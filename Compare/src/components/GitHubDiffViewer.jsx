import React, { useState, useRef, useEffect } from 'react';

export const GitHubDiffViewer = ({ diffData }) => {
  const [viewMode, setViewMode] = useState('unified'); // 'unified' or 'split'
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [diffIndices, setDiffIndices] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const diffContentRef = useRef(null);
  
  // Find indices of changed lines to support navigation
  useEffect(() => {
    if (diffData && diffData.lines) {
      const indices = diffData.lines
        .map((line, index) => line.type !== 'unchanged' ? index : null)
        .filter(index => index !== null);
      
      setDiffIndices(indices);
      if (indices.length > 0 && currentDiffIndex >= indices.length) {
        setCurrentDiffIndex(0);
      }
      
      // Initialize all sections as collapsed
      const newCollapsedSections = {};
      diffData.lines.forEach((line, index) => {
        if (line.isCollapsibleStart) {
          newCollapsedSections[index] = true;
        }
      });
      setCollapsedSections(newCollapsedSections);
    }
  }, [diffData, viewMode]);
  
  // Scroll to the current diff when it changes
  useEffect(() => {
    if (diffContentRef.current && diffIndices.length > 0) {
      const lineElements = diffContentRef.current.querySelectorAll('tr.diff-line');
      const lineToScrollTo = lineElements[diffIndices[currentDiffIndex]];
      
      if (lineToScrollTo) {
        lineToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a highlight effect
        lineToScrollTo.classList.add('bg-blue-100');
        setTimeout(() => {
          lineToScrollTo.classList.remove('bg-blue-100');
        }, 1000);
      }
    }
  }, [currentDiffIndex, diffIndices, viewMode, collapsedSections]);
  
  const navigateDiff = (direction) => {
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
  };

  const toggleCollapsedSection = (index) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  if (!diffData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No differences to display</p>
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
    <div className="flex flex-col h-full">
      {/* Diff Controls */}
      <div className="mb-3 flex flex-col gap-2">
        {/* Diff Summary */}
        <div className="flex items-center text-sm bg-gray-50 p-2 rounded border">
          <span className="mr-3">{diffSummary.files} changed files</span>
          <span className="flex items-center text-green-600 mr-3">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1"></span>
            +{diffSummary.additions}
          </span>
          <span className="flex items-center text-red-600">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1"></span>
            -{diffSummary.deletions}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'unified' ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300'}`}
              onClick={() => setViewMode('unified')}
            >
              Unified
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'split' ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300'}`}
              onClick={() => setViewMode('split')}
            >
              Split
            </button>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">
              {diffIndices.length > 0 
                ? `${currentDiffIndex + 1}/${diffIndices.length}` 
                : '0/0'}
            </span>
            <button 
              className="px-3 py-1 text-sm rounded-md bg-gray-100 border border-gray-300 disabled:opacity-50"
              onClick={() => navigateDiff('prev')}
              disabled={diffIndices.length === 0}
            >
              &lt; Prev
            </button>
            <button 
              className="px-3 py-1 text-sm rounded-md bg-gray-100 border border-gray-300 disabled:opacity-50"
              onClick={() => navigateDiff('next')}
              disabled={diffIndices.length === 0}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
      
      {/* Diff Content */}
      <div className="flex-1 overflow-auto border rounded" ref={diffContentRef}>
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
          className={part.removed ? 'bg-red-200' : part.added ? 'bg-green-200' : ''}
        >
          {part.value}
        </span>
      ))}
    </>
  );
};

// Collapsible section component
const CollapsedSection = ({ count, onClick }) => (
  <tr 
    onClick={onClick}
    className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
  >
    <td colSpan={4} className="py-1 px-2 text-center text-gray-500 text-sm">
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
        {count} unchanged line{count !== 1 ? 's' : ''}
      </button>
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
        index: i
      });
      
      // Skip the lines in the collapsed section
      skipCount = line.collapsibleCount - 1;
    } else {
      renderLines.push(line);
    }
  }
  
  return (
    <div className="p-0 font-mono text-sm w-full">
      <table className="w-full border-collapse">
        <tbody>
          {/* File header */}
          <tr className="bg-gray-100 border-b">
            <td colSpan={4} className="p-2 text-gray-700 font-bold">
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
            
            // Regular diff line
            return (
              <tr 
                key={index} 
                className={`diff-line hover:bg-gray-50 ${
                  line.type === 'added' 
                    ? 'bg-green-50' 
                    : line.type === 'removed' 
                    ? 'bg-red-50' 
                    : ''
                }`}
              >
                <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">
                  {line.oldLineNum || ''}
                </td>
                <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">
                  {line.newLineNum || ''}
                </td>
                <td className="w-6 text-center text-gray-500 select-none border-r">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ''}
                </td>
                <td className={`pl-2 whitespace-pre-wrap ${
                  line.type === 'added' 
                    ? 'text-green-600' 
                    : line.type === 'removed' 
                    ? 'text-red-600' 
                    : ''
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
        index: i
      });
      
      // Skip the lines in the collapsed section
      skipCount = line.collapsibleCount - 1;
    } else {
      renderLines.push(line);
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
      <div className="w-1/2 border-r">
        <div className="p-0 font-mono text-sm w-full">
          <table className="w-full border-collapse">
            <tbody>
              {/* File header */}
              <tr className="bg-gray-100 border-b">
                <td colSpan={2} className="p-2 text-gray-700 font-bold">
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
                      className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <td colSpan={2} className="py-1 px-2 text-center text-gray-500 text-sm">
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
                
                // Regular diff line
                return (
                  <tr 
                    key={index} 
                    className={`diff-line hover:bg-gray-50 ${line.type === 'removed' ? 'bg-red-50' : ''}`}
                  >
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">
                      {line.displayLineNum}
                    </td>
                    <td className={`pl-2 whitespace-pre-wrap ${line.type === 'removed' ? 'text-red-600' : ''}`}>
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
        <div className="p-0 font-mono text-sm w-full">
          <table className="w-full border-collapse">
            <tbody>
              {/* File header */}
              <tr className="bg-gray-100 border-b">
                <td colSpan={2} className="p-2 text-gray-700 font-bold">
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
                      className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <td colSpan={2} className="py-1 px-2 text-center text-gray-500 text-sm">
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
                
                // Regular diff line
                return (
                  <tr 
                    key={index} 
                    className={`diff-line hover:bg-gray-50 ${line.type === 'added' ? 'bg-green-50' : ''}`}
                  >
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">
                      {line.displayLineNum}
                    </td>
                    <td className={`pl-2 whitespace-pre-wrap ${line.type === 'added' ? 'text-green-600' : ''}`}>
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