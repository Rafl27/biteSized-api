// auth.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mysecretkey';

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'You must be logged in' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'You must be logged in' });
    }
};

module.exports = requireAuth;
