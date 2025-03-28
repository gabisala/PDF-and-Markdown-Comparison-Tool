import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory or dist if it exists
if (fs.existsSync('./dist')) {
  app.use(express.static(join(__dirname, 'dist')));
} else {
  app.use(express.static(join(__dirname, 'public')));
}

// For single page applications - handle routes by sending the index.html
app.get('*', (req, res) => {
  if (fs.existsSync('./dist/index.html')) {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } else if (fs.existsSync('./index.html')) {
    res.sendFile(join(__dirname, 'index.html'));
  } else {
    res.status(404).send('Application not built yet. Run npm build first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 