require('dotenv').config();
const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    fetch = require('node-fetch'),
    cache = require('./middlewares');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });
});

app.get('/api/search', cache(10), async (req, res) => {
    let { query } = req.query;
    query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!query) {
        res.status(400).json({ error: 'Query not found' });
        return;
    }
    try {
        const products = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`)
        const { results } = await products.json();
        res.status(200).json({ results });
    } catch (e) {
        res.status(400).json({ error: 'Error' });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`)
});