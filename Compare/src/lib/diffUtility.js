import { diffLines, diffWordsWithSpace } from 'diff';

/**
 * Normalize text extracted from PDF for better comparison
 * @param {string} pdfText - The text extracted from a PDF
 * @returns {string} - Normalized text with consistent spacing
 */
export function normalizePDFText(pdfText) {
  if (!pdfText) return '';
  
  return pdfText
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    // Replace multiple spaces with a single space
    .replace(/[ \t]+/g, ' ')
    // Replace multiple newlines with a single newline
    .replace(/\n+/g, '\n')
    // Trim whitespace from the beginning and end of each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Generate a line-by-line diff between two text strings
 * @param {string} oldText - The original text
 * @param {string} newText - The modified text
 * @param {boolean} isPDF - Whether the text is from PDF files
 * @returns {Object} - An object containing the diff data
 */
export function generateTextDiff(oldText, newText, isPDF = false) {
  // Normalize text if from PDF
  const processedOldText = isPDF ? normalizePDFText(oldText) : oldText;
  const processedNewText = isPDF ? normalizePDFText(newText) : newText;
  
  // Generate line-by-line diff
  const lineDiff = diffLines(processedOldText, processedNewText);
  
  // Process diff to create a more structured representation
  const processedDiff = [];
  let oldLineNum = 1;
  let newLineNum = 1;
  
  lineDiff.forEach(part => {
    const lines = part.value.split('\n');
    // Remove the last empty line that comes from split
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    
    lines.forEach(line => {
      const diffLine = {
        content: line,
        type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
        oldLineNum: part.removed ? oldLineNum++ : null,
        newLineNum: part.added ? newLineNum++ : part.removed ? null : newLineNum++
      };
      processedDiff.push(diffLine);
    });
  });
  
  // Calculate summary
  const summary = {
    additions: processedDiff.filter(line => line.type === 'added').length,
    deletions: processedDiff.filter(line => line.type === 'removed').length,
    changes: processedDiff.filter(line => line.type !== 'unchanged').length
  };
  
  return {
    diff: processedDiff,
    summary: summary
  };
}

/**
 * Generate a word-level diff for inline highlighting
 * @param {string} oldText - The original text
 * @param {string} newText - The modified text
 * @returns {Array} - An array of diff parts with word-level changes
 */
export function generateWordDiff(oldText, newText) {
  return diffWordsWithSpace(oldText, newText);
}

/**
 * Find matching removed and added lines for word-level diffing
 * @param {Array} lines - Array of diff lines
 * @returns {Array} - Array with enhanced lines including word-level diff when applicable
 */
export function enhanceWithWordDiff(lines) {
  const enhancedLines = [...lines];
  
  // Find potential matching lines (removed followed by added)
  for (let i = 0; i < enhancedLines.length - 1; i++) {
    const currentLine = enhancedLines[i];
    const nextLine = enhancedLines[i + 1];
    
    if (currentLine.type === 'removed' && nextLine.type === 'added') {
      // Perform word-level diff between the removed and added line
      const wordDiff = generateWordDiff(currentLine.content, nextLine.content);
      
      // Add the word-level diff data to both lines
      currentLine.wordDiff = wordDiff.filter(part => !part.added);
      nextLine.wordDiff = wordDiff.filter(part => !part.removed);
      
      // Mark these lines as a pair
      currentLine.hasPair = true;
      nextLine.hasPair = true;
    }
  }
  
  return enhancedLines;
}

/**
 * Identifies collapsible sections of unchanged lines
 * @param {Array} lines - Array of diff lines
 * @param {number} contextLines - Number of context lines to keep around changes
 * @returns {Array} - Array with collapsible sections marked
 */
export function markCollapsibleSections(lines, contextLines = 3) {
  if (!lines || lines.length === 0) return lines;
  
  const markedLines = [...lines];
  let inCollapsibleSection = false;
  let collapsibleSectionStart = -1;
  let unchangedCount = 0;
  
  // First pass: mark start of collapsible sections
  for (let i = 0; i < markedLines.length; i++) {
    const line = markedLines[i];
    
    if (line.type === 'unchanged') {
      unchangedCount++;
      
      // If we've found enough unchanged lines in a row,
      // and we're not already in a collapsible section,
      // mark the start of a new collapsible section
      if (unchangedCount > contextLines * 2 && !inCollapsibleSection) {
        collapsibleSectionStart = i - unchangedCount + contextLines;
        inCollapsibleSection = true;
      }
    } else {
      // If we were in a collapsible section, end it 
      // and mark the collapsible range
      if (inCollapsibleSection) {
        const collapsibleEnd = i - contextLines - 1;
        
        if (collapsibleEnd > collapsibleSectionStart) {
          markedLines[collapsibleSectionStart].isCollapsibleStart = true;
          markedLines[collapsibleSectionStart].collapsibleCount = 
            collapsibleEnd - collapsibleSectionStart + 1;
            
          // Mark all lines in the section
          for (let j = collapsibleSectionStart; j <= collapsibleEnd; j++) {
            markedLines[j].isCollapsible = true;
          }
        }
        
        inCollapsibleSection = false;
      }
      
      unchangedCount = 0;
    }
  }
  
  // If we ended the file in a collapsible section, end it
  if (inCollapsibleSection) {
    const collapsibleEnd = markedLines.length - contextLines - 1;
    
    if (collapsibleEnd > collapsibleSectionStart) {
      markedLines[collapsibleSectionStart].isCollapsibleStart = true;
      markedLines[collapsibleSectionStart].collapsibleCount = 
        collapsibleEnd - collapsibleSectionStart + 1;
        
      // Mark all lines in the section
      for (let j = collapsibleSectionStart; j <= collapsibleEnd; j++) {
        markedLines[j].isCollapsible = true;
      }
    }
  }
  
  return markedLines;
}

/**
 * Converts the structured diff data to a format suitable for the GitHubDiffViewer
 * @param {Object} diffData - The diff data from generateTextDiff
 * @returns {Object} - The formatted diff data for GitHubDiffViewer
 */
export function formatDiffForViewer(diffData) {
  // Enhance with word-level diff
  const enhancedLines = enhanceWithWordDiff(diffData.diff);
  
  // Identify collapsible sections
  const collapsibleLines = markCollapsibleSections(enhancedLines);
  
  return {
    fileName: diffData.fileName || 'comparison.md',
    summary: diffData.summary,
    lines: collapsibleLines
  };
} 