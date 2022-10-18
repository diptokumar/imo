const express = require('express');
const chatController = require('./../../controllers/ChatController/chatController');
const messageController = require('./../../controllers/ChatController/messageController');

const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');



router.route("/get-users").get(authController.protect, messageController.alluserlastmessage);


router.route("/get-message/:chatId").get(authController.protect, messageController.allMessages);


router.route("/send-message").post(authController.protect, messageController.sendMessage);


// chat under order
router.route("/chat-under-order").post(authController.protect, chatController.chatunderorder);


router.route("/").post(authController.protect, chatController.accessChat);



module.exports = router;