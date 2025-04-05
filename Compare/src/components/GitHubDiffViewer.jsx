import React, { useState, useRef, useEffect, useCallback } from 'react';

export const GitHubDiffViewer = ({ diffData }) => {
  const [viewMode, setViewMode] = useState('unified'); // 'unified' or 'split'
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [diffIndices, setDiffIndices] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const diffContentRef = useRef(null);
  
  // Memoize the navigation function
  const navigateDiff = useCallback((direction) => {
    if (diffIndices.length === 0) return;
    
    if (direction === 'next') {
      setCurrentDiffIndex((prevIndex) => 
        prevIndex === diffIndices.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setCurrentDiffIndex((prevIndex) => 
        prevIndex === 0 ? diffIndices.length - 1 : prevIndex - 1
      );
    }
  }, [diffIndices]);
  
  // Track scroll position to show/hide floating nav based on diff content visibility
  useEffect(() => {
    const handleScroll = () => {
      if (diffContentRef.current) {
        const rect = diffContentRef.current.getBoundingClientRect();
        // Show floating nav when the diff content is in view
        setShowFloatingNav(
          rect.top < window.innerHeight && 
          rect.bottom > 0
        );
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Add keyboard navigation with proper dependencies
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle navigation keys if not in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'n' || e.key === 'j') {
        navigateDiff('next');
      } else if (e.key === 'p' || e.key === 'k') {
        navigateDiff('prev');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateDiff]);
  
  // Find indices of changed lines to support navigation
  useEffect(() => {
    if (diffData && diffData.lines) {
      // Create a new array to track actual line differences (not just rendering indices)
      const indices = [];
      
      // Track the actual indices of modified lines in the original data
      diffData.lines.forEach((line, index) => {
        // Only include lines that are actual differences (added or removed)
        if (line.type === 'added' || line.type === 'removed') {
          // Check if this line is in a collapsed section
          const isInCollapsedSection = Object.entries(collapsedSections).some(([startIndex, isCollapsed]) => {
            if (!isCollapsed) return false;
            const section = diffData.lines[parseInt(startIndex)];
            return section && 
                   section.isCollapsibleStart && 
                   index >= parseInt(startIndex) && 
                   index < parseInt(startIndex) + section.collapsibleCount;
          });
          
          if (!isInCollapsedSection) {
            indices.push(index);
          }
        }
      });
      
      setDiffIndices(indices);
      if (indices.length > 0 && currentDiffIndex >= indices.length) {
        setCurrentDiffIndex(0);
      }
    }
  }, [diffData, collapsedSections]);
  
  // Scroll to the current diff when it changes
  useEffect(() => {
    if (diffContentRef.current && diffIndices.length > 0) {
      // Get the actual index in the original data that we want to navigate to
      const targetLineIndex = diffIndices[currentDiffIndex];
      
      // Find all line elements
      const allLineElements = diffContentRef.current.querySelectorAll('tr.diff-line');
      
      // Find the element that has the matching original line index
      let lineToScrollTo = null;
      for (const lineElement of allLineElements) {
        const lineIndexAttr = lineElement.getAttribute('data-original-index');
        if (lineIndexAttr && parseInt(lineIndexAttr) === targetLineIndex) {
          lineToScrollTo = lineElement;
          break;
        }
      }
      
      if (lineToScrollTo) {
        // Scroll the line into view with some padding
        lineToScrollTo.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add a stronger highlight effect with animation
        lineToScrollTo.classList.add('highlight-current-diff');
        
        // Remove any previous highlights
        const prevHighlights = diffContentRef.current.querySelectorAll('.highlight-current-diff');
        prevHighlights.forEach(el => {
          if (el !== lineToScrollTo) {
            el.classList.remove('highlight-current-diff');
          }
        });
      }
    }
  }, [currentDiffIndex, diffIndices]);
  
  // Add CSS for the highlight animation using inline styles
  useEffect(() => {
    // Create a style element for the highlight animation
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.innerHTML = `
      .highlight-current-diff {
        position: relative;
        z-index: 1;
      }
      .highlight-current-diff::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(59, 130, 246, 0.25); /* Lighter blue with lower opacity */
        border-left: 3px solid rgba(37, 99, 235, 0.7); /* Semi-transparent blue border */
        z-index: -1;
        pointer-events: none;
      }
      
      /* Dark mode styles for highlight */
      .dark .highlight-current-diff::after {
        background-color: rgba(59, 130, 246, 0.3); /* Slightly more visible in dark mode */
        border-left: 3px solid rgba(96, 165, 250, 0.8); /* Brighter blue border for dark mode */
      }
    `;
    document.head.appendChild(styleEl);
    
    // Clean up the style element on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  const toggleCollapsedSection = (index) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  if (!diffData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No differences to display</p>
      </div>
    );
  }

  // Use real diff summary from the diffData
  const diffSummary = {
    additions: diffData.summary?.additions || 0,
    deletions: diffData.summary?.deletions || 0,
    changes: diffData.summary?.changes || 0,
    files: 1
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Diff Controls (without navigation) */}
      <div className="mb-3 flex flex-col gap-2">
        {/* Diff Summary */}
        <div className="flex items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
          <span className="mr-3 dark:text-gray-200">{diffSummary.files} changed files</span>
          <span className="flex items-center text-green-600 dark:text-green-400 mr-3">
            <span className="inline-block w-3 h-3 bg-green-500 dark:bg-green-400 rounded-sm mr-1"></span>
            +{diffSummary.additions}
          </span>
          <span className="flex items-center text-red-600 dark:text-red-400">
            <span className="inline-block w-3 h-3 bg-red-500 dark:bg-red-400 rounded-sm mr-1"></span>
            -{diffSummary.deletions}
          </span>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium dark:text-gray-300">View Mode:</span>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${
                viewMode === 'unified' 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
              }`}
              onClick={() => setViewMode('unified')}
            >
              Unified
            </button>
            <button 
              className={`px-3 py-1 text-sm ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
              }`}
              onClick={() => setViewMode('split')}
            >
              Split
            </button>
          </div>
          
          {/* Diff Navigation Stats */}
          {diffIndices.length > 0 && (
            <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">
              Showing diff {currentDiffIndex + 1} of {diffIndices.length}
            </div>
          )}
        </div>
      </div>
      
      {/* Diff Content */}
      <div 
        ref={diffContentRef} 
        className="flex-1 overflow-x-auto border rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700"
      >
        {viewMode === 'unified' ? (
          <UnifiedDiffView 
            diffData={diffData} 
            collapsedSections={collapsedSections} 
            toggleCollapsedSection={toggleCollapsedSection} 
          />
        ) : (
          <SplitDiffView 
            diffData={diffData} 
            collapsedSections={collapsedSections} 
            toggleCollapsedSection={toggleCollapsedSection}
          />
        )}
      </div>
      
      {/* Floating Diff Navigation */}
      {showFloatingNav && diffIndices.length > 1 && (
        <div className="fixed bottom-4 right-4 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border dark:border-gray-700 z-50">
          <div className="flex gap-1">
            <button
              onClick={() => navigateDiff('prev')}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Previous difference (p/k)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => navigateDiff('next')}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Next difference (n/j)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <span className="text-xs flex items-center text-gray-500 dark:text-gray-400">
            {currentDiffIndex + 1}/{diffIndices.length}
          </span>
        </div>
      )}
    </div>
  );
};

// Helper function to render word-level diff content
const renderWordDiff = (line) => {
  if (!line.wordDiff) {
    return <span>{line.content}</span>;
  }

  return (
    <>
      {line.wordDiff.map((part, i) => (
        <span 
          key={i} 
          className={
            part.removed 
              ? 'bg-red-200/70 dark:bg-red-800/50 dark:text-red-100' 
              : part.added 
              ? 'bg-green-200/70 dark:bg-green-800/50 dark:text-green-100' 
              : ''
          }
        >
          {part.value}
        </span>
      ))}
    </>
  );
};

// Collapsible section component
const CollapsedSection = ({ count, onClick }) => (
  <tr>
    <td colSpan="4" className="text-center py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" onClick={onClick}>
      <span className="text-gray-600 dark:text-gray-300 text-sm">... {count} unchanged lines ...</span>
    </td>
  </tr>
);

const UnifiedDiffView = ({ diffData, collapsedSections, toggleCollapsedSection }) => {
  const fileName = diffData.fileName || 'Unknown File';
  const lines = diffData.lines || [];
  
  // Process lines for rendering, handling collapsed sections
  const renderLines = [];
  let skipCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines in collapsed sections
    if (skipCount > 0) {
      skipCount--;
      continue;
    }
    
    // If this is the start of a collapsible section and it's collapsed
    if (line.isCollapsibleStart && collapsedSections[i]) {
      // Add a collapsed section indicator
      renderLines.push({
        type: 'collapsed',
        count: line.collapsibleCount,
        index: i,
        originalIndex: i
      });
      
      // Skip the lines in the collapsed section
      skipCount = line.collapsibleCount - 1;
    } else {
      // Add the original index to each line for navigation
      renderLines.push({
        ...line,
        originalIndex: i
      });
    }
  }
  
  return (
    <div className="p-0 font-mono text-sm w-full bg-white dark:bg-gray-800">
      <table className="w-full border-collapse">
        <tbody>
          {/* File header */}
          <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
            <td colSpan={4} className="p-2 text-gray-700 dark:text-gray-200 font-bold">
              {fileName}
            </td>
          </tr>
          
          {/* Diff lines */}
          {renderLines.map((line, index) => {
            // Handle collapsed section
            if (line.type === 'collapsed') {
              return (
                <CollapsedSection 
                  key={`collapsed-${index}`}
                  count={line.count}
                  onClick={() => toggleCollapsedSection(line.index)}
                />
              );
            }
            
            // Determine background based on line type
            let bgClass = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
            if (line.type === 'added') {
              bgClass = "bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/40";
            } else if (line.type === 'removed') {
              bgClass = "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/40";
            }
            
            // Regular diff line
            return (
              <tr 
                key={index} 
                data-original-index={line.originalIndex}
                className={`diff-line ${bgClass}`}
              >
                <td className="w-10 text-right text-gray-500 dark:text-gray-400 pr-1 select-none border-r dark:border-gray-600">
                  {line.oldLineNum || ''}
                </td>
                <td className="w-10 text-right text-gray-500 dark:text-gray-400 pr-1 select-none border-r dark:border-gray-600">
                  {line.newLineNum || ''}
                </td>
                <td className="w-6 text-center text-gray-500 dark:text-gray-400 select-none border-r dark:border-gray-600">
                  {line.type === 'added' ? (
                    <span className="text-green-600 dark:text-green-400">+</span>
                  ) : line.type === 'removed' ? (
                    <span className="text-red-600 dark:text-red-400">-</span>
                  ) : (
                    ''
                  )}
                </td>
                <td className={`pl-2 whitespace-pre-wrap ${
                  line.type === 'added' 
                    ? 'text-green-600 dark:text-green-300' 
                    : line.type === 'removed' 
                    ? 'text-red-600 dark:text-red-300' 
                    : 'dark:text-gray-300'
                }`}>
                  {line.hasPair ? renderWordDiff(line) : line.content}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const SplitDiffView = ({ diffData, collapsedSections, toggleCollapsedSection }) => {
  const fileName = diffData.fileName || 'Unknown File';
  const lines = diffData.lines || [];
  
  // Process lines for rendering, handling collapsed sections
  const renderLines = [];
  let skipCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines in collapsed sections
    if (skipCount > 0) {
      skipCount--;
      continue;
    }
    
    // If this is the start of a collapsible section and it's collapsed
    if (line.isCollapsibleStart && collapsedSections[i]) {
      // Add a collapsed section indicator
      renderLines.push({
        type: 'collapsed',
        count: line.collapsibleCount,
        index: i,
        originalIndex: i
      });
      
      // Skip the lines in the collapsed section
      skipCount = line.collapsibleCount - 1;
    } else {
      // Add the original index to each line for navigation
      renderLines.push({
        ...line,
        originalIndex: i
      });
    }
  }
  
  // Process lines for split view
  const leftLines = [];
  const rightLines = [];
  
  renderLines.forEach(line => {
    // Handle collapsed sections
    if (line.type === 'collapsed') {
      leftLines.push(line);
      rightLines.push(line);
      return;
    }
    
    if (line.type === 'removed' || line.type === 'unchanged') {
      leftLines.push({
        ...line,
        displayLineNum: line.oldLineNum
      });
    } else if (line.type === 'unchanged') {
      // For unchanged lines, add to both sides
      leftLines.push({
        ...line,
        displayLineNum: line.oldLineNum
      });
    }
    
    if (line.type === 'added' || line.type === 'unchanged') {
      rightLines.push({
        ...line,
        displayLineNum: line.newLineNum
      });
    } else if (line.type === 'unchanged') {
      // For unchanged lines, add to both sides
      rightLines.push({
        ...line,
        displayLineNum: line.newLineNum
      });
    }
  });
  
  return (
    <div className="flex">
      <div className="w-1/2 border-r dark:border-gray-600">
        <div className="p-0 font-mono text-sm w-full bg-white dark:bg-gray-800">
          <table className="w-full border-collapse">
            <tbody>
              {/* File header */}
              <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                <td colSpan={2} className="p-2 text-gray-700 dark:text-gray-200 font-bold">
                  {fileName} (Original)
                </td>
              </tr>
              
              {/* Left side - Original content */}
              {leftLines.map((line, index) => {
                // Handle collapsed section
                if (line.type === 'collapsed') {
                  return (
                    <tr 
                      key={`collapsed-${index}`}
                      onClick={() => toggleCollapsedSection(line.index)}
                      className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <td colSpan={2} className="py-1 px-2 text-center text-sm text-gray-500 dark:text-gray-300">
                        <button className="flex items-center justify-center w-full">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {line.count} unchanged line{line.count !== 1 ? 's' : ''}
                        </button>
                      </td>
                    </tr>
                  );
                }
                
                // Determine background based on line type
                let bgClass = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
                if (line.type === 'removed') {
                  bgClass = "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/40";
                }
                
                // Regular diff line
                return (
                  <tr 
                    key={index} 
                    data-original-index={line.originalIndex}
                    className={`diff-line ${bgClass}`}
                  >
                    <td className="w-10 text-right text-gray-500 dark:text-gray-400 pr-1 select-none border-r dark:border-gray-600">
                      {line.displayLineNum}
                    </td>
                    <td className={`pl-2 whitespace-pre-wrap ${
                      line.type === 'removed' 
                        ? 'text-red-600 dark:text-red-300' 
                        : 'dark:text-gray-300'
                    }`}>
                      {line.hasPair ? renderWordDiff(line) : line.content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="w-1/2">
        <div className="p-0 font-mono text-sm w-full bg-white dark:bg-gray-800">
          <table className="w-full border-collapse">
            <tbody>
              {/* File header */}
              <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                <td colSpan={2} className="p-2 text-gray-700 dark:text-gray-200 font-bold">
                  {fileName} (Modified)
                </td>
              </tr>
              
              {/* Right side - Modified content */}
              {rightLines.map((line, index) => {
                // Handle collapsed section
                if (line.type === 'collapsed') {
                  return (
                    <tr 
                      key={`collapsed-${index}`}
                      onClick={() => toggleCollapsedSection(line.index)}
                      className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <td colSpan={2} className="py-1 px-2 text-center text-sm text-gray-500 dark:text-gray-300">
                        <button className="flex items-center justify-center w-full">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {line.count} unchanged line{line.count !== 1 ? 's' : ''}
                        </button>
                      </td>
                    </tr>
                  );
                }
                
                // Determine background based on line type
                let bgClass = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
                if (line.type === 'added') {
                  bgClass = "bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/40";
                }
                
                // Regular diff line
                return (
                  <tr 
                    key={index} 
                    data-original-index={line.originalIndex}
                    className={`diff-line ${bgClass}`}
                  >
                    <td className="w-10 text-right text-gray-500 dark:text-gray-400 pr-1 select-none border-r dark:border-gray-600">
                      {line.displayLineNum}
                    </td>
                    <td className={`pl-2 whitespace-pre-wrap ${
                      line.type === 'added' 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'dark:text-gray-300'
                    }`}>
                      {line.hasPair ? renderWordDiff(line) : line.content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 