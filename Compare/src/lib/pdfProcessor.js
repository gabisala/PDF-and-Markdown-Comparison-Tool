import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/**
 * Extract text content from a PDF file while preserving formatting
 * @param {ArrayBuffer} pdfBuffer - PDF file as ArrayBuffer
 * @returns {Promise<string>} Extracted text from the PDF
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
    
    let fullText = '';
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY, lastX, text = '';
        const items = textContent.items;
        
        // Sort items by their vertical position (top to bottom)
        items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const currentY = item.transform[5];
          const currentX = item.transform[4];
          
          // New paragraph detection (significant Y change)
          if (lastY !== undefined && Math.abs(lastY - currentY) > 12) {
            text += '\n\n';
          }
          // Same line but significant X change (like tabs or spaces)
          else if (lastX !== undefined && lastY === currentY && (currentX - lastX) > 10) {
            text += '    '; // Add spaces to preserve horizontal formatting
          }
          // Normal continuation of text
          else if (i > 0 && lastY === currentY) {
            text += ' ';
          }
          
          text += item.str;
          lastY = currentY;
          lastX = currentX + (item.width || 0);
        }
        
        fullText += text + '\n\n'; // Add page break
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        fullText += `[Error reading page ${pageNum}]\n\n`;
      }
    }
    
    const result = fullText.trim();
    if (!result) {
      throw new Error('No text content extracted from PDF');
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Process a PDF file to prepare it for comparison
 * @param {File} file - The PDF file object
 * @returns {Promise<{text: string, fileName: string, fileType: string}>} Processed file data
 */
export const processPDFFile = async (file) => {
  try {
    console.log('Starting PDF processing for file:', file.name);
    
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer();
    console.log('File successfully read as ArrayBuffer');
    
    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    console.log('Text successfully extracted from PDF');
    
    return {
      text,
      fileName: file.name,
      fileType: 'pdf'
    };
  } catch (error) {
    console.error('Error processing PDF file:', error);
    throw new Error(`Failed to process PDF file: ${error.message}`);
  }
}; 