const jwt = require('jsonwebtoken');
const Story = require('../models/story');
const User = require('../models/user')
const mongoose = require('mongoose');

exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({})
            .populate({
                path: 'user',
                select: 'name profilePicture'
            })
            .populate('comments.user', '-password');
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong! getStories' });
    }
};

exports.postStories = async (req, res) => {
    try {
        const { name, text, img } = req.body;
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const story = new Story({ name, text, img, user: decoded.userId });
        await story.save();
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong! postStories' });
    }
};

exports.getStoriesId = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id).populate({ path: 'user', select: 'name profilePicture' })
            .populate('comments.user', '-password')
            .populate('comments.replies.user', '-password')
            .populate('comments.replies.nestedReplies.user', '-password');
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong! getStoriesId' });
    }
};

exports.putStoriesId = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, text, img } = req.body;
        const story = await Story.findByIdAndUpdate(
            id,
            { name, text, img },
            { new: true }
        ).populate('user', '-password');
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong! putStoriesId' });
    }
};

exports.deleteStories = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findByIdAndDelete(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.usercollection = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Missing token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        const userId = decoded.userId;
        const stories = await Story.find({ user: userId })
            .populate('user', '-password')
            .populate('comments.user', '-password');
        res.json(stories);
    } catch (error) {
        console.error('Error in getStoriesByUser:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.postComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, img } = req.body;

        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const story = await Story.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const comment = { user: user, text, img };

        const updatedStory = await Story.findByIdAndUpdate(
            id,
            { $push: { comments: comment } },
            { new: true }
        )
            .populate('comments.user', '-password');

        res.json(updatedStory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.postReply = async (req, res, next) => {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization header not found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const reply = { user: user, text };
        console.log(user)
        const story = await Story.findOneAndUpdate(
            { _id: id, 'comments._id': commentId },
            { $push: { 'comments.$.replies': reply } },
            { new: true }
        )
            // .populate('comments.user', '-password')
            .populate('comments.replies.user', '-password');
        if (!story) {
            return res.status(404).json({ message: 'Story or comment not found' });
        }
        res.json(story);
    } catch (error) {
        next(error);
    }
}

exports.postNestedReply = async (req, res) => {
    try {
        const { id, commentId, replyId } = req.params;
        const { text } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization header not found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const nestedReply = { user: decoded.userId, text };
        const story = await Story.findOneAndUpdate(
            { _id: id, 'comments._id': commentId, 'comments.replies._id': replyId },
            { $push: { 'comments.$.replies.$[reply].nestedReplies': nestedReply } },
            { new: true, arrayFilters: [{ 'reply._id': replyId }] }
        ).populate('comments.user', '-password').populate('comments.replies.user', '-password').populate('comments.replies.nestedReplies.user', '-password');
        if (!story) {
            return res.status(404).json({ message: 'Story, comment, or reply not found' });
        }
        res.json(story);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.upvoteStory = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        story.upvotes += 1;
        await story.save();
        res.json(story);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.downvoteStory = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        story.downvotes += 1;
        await story.save();
        res.json(story);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};