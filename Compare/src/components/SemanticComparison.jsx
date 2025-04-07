import React, { useState, useEffect } from 'react';
import {
  calculateParagraphSimilarities,
  calculateOverallSimilarity
} from '../lib/semanticComparison';

export default function SemanticComparison({ originalText, transformedText }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [overallScore, setOverallScore] = useState(null);

  useEffect(() => {
    async function calculateSimilarities() {
      try {
        setLoading(true);
        setError(null);
        
        // Process markdown directly - our function handles text processing
        const paragraphResults = await calculateParagraphSimilarities(
          originalText,
          transformedText
        );
        
        const overall = calculateOverallSimilarity(paragraphResults);
        
        setResults(paragraphResults);
        setOverallScore(overall);
      } catch (err) {
        console.error('Semantic comparison error:', err);
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (originalText && transformedText) {
      calculateSimilarities();
    }
  }, [originalText, transformedText]);

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Calculating semantic similarity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
        <div className="text-red-600 dark:text-red-400">
          Error calculating semantic similarity: {error}
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Overall Semantic Similarity</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${overallScore * 100}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm font-medium">
            {(overallScore * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Paragraph Comparison</h3>
        {results.map((result, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Original</h4>
                <p className="text-sm whitespace-pre-wrap">{result.original}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Transformed</h4>
                <p className="text-sm whitespace-pre-wrap">{result.transformed}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.similarity > 0.8
                        ? 'bg-green-500'
                        : result.similarity > 0.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${result.similarity * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">
                  {(result.similarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 