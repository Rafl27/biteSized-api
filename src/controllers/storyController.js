const jwt = require('jsonwebtoken');
const Story = require('../models/story');

exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({})
            .populate('user', '-password')
            .populate('comments.user', '-password');
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

//TODO add upvotes

exports.postStories = async (req, res) => {
    try {
        const { name, text, img } = req.body;
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const story = new Story({ name, text, img, user: decoded.userId });
        await story.save();
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.getStoriesId = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id).populate('user', '-password');
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' });
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
        res.status(500).json({ message: 'Something went wrong!' });
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

// http://localhost:3000/story/643df1a88783d6a4d2dc55af/comments
exports.postComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const story = await Story.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        const comment = { user: decoded.userId, text };
        const updatedStory = await Story.findByIdAndUpdate(id, { $push: { comments: comment } }, { new: true }).populate('comments.user', '-password');
        res.json(updatedStory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// http://localhost:3000/story/643df1a88783d6a4d2dc55af/comments/643df1da8783d6a4d2dc55b2/replies
exports.postReply = async (req, res, next) => {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization header not found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const reply = { user: decoded.userId, text };
        const story = await Story.findOneAndUpdate(
            { _id: id, 'comments._id': commentId },
            { $push: { 'comments.$.replies': reply } },
            { new: true }
        ).populate('comments.user', '-password').populate('comments.replies.user', '-password');
        if (!story) {
            return res.status(404).json({ message: 'Story or comment not found' });
        }
        res.json(story);
    } catch (error) {
        next(error);
    }
}

// The getStory controller now also populates the comments.user field to get the details of the user who posted the comment.

// The postComment controller adds a new comment to the comments array of the story. The comment is created using the decoded.userId to set the user field, and the text field is taken from the request body.

// The postReply controller adds a new reply to a comment. It first finds the story and the comment using their IDs, and then adds the new reply to the replies array of the comment. The user field of the reply is set using decoded.userId, and the text field is taken from the request body. Note that the findOneAndUpdate method is used to update the story and the comment at the same time.

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