// api/index.js
import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';

// Construct the full path to db.json
const dbPath = path.join(process.cwd(), 'db.json');
// Read and parse the db.json file
const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Create the router directly from the data object
const router = jsonServer.router(data);

// Export a function that directly uses the router to handle requests
export default (req, res) => {
  router(req, res);
};