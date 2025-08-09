// api/index.js
import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const router = jsonServer.router(data);

export default (req, res) => {
  // This is the key change: we manually rewrite the URL.
  // For example, an incoming request for /api/hotels becomes /hotels
  if (req.url.startsWith('/api')) {
    req.url = req.url.substring(4);
  }
  
  // Now, pass the modified request to the router.
  router(req, res);
};