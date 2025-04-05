# PDF and Markdown Comparison Tool Implementation Guide

## Project Overview
A browser-based tool that allows drag-and-drop comparison of PDF and Markdown files with GitHub-style diff views. The tool renders files side-by-side with a third panel highlighting differences, and provides both unified and split diff views.

## Core Requirements (Updated)
- Compare two PDF files with both visual and text-based comparison
- Compare two Markdown files with GitHub-style diff highlighting
- Generate difference highlights with clear color coding
- Side-by-side and unified diff visualization
- Multi-page PDF navigation with preserved formatting
- Drag-and-drop file interface
- Local-only operation (no server requirements)

## Technical Stack
- **Frontend**: React with Vite
- **PDF Processing**: PDF.js with enhanced text extraction
- **Markdown Processing**: Marked.js
- **Diff Detection**:
  - PDF: pixelmatch for visual, custom text processing for content
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

### Phase 2: Enhanced PDF Processing
1. Integrate PDF.js with worker configuration
2. Implement advanced text extraction with formatting preservation
3. Handle multi-page PDFs with proper text flow
4. Process PDF structure (paragraphs, spacing)
5. Maintain visual layout and formatting
6. Extract text with position information

### Phase 3: Markdown Processing
1. Implement Marked.js for rendering
2. Create toggle between raw and rendered Markdown views
3. Implement syntax highlighting for code blocks
   - Add Prism.js for code highlighting
   - Configure language detection
   - Customize token styles for both light and dark modes
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
7. Optimize UI spacing for improved readability
8. Implement fixed navigation buttons in the upper right corner

## Technical Implementation Details

### PDF Processing Workflow
1. File drop event → read file as ArrayBuffer
2. Initialize PDF.js worker
3. Load PDF document and process each page:
   - Extract text content with position information
   - Preserve paragraph structure
   - Maintain horizontal spacing
   - Handle multi-column layouts
4. Process text while maintaining format:
   - Track vertical positions for paragraphs
   - Preserve horizontal spacing for layout
   - Handle special formatting cases
5. Generate formatted text output suitable for comparison

### Key Functions
```javascript
// PDF Processing
async function processPDFFile(file) {
  const buffer = await file.arrayBuffer();
  const text = await extractTextFromPDF(buffer);
  return {
    text,
    fileName: file.name,
    fileType: 'pdf'
  };
}

async function extractTextFromPDF(pdfBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Process text with position information
    const items = textContent.items.sort((a, b) => 
      b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]
    );
    
    // Preserve formatting while extracting text
    let lastY, lastX, text = '';
    for (const item of items) {
      const currentY = item.transform[5];
      const currentX = item.transform[4];
      
      // Handle paragraph breaks and spacing
      if (lastY !== undefined && Math.abs(lastY - currentY) > 12) {
        text += '\n\n';
      } else if (lastX !== undefined && lastY === currentY && (currentX - lastX) > 10) {
        text += '    ';
      } else if (lastY === currentY) {
        text += ' ';
      }
      
      text += item.str;
      lastY = currentY;
      lastX = currentX + (item.width || 0);
    }
    
    fullText += text + '\n\n';
  }
  
  return fullText.trim();
}
```

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
  - FixedNavigation (always-visible navigation buttons)

### Key Functions
- `processPDF(file)`: Converts PDF to canvas using PDF.js
- `processMarkdown(file)`: Converts Markdown to HTML using Marked.js
- `comparePDFPages(canvas1, canvas2)`: Visual comparison using pixelmatch
- `generateUnifiedDiff(text1, text2)`: Creates GitHub-style unified diff
- `generateSplitDiff(text1, text2)`: Creates GitHub-style split diff
- `getNextDifference()`: Navigation helper for jumping to differences
- `getPrevDifference()`: Navigation helper for jumping to differences

### Syntax Highlighting Implementation
1. **Markdown Viewer**:
   - Integrate Prism.js for syntax highlighting
   - Configure marked options to use Prism for code blocks
   - Apply highlighting in rendered view
   ```javascript
   marked.setOptions({
     highlight: function(code, lang) {
       if (lang && Prism.languages[lang]) {
         return Prism.highlight(code, Prism.languages[lang], lang);
       }
       return code;
     }
   });
   ```

2. **GitHub-Style Diff View**:
   - Detect code language from file extension
   - Apply highlighting to code blocks in diff view
   - Custom styling for highlighted code in diff backgrounds
   ```javascript
   const detectLanguage = (fileName, lineContent) => {
     // Extract extension from filename
     if (fileName) {
       const ext = fileName.split('.').pop().toLowerCase();
       
       const languageMap = {
         'js': 'javascript',
         'jsx': 'jsx',
         'ts': 'typescript',
         'tsx': 'tsx',
         'css': 'css',
         'py': 'python',
         'sh': 'bash',
         'json': 'json',
         'md': 'markdown'
       };
       
       if (languageMap[ext]) {
         return languageMap[ext];
       }
     }
     
     // Fallback: detect from content for markdown code blocks
     if (lineContent && lineContent.startsWith('```')) {
       const lang = lineContent.substring(3).trim();
       if (Prism.languages[lang]) {
         return lang;
       }
     }
     
     return null;
   };
   ```

3. **CSS Customization**:
   - Theme customization for dark mode
   - Enhanced token visibility in diff backgrounds
   - Special handling for tokens in addition/deletion highlights

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