import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text content from a PDF file
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
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with next page instead of failing completely
        fullText += `[Error reading page ${pageNum}]\n`;
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