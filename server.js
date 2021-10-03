'use strict';

const express = require('express');
const config = require('./config');
const ws = require('ws');
const path = require('path');
const pug = require('pug');
const ReadingService = require('./services/reading-service');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Initialize Services
const readingService = new ReadingService();

// App
const app = express();

// Middleware
app.use(express.json());

// DEBUGGING MIDDLEWARE
let demoLogger = (req, res, next) => {
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  let log = `[${new Date().toISOString()}] ${method}:${url} ${status}`;
  console.log(log);
  console.log(req.body);
  next();
};
app.use(demoLogger);

// Template Engine
app.set('view engine', 'pug')
app.set('views', './views')


// Endpoints
app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.get('/', (req, res) => {
  res.render('index', { name: 'Michael', config: JSON.stringify(config)});
});

app.get('/readings', function (req, res) {
  res.send(readingService.readings);
});

app.post('/readings', function (req, res) {
  readingService.insertReadings(req.body);
  res.status(201).send();
});

app.delete('/readings', function (req, res) {
  readingService.deleteReadings();
  res.status(200).send();
});


// Run
const expressServer = app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}\nenvironment: "${config.env}"`);


// Web Socket Endpoints
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  // subscribe to readings changes
  readingService.subscribe((readings) => {
    socket.send(JSON.stringify(readings));
  });

  // socket.on('message', message => {
  //   console.log(message.toString());
  //   socket.send('Hello Client!');
  // });
});


expressServer.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});