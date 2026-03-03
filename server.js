const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// GET / - Returns a Hello World greeting
app.get('/', (req, res) => {
  res.send('Hello World');
});

// GET /evening - Returns a Good evening greeting
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
