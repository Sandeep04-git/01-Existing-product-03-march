const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// GET / — returns the original Hello World response with exact fidelity
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('Hello, World!\n');
});

// GET /evening — returns the Good evening response
app.get('/evening', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('Good evening');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
