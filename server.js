'use strict';

const express = require('express');
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

// Template Engine
app.set('view engine', 'pug')
app.set('views', './views')


// Endpoints
app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.get('/', (req, res) => {
  res.render('index', { name: 'Michael' });
  // res.sendFile(path.join(__dirname, '/index.html'));
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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);