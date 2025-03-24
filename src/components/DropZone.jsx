import React from 'react';

const DropZone = ({ onFileDrop, onFileSelect, children, className }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file, onFileDrop);
    }
  };

  const handleClick = () => {
    document.getElementById('file-upload').click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file, onFileSelect);
    }
  };
  
  const validateAndProcessFile = (file, callback) => {
    const fileExt = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['pdf', 'md', 'markdown', 'txt'];
    
    if (!validExtensions.includes(fileExt)) {
      alert(`Unsupported file type: .${fileExt}\nPlease use PDF (.pdf) or Markdown (.md, .markdown, .txt) files.`);
      return;
    }
    
    callback(file);
  };

  return (
    <div 
      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer ${className}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        id="file-upload" 
        type="file" 
        className="hidden" 
        accept=".pdf,.md,.markdown,.txt" 
        onChange={handleFileChange}
      />
      {children || (
        <div className="text-center text-gray-500">
          <p>Drag and drop a file here, or click to select</p>
          <p className="text-xs mt-1">Supported formats: PDF, Markdown</p>
        </div>
      )}
    </div>
  );
};

export default DropZone; 