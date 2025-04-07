import { Matrix } from 'ml-matrix';

/**
 * Split text into paragraphs
 * @param {string} text - The text to split
 * @returns {string[]} - Array of paragraphs
 */
export function splitIntoParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Create a bag of words vector from text
 * @param {string} text - The text to vectorize
 * @returns {Object} - Object with words as keys and counts as values
 */
function createBagOfWords(text) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
  
  const bagOfWords = {};
  for (const word of words) {
    bagOfWords[word] = (bagOfWords[word] || 0) + 1;
  }
  
  return bagOfWords;
}

/**
 * Calculate cosine similarity between two text segments
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  // Handle empty or whitespace-only text
  if (!text1 || !text2 || text1.trim() === '' || text2.trim() === '') {
    return 0;
  }
  
  try {
    const bow1 = createBagOfWords(text1);
    const bow2 = createBagOfWords(text2);
    
    // Check if we have at least some words
    if (Object.keys(bow1).length === 0 || Object.keys(bow2).length === 0) {
      return 0;
    }
    
    // Get unique words from both texts
    const allWords = new Set([...Object.keys(bow1), ...Object.keys(bow2)]);
    
    // If no words in common, return 0
    if (allWords.size === 0) {
      return 0;
    }
    
    // Create vectors
    const vec1 = [];
    const vec2 = [];
    
    for (const word of allWords) {
      vec1.push(bow1[word] || 0);
      vec2.push(bow2[word] || 0);
    }
    
    // Handle zero vectors - if either vector is all zeros, similarity is 0
    if (vec1.every(val => val === 0) || vec2.every(val => val === 0)) {
      return 0;
    }
    
    // Simple dot product calculation to avoid matrix library errors
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    // Calculate cosine similarity
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (norm1 * norm2);
  } catch (error) {
    console.error('Error calculating text similarity:', error);
    return 0; // Return 0 similarity on error
  }
}

/**
 * Calculate semantic similarity for each paragraph pair
 * @param {string} originalText - Original document text
 * @param {string} transformedText - Transformed document text
 * @returns {Promise<Array<{original: string, transformed: string, similarity: number}>>}
 */
export async function calculateParagraphSimilarities(originalText, transformedText) {
  const originalParagraphs = splitIntoParagraphs(originalText);
  const transformedParagraphs = splitIntoParagraphs(transformedText);
  
  const results = [];
  
  for (let i = 0; i < originalParagraphs.length; i++) {
    // Find best matching paragraph in transformed text
    let bestMatch = {
      paragraph: '',
      similarity: -1
    };
    
    for (const transformedPara of transformedParagraphs) {
      const similarity = calculateTextSimilarity(originalParagraphs[i], transformedPara);
      
      if (similarity > bestMatch.similarity) {
        bestMatch = {
          paragraph: transformedPara,
          similarity
        };
      }
    }
    
    results.push({
      original: originalParagraphs[i],
      transformed: bestMatch.paragraph,
      similarity: bestMatch.similarity
    });
  }
  
  return results;
}

/**
 * Calculate overall semantic similarity score
 * @param {Array<{similarity: number}>} paragraphResults - Results from calculateParagraphSimilarities
 * @returns {number} - Overall similarity score
 */
export function calculateOverallSimilarity(paragraphResults) {
  if (paragraphResults.length === 0) return 0;
  
  const sum = paragraphResults.reduce((acc, curr) => acc + curr.similarity, 0);
  return sum / paragraphResults.length;
} 