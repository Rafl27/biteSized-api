const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    text: { type: String, required: true },
    replies: [this],
});


const storySchema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    img: { type: String },
    user: { type: String, required: true },
    date: { type: Date, default: Date.now },
    comments: [commentSchema],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
});


module.exports = mongoose.model('Story', storySchema);
