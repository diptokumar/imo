const express = require('express');
const notificationController = require('./../../controllers/NotificationController/notificationController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.getAllNotifications)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.createsNotification);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.getSingleNotification)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.updateNotification)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.deleteNotification)

module.exports = router;
