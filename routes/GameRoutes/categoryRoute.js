const express = require('express');
const categoryController = require('./../../controllers/GameController/categoryController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), categoryController.getAllcategorys)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), categoryController.createsCategory);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), categoryController.getSinglecategory)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), categoryController.updatecategory)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), categoryController.deletecategory)

module.exports = router;
