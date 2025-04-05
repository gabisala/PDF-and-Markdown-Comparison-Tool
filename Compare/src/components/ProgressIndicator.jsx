import React from 'react';

const ProgressIndicator = ({ message, progress }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 border dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium dark:text-white">{message || 'Processing...'}</div>
        <div className="text-sm text-gray-500 dark:text-gray-300">{progress !== null ? `${progress}%` : ''}</div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress || 0}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 