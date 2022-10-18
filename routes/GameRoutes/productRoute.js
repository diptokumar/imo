const express = require('express');
const productController = require('./../../controllers/GameController/productController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), productController.getAllproducts)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), productController.createProducts);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), productController.getSingleproduct)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), productController.updateproduct)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), productController.deleteproduct)

module.exports = router;
