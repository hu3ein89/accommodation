import express from 'express';
import cors from 'cors';
import { create, router as jsonServerRouter } from 'json-server';
import data from '../db.json';
import path from 'path';

// Create the Vercel serverless function
const server = create();

// Create a router from your db.json file
const router = jsonServerRouter(data);

// Set up middlewares
const middlewares = jsonServer.defaults();

// Use CORS and default middlewares
server.use(cors());
server.use(middlewares);

// Use the router for all API endpoints
server.use('/api', router);

// This is a crucial line for Vercel. It redirects all non-API requests
// to your frontend's index.html file.
server.use(express.static(path.join(process.cwd(), 'dist')));

export default server;