const express = require('express');
const userController = require('./../../controllers/UserController/userController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');



router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);


router.use(authController.protect );


router
  .route('/findByAllNumber')
  .post(userController.findUsers)



router
    .route('/')
    .get( userController.getAllUsers)
    .post( userController.createUsers);


router
    .route('/:id')
    .get( userController.getSingleUser)
    .patch( userController.updateUser)
    .delete( userController.deleteUser)


module.exports = router;
