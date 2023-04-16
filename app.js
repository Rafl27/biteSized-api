const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/user', userRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const Story = require('./src/models/story');
const requireAuth = require('./src/middlewares/authMiddleware');

const JWT_SECRET = 'mysecretkey';

app.get('/stories', async (req, res) => {
    const stories = await Story.find().populate('user', '-password');
    res.json(stories);
});

app.post('/stories', async (req, res) => {
    const { name, text } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'mysecretkey');
    const story = new Story({ name, text, user: decoded.userId });
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

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
