# PDF and Markdown Comparison Tool

A browser-based tool that allows side-by-side comparison of PDF and Markdown files with visual highlighting of differences.

![Application Screenshot](screenshot.png)

## Features

- **File Type Support**: 
  - PDF files (.pdf)
  - Markdown files (.md, .markdown, .txt)
  
- **Comparison Features**:
  - Visual side-by-side comparison
  - Highlighted differences
  - Page navigation for multi-page PDFs
  - Raw/rendered toggle for Markdown
  - Zoom controls for PDFs
  
- **User Interface**:
  - Drag-and-drop file upload
  - Three-panel layout (File 1, File 2, Differences)
  - Modern UI with shadcn/ui components
  - Responsive design with horizontal scrolling

## Technologies Used

- React with Vite
- PDF.js for PDF rendering
- Marked.js for Markdown processing
- diff-match-patch for text comparison
- pixelmatch for visual PDF comparison
- Tailwind CSS for styling
- shadcn/ui for UI components

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
2. The differences will be highlighted in the third panel
3. Use the navigation controls at the bottom for PDFs
4. Toggle between Raw and Rendered views for Markdown files

## License

MIT 