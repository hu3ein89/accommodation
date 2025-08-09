import express from 'express';
import path from 'path';
import jsonServer from '../src/api/jsonServer';

const server = express();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Use the default json-server middlewares
server.use(middlewares);

// Use the router for all requests to the /api endpoint
server.use('/api', router);

// Serve your frontend build files
server.use(express.static(path.join(__dirname, 'dist')));

export default server;