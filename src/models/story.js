const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Story', storySchema);
