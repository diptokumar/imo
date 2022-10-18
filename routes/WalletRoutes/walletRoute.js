const express = require('express');
const walletController = require('./../../controllers/WalletController/walletController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect );

router
    .route('/deposit-request')
    .post(walletController.createdepositRequest)
   

router
    .route('/accept-deposit-request/:id')
    .post( walletController.acceptdepositRequest)
    

router
    .route('/random-online-seller')
    .get( walletController.randomOnlineseller)
  
router
    .route('/transfer')
    .post( walletController.transfer)
 
router
    .route('/get-deposit-request')
    .get( walletController.getdepositRequest)
router
    .route('/get-single-deposit-info/:id')
    .get( walletController.getDepositInformation)

router
    .route('/admincut-deposit/:depositid')
    .post( walletController.admincut)
  
router
    .route('/user-wallet/:id')
    .get( walletController.userwallet)
  
router
    .route('/seller-wallet-panel/:sellerid')
    .get( walletController.sellerwalletpanel)
  
router
    .route('/seller-deposit-panel/:sellerid')
    .get( walletController.depositpanel)
  

router
    .route('/buyer-deposit-log/:id')
    .get(walletController.depositRequestlog)


router
    .route('/tranfer-deposit-log/:id')
    .get(walletController.tranferRequestlog)


module.exports = router;
