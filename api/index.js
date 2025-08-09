import express from 'express';
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the db.json file correctly from the parent directory
const dbPath = path.join(__dirname, '..', 'db.json');
const server = express();

try {
  // Use a more reliable method to read the file
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const router = jsonServer.router(db);
  const middlewares = jsonServer.defaults();

  server.use(middlewares);
  server.use('/api', router);

} catch (error) {
  console.error("Failed to load or parse db.json:", error);
  // Optional: Add a simple error handler for Vercel
  server.use('/api', (req, res) => {
    res.status(500).send('API is currently unavailable. Please check the logs for details.');
  });
}

export default server;