import React, { useEffect, useRef, useState } from 'react';

const DiffPanel = ({ comparison, zoom }) => {
  const canvasRef = useRef(null);
  const [diffStats, setDiffStats] = useState(null);
  
  useEffect(() => {
    if (!comparison) return;
    
    const displayDiff = () => {
      if (comparison.type === 'pdf') {
        displayPDFDiff();
      }
    };
    
    const displayPDFDiff = () => {
      if (!comparison.diff || !comparison.diff.diffCanvas) return;
      
      const canvas = canvasRef.current;
      const diffCanvas = comparison.diff.diffCanvas;
      
      if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions based on zoom level
        canvas.width = diffCanvas.width * zoom;
        canvas.height = diffCanvas.height * zoom;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the diff with zoom
        ctx.drawImage(
          diffCanvas,
          0, 0,
          diffCanvas.width,
          diffCanvas.height,
          0, 0,
          diffCanvas.width * zoom,
          diffCanvas.height * zoom
        );
        
        // Update diff statistics
        setDiffStats({
          pixelCount: comparison.diff.diffPixelCount,
          percentDiff: comparison.diff.percentDiff.toFixed(2)
        });
      }
    };
    
    displayDiff();
  }, [comparison, zoom]);
  
  if (!comparison) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Load both files to see differences</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto">
      <div className="mb-2 text-sm text-gray-600 flex justify-between">
        <span>Differences</span>
        {diffStats && (
          <span>
            {diffStats.pixelCount} pixels ({diffStats.percentDiff}% different)
          </span>
        )}
      </div>
      
      {comparison.type === 'pdf' && (
        <canvas 
          ref={canvasRef} 
          className="border border-gray-300"
        />
      )}
      
      {comparison.type === 'markdown' && (
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
            <div 
              className="whitespace-pre-wrap text-sm font-mono"
              dangerouslySetInnerHTML={{ __html: comparison.diff?.rawText?.html }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffPanel; 