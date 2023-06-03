const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.get('/', storyController.getStories);
router.post('/', storyController.postStories);
router.put('/:id', storyController.putStoriesId);
router.delete('/:id', storyController.deleteStories);
router.post('/:id/comments', storyController.postComment);
router.post('/:id/comments/:commentId/replies', storyController.postReply);
router.put('/:id/upvote', storyController.upvoteStory);
router.put('/:id/downvote', storyController.downvoteStory);
router.get('/usercollection', storyController.usercollection);
router.get('/:id', storyController.getStoriesId);
router.post('/:id/comments/:commentId/replies/:replyId/response', storyController.postNestedReply);
module.exports = router;