import React, { useState } from 'react';

const MarkdownView = ({ markdown, viewType = 'raw' }) => {
  const [activeView, setActiveView] = useState(viewType);
  
  if (!markdown) {
    return <div>No markdown content available</div>;
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-200 p-1 rounded mb-2">
        <button 
          className={`px-2 py-1 rounded text-xs mr-1 ${activeView === 'raw' ? 'bg-white shadow' : ''}`}
          onClick={() => setActiveView('raw')}
        >
          Raw
        </button>
        <button 
          className={`px-2 py-1 rounded text-xs ${activeView === 'rendered' ? 'bg-white shadow' : ''}`}
          onClick={() => setActiveView('rendered')}
        >
          Rendered
        </button>
      </div>
      
      <div className="flex-1 overflow-auto border border-gray-300 p-2 rounded">
        {activeView === 'raw' ? (
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {markdown.text}
          </pre>
        ) : (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: markdown.html }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownView; 