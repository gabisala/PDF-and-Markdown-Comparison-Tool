import React, { useEffect, useRef } from 'react';

const FilePanel = ({ file, currentPage, zoom }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!file) return;
    
    const displayFile = () => {
      if (file.type === 'pdf') {
        displayPDF();
      }
    };
    
    const displayPDF = () => {
      if (!file.pages || file.pages.length === 0) return;
      
      // Find the current page
      const pageData = file.pages.find(p => p.pageNumber === currentPage) || file.pages[0];
      const canvas = canvasRef.current;
      
      if (canvas && pageData.canvas) {
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions based on zoom level
        canvas.width = pageData.width * zoom;
        canvas.height = pageData.height * zoom;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the page with zoom
        ctx.drawImage(
          pageData.canvas,
          0, 0,
          pageData.width,
          pageData.height,
          0, 0,
          pageData.width * zoom,
          pageData.height * zoom
        );
      }
    };
    
    displayFile();
  }, [file, currentPage, zoom]);
  
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No file loaded</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto">
      <div className="mb-2 text-sm text-gray-600">
        {file.name} {file.type === 'pdf' && `(Page ${currentPage} of ${file.numPages})`}
      </div>
      
      {file.type === 'pdf' && (
        <canvas 
          ref={canvasRef} 
          className="border border-gray-300"
        />
      )}
      
      {file.type === 'markdown' && (
        <div className="h-full flex flex-col">
          <div className="bg-gray-200 p-1 rounded mb-2">
            <button className="px-2 py-1 rounded bg-white shadow text-xs mr-1">
              Raw
            </button>
            <button className="px-2 py-1 rounded text-xs">
              Rendered
            </button>
          </div>
          
          <div className="flex-1 overflow-auto border border-gray-300 p-2 rounded">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {file.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePanel; 