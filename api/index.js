// api/index.js
import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';

// 1. Create the full server instance
const server = jsonServer.create();

// 2. Read the database file
const dbPath = path.join(process.cwd(), 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const router = jsonServer.router(data);

// 3. Get the default middlewares (like cors, logger, etc.)
const middlewares = jsonServer.defaults({ logger: false });
server.use(middlewares);

// 4. Mount the router on the /api path.
// This tells the server that your routes are /api/hotels, /api/users, etc.
// It will handle the URL pathing correctly.
server.use('/api', router);

// 5. Export the fully configured server
export default server;