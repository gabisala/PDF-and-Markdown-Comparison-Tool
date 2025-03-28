import React, { useState } from 'react';
import DropZone from './components/DropZone';
import { GitHubDiffViewer } from './components/GitHubDiffViewer';
import MarkdownViewer from './components/MarkdownViewer';
import ProgressIndicator from './components/ProgressIndicator';
import { processFile, isMarkdownFile, isPDFFile } from './lib/fileProcessor';
import { generateTextDiff, formatDiffForViewer } from './lib/diffUtility';

function App() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [processedFiles, setProcessedFiles] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(null);

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
    setProcessingProgress(0);
    
    try {
      // Process first file
      setProcessingStep('Processing first file...');
      const file1 = await processFile(files[0]);
      setProcessingProgress(33);
      
      // Process second file
      setProcessingStep('Processing second file...');
      const file2 = await processFile(files[1]);
      setProcessingProgress(66);
      
      setProcessedFiles([file1, file2]);
      
      // Check if both files are PDFs
      const arePDFs = isPDFFile(files[0]) && isPDFFile(files[1]);
      
      // Generate diff based on file types
      setProcessingStep('Comparing files...');
      const textDiff = generateTextDiff(file1.content, file2.content, arePDFs);
      const formattedDiff = formatDiffForViewer({
        ...textDiff,
        fileName: file2.name // Use the second file name for the diff
      });
      setProcessingProgress(100);
      setDiffData(formattedDiff);
    } catch (err) {
      console.error('Error processing files:', err);
      setError(err.message);
      setProcessedFiles(null);
      setDiffData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderFilePreview = (fileData, index) => {
    if (isMarkdownFile(selectedFiles[index])) {
      return (
        <MarkdownViewer 
          markdownContent={fileData.content} 
          fileName={fileData.name} 
        />
      );
    } else if (isPDFFile(selectedFiles[index])) {
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">{fileData.name}</h3>
          <div className="border p-3 rounded bg-gray-50 max-h-96 overflow-auto whitespace-pre-wrap font-mono text-sm">
            {fileData.content}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        PDF and Markdown Comparison Tool
      </h1>
      <div className="max-w-7xl mx-auto grid gap-6">
        <DropZone onFileSelect={handleFileSelect} />
        
        {loading && (
          <ProgressIndicator 
            message={processingStep} 
            progress={processingProgress} 
          />
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {processedFiles && processedFiles.length === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {renderFilePreview(processedFiles[0], 0)}
            {renderFilePreview(processedFiles[1], 1)}
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