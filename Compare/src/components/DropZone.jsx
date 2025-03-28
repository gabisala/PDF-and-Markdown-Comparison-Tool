import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card>
      <div 
        className={`p-6 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
          <div className="flex justify-center mb-4">
            <svg 
              className="w-12 h-12 text-gray-400" 
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

          <p className="mb-2 text-sm text-gray-600">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF or Markdown files only (max 2 files)
          </p>

          <Button
            onClick={handleButtonClick}
            className="mt-4"
            variant="outline"
          >
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="p-4 border-t">
          <h4 className="text-sm font-medium mb-2">Selected Files ({files.length}/2)</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded ${
                    file.type === 'application/pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {file.type === 'application/pdf' ? 'PDF' : 'MD'}
                  </span>
                  <span className="ml-2 text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
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
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default DropZone; 