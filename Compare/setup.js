import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

const packagesToReplace = [
  'rimraf',
  'glob',
  'npmlog',
  'inflight',
  'gauge',
  'are-we-there-yet'
];

// Function to find all occurrences of a package in node_modules
function findPackageOccurrences(packageName, directory) {
  const results = [];
  
  // Find direct occurrence
  const directPath = path.join(directory, packageName);
  if (fs.existsSync(directPath)) {
    results.push(directPath);
  }
  
  // Find nested occurrences
  const entries = fs.readdirSync(directory);
  for (const entry of entries) {
    const entryPath = path.join(directory, entry);
    if (entry.startsWith('@') && fs.statSync(entryPath).isDirectory()) {
      // Handle scoped packages
      const scopedEntries = fs.readdirSync(entryPath);
      for (const scopedEntry of scopedEntries) {
        const scopedPackagePath = path.join(entryPath, scopedEntry);
        if (fs.statSync(scopedPackagePath).isDirectory()) {
          const nestedNodeModules = path.join(scopedPackagePath, 'node_modules');
          if (fs.existsSync(nestedNodeModules)) {
            results.push(...findPackageOccurrences(packageName, nestedNodeModules));
          }
        }
      }
    } else if (fs.statSync(entryPath).isDirectory() && entry !== packageName) {
      const nestedNodeModules = path.join(entryPath, 'node_modules');
      if (fs.existsSync(nestedNodeModules)) {
        results.push(...findPackageOccurrences(packageName, nestedNodeModules));
      }
    }
  }
  
  return results;
}

// Remove all instances of the deprecated packages
console.log('Removing deprecated packages...');
const nodeModulesPath = path.join(__dirname, 'node_modules');

for (const packageName of packagesToReplace) {
  const occurrences = findPackageOccurrences(packageName, nodeModulesPath);
  for (const occurrence of occurrences) {
    console.log(`Removing ${occurrence}`);
    fs.rmSync(occurrence, { recursive: true, force: true });
  }
}

// Install newer versions and ensure key packages are properly installed
console.log('Installing newer versions of packages and key dependencies...');
execSync('npm install glob@10.3.10 rimraf@5.0.5 lru-cache@10.2.0 --save-dev', { stdio: 'inherit' });

// Reinstall key packages that might be affected
console.log('Reinstalling key packages to ensure they work properly...');
execSync('npm install diff@7.0.0 react@18.2.0 react-dom@18.2.0 --save', { stdio: 'inherit' });

console.log('Setup complete. The deprecated packages have been removed and key packages reinstalled.'); 