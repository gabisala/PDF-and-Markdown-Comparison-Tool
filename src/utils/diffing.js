/**
 * Utilities for handling diff operations between files
 */

/**
 * Create a line-by-line diff between two text files
 * @param {string} text1 - Original text content
 * @param {string} text2 - Modified text content
 * @returns {Object} Diff structure with line changes
 */
export function createLineDiff(text1, text2) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  // This is a simple implementation. In a real app, we'd use a robust
  // diff algorithm like Myers diff or similar
  
  const diff = {
    lines: [],
    summary: {
      additions: 0,
      deletions: 0,
      changes: 0,
      files: 1
    }
  };
  
  // Simple line-by-line comparison (a more robust implementation would use an actual diff algorithm)
  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = i < lines1.length ? lines1[i] : null;
    const line2 = i < lines2.length ? lines2[i] : null;
    
    if (line1 === null) {
      // Line was added
      diff.lines.push({
        type: 'addition',
        lineNumber1: null,
        lineNumber2: i + 1,
        content: line2
      });
      diff.summary.additions++;
    } else if (line2 === null) {
      // Line was deleted
      diff.lines.push({
        type: 'deletion',
        lineNumber1: i + 1,
        lineNumber2: null,
        content: line1
      });
      diff.summary.deletions++;
    } else if (line1 !== line2) {
      // Line was modified
      diff.lines.push({
        type: 'modification',
        lineNumber1: i + 1,
        lineNumber2: i + 1,
        content1: line1,
        content2: line2
      });
      diff.summary.changes++;
    } else {
      // Line is unchanged
      diff.lines.push({
        type: 'unchanged',
        lineNumber1: i + 1,
        lineNumber2: i + 1,
        content: line1
      });
    }
  }
  
  diff.summary.changes = diff.summary.additions + diff.summary.deletions;
  
  return diff;
}

/**
 * Create a character-level diff between two text strings
 * This is a simplified implementation. In a real app, you'd use
 * a library like diff-match-patch or similar
 * 
 * @param {string} text1 - Original text
 * @param {string} text2 - Modified text
 * @returns {Array} Array of change objects with type and text
 */
export function createCharacterDiff(text1, text2) {
  // This is a very naive character diff implementation
  // In production, you would use a library like diff-match-patch
  
  if (text1 === text2) {
    return [{type: 'unchanged', text: text1}];
  }
  
  // For this simplified implementation, we'll just identify common prefix/suffix
  // and mark the middle as changed
  
  let prefixLength = 0;
  const minLength = Math.min(text1.length, text2.length);
  
  // Find common prefix
  while (prefixLength < minLength && text1[prefixLength] === text2[prefixLength]) {
    prefixLength++;
  }
  
  // Find common suffix
  let suffixLength = 0;
  while (
    suffixLength < minLength - prefixLength &&
    text1[text1.length - 1 - suffixLength] === text2[text2.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }
  
  const result = [];
  
  // Add common prefix if exists
  if (prefixLength > 0) {
    result.push({
      type: 'unchanged',
      text: text1.substring(0, prefixLength)
    });
  }
  
  // Add deletion if exists
  const deletedText = text1.substring(prefixLength, text1.length - suffixLength);
  if (deletedText) {
    result.push({
      type: 'deletion',
      text: deletedText
    });
  }
  
  // Add addition if exists
  const addedText = text2.substring(prefixLength, text2.length - suffixLength);
  if (addedText) {
    result.push({
      type: 'addition',
      text: addedText
    });
  }
  
  // Add common suffix if exists
  if (suffixLength > 0) {
    result.push({
      type: 'unchanged',
      text: text1.substring(text1.length - suffixLength)
    });
  }
  
  return result;
}

/**
 * Create a diff that can be used with the GitHubDiffViewer component
 * 
 * @param {string} text1 - Original text content
 * @param {string} text2 - Modified text content
 * @param {string} filename - Name of the file being compared
 * @returns {Object} Diff structure compatible with GitHubDiffViewer
 */
export function createGitHubStyleDiff(text1, text2, filename = 'file.md') {
  const lineDiff = createLineDiff(text1, text2);
  
  return {
    filename,
    lines: lineDiff.lines,
    summary: lineDiff.summary
  };
}

/**
 * Generates HTML with highlighted differences for displaying in a diff view
 * 
 * @param {string} text1 - Original text
 * @param {string} text2 - Modified text
 * @returns {Object} Object with HTML representation of the diff
 */
export function generateDiffHtml(text1, text2) {
  const lineDiff = createLineDiff(text1, text2);
  
  let html = '';
  
  for (const line of lineDiff.lines) {
    if (line.type === 'addition') {
      html += `<div class="bg-green-50 p-1 rounded"><span class="text-green-600">+ ${escapeHtml(line.content)}</span></div>`;
    } else if (line.type === 'deletion') {
      html += `<div class="bg-red-50 p-1 rounded"><span class="text-red-600">- ${escapeHtml(line.content)}</span></div>`;
    } else if (line.type === 'modification') {
      const charDiff1 = characterHighlight(line.content1, 'deletion');
      const charDiff2 = characterHighlight(line.content2, 'addition');
      
      html += `<div class="bg-red-50 p-1 rounded mb-1"><span class="text-red-600">- ${charDiff1}</span></div>`;
      html += `<div class="bg-green-50 p-1 rounded"><span class="text-green-600">+ ${charDiff2}</span></div>`;
    } else {
      html += `<div class="p-1">${escapeHtml(line.content)}</div>`;
    }
  }
  
  return {
    html,
    summary: lineDiff.summary
  };
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Very simple helper for now - in a real app, this would do
 * real character-level highlighting based on an actual diff algorithm
 */
function characterHighlight(text, type) {
  return escapeHtml(text);
} 