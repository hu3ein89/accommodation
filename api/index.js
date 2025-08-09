import express from 'express';
import jsonServer from 'json-server';

// Import the database file directly
import db from '../db.json';

const server = express();
const router = jsonServer.router(db); // Use the imported database object
const middlewares = jsonServer.defaults();

// Use the default json-server middlewares
server.use(middlewares);

// Use the router for all requests to the /api endpoint
server.use('/api', router);

export default server;