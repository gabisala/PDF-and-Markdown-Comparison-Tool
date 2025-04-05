import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text content from a PDF file
 * @param {ArrayBuffer} pdfBuffer - PDF file as ArrayBuffer
 * @returns {Promise<string>} Extracted text from the PDF
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Process a PDF file to prepare it for comparison
 * @param {File} file - The PDF file object
 * @returns {Promise<{text: string, fileName: string, fileType: string}>} Processed file data
 */
export const processPDFFile = async (file) => {
  try {
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    
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