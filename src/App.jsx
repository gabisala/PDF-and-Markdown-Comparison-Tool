import { useState, useEffect } from 'react'
import './App.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { processPDF, comparePDFPages } from './utils/pdfUtils'
import { processMarkdown, compareMarkdown } from './utils/markdownUtils'
import DropZone from './components/DropZone'
import PDFViewer from './components/PDFViewer'
import DiffViewer from './components/DiffViewer'
import MarkdownViewer from './components/MarkdownViewer'
import MarkdownDiffViewer from './components/MarkdownDiffViewer'

function App() {
  const [files, setFiles] = useState({
    left: null,
    right: null
  });

  const [comparison, setComparison] = useState(null);

  const [viewState, setViewState] = useState({
    currentPage: 1,
    totalPages: 1,
    zoom: 1.0
  });

  const handleFileDrop = (side) => async (file) => {
    try {
      let processedFile;
      const fileExt = file.name.toLowerCase().split('.').pop();
      
      if (fileExt === 'pdf') {
        processedFile = await processPDF(file);
      } else if (['md', 'markdown', 'txt'].includes(fileExt)) {
        processedFile = await processMarkdown(file);
      } else {
        console.error('Unsupported file type');
        return;
      }
      
      setFiles(prev => ({
        ...prev,
        [side]: processedFile
      }));
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  useEffect(() => {
    const compareFiles = async () => {
      if (!files.left || !files.right) return;
      
      if (files.left.type !== files.right.type) {
        console.error('Cannot compare different file types');
        return;
      }
      
      try {
        if (files.left.type === 'pdf') {
          setViewState(prev => ({
            ...prev,
            currentPage: 1,
            totalPages: Math.min(files.left.numPages, files.right.numPages)
          }));
          
          setTimeout(() => {
            comparePDFFiles();
          }, 0);
        } else if (files.left.type === 'markdown') {
          compareMarkdownFiles();
        }
      } catch (error) {
        console.error('Error comparing files:', error);
      }
    };
    
    compareFiles();
  }, [files.left, files.right]);

  const comparePDFFiles = () => {
    if (!files.left || !files.right || files.left.type !== 'pdf' || files.right.type !== 'pdf') return;
    
    const leftPage = files.left.pages.find(p => p.pageNumber === viewState.currentPage);
    const rightPage = files.right.pages.find(p => p.pageNumber === viewState.currentPage);
    
    if (!leftPage || !rightPage) return;
    
    const diff = comparePDFPages(leftPage.canvas, rightPage.canvas);
    
    setComparison({
      type: 'pdf',
      diff
    });
  };

  const compareMarkdownFiles = () => {
    if (!files.left || !files.right || files.left.type !== 'markdown' || files.right.type !== 'markdown') {
      console.error("Cannot compare: files are not both markdown type");
      return;
    }
    
    try {
      console.log("Comparing markdown files:", {
        file1: files.left.name,
        file2: files.right.name,
        textLength1: files.left.text.length,
        textLength2: files.right.text.length
      });
      
      const diff = compareMarkdown(files.left.text, files.right.text);
      
      console.log("Markdown comparison complete. Result has diff data:", !!diff);
      
      setComparison({
        type: 'markdown',
        diff
      });
    } catch (error) {
      console.error("Error comparing markdown files:", error);
      alert("There was an error comparing the markdown files. Check the console for details.");
    }
  };

  useEffect(() => {
    if (files.left?.type === 'pdf' && files.right?.type === 'pdf') {
      comparePDFFiles();
    }
  }, [viewState.currentPage]);

  const handlePrevPage = () => {
    setViewState(prev => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1)
    }));
  };

  const handleNextPage = () => {
    setViewState(prev => ({
      ...prev,
      currentPage: Math.min(prev.totalPages, prev.currentPage + 1)
    }));
  };

  const handleZoomIn = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(3.0, prev.zoom + 0.1)
    }));
  };

  const handleZoomOut = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.5, prev.zoom - 0.1)
    }));
  };

  const getPageData = (file) => {
    if (!file || file.type !== 'pdf') return null;
    return file.pages.find(p => p.pageNumber === viewState.currentPage) || null;
  };

  const renderInitialDropzone = () => {
    return (
      <div className="mb-6">
        <DropZone 
          onFileDrop={handleFileDrop('left')}
          onFileSelect={handleFileDrop('left')}
          className="h-40"
        >
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Compare Files</p>
            <p>Drag and drop two files (PDF or Markdown) here, or click to select files</p>
          </div>
        </DropZone>
      </div>
    );
  };

  const getFileTitle = (side) => {
    const file = files[side];
    if (!file) return side === 'left' ? 'File 1' : 'File 2';
    
    let title = side === 'left' ? 'File 1' : 'File 2';
    if (file.name) title += ` (${file.name})`;
    
    if (file.type === 'pdf') {
      title += ` - Page ${viewState.currentPage}`;
    }
    
    return title;
  };

  const renderFileContent = (side) => {
    const file = files[side];
    
    if (!file) {
      return (
        <DropZone 
          onFileDrop={handleFileDrop(side)}
          onFileSelect={handleFileDrop(side)}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <p>Drag and drop {side === 'left' ? 'first' : 'second'} file here</p>
            <p className="text-xs">(PDF or Markdown)</p>
          </div>
        </DropZone>
      );
    }
    
    if (file.type === 'pdf') {
      return (
        <PDFViewer 
          pageData={getPageData(file)} 
          zoom={viewState.zoom} 
        />
      );
    } else if (file.type === 'markdown') {
      return (
        <MarkdownViewer 
          markdownData={file}
        />
      );
    }
    
    return null;
  };

  const renderDiffContent = () => {
    if (!comparison) return null;
    
    if (comparison.type === 'pdf') {
      return (
        <DiffViewer 
          diffData={comparison.diff}
          zoom={viewState.zoom}
        />
      );
    } else if (comparison.type === 'markdown') {
      return (
        <MarkdownDiffViewer 
          diffData={comparison.diff}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 overflow-x-auto">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">File Comparison Tool</h1>
        
        {(!files.left || !files.right) && renderInitialDropzone()}
        
        <div className="grid grid-cols-3 gap-4 mb-4 min-w-[900px]">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">{getFileTitle('left')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-[85vh] overflow-hidden relative">
              {renderFileContent('left')}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">{getFileTitle('right')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-[85vh] overflow-hidden relative">
              {renderFileContent('right')}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                Differences
                {files.left?.type === 'pdf' ? ` - Page ${viewState.currentPage}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-[85vh] overflow-hidden relative">
              {comparison ? (
                renderDiffContent()
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>Comparison results will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {files.left?.type === 'pdf' && files.right?.type === 'pdf' && (
          <div className="flex justify-center items-center gap-4 mt-4 min-w-[900px]">
            <Button 
              onClick={handlePrevPage}
              disabled={viewState.currentPage <= 1}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex items-center">
              <span>Page {viewState.currentPage} of {viewState.totalPages}</span>
            </div>
            <Button 
              onClick={handleNextPage}
              disabled={viewState.currentPage >= viewState.totalPages}
              variant="outline"
            >
              Next
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Button onClick={handleZoomOut} variant="outline" size="icon" className="h-8 w-8 rounded-full">-</Button>
              <span>{Math.round(viewState.zoom * 100)}%</span>
              <Button onClick={handleZoomIn} variant="outline" size="icon" className="h-8 w-8 rounded-full">+</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
