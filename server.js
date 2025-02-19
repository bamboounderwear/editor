import express from 'express';
import serveStatic from 'serve-static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files
app.use(serveStatic(__dirname));

// Set correct MIME type for JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

// Handle all routes
app.get('*', (req, res) => {
  // If requesting a template, serve it directly
  if (req.path.startsWith('/templates/')) {
    res.sendFile(join(__dirname, req.path));
  } else {
    // Otherwise serve index.html
    res.sendFile(join(__dirname, 'index.html'));
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});