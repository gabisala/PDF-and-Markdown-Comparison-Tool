import React, { useState, useRef } from 'react';

const DropZone = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };

  const processFiles = (newFiles) => {
    // Filter for only PDF and Markdown files
    const validFiles = newFiles.filter(file => {
      const type = file.type;
      return type === 'application/pdf' || 
             type === 'text/markdown' || 
             type === 'text/plain' || // Include plain text as potential markdown
             file.name.endsWith('.md');
    });

    if (validFiles.length === 0) {
      alert('Please select PDF or Markdown files only.');
      return;
    }

    // Limit to 2 files maximum
    const updatedFiles = [...files, ...validFiles].slice(0, 2);
    setFiles(updatedFiles);
    
    // Notify parent component
    if (onFileSelect && updatedFiles.length === 2) {
      onFileSelect(updatedFiles);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    
    // Clear the parent's file selection since we no longer have 2 files
    if (onFileSelect) {
      onFileSelect(updatedFiles.length === 2 ? updatedFiles : null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="shadow-sm dark:shadow-gray-900/30 mb-8">
      <div 
        className={`p-10 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors mb-8 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept=".pdf,.md,.markdown,text/markdown,application/pdf,text/plain"
        />

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <svg 
              className="w-14 h-14 text-gray-400 dark:text-gray-300" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>

          <p className="mb-3 text-sm text-gray-600 dark:text-gray-200">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300">
            PDF or Markdown files only (max 2 files)
          </p>

          <button
            onClick={handleButtonClick}
            className="mt-6 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
              dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Select Files
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="p-6 pt-8 pb-8 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-4 dark:text-white">Selected Files ({files.length}/2)</h4>
          <ul className="space-y-4">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <div className="flex items-center">
                  <span className={`w-10 h-10 flex items-center justify-center rounded font-semibold ${
                    file.type === 'application/pdf' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}>
                    {file.type === 'application/pdf' ? 'PDF' : 'MD'}
                  </span>
                  <span className="ml-4 text-sm truncate max-w-xs dark:text-gray-200">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 p-1"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropZone; 