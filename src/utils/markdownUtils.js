import { marked } from 'marked';
import { diff_match_patch } from 'diff-match-patch';
import { createGitHubStyleDiff } from './diffing';

/**
 * Process a Markdown file and convert it to HTML
 * @param {File} file - The Markdown file object
 * @returns {Promise<Object>} - Processed markdown data
 */
export async function processMarkdown(file) {
  try {
    // Read file as text
    const text = await file.text();
    
    // Parse markdown to HTML
    const html = marked.parse(text);
    
    return {
      file,
      type: 'markdown',
      name: file.name,
      text,
      html
    };
  } catch (error) {
    console.error('Error processing Markdown:', error);
    throw error;
  }
}

/**
 * Compare two markdown texts and generate HTML with differences highlighted
 * @param {string} text1 - First markdown text
 * @param {string} text2 - Second markdown text
 * @returns {Object} - HTML with differences highlighted
 */
export function compareMarkdown(text1, text2) {
  // Split text into lines
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  // Initialize diff-match-patch
  const dmp = new diff_match_patch();
  
  // Compare each line and build HTML
  let diffHtml = '';
  
  // Track if we're showing a deletion or addition block
  let inDeleteBlock = false;
  let inAddBlock = false;
  let deleteLines = [];
  let addLines = [];
  
  // Create line by line diff array
  const diffArray = createLineDiff(lines1, lines2);
  
  // Process the diff array
  diffArray.forEach(entry => {
    const [type, value] = entry;
    
    if (type === -1) { // Delete
      if (inAddBlock) {
        // Close add block if open
        diffHtml += generateAddBlock(addLines);
        addLines = [];
        inAddBlock = false;
      }
      inDeleteBlock = true;
      deleteLines.push(value);
    } 
    else if (type === 1) { // Add
      if (inDeleteBlock) {
        // Close delete block if open
        diffHtml += generateDeleteBlock(deleteLines);
        deleteLines = [];
        inDeleteBlock = false;
      }
      inAddBlock = true;
      addLines.push(value);
    } 
    else { // Equal
      // Close any open blocks
      if (inDeleteBlock) {
        diffHtml += generateDeleteBlock(deleteLines);
        deleteLines = [];
        inDeleteBlock = false;
      }
      if (inAddBlock) {
        diffHtml += generateAddBlock(addLines);
        addLines = [];
        inAddBlock = false;
      }
      
      // Add the unchanged line
      diffHtml += `<div class="text-gray-700">${escapeHtml(value)}</div>`;
    }
  });
  
  // Close any remaining blocks
  if (inDeleteBlock) {
    diffHtml += generateDeleteBlock(deleteLines);
  }
  if (inAddBlock) {
    diffHtml += generateAddBlock(addLines);
  }
  
  // Render HTML for both versions for side-by-side comparison
  const html1 = marked.parse(text1);
  const html2 = marked.parse(text2);
  
  // Generate GitHub-style diff
  const githubDiff = createGitHubStyleDiff(text1, text2, 'document.md');
  
  // Count changes for summary
  const summary = {
    additions: 0,
    deletions: 0,
    changes: 0
  };
  
  diffArray.forEach(entry => {
    const [type] = entry;
    if (type === -1) summary.deletions++;
    if (type === 1) summary.additions++;
  });
  
  summary.changes = summary.additions + summary.deletions;
  
  return {
    rawText: {
      diffArray,
      html: diffHtml
    },
    renderedHtml: {
      html1,
      html2
    },
    githubDiff: {
      ...githubDiff,
      summary
    }
  };
}

/**
 * Create a line-by-line diff of two arrays of strings
 * @param {Array} lines1 - First array of lines
 * @param {Array} lines2 - Second array of lines
 * @returns {Array} - Array of diff operations
 */
function createLineDiff(lines1, lines2) {
  // A simple line-by-line diff
  const lineDiffs = [];
  
  // Create a new diff_match_patch instance
  const dmp = new diff_match_patch();
  
  // Convert arrays to strings with newlines
  const text1 = lines1.join('\n');
  const text2 = lines2.join('\n');
  
  // Get the diffs
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);
  
  // Process the diffs to create line-by-line diffs
  let lineBuffer = '';
  let currentOp = null;
  
  for (const [op, text] of diffs) {
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // If we're at a line break or the last line
      if (i < lines.length - 1 || i === lines.length - 1 && text.endsWith('\n')) {
        // Complete the line and push it
        lineBuffer += line;
        
        if (lineBuffer || op === 0) {  // Don't push empty unchanged lines
          lineDiffs.push([op, lineBuffer]);
        }
        
        lineBuffer = '';
        currentOp = null;
      } else {
        // We're in the middle of a line
        lineBuffer += line;
        currentOp = op;
      }
    }
  }
  
  // Add any remaining buffer
  if (lineBuffer && currentOp !== null) {
    lineDiffs.push([currentOp, lineBuffer]);
  }
  
  return lineDiffs;
}

/**
 * Perform character-level diff on two strings
 * @param {string} text1 - Original text
 * @param {string} text2 - Modified text
 * @returns {Array} - Array of character diff objects
 */
export function characterLevelDiff(text1, text2) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);
  
  return diffs.map(([op, text]) => {
    return {
      type: op === -1 ? 'deletion' : op === 1 ? 'addition' : 'unchanged',
      text
    };
  });
}

/**
 * Generate HTML for a block of deleted lines
 * @param {Array} lines - Array of deleted lines
 * @returns {string} - HTML for the deleted block
 */
function generateDeleteBlock(lines) {
  if (lines.length === 0) return '';
  
  return `<div class="bg-red-100 border-l-4 border-red-500 mb-2 p-2 rounded">
    <div class="text-red-800 font-semibold text-xs mb-1">Removed:</div>
    ${lines.map(line => `<div class="text-red-900">${escapeHtml(line)}</div>`).join('')}
  </div>`;
}

/**
 * Generate HTML for a block of added lines
 * @param {Array} lines - Array of added lines
 * @returns {string} - HTML for the added block
 */
function generateAddBlock(lines) {
  if (lines.length === 0) return '';
  
  return `<div class="bg-green-100 border-l-4 border-green-500 mb-2 p-2 rounded">
    <div class="text-green-800 font-semibold text-xs mb-1">Added:</div>
    ${lines.map(line => `<div class="text-green-900">${escapeHtml(line)}</div>`).join('')}
  </div>`;
}

/**
 * Escape HTML special characters
 * @param {string} text - Input text
 * @returns {string} - HTML-escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} 