/**
 * File processor utility for handling different file types
 */
import { processPDFFile as extractPDFContent } from './pdfProcessor';

/**
 * Processes a file and returns its content based on the file type
 * @param {File} file - The file to process
 * @returns {Promise<Object>} - The processed file content
 */
export async function processFile(file) {
  // Detect file type based on mime type or extension
  const isMarkdown = isMarkdownFile(file);
  const isPDF = isPDFFile(file);

  if (!isMarkdown && !isPDF) {
    throw new Error('Unsupported file type. Only PDF and Markdown files are supported.');
  }

  try {
    if (isMarkdown) {
      return await processMarkdownFile(file);
    } else if (isPDF) {
      return await processPDFFile(file);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

/**
 * Checks if a file is a Markdown file
 * @param {File} file - The file to check
 * @returns {boolean} - Whether the file is a Markdown file
 */
export function isMarkdownFile(file) {
  const type = file.type;
  const name = file.name.toLowerCase();
  
  return (
    type === 'text/markdown' ||
    type === 'text/x-markdown' ||
    name.endsWith('.md') ||
    name.endsWith('.markdown')
  );
}

/**
 * Checks if a file is a PDF file
 * @param {File} file - The file to check
 * @returns {boolean} - Whether the file is a PDF file
 */
export function isPDFFile(file) {
  const type = file.type;
  const name = file.name.toLowerCase();
  
  return (
    type === 'application/pdf' ||
    name.endsWith('.pdf')
  );
}

/**
 * Processes a Markdown file
 * @param {File} file - The Markdown file to process
 * @returns {Promise<Object>} - The processed file content
 */
async function processMarkdownFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve({
        type: 'markdown',
        name: file.name,
        content: event.target.result,
        size: file.size,
        lastModified: file.lastModified
      });
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
}

/**
 * Processes a PDF file
 * @param {File} file - The PDF file to process
 * @returns {Promise<Object>} - The processed file content
 */
async function processPDFFile(file) {
  try {
    const pdfData = await extractPDFContent(file);
    
    return {
      type: 'pdf',
      name: file.name,
      content: pdfData.text,
      size: file.size,
      lastModified: file.lastModified
    };
  } catch (error) {
    console.error('Error processing PDF file:', error);
    throw new Error(`Failed to process PDF file: ${error.message}`);
  }
} 