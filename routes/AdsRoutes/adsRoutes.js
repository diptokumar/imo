const express = require('express');
const adsController = require('./../../controllers/AdsController/adsController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), adsController.getAllAds)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), adsController.createsAds);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), adsController.getSingleAds)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), adsController.updateAds)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), adsController.deleteAds)

module.exports = router;
