import React from 'react';

const ProgressIndicator = ({ message = 'Processing...', progress = null }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
        <p className="text-gray-600 mb-2">{message}</p>
        {progress !== null && (
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator; 