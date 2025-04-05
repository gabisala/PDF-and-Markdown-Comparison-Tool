import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

const MarkdownViewer = ({ markdownContent, fileName = 'Untitled.md' }) => {
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' or 'raw'
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (markdownContent && viewMode === 'rendered') {
      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });

      // Convert markdown to HTML
      try {
        const renderedHtml = marked.parse(markdownContent);
        setHtml(renderedHtml);
      } catch (error) {
        console.error('Error parsing markdown:', error);
        setHtml('<div class="text-red-500">Error rendering markdown</div>');
      }
    }
  }, [markdownContent, viewMode]);

  if (!markdownContent) {
    return (
      <div className="h-full flex items-center justify-center p-6 border rounded-lg shadow-sm dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No markdown content to display</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden border rounded-lg shadow-sm dark:border-gray-700">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="font-medium truncate dark:text-white">{fileName}</div>
        <div className="flex gap-1">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'rendered' 
                ? 'bg-blue-600 text-white dark:bg-blue-500' 
                : 'bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
            }`}
            onClick={() => setViewMode('rendered')}
          >
            Preview
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'raw' 
                ? 'bg-blue-600 text-white dark:bg-blue-500' 
                : 'bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
            }`}
            onClick={() => setViewMode('raw')}
          >
            Raw
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 dark:bg-gray-800">
        {viewMode === 'rendered' ? (
          <div 
            className="prose max-w-none dark:prose-invert dark:text-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap dark:text-gray-200">{markdownContent}</pre>
        )}
      </div>
    </div>
  );
};

export default MarkdownViewer; 