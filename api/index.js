import express from 'express';
import jsonServer from 'json-server';

const server = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use('/api', router);

export default server;