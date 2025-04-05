# PDF and Markdown Comparison Tool - Project Brief

## What We're Building

Imagine a web-based tool similar to GitHub's diff view, but specialized for comparing PDF and Markdown files. Users can drag and drop two files, and the tool shows their differences side by side, highlighting what's changed between them.

## Key Features

### 1. File Handling
- Users can drag and drop two files onto the interface
- Supports two file types:
  - PDFs (even multi-page documents)
  - Markdown files (.md, .markdown)
- Files are processed entirely in the browser (no server needed)

### 2. PDF Comparison
- **Text Extraction**: We extract text from PDFs while preserving:
  - Paragraph structure
  - Spacing and indentation
  - Document layout (columns, sections)
- **Visual Comparison**: Shows differences between PDFs like:
  - Added/removed text
  - Changed formatting
  - Modified content
- **Navigation**: Users can:
  - Move between pages
  - Zoom in/out
  - Jump between differences

### 3. Markdown Comparison
- Shows differences in both raw text and rendered views
- GitHub-style highlighting:
  - Green for additions
  - Red for deletions
- Character-level diff highlighting
- Toggle between raw markdown and rendered preview

### 4. User Interface
- Three-panel layout:
  - Left panel: First file
  - Right panel: Second file
  - Bottom panel: Unified diff view
- Comparison controls:
  - Split/unified view toggle
  - Next/previous difference navigation
  - Zoom controls for PDFs
- Dark/light mode support

## Technical Stack

### Core Technologies
- **Frontend**: React with Vite
  - Fast development server
  - Hot module replacement
  - Modern build tooling

### Key Libraries
1. **PDF Processing**:
   - `pdfjs-dist`: Mozilla's PDF.js for PDF rendering and text extraction
   ```javascript
   // Example PDF processing
   const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
   const page = await pdf.getPage(1);
   const textContent = await page.getTextContent();
   ```

2. **Markdown Processing**:
   - `marked`: For Markdown parsing and rendering
   ```javascript
   // Example Markdown processing
   const htmlContent = marked.parse(markdownText);
   ```

3. **Diff Generation**:
   - `diff-match-patch`: For text comparison
   - `pixelmatch`: For visual PDF comparison
   ```javascript
   // Example diff generation
   const dmp = new diff_match_patch();
   const diffs = dmp.diff_main(text1, text2);
   dmp.diff_cleanupSemantic(diffs);
   ```

4. **Styling**:
   - Tailwind CSS for responsive design
   ```javascript
   // Example component with Tailwind
   <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
     <div className="rounded-lg shadow-md p-4">
       {/* Content */}
     </div>
   </div>
   ```

## Code Structure

```
src/
├── components/           # React components
│   ├── DropZone.jsx     # File upload handling
│   ├── PDFViewer.jsx    # PDF rendering
│   ├── MarkdownViewer.jsx
│   └── GitHubDiffViewer.jsx
├── lib/                 # Utility functions
│   ├── pdfProcessor.js  # PDF text extraction
│   ├── diffUtility.js   # Diff generation
│   └── fileProcessor.js # File type handling
└── App.jsx             # Main application
```

## Key Implementation Details

### 1. PDF Text Extraction
```javascript
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
      // Handle paragraph breaks and spacing
      if (needsNewParagraph(lastY, item.transform[5])) {
        text += '\n\n';
      } else if (needsSpacing(lastX, item.transform[4])) {
        text += '    ';
      }
      
      text += item.str;
      updatePositions(item);
    }
    
    fullText += text + '\n\n';
  }
  
  return fullText.trim();
}
```

### 2. File Processing Flow
```javascript
async function handleFiles(files) {
  const [file1, file2] = files;
  
  // Process files based on type
  const content1 = await processFile(file1);
  const content2 = await processFile(file2);
  
  // Generate diff
  const diff = generateDiff(content1, content2);
  
  // Update UI with results
  updateDiffView(diff);
}
```

### 3. Component Communication
```javascript
function App() {
  const [files, setFiles] = useState(null);
  const [diff, setDiff] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  
  const handleFileSelect = async (newFiles) => {
    setFiles(newFiles);
    const diffResult = await processFiles(newFiles);
    setDiff(diffResult);
  };
  
  return (
    <div className="app-container">
      <DropZone onFileSelect={handleFileSelect} />
      <DiffViewer
        files={files}
        diff={diff}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser

## Development Workflow

1. **File Upload**:
   - Implement drag-and-drop or file selection
   - Validate file types and sizes
   - Read file contents

2. **Processing**:
   - Extract text content
   - Preserve formatting
   - Generate diffs

3. **Display**:
   - Render content in panels
   - Highlight differences
   - Handle user interactions

4. **Navigation**:
   - Implement page controls
   - Add diff navigation
   - Support keyboard shortcuts

## Testing Considerations

- Test with various PDF layouts
- Verify Markdown rendering
- Check diff accuracy
- Validate formatting preservation
- Test large files
- Verify browser compatibility

## Performance Tips

1. Use Web Workers for heavy processing
2. Implement lazy loading for large files
3. Cache processed results
4. Optimize diff rendering
5. Use virtualization for long documents

This should give you a solid understanding of what we're building and how to approach it. Let me know if you need any clarification on specific aspects! 