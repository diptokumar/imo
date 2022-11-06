const express = require('express');
const chatController = require('../../controllers/ChatController/chatController');
const messageController = require('../../controllers/ChatController/messageController');

const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');







router.route("/add-to-group").post(authController.protect, chatController.addToGroup);

router.route("/remove-from-group").post(authController.protect, chatController.removeFromGroup);


router.route("/rename-group-chat").post(authController.protect, chatController.renameGroup);

router.route("/create-group-chat").post(authController.protect, chatController.createGroupChat);

router.route("/send-message").post(authController.protect, messageController.sendMessage);

router.route("/get-message/:chatId").get(authController.protect, messageController.allMessages);


router.route("/all-chats").get(authController.protect, chatController.fetchChats);

router.route("/").post(authController.protect, chatController.accessChat);



module.exports = router;