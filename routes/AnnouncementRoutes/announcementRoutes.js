const express = require('express');
const announcementController = require('../../controllers/AnnouncementController/AnnouncementController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), announcementController.getAllannouncement)
    .post(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), announcementController.createsAnnouncement);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), announcementController.getSingleannouncement)
    .patch(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), announcementController.updateannouncement)
    .delete(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), announcementController.deleteannouncement)

module.exports = router;
