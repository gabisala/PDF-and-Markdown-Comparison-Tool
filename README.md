# PDF Comparison Tool

A browser-based tool that allows you to compare two PDF files side by side and see the differences highlighted in a third panel.

## Features

- Drag and drop interface for PDF files
- Side-by-side comparison of PDF files
- Visual highlighting of differences
- Multi-page navigation
- Zoom controls
- Local-only operation (no server required)

## Technologies Used

- React with Vite
- PDF.js for PDF rendering
- Pixelmatch for visual comparison
- shadcn/ui for UI components
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pdf-comparison-tool.git
cd pdf-comparison-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

1. Open the app in your browser
2. Drag and drop two PDF files into the interface, or click to select files
3. The PDFs will be displayed side by side
4. Use the navigation controls to browse pages and adjust zoom
5. The differences between the PDFs will be highlighted in the right panel

## License

MIT
