import React, { useRef, useEffect } from 'react';

const PDFViewer = ({ pageData, zoom = 1.0 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !pageData || !pageData.canvas) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = pageData.canvas.width * zoom;
    canvas.height = pageData.canvas.height * zoom;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoom, zoom);
    ctx.drawImage(pageData.canvas, 0, 0);
    
    // Reset the transformation to avoid cumulative scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [pageData, zoom]);

  if (!pageData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No PDF page to display</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PDFViewer; 