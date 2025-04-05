import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge
 * @param {...string} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Exports the diff as HTML content by capturing the rendered UI
 * @param {Object} diffData The diff data object
 * @param {string} title The title for the exported HTML
 * @param {Object} fileInfo Information about the compared files
 * @returns {string} The HTML string
 */
export function exportDiffAsHTML(diffData, title = "Diff Report", fileInfo = {}) {
  // Get the actual rendered content from the DOM
  const diffElement = document.querySelector('.diff-content');
  
  if (!diffElement) {
    console.error('Could not find diff content element');
    return null;
  }
  
  // Clone the rendered diff to avoid modifying the actual DOM
  const clonedContent = diffElement.cloneNode(true);
  
  // Extract stylesheets to include in export
  const stylesheets = Array.from(document.styleSheets)
    .filter(sheet => {
      try {
        // Only include stylesheets from same origin (avoid CORS issues)
        if (sheet.href && new URL(sheet.href).origin !== window.location.origin) {
          return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    })
    .map(sheet => {
      try {
        const rules = Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
        return rules;
      } catch (e) {
        // If we can't access rules due to CORS, return empty string
        return '';
      }
    })
    .join('\n');

  // Create the HTML document with all necessary styles
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        /* Reset styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
          color: #24292e;
        }
        
        /* Include all stylesheets from the page */
        ${stylesheets}
        
        /* Additional print-friendly styles */
        @media print {
          body {
            padding: 0;
          }
          .diff-stats {
            margin-bottom: 20px;
          }
        }
        
        /* Ensure all elements are visible */
        .collapsed-section {
          display: block !important;
        }
        
        /* Container styles */
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        /* Header styles */
        .header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .file-info {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 14px;
          color: #586069;
        }
        
        /* Hide UI-specific elements */
        .collapsible-button,
        .navigation-controls {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          ${fileInfo.oldFileName && fileInfo.newFileName ? 
            `<div class="file-info">
              <div>Original: <strong>${fileInfo.oldFileName}</strong></div>
              <div>Modified: <strong>${fileInfo.newFileName}</strong></div>
            </div>` : ''
          }
        </div>
        ${clonedContent.outerHTML}
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Exports the diff report as PDF by capturing the exact UI rendering
 * @param {Object} diffData The diff data object 
 * @param {string} title The title for the PDF
 * @param {Object} fileInfo Information about the compared files
 */
export function exportDiffAsPDF(diffData, title = "Diff Report", fileInfo = {}) {
  // First convert to HTML
  const html = exportDiffAsHTML(diffData, title, fileInfo);
  if (!html) return;

  // Create a Blob from the HTML
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open the HTML in a new window
  const printWindow = window.open(url, '_blank');
  
  // Add event listener to trigger print dialog once the page is loaded
  printWindow.addEventListener('load', () => {
    printWindow.print();
    // Clean up the URL object after printing is complete
    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
} 