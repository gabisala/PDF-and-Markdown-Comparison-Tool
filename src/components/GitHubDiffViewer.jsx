import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const GitHubDiffViewer = ({ diffData }) => {
  const [viewMode, setViewMode] = useState('unified'); // 'unified' or 'split'
  
  if (!diffData || !diffData.githubDiff) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No differences to display</p>
      </div>
    );
  }

  // Get diff data from our utility
  const { summary, filename, lines } = diffData.githubDiff;

  return (
    <div className="flex flex-col h-full">
      {/* Diff Controls */}
      <div className="mb-3 flex flex-col gap-2">
        {/* Diff Summary */}
        <div className="flex items-center text-sm bg-gray-50 p-2 rounded border">
          <span className="mr-3">1 changed file</span>
          <span className="flex items-center text-green-600 mr-3">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1"></span>
            +{summary.additions}
          </span>
          <span className="flex items-center text-red-600">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1"></span>
            -{summary.deletions}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button 
              variant={viewMode === 'unified' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('unified')}
            >
              Unified
            </Button>
            <Button 
              variant={viewMode === 'split' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('split')}
            >
              Split
            </Button>
          </div>
        </div>
      </div>
      
      {/* Diff Content */}
      <div className="flex-1 overflow-auto border rounded">
        {viewMode === 'unified' ? (
          <UnifiedDiffView diffData={diffData.githubDiff} />
        ) : (
          <SplitDiffView diffData={diffData.githubDiff} />
        )}
      </div>
    </div>
  );
};

const UnifiedDiffView = ({ diffData }) => {
  if (!diffData || !diffData.lines) {
    return <div className="p-4">No diff data available</div>;
  }
  
  // Keep track of line numbers
  let lineNumber1 = 1;
  let lineNumber2 = 1;
  
  return (
    <div className="p-0 font-mono text-sm w-full">
      <table className="w-full border-collapse">
        <tbody>
          {/* File header */}
          <tr className="bg-gray-100 border-b">
            <td colSpan={4} className="p-2 text-gray-700 font-bold">
              {diffData.filename || 'document.md'}
            </td>
          </tr>
          
          {/* Diff lines */}
          {diffData.lines.map((line, index) => {
            if (line.type === 'unchanged') {
              const ln1 = lineNumber1++;
              const ln2 = lineNumber2++;
              return (
                <tr className="hover:bg-gray-50" key={index}>
                  <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{ln1}</td>
                  <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{ln2}</td>
                  <td className="w-6 text-center text-gray-500 select-none border-r"></td>
                  <td className="pl-2 whitespace-pre">{line.content}</td>
                </tr>
              );
            } else if (line.type === 'deletion') {
              const ln1 = lineNumber1++;
              return (
                <tr className="hover:bg-gray-50 bg-red-50" key={index}>
                  <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{ln1}</td>
                  <td className="w-10 text-right text-gray-500 pr-1 select-none border-r"></td>
                  <td className="w-6 text-center text-red-500 select-none border-r">-</td>
                  <td className="pl-2 whitespace-pre text-red-600">{line.content}</td>
                </tr>
              );
            } else if (line.type === 'addition') {
              const ln2 = lineNumber2++;
              return (
                <tr className="hover:bg-gray-50 bg-green-50" key={index}>
                  <td className="w-10 text-right text-gray-500 pr-1 select-none border-r"></td>
                  <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{ln2}</td>
                  <td className="w-6 text-center text-green-500 select-none border-r">+</td>
                  <td className="pl-2 whitespace-pre text-green-600">{line.content}</td>
                </tr>
              );
            } else if (line.type === 'modification') {
              const ln1 = lineNumber1++;
              const ln2 = lineNumber2++;
              return (
                <>
                  <tr className="hover:bg-gray-50 bg-red-50" key={`${index}-del`}>
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{ln1}</td>
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r"></td>
                    <td className="w-6 text-center text-red-500 select-none border-r">-</td>
                    <td className="pl-2 whitespace-pre text-red-600">{line.content1}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-green-50" key={`${index}-add`}>
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r"></td>
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{ln2}</td>
                    <td className="w-6 text-center text-green-500 select-none border-r">+</td>
                    <td className="pl-2 whitespace-pre text-green-600">{line.content2}</td>
                  </tr>
                </>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};

const SplitDiffView = ({ diffData }) => {
  if (!diffData || !diffData.lines) {
    return <div className="p-4">No diff data available</div>;
  }
  
  // Process lines into left and right columns
  const leftLines = [];
  const rightLines = [];
  
  // Keep track of line numbers
  let lineNumber1 = 1;
  let lineNumber2 = 1;
  
  // Prepare data for split view
  diffData.lines.forEach(line => {
    if (line.type === 'unchanged') {
      leftLines.push({
        number: lineNumber1++,
        content: line.content,
        type: 'unchanged'
      });
      
      rightLines.push({
        number: lineNumber2++,
        content: line.content,
        type: 'unchanged'
      });
    } else if (line.type === 'deletion') {
      leftLines.push({
        number: lineNumber1++,
        content: line.content,
        type: 'deletion'
      });
      
      // Add placeholder in right
      rightLines.push(null);
    } else if (line.type === 'addition') {
      // Add placeholder in left
      leftLines.push(null);
      
      rightLines.push({
        number: lineNumber2++,
        content: line.content,
        type: 'addition'
      });
    } else if (line.type === 'modification') {
      leftLines.push({
        number: lineNumber1++,
        content: line.content1,
        type: 'deletion'
      });
      
      rightLines.push({
        number: lineNumber2++,
        content: line.content2,
        type: 'addition'
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
                  {diffData.filename || 'document.md'} (Original)
                </td>
              </tr>
              
              {/* Left column */}
              {leftLines.map((line, index) => {
                if (!line) {
                  return (
                    <tr className="h-6" key={`left-${index}`}>
                      <td className="w-10 text-right text-gray-500 pr-1 select-none border-r"></td>
                      <td></td>
                    </tr>
                  );
                }
                
                const bgClass = line.type === 'deletion' ? 'bg-red-50' : '';
                const textClass = line.type === 'deletion' ? 'text-red-600' : '';
                
                return (
                  <tr className={`hover:bg-gray-50 ${bgClass}`} key={`left-${index}`}>
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{line.number}</td>
                    <td className={`pl-2 whitespace-pre ${textClass}`}>{line.content}</td>
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
                  {diffData.filename || 'document.md'} (Modified)
                </td>
              </tr>
              
              {/* Right column */}
              {rightLines.map((line, index) => {
                if (!line) {
                  return (
                    <tr className="h-6" key={`right-${index}`}>
                      <td className="w-10 text-right text-gray-500 pr-1 select-none border-r"></td>
                      <td></td>
                    </tr>
                  );
                }
                
                const bgClass = line.type === 'addition' ? 'bg-green-50' : '';
                const textClass = line.type === 'addition' ? 'text-green-600' : '';
                
                return (
                  <tr className={`hover:bg-gray-50 ${bgClass}`} key={`right-${index}`}>
                    <td className="w-10 text-right text-gray-500 pr-1 select-none border-r">{line.number}</td>
                    <td className={`pl-2 whitespace-pre ${textClass}`}>{line.content}</td>
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

export default GitHubDiffViewer; 