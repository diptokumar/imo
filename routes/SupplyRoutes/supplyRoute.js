const express = require('express');
const supplyController = require('./../../controllers/SupplyController/supplyController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/supply-log')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), supplyController.getSupplylog)
   

router
    .route('/supply-taken-given-value')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), supplyController.givenAndtakenBdt)
    


router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), supplyController.getAllSellersSupply)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), supplyController.createsSupply);


router
    .route('/:id')
    // .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.getSingleNotification)
    // .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.updateNotification)
    // .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), notificationController.deleteNotification)

module.exports = router;
