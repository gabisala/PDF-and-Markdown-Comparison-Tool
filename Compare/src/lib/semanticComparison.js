import { pipeline } from '@xenova/transformers';
import { Matrix } from 'ml-matrix';

// Cache for the transformer model
let model = null;
let tokenizer = null;

/**
 * Initialize the transformer model
 * @returns {Promise<void>}
 */
export async function initializeModel() {
  if (!model) {
    try {
      // Using a lightweight model suitable for browser
      [model, tokenizer] = await Promise.all([
        pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'),
        pipeline('tokenizer', 'Xenova/all-MiniLM-L6-v2')
      ]);
    } catch (error) {
      console.error('Error initializing model:', error);
      throw error;
    }
  }
}

/**
 * Calculate embeddings for a text
 * @param {string} text - The text to calculate embeddings for
 * @returns {Promise<Float32Array>} - The text embeddings
 */
export async function calculateEmbeddings(text) {
  if (!model) {
    await initializeModel();
  }

  try {
    const output = await model(text, {
      pooling: 'mean',
      normalize: true
    });
    return output.data;
  } catch (error) {
    console.error('Error calculating embeddings:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * @param {Float32Array} emb1 - First embedding
 * @param {Float32Array} emb2 - Second embedding
 * @returns {number} - Cosine similarity score
 */
export function calculateCosineSimilarity(emb1, emb2) {
  const vec1 = new Matrix([Array.from(emb1)]);
  const vec2 = new Matrix([Array.from(emb2)]);
  
  const dotProduct = Matrix.multiply(vec1, vec2.transpose()).get(0, 0);
  const norm1 = Math.sqrt(Matrix.multiply(vec1, vec1.transpose()).get(0, 0));
  const norm2 = Math.sqrt(Matrix.multiply(vec2, vec2.transpose()).get(0, 0));
  
  return dotProduct / (norm1 * norm2);
}

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
    const originalEmb = await calculateEmbeddings(originalParagraphs[i]);
    
    // Find best matching paragraph in transformed text
    let bestMatch = {
      paragraph: '',
      similarity: -1
    };
    
    for (const transformedPara of transformedParagraphs) {
      const transformedEmb = await calculateEmbeddings(transformedPara);
      const similarity = calculateCosineSimilarity(originalEmb, transformedEmb);
      
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