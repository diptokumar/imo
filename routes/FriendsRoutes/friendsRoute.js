const express = require('express');
const friendsController = require('./../../controllers/FriendsController/friendsController');

const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');

router.route("/create-friend-request").post(authController.protect, friendsController.createFriendRequest);


router.route("/accept-request/:requestId").post(authController.protect, friendsController.acceptFriendRequest);

router.route("/unfriend").post(authController.protect, friendsController.doUnfriend);

router.route("/get-friends").get(authController.protect, friendsController.getAllfriend);

router.route("/get-friends-request").get(authController.protect, friendsController.getAllfriendrequest);



module.exports = router;