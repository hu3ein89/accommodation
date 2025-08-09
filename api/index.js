// api/index.js
import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';

// Create the server instance
const server = jsonServer.create();

// Construct the full path to db.json
const dbPath = path.join(process.cwd(), 'db.json');

// Read and parse the db.json file
const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
console.log('Available routes:', Object.keys(data));

// Pass the JavaScript object to the router, creating an in-memory database
const router = jsonServer.router(data);

const middlewares = jsonServer.defaults({
  // No logger in serverless environment for cleaner logs
  logger: false,
  // Vercel handles static assets
  static: '/tmp'
});

server.use(middlewares);
server.use(router);

// Export the server for Vercel to use
export default server;