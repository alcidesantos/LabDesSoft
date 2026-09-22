const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('API está a funcionar!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`API está a correr em http://localhost:${port}`);
});