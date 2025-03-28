import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <Card className="h-full flex items-center justify-center p-6">
        <p className="text-gray-500">No markdown content to display</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <div className="font-medium truncate">{fileName}</div>
        <div className="flex gap-1">
          <Button 
            variant={viewMode === 'rendered' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('rendered')}
          >
            Preview
          </Button>
          <Button 
            variant={viewMode === 'raw' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('raw')}
          >
            Raw
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'rendered' ? (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap">{markdownContent}</pre>
        )}
      </div>
    </Card>
  );
};

export default MarkdownViewer; 