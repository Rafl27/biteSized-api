const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://rafael:sTiEMncLcvyLJtbs@bitesizeddb.mjc4hsn.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const User = require('./models/user');
const Story = require('./models/story');

const JWT_SECRET = 'mysecretkey';

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(422).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(422).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
});

app.get('/stories', async (req, res) => {
    const stories = await Story.find().populate('user', '-password');
    res.json(stories);
});

app.post('/stories', async (req, res) => {
    const { name, text } = req.body;
    const story = new Story({ name, text, user: req.userId });
    await story.save();
    res.json(story);
});

app.get('/stories/:id', async (req, res) => {
    const { id } = req.params;
    const story = await Story.findById(id).populate('user', '-password');
    res.json(story);
});

app.put('/stories/:id', async (req, res) => {
    const { id } = req.params;
    const { name, text } = req.body;
    const story = await Story.findByIdAndUpdate(id, { name, text }, { new: true }).populate('user', '-password');
    res.json(story);
});

app.delete('/stories/:id', async (req, res) => {
    const { id } = req.params;
    const story = await Story.findByIdAndDelete(id);
    res.json(story);
});

// Middleware to authenticate user
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
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});