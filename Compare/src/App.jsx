import React, { useState, useRef } from 'react';
import DropZone from './components/DropZone';
import { GitHubDiffViewer } from './components/GitHubDiffViewer';
import MarkdownViewer from './components/MarkdownViewer';
import ProgressIndicator from './components/ProgressIndicator';
import ThemeToggle from './components/ThemeToggle';
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
  
  // Add refs for scrolling
  const topRef = useRef(null);
  const differencesRef = useRef(null);
  
  // Scroll functions
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToDifferences = () => {
    differencesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    setDiffData(null);
    
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
      console.log("Processed files:", [file1, file2]);
      
      // Check if both files are PDFs
      const arePDFs = isPDFFile(files[0]) && isPDFFile(files[1]);
      
      // Generate diff based on file types
      setProcessingStep('Comparing files...');
      const textDiff = generateTextDiff(file1.content, file2.content, arePDFs);
      const formattedDiff = formatDiffForViewer({
        ...textDiff,
        fileName: file2.name // Use the second file name for the diff
      });
      
      console.log("Generated diff data:", formattedDiff);
      setDiffData(formattedDiff);
      setProcessingProgress(100);
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
    if (!selectedFiles || !selectedFiles[index]) return null;
    
    if (isMarkdownFile(selectedFiles[index])) {
      return (
        <div className="bg-white dark:bg-gray-800 h-full">
          <MarkdownViewer 
            markdownContent={fileData.content} 
            fileName={fileData.name} 
          />
        </div>
      );
    } else if (isPDFFile(selectedFiles[index])) {
      return (
        <div className="h-full flex flex-col overflow-hidden border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <div className="font-medium truncate">{fileData.name}</div>
          </div>
          <div className="flex-1 overflow-auto p-6 whitespace-pre-wrap font-mono text-sm dark:text-gray-200">
            {fileData.content ? fileData.content : "No content available"}
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full">
          <h3 className="font-medium mb-2 dark:text-gray-200">{fileData.name}</h3>
          <div className="border p-3 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 max-h-96 overflow-auto">
            <pre className="text-xs text-gray-800 dark:text-gray-200">{fileData.content ? fileData.content : "No content available"}</pre>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors">
      <div ref={topRef} className="flex flex-col items-center justify-center mb-8">
        <div className="w-full flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold text-center dark:text-white">
          PDF and Markdown Comparison Tool
        </h1>
      </div>
      <div className="max-w-7xl mx-auto grid gap-6">
        <DropZone onFileSelect={handleFileSelect} />
        
        {loading && (
          <ProgressIndicator 
            message={processingStep} 
            progress={processingProgress} 
          />
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {processedFiles && processedFiles.length === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {renderFilePreview(processedFiles[0], 0)}
            {renderFilePreview(processedFiles[1], 1)}
          </div>
        )}
        
        {diffData && (
          <div ref={differencesRef} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 my-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Differences</h2>
            <GitHubDiffViewer diffData={diffData} />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {diffData && (
        <div className="fixed top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-50">
          <button 
            onClick={scrollToTop}
            className="bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            title="Go to Top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={scrollToDifferences}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Go to Differences"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default App; 