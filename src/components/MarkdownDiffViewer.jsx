import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MarkdownDiffViewer = ({ diffData }) => {
  const [viewMode, setViewMode] = useState('raw'); // 'rendered' or 'raw'
  
  if (!diffData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No differences to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2 gap-2">
        <Button 
          variant={viewMode === 'rendered' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setViewMode('rendered')}
        >
          Rendered Split
        </Button>
        <Button 
          variant={viewMode === 'raw' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setViewMode('raw')}
        >
          Raw Diff
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto border rounded">
        {viewMode === 'raw' ? (
          <div className="p-4">
            <div className="mb-4 text-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-sm"></span>
                  <span className="text-xs">Added content</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-sm"></span>
                  <span className="text-xs">Removed content</span>
                </div>
              </div>
            </div>
            <div 
              className="font-mono text-sm leading-relaxed space-y-1"
              dangerouslySetInnerHTML={{ __html: diffData.rawText.html }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 h-full divide-x">
            <div className="p-4 overflow-auto">
              <div className="text-xs bg-gray-100 text-gray-700 mb-2 font-medium p-1 rounded">Original</div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: diffData.renderedHtml.html1 }}
              />
            </div>
            <div className="p-4 overflow-auto">
              <div className="text-xs bg-gray-100 text-gray-700 mb-2 font-medium p-1 rounded">Changed</div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: diffData.renderedHtml.html2 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownDiffViewer; 