const express = require('express');
const sellerProductController = require('./../../controllers/SellerProductController/sellerProductController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), sellerProductController.getAllAssignProducts)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), sellerProductController.createsAssignProduct);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), sellerProductController.getSingleAssignProduct)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), sellerProductController.updateAssignProduct)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), sellerProductController.deleteAssignProduct)

module.exports = router;
