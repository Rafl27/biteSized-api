const jwt = require('jsonwebtoken');
const Story = require('../models/story');

exports.getStories = async (req, res) => {
    const stories = await Story.find().populate('user', '-password');
    res.json(stories);
}

exports.postStories = async (req, res) => {
    const { name, text } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'mysecretkey');
    const story = new Story({ name, text, user: decoded.userId });
    await story.save();
    res.json(story);
}

exports.getStoriesId = async (req, res) => {
    const { id } = req.params;
    const story = await Story.findById(id).populate('user', '-password');
    res.json(story);
}

exports.putStoriesId = async (req, res) => {
    const { id } = req.params;
    const { name, text } = req.body;
    const story = await Story.findByIdAndUpdate(id, { name, text }, { new: true }).populate('user', '-password');
    res.json(story);
}

exports.deleteStories = async (req, res) => {
    const { id } = req.params;
    const story = await Story.findByIdAndDelete(id);
    res.json(story);
}