const mcache = require('memory-cache');
const cache = (duration) => (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
        let response = JSON.parse(cachedBody);
        if (response.error) {
            res.status(400).json(response);
        } else {
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

module.exports = cache;