import React, { useState, useRef, useEffect } from 'react';
import DropZone from './components/DropZone';
import { GitHubDiffViewer } from './components/GitHubDiffViewer';
import MarkdownViewer from './components/MarkdownViewer';
import ProgressIndicator from './components/ProgressIndicator';
import ThemeToggle from './components/ThemeToggle';
import { processFile, isMarkdownFile, isPDFFile } from './lib/fileProcessor';
import { generateTextDiff, formatDiffForViewer } from './lib/diffUtility';
import { exportDiffAsHTML, exportDiffAsPDF } from './lib/utils';

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
  
  // Add export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Add ref for export dropdown
  const exportDropdownRef = useRef(null);
  
  // Scroll functions
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToDifferences = () => {
    differencesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

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

  // Export handlers
  const handleExportHTML = () => {
    if (!diffData || !processedFiles) return;
    
    // Generate the HTML with both file names
    const html = exportDiffAsHTML(
      diffData, 
      `Diff Report - ${processedFiles[0].name} vs ${processedFiles[1].name}`,
      {
        oldFileName: processedFiles[0].name,
        newFileName: processedFiles[1].name
      }
    );
    
    // Create a download link for the HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-report-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    setShowExportDropdown(false);
  };
  
  const handleExportPDF = () => {
    if (!diffData || !processedFiles) return;
    
    // Use the PDF export utility with both file names
    exportDiffAsPDF(
      diffData, 
      `Diff Report - ${processedFiles[0].name} vs ${processedFiles[1].name}`,
      {
        oldFileName: processedFiles[0].name,
        newFileName: processedFiles[1].name
      }
    );
    
    setShowExportDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 pt-12 transition-colors">
      <div ref={topRef} className="flex flex-col items-center justify-center mb-12">
        <div className="w-full flex justify-end mb-4">
        </div>
        <h1 className="text-3xl font-bold text-center dark:text-white">
          PDF and Markdown Comparison Tool
        </h1>
      </div>
      
      {/* Fixed navigation buttons */}
      <div className="fixed top-4 right-4 flex flex-col items-center gap-2 z-50">
        <ThemeToggle />
        <button 
          onClick={scrollToTop}
          className="bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Go to Top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={scrollToDifferences}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Go to Differences"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Differences</h2>
              
              {/* Export Dropdown */}
              <div className="relative" ref={exportDropdownRef}>
                <button 
                  onClick={() => setShowExportDropdown(prev => !prev)}
                  className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
                  aria-haspopup="true"
                  aria-expanded={showExportDropdown}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export
                </button>
                
                {showExportDropdown && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={handleExportHTML}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Export as HTML
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Export as PDF (print)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {processedFiles && (
              <div className="mb-4 flex flex-col sm:flex-row text-sm gap-3 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-medium">Original:</span> {processedFiles[0].name}
                </div>
                <div>
                  <span className="font-medium">Modified:</span> {processedFiles[1].name}
                </div>
              </div>
            )}
            <GitHubDiffViewer 
              diffData={diffData} 
              fileInfo={{
                oldFileName: processedFiles?.[0]?.name,
                newFileName: processedFiles?.[1]?.name
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 