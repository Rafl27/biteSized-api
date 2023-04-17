const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.get('/', storyController.getStories);
router.post('/', storyController.postStories);
router.get('/:id', storyController.getStoriesId);
router.put('/:id', storyController.putStoriesId);
router.delete('/:id', storyController.deleteStories);

module.exports = router;