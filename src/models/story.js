const mongoose = require('mongoose');

const nestedReplySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
});

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    nestedReplies: [nestedReplySchema]
});

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    replies: [replySchema],
});

const storySchema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    img: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    comments: [commentSchema],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
});

module.exports = mongoose.model('Story', storySchema);
