# PDF and Markdown Comparison Tool Implementation Guide

## Project Overview
A browser-based tool that allows drag-and-drop comparison of PDF and Markdown files with GitHub-style diff views. The tool renders files side-by-side with a third panel highlighting differences, and provides both unified and split diff views.

## Core Requirements (Updated)
- Compare two PDF files visually using canvas
- Compare two Markdown files with GitHub-style diff highlighting
- Generate difference highlights with clear color coding
- Side-by-side and unified diff visualization
- Multi-page PDF navigation
- Drag-and-drop file interface
- Local-only operation (no server requirements)

## Technical Stack
- **Frontend**: React with Vite
- **PDF Processing**: PDF.js
- **Markdown Processing**: Marked.js
- **Diff Detection**:
  - PDF: pixelmatch
  - Markdown: diff-match-patch
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS

## Implementation Roadmap

### Phase 1: Project Setup & Basic Structure
1. Initialize React project with Vite
2. Setup Tailwind CSS
3. Setup shadcn/ui components
4. Create basic three-panel layout
5. Implement drag-and-drop file interface

### Phase 2: PDF Processing
1. Integrate PDF.js
2. Convert PDF pages to canvas elements
3. Implement page navigation for multi-page PDFs
4. Ensure proper sizing/scaling of PDF canvas
5. Extract text where possible for text-based diffing

### Phase 3: Markdown Processing
1. Implement Marked.js for rendering
2. Create toggle between raw and rendered Markdown views
3. Implement syntax highlighting for code blocks
4. Add character-level diffing for precise changes

### Phase 4: GitHub-Style Diff Implementation
1. Implement unified diff view for Markdown
   - Color-coded additions/deletions
   - Line numbers for reference
   - "+" and "-" symbols in margin
2. Implement split diff view for Markdown
   - Side-by-side original and modified files
   - Aligned content for easy comparison
3. Create diff summary statistics (additions, deletions, changes)
4. Add navigation features to jump between differences
5. Implement visual diff for PDFs
6. Add collapsible sections for unchanged content

### Phase 5: UI Refinement
1. Implement zoom controls
2. Add page navigation controls for PDFs
3. Create sidebar indicators showing difference locations
4. Implement mini-map for scrollbar indicators
5. Add responsive layout adjustments
6. Polish UI with high-contrast colors for differences

## Technical Implementation Details

### File Processing Workflow
1. File drop event → read file as ArrayBuffer
2. Detect file type (PDF or Markdown)
3. For PDF: PDF.js → parse → render to canvas + extract text if possible
4. For Markdown: read as text → parse with Marked.js → render as HTML

### GitHub-Style Diff Algorithm
1. **Unified View**:
   - Process diffs line-by-line
   - Generate HTML with appropriate color coding and line numbers
   - Add "+" and "-" symbols in margins
   - Keep track of line numbers for both files

2. **Split View**:
   - Align matching content blocks
   - Highlight additions/deletions on respective sides
   - Generate synchronized scrolling

### PDF Comparison Algorithm
1. Render both PDFs to same-sized canvas elements
2. Get ImageData from both canvases
3. Use pixelmatch to compare pixel data
4. Generate third canvas with highlighted differences
5. Extract text where possible for text-based diffing
6. Toggle between visual diff and text-based diff

### Component Structure
- App (main container)
  - DropZone (handles file upload)
  - Card (container for each panel)
    - PDFViewer (left PDF)
    - PDFViewer (right PDF)
    - DiffViewer (difference view)
  - DiffControls (toggles between unified/split views)
  - NavigationControls (page navigation, diff navigation)
  - DiffSummary (statistics on differences)

### Key Functions
- `processPDF(file)`: Converts PDF to canvas using PDF.js
- `processMarkdown(file)`: Converts Markdown to HTML using Marked.js
- `comparePDFPages(canvas1, canvas2)`: Visual comparison using pixelmatch
- `generateUnifiedDiff(text1, text2)`: Creates GitHub-style unified diff
- `generateSplitDiff(text1, text2)`: Creates GitHub-style split diff
- `getNextDifference()`: Navigation helper for jumping to differences
- `getPrevDifference()`: Navigation helper for jumping to differences

## Data Structures
- **FileState**: { file, type, content, pages[] }
- **ComparisonResult**: { type, unified, split, summary, diffLocations }
- **PageState**: { currentPage, totalPages, zoom }
- **DiffState**: { viewMode, currentDiff, totalDiffs }

## Error Handling
- File type validation
- PDF parsing errors
- Canvas rendering issues
- Memory management for large files

## Performance Considerations
- Canvas optimization for large PDFs
- Throttle pixel comparison for large images
- Lazy loading for multi-page PDFs
- Virtualized scrolling for large documents
- Memory cleanup after comparison

## Dependencies
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "pdfjs-dist": "^3.11.174",
    "marked": "^9.0.0",
    "diff-match-patch": "^1.0.5",
    "pixelmatch": "^5.3.0",
    "prismjs": "^1.29.0"
  },
  "devDependencies": {
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.15",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3"
  }
}
```

## Implementation Steps Detail

### 1. GitHub-Style Unified Diff Implementation
```javascript
function generateUnifiedDiff(text1, text2) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const dmp = new diff_match_patch();
  
  // Generate line-based diffs
  const lineDiffs = [];
  let lineNumber1 = 1;
  let lineNumber2 = 1;
  
  for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
    const line1 = i < lines1.length ? lines1[i] : '';
    const line2 = i < lines2.length ? lines2[i] : '';
    
    if (line1 === line2) {
      // Equal lines
      lineDiffs.push({
        type: 'equal',
        line: line1,
        lineNumber1: lineNumber1++,
        lineNumber2: lineNumber2++
      });
    } else {
      // Different lines
      if (i < lines1.length) {
        lineDiffs.push({
          type: 'delete',
          line: line1,
          lineNumber1: lineNumber1++,
          lineNumber2: null
        });
      }
      
      if (i < lines2.length) {
        lineDiffs.push({
          type: 'insert',
          line: line2,
          lineNumber1: null,
          lineNumber2: lineNumber2++
        });
      }
    }
  }
  
  // Generate HTML
  let html = '<div class="unified-diff">';
  
  for (const diff of lineDiffs) {
    const lineNumber1 = diff.lineNumber1 !== null ? diff.lineNumber1 : '';
    const lineNumber2 = diff.lineNumber2 !== null ? diff.lineNumber2 : '';
    
    if (diff.type === 'equal') {
      html += `
        <div class="diff-line">
          <div class="diff-line-number">${lineNumber1}</div>
          <div class="diff-line-number">${lineNumber2}</div>
          <div class="diff-line-content">${escapeHtml(diff.line)}</div>
        </div>
      `;
    } else if (diff.type === 'delete') {
      html += `
        <div class="diff-line diff-delete">
          <div class="diff-line-number">${lineNumber1}</div>
          <div class="diff-line-number"></div>
          <div class="diff-line-marker">-</div>
          <div class="diff-line-content bg-red-100">${escapeHtml(diff.line)}</div>
        </div>
      `;
    } else if (diff.type === 'insert') {
      html += `
        <div class="diff-line diff-insert">
          <div class="diff-line-number"></div>
          <div class="diff-line-number">${lineNumber2}</div>
          <div class="diff-line-marker">+</div>
          <div class="diff-line-content bg-green-100">${escapeHtml(diff.line)}</div>
        </div>
      `;
    }
  }
  
  html += '</div>';
  
  return {
    html,
    summary: {
      additions: lineDiffs.filter(d => d.type === 'insert').length,
      deletions: lineDiffs.filter(d => d.type === 'delete').length,
      changes: lineDiffs.filter(d => d.type !== 'equal').length
    }
  };
}
```

### 2. GitHub-Style Split Diff Implementation
```javascript
function generateSplitDiff(text1, text2) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  // Implement split diff here using similar approach to unified diff
  // but with left/right panels
  
  return {
    leftHtml: '...',
    rightHtml: '...',
    summary: {
      additions: ...,
      deletions: ...,
      changes: ...
    }
  };
}
```

## Potential Challenges and Solutions

1. **Different PDF sizes**
   - Solution: Normalize canvas sizes before comparison
   
2. **Large PDF files**
   - Solution: Process pages on-demand rather than all at once

3. **Memory Management**
   - Solution: Clean up canvas objects when no longer needed

4. **Accurate Difference Detection**
   - Solution: Adjust pixelmatch threshold based on document type

5. **Performance for Large Documents**
   - Solution: Implement progressive rendering and virtualized scrolling

6. **Complex Markdown Formatting**
   - Solution: Character-level diffing with syntax-aware comparisons
   
7. **PDF Text Extraction Challenges**
   - Solution: Provide fallback to pure visual comparison when text extraction fails

This documentation provides all the necessary details to implement the PDF and Markdown comparison tool with GitHub-style diff views. Following this structure will result in a functional tool that matches the desired UI layout and functionality. 