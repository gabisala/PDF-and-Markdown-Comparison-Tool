import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pixelmatch from 'pixelmatch';

// Set the worker source (required for PDF.js)
GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

/**
 * Process a PDF file and convert it to canvas elements
 * @param {File} file - The PDF file object
 * @returns {Promise<Object>} - Processed PDF data
 */
export async function processPDF(file) {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    // Load PDF document
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    const pages = [];
    
    // Process each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Create canvas for the page
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      pages.push({
        canvas,
        width: viewport.width,
        height: viewport.height,
        pageNumber: i
      });
    }
    
    return {
      file,
      type: 'pdf',
      name: file.name,
      pages,
      numPages,
      currentPage: 1
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Compare two PDF pages visually using pixelmatch
 * @param {HTMLCanvasElement} canvas1 - First canvas element
 * @param {HTMLCanvasElement} canvas2 - Second canvas element
 * @returns {Object} - Diff canvas and pixel count
 */
export function comparePDFPages(canvas1, canvas2) {
  // Get canvas contexts
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');
  
  // Normalize canvas sizes if they're different
  const width = Math.max(canvas1.width, canvas2.width);
  const height = Math.max(canvas1.height, canvas2.height);
  
  // Create a new canvas with normalized dimensions
  const normalizedCanvas1 = document.createElement('canvas');
  normalizedCanvas1.width = width;
  normalizedCanvas1.height = height;
  const normalizedCtx1 = normalizedCanvas1.getContext('2d');
  normalizedCtx1.drawImage(canvas1, 0, 0);
  
  const normalizedCanvas2 = document.createElement('canvas');
  normalizedCanvas2.width = width;
  normalizedCanvas2.height = height;
  const normalizedCtx2 = normalizedCanvas2.getContext('2d');
  normalizedCtx2.drawImage(canvas2, 0, 0);
  
  // Get image data from canvases
  const imageData1 = normalizedCtx1.getImageData(0, 0, width, height);
  const imageData2 = normalizedCtx2.getImageData(0, 0, width, height);
  
  // Create diff canvas
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  const diffImageData = diffCtx.createImageData(width, height);
  
  // Compare images using pixelmatch
  const diffPixelCount = pixelmatch(
    imageData1.data,
    imageData2.data,
    diffImageData.data,
    width,
    height,
    {
      threshold: 0.1,
      alpha: 0.5,
      includeAA: false,
      diffColor: [255, 0, 0],     // red for differences
      diffColorAlt: [0, 255, 0]   // green for anti-aliased differences
    }
  );
  
  // Draw diff image to canvas
  diffCtx.putImageData(diffImageData, 0, 0);
  
  return {
    diffCanvas,
    diffPixelCount,
    width,
    height,
    percentDiff: (diffPixelCount / (width * height)) * 100
  };
} 