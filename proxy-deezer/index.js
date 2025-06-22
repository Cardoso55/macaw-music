const express = require('express');
const fetch = require('node-fetch'); // Funciona com Node.js v2
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// Proxy para busca de artista no Deezer
app.get('/deezer/search/artist', async (req, res) => {
  const { q } = req.query;

  try {
    const response = await axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}`);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar artista no Deezer:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar artista' });
  }
});

// Proxy para top músicas do artista no Deezer
app.get('/deezer/artist/:id/top', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://api.deezer.com/artist/${id}/top?limit=10&output=json`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro no proxy de top músicas:', error);
    res.status(500).json({ error: 'Erro ao buscar top músicas' });
  }
});

// Proxy para buscar letras da API lyrics.ovh
app.get('/lyrics', async (req, res) => {
  const { artist, title } = req.query;
  const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar letra:', error);
    res.status(500).json({ error: 'Erro ao buscar letra' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));
