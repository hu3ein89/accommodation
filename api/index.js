import express from 'express';
import cors from 'cors';
import jsonServer from 'json-server';
import path from 'path';

const server = express();
const router = jsonServer.router(path.join(process.cwd(), 'db.json'));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(middlewares);
server.use('/api', router);

// Fallback to serve the single-page application for all non-API requests
server.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

export default server;