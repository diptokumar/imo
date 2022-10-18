const express = require('express');
const orderController = require('./../../controllers/OrderController/orderController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect);
router
    .route('/leader-board')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.leaderboard)


router
    .route('/total-sale')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.totalsale)

    router
    .route('/total-order')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.totalorder)

    router
    .route('/total-profit')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.totalprofit)


router
    .route('/:orderid')
    .patch(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.sellerOrderAccept)
router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.getUserOrder)
    .post(authController.restrictTo('BUYER', 'ADMIN', 'SELLER'), orderController.createOrder);


module.exports = router;
