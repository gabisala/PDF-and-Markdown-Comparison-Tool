# PDF and Markdown Comparison Tool

A browser-based tool that allows side-by-side comparison of PDF and Markdown files with visual highlighting of differences. The tool provides both visual and text-based comparison for PDFs while preserving document formatting and structure.

![Application Screenshot](screenshot.png)

## Features

- **File Type Support**: 
  - PDF files (.pdf) with enhanced text extraction
  - Markdown files (.md, .markdown, .txt)
  
- **PDF Processing**:
  - Advanced text extraction with format preservation
  - Maintains paragraph structure and spacing
  - Handles multi-column layouts
  - Visual and text-based comparison
  - Page navigation for multi-page PDFs
  - Zoom controls
  
- **Markdown Features**:
  - GitHub-style diff highlighting
  - Character-level change detection
  - Raw/rendered toggle view
  - Syntax highlighting
  
- **Comparison Features**:
  - Visual side-by-side comparison
  - Highlighted differences
  - Split and unified diff views
  - Navigation between changes
  - Change statistics
  
- **User Interface**:
  - Drag-and-drop file upload
  - Three-panel layout (File 1, File 2, Differences)
  - Dark mode support
  - Responsive design
  - Keyboard shortcuts
  - Fixed navigation controls for easy access
  - Optimized spacing for improved readability

## Technologies Used

- React with Vite
- PDF.js for advanced PDF processing
- Marked.js for Markdown processing
- diff-match-patch for text comparison
- pixelmatch for visual PDF comparison
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gabisala/PDF-and-Markdown-Comparison-Tool.git
cd PDF-and-Markdown-Comparison-Tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

### Building for Production

```bash
npm run build
```

## Usage

1. Drag and drop two files of the same type (PDF or Markdown) onto the panels
2. The tool will automatically detect the file type and process accordingly:
   - PDFs: Preserves formatting while extracting text for comparison
   - Markdown: Provides both raw and rendered views
3. Use the comparison controls to:
   - Toggle between split and unified views
   - Navigate between changes
   - Adjust zoom level for PDFs
   - Switch between visual and text-based comparison for PDFs
4. Use keyboard shortcuts for quick navigation and control

## License

MIT 