/**
 * This is a shim file to help work around Vite import resolution issues with the diff package.
 * If you're experiencing import errors with 'diff', import from this file instead.
 */

// Import directly from the correct file path
import * as diffModule from '../../node_modules/diff/lib/diff.js';

// Re-export all functions from the diff package
export const diffLines = diffModule.diffLines;
export const diffWordsWithSpace = diffModule.diffWordsWithSpace;
export const diffWords = diffModule.diffWords;
export const diffSentences = diffModule.diffSentences;
export const diffCss = diffModule.diffCss;
export const diffJson = diffModule.diffJson;
export const diffArrays = diffModule.diffArrays;

// Re-export the entire module as default
export default diffModule; 