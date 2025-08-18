const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
    '/profile-picture',
    authMiddleware,
    uploadController.uploadProfilePicture,
    uploadController.handleProfilePictureUpload 
);

module.exports = router;