const express = require('express');
const { nanoid } = require('nanoid');
const validator = require('validator');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(require('cors')());
app.use(express.static('public'));

// API: Create short URL
app.post('/api/shorten', (req, res) => {
  const { longUrl } = req.body;
  
  if (!longUrl || !validator.isURL(longUrl)) {
    return res.status(400).json({ error: 'Valid long URL is required' });
  }

  const shortCode = nanoid(6); 

  db.run(`INSERT INTO urls (short_code, long_url) VALUES (?, ?)`, 
  [shortCode, longUrl], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    res.json({ shortUrl, shortCode, longUrl });
  });
});

// Redirect route
app.get('/:code', (req, res) => {
  const { code } = req.params;
  db.get(`SELECT long_url FROM urls WHERE short_code = ?`, [code], (err, row) => {
    if (err || !row) return res.status(404).send('URL not found');
    res.redirect(row.long_url);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));