import React, { useState } from 'react';
import DropZone from './components/DropZone';
import { GitHubDiffViewer } from './components/GitHubDiffViewer';
import MarkdownViewer from './components/MarkdownViewer';
import { processFile, isMarkdownFile } from './lib/fileProcessor';
import { generateTextDiff, formatDiffForViewer } from './lib/diffUtility';

function App() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [processedFiles, setProcessedFiles] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length !== 2) {
      setSelectedFiles(null);
      setProcessedFiles(null);
      setDiffData(null);
      setError(null);
      return;
    }

    setSelectedFiles(files);
    setLoading(true);
    setError(null);
    
    try {
      // Process both files
      const file1 = await processFile(files[0]);
      const file2 = await processFile(files[1]);
      
      setProcessedFiles([file1, file2]);
      
      // Only generate text diff for markdown files for now
      if (isMarkdownFile(files[0]) && isMarkdownFile(files[1])) {
        const textDiff = generateTextDiff(file1.content, file2.content);
        const formattedDiff = formatDiffForViewer({
          ...textDiff,
          fileName: file2.name // Use the second file name for the diff
        });
        setDiffData(formattedDiff);
      } else {
        // For now, we're not handling PDF diff yet
        setDiffData(null);
        setError("PDF comparison not yet implemented.");
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setError(err.message);
      setProcessedFiles(null);
      setDiffData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        PDF and Markdown Comparison Tool
      </h1>
      <div className="max-w-7xl mx-auto grid gap-6">
        <DropZone onFileSelect={handleFileSelect} />
        
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center">
            <p className="text-gray-600">Processing files...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {processedFiles && processedFiles.length === 2 && isMarkdownFile(selectedFiles[0]) && isMarkdownFile(selectedFiles[1]) && (
          <div className="grid grid-cols-2 gap-4">
            <MarkdownViewer 
              markdownContent={processedFiles[0].content} 
              fileName={processedFiles[0].name} 
            />
            <MarkdownViewer 
              markdownContent={processedFiles[1].content} 
              fileName={processedFiles[1].name} 
            />
          </div>
        )}
        
        {diffData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Differences</h2>
            <GitHubDiffViewer diffData={diffData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 