import React from 'react';

const NavigationControls = ({ 
  currentPage, 
  totalPages, 
  zoom,
  onPrevPage, 
  onNextPage, 
  onZoomIn, 
  onZoomOut,
  onZoomReset
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-4">
      <div className="flex items-center space-x-2">
        <button
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
        >
          ←
        </button>
        
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
        >
          →
        </button>
      </div>
      
      <div className="border-l border-gray-300 h-6 mx-2"></div>
      
      <div className="flex items-center space-x-2">
        <button
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={onZoomOut}
        >
          -
        </button>
        
        <span className="text-sm">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={onZoomReset}
        >
          Reset
        </button>
        
        <button
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={onZoomIn}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default NavigationControls; 