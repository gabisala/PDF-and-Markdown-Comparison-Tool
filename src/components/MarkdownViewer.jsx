import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const MarkdownViewer = ({ markdownData, isRawDiff = false }) => {
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' or 'raw'
  
  if (!markdownData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No Markdown to display</p>
      </div>
    );
  }

  const renderContent = () => {
    if (isRawDiff) {
      // If this is displaying differences
      if (viewMode === 'raw') {
        return (
          <div 
            className="whitespace-pre-wrap font-mono text-sm overflow-auto h-full p-4"
            dangerouslySetInnerHTML={{ __html: markdownData.rawText.html }}
          />
        );
      } else {
        // In rendered mode, we show a split view of both rendered documents
        return (
          <div className="grid grid-cols-2 h-full divide-x">
            <div className="p-4 overflow-auto">
              <div className="text-xs text-gray-500 mb-2 font-medium">Original</div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownData.renderedHtml.html1 }}
              />
            </div>
            <div className="p-4 overflow-auto">
              <div className="text-xs text-gray-500 mb-2 font-medium">Changed</div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownData.renderedHtml.html2 }}
              />
            </div>
          </div>
        );
      }
    } else {
      // Normal markdown view (not diff)
      if (viewMode === 'raw') {
        return (
          <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto h-full p-4">
            {markdownData.text}
          </pre>
        );
      } else {
        return (
          <div 
            className="prose max-w-none overflow-auto h-full p-4"
            dangerouslySetInnerHTML={{ __html: markdownData.html }}
          />
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2 gap-2">
        <Button 
          variant={viewMode === 'rendered' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setViewMode('rendered')}
        >
          Rendered
        </Button>
        <Button 
          variant={viewMode === 'raw' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setViewMode('raw')}
        >
          Raw
        </Button>
      </div>
      <div className="flex-1 overflow-auto border rounded">
        {renderContent()}
      </div>
    </div>
  );
};

export default MarkdownViewer; 