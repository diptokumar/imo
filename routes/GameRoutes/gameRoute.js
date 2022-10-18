const express = require('express');
const gameController = require('./../../controllers/GameController/gameController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), gameController.getAllGames)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), gameController.createGames);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), gameController.getSingleGame)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), gameController.updateGame)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), gameController.deleteGame)

module.exports = router;
