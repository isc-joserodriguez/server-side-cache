require('dotenv').config();
const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    fetch = require('node-fetch'),
    mcache = require('memory-cache');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cache = (duration) => (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
        let response=JSON.parse(cachedBody);
        if(response.error){
            res.status(400).json(response);
        }else{
            res.status(200).json(response);
        }
        return;
    } else {
        res.sendResponse = res.send;
        res.send = (body) => {
            mcache.put(key, body, duration * 1000);
            res.sendResponse(body);
        }
        next();
    }
}

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });
});

app.get('/api/search', cache(10), async (req, res) => {
    let { query } = req.query;
    if (!query) {
        res.status(400).json({ error: 'Query not found' });
        return;
    }
    try {
        const { results } = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`).then(res => res.json());
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