import React, { useRef, useEffect } from 'react';

const DiffViewer = ({ diffData, zoom = 1.0 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !diffData || !diffData.diffCanvas) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = diffData.diffCanvas.width * zoom;
    canvas.height = diffData.diffCanvas.height * zoom;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoom, zoom);
    ctx.drawImage(diffData.diffCanvas, 0, 0);
    
    // Reset the transformation to avoid cumulative scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [diffData, zoom]);

  if (!diffData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No differences to display</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto flex items-center justify-center">
      <canvas ref={canvasRef} />
      {diffData.diffPixelCount > 0 && (
        <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
          {diffData.diffPixelCount} pixels different
        </div>
      )}
    </div>
  );
};

export default DiffViewer; 