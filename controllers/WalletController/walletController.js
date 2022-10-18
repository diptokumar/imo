const Wallet = require('../../models/WalletModel/walletModel');
const Transfer = require('../../models/WalletModel/transferModel');
const DepositRequest = require('../../models/WalletModel/depositRequestModel');
const User = require('../../models/UserModel/userModel');
const CreditDebitLog = require('../../models/WalletModel/CreditDebitlogModel');
const Admincut = require('../../models/WalletModel/admincutModel');
const Supply = require('../../models/SupplyModel/supplyModel');
const OrderModel = require('../../models/OrderModel/orderModel');


const mongoose = require('mongoose');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.createdepositRequest = catchAsync(async (req, res, next) => {
    
    const { seller, sellerphoneNumber,
        depositor, depositorphoneNumber,depositBalance,transactionId,
        paymentType } = req.body;
    let object = {
        seller: seller, 
        sellerphoneNumber: sellerphoneNumber,
        depositor: depositor, 
        depositorphoneNumber:depositorphoneNumber,
        depositBalance: depositBalance,
        transactionId: transactionId,
        paymentType: paymentType
    }
    const newDepositRequest = await DepositRequest.create(object);
    res.status(201).json({
        status: 'success',
        newDepositRequest
    });
})

exports.getdepositRequest = catchAsync(async (req, res, next) => {

    let {pageNo, limit, status, admincutstatus, sellerid} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {};
    
    if(status && status.length>0){
        object.paymentStatus = status;
    }
    if(admincutstatus && admincutstatus.length>0){
        object.admincutstatus = admincutstatus;
    }
    if(sellerid && sellerid.length>0){
        object.seller = sellerid;
    }else{
        object.seller = req.user._id;
    }
    
    

    const depositRequest = await DepositRequest.find(object).
    skip(startIndex).limit(parseInt(limit)).populate({path: 'depositor', select: 'name phoneNumber'});
    let total = await DepositRequest.countDocuments(object);
    let totalPage = Math.ceil(total/parseInt(limit));
    res.status(200).json({
        status: 'success',
        length: depositRequest.length,
        totalPage,
        depositRequest
    });
  // get all deposit request
})

exports.acceptdepositRequest = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    let depositRequest = await DepositRequest.findById(id);
    if (!depositRequest) {
        return next(new AppError('No deposit request found with this id', 404));
    }
    let wallets,walletseller;
    if(paymentStatus === 'accept' && depositRequest.paymentStatus === 'pending'){

        const wallet = await Wallet.findOne({walletUser: depositRequest.depositor});
        const walletsellercheck = await Wallet.findOne({walletUser: depositRequest.seller});
        if(!wallet){
            wallets =  await Wallet.create({
                walletUser: depositRequest.depositor,
                credit: depositRequest.depositBalance,
                currentbalance: depositRequest.depositBalance,
                debit: 0
            });
            
        }else{
            wallets = await Wallet.findOneAndUpdate({walletUser: depositRequest.depositor}, {
                $inc: {
                    credit: depositRequest.depositBalance,
                    currentbalance: depositRequest.depositBalance
                }
            },{new: true});
            
        }


        if(!walletsellercheck){
            walletseller =  await Wallet.create({
                walletUser: depositRequest.seller,
                credit: depositRequest.depositBalance,
                currentbalance: depositRequest.depositBalance,
                debit: 0
            });
            
        }else{
            walletseller = await Wallet.findOneAndUpdate({walletUser: depositRequest.seller}, {
                $inc: {
                    credit: depositRequest.depositBalance,
                    currentbalance: depositRequest.depositBalance
                }
            },{new: true});
        }
        depositRequest = await DepositRequest.findByIdAndUpdate(id, {paymentStatus: 'accept', paymentAcceptBy: req.user._id}, {new: true});
        let creditDebitLogseller = await CreditDebitLog.create({
            wallet: walletseller._id,
            method: 'credit',
            amount: depositRequest.depositBalance
        })
        let creditLogbuyer = await CreditDebitLog.create({
            wallet: wallets._id,
            method: 'credit',
            amount: depositRequest.depositBalance
        })
        let debitLogbuyer = await CreditDebitLog.create({
            wallet: wallets._id,
            method: 'debit',
            amount: depositRequest.depositBalance
        })
    }else{
        depositRequest = await DepositRequest.findByIdAndUpdate(id, {paymentStatus: 'reject', paymentAcceptBy: req.user._id}, {new: true});
    }
    
    res.status(201).json({
        status: 'success',
        wallets,
        depositRequest
    });
})

exports.randomOnlineseller = catchAsync(async (req, res, next) => { 
    let seller = await User.aggregate([
        { $match: { role: 'SELLER' , online: true} },
        { $sample: { size: 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        seller
    })
})

exports.transfer = catchAsync(async (req, res, next) => {
    const { transferfrom, transferto, transferamount, message } = req.body;
    let transfer;
    let checkwalletamount = await Wallet.findOne({walletUser: transferfrom, currentbalance: {$gte: transferamount}});
    console.log(checkwalletamount);
    if(checkwalletamount != null){
    transfer = await Transfer.create({
        transferfrom: transferfrom,
        transferto: transferto,
        transferamount: transferamount,
        message: message
    });
    const wallet = await Wallet.findOne({walletUser: transferto});
        if(!wallet){
            wallets =  await Wallet.create({
                walletUser: transferto,
                credit: transferamount,
                currentbalance: transferamount,
                debit: 0
            });
        }else{
            wallets = await Wallet.findOneAndUpdate({walletUser: transferto}, {
                $inc: {
                    credit: transferamount,
                    currentbalance: transferamount
                }
            }, {new: true}); 
        }
        await Wallet.findByIdAndUpdate(checkwalletamount._id, {
            $inc: {
                debit: transferamount,
                currentbalance: -transferamount
            }
        },{new: true});

        let DebitLogtransferer = await CreditDebitLog.create({
            wallet: checkwalletamount._id,
            method: 'debit',
            amount: transferamount
        })
        let creditLogReceiver = await CreditDebitLog.create({
            wallet: wallets._id,
            method: 'credit',
            amount: transferamount
        })
       
    res.status(201).json({
        status: 'success',
        message: 'Transfer success',
        transfer
    })
}else{
        res.status(400).json({
            status: 'fail',
            message: 'Insufficient balance'
        })
    }
})

exports.getDepositInformation = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const depositInformation = await DepositRequest.findById(id).populate({path: 'depositor', select: 'name phoneNumber'});
    if (!depositInformation) {
        return next(new AppError('No deposit request found with this id', 404));
    }
    res.status(200).json({
        status: 'success',
        depositInformation
    })
})

exports.admincut = catchAsync(async (req, res, next) => {
    //1. get single deposit data
    //2. get sellet wallet single wallet data 
    //3. verify admin status false
    //4. verify admin input amount is less than current balance
    //5. update seller wallet and create log of debit from seller wallet

    const { depositid } = req.params;
    const {cutamount} = req.body;
    const deposit = await DepositRequest.findById(depositid);
    if (!deposit) {
        return next(new AppError('No deposit request found with this id', 404));
    }

    const walletseller = await Wallet.findOne({walletUser: deposit.seller, currentbalance: {$gte: cutamount}});

    if(!walletseller){
        return next(new AppError('Insufficient balance or seller wallet is not valid', 400));
    }
    if(deposit.depositBalance < cutamount){
        return next(new AppError('Admin cut amount is greater than deposit balance!', 400));
    }

    let admincutdocument = await Admincut.create({
        depositid: depositid,
        seller: deposit.seller,
        depositBalance: deposit.depositBalance,
        admincutamount: cutamount,
    });
    await Wallet.findByIdAndUpdate(walletseller._id, {
        $inc: {
            credit: -cutamount,
            debit: cutamount,
        }
    }, {new: true});

    await DepositRequest.findByIdAndUpdate(depositid, {admincutstatus: true, admincutamount: cutamount}, {new: true});

    let DebitLogadmincut = await CreditDebitLog.create({
        wallet: walletseller._id,
        method: 'debit',
        amount: cutamount
    });

    res.status(201).json({
        status: 'success',
        DebitLogadmincut,
        admincutdocument,
    })

})

exports.userwallet = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userwallet = await Wallet.findOne({walletUser: id}).populate({path: 'walletUser', select: 'name phoneNumber'});
    if (!userwallet) {
        return next(new AppError('No wallet found with this id', 404));
    }
    res.status(200).json({
        status: 'success',
        userwallet
    })
});

exports.sellerwalletpanel = catchAsync(async (req, res, next) => {
    const { sellerid } = req.params;
    let profit = 0, sellbalance = 0, supplyAmout=0, sellerdepositamount = 0;
     sellerdepositamount = await DepositRequest.aggregate([
        { $match: { seller: mongoose.Types.ObjectId(sellerid), paymentStatus: 'accept'} },
        { $group: { _id: null, total: { $sum: '$depositBalance' } } },

    ]);


    const totalsale = await OrderModel.aggregate([
        { $match: { seller: mongoose.Types.ObjectId(sellerid), orderStatus: 'completed'} },
        { $group: { _id: null, total: { $sum: '$orderPrice' } } },
    ]);

    if(totalsale.length > 0){
        sellbalance = totalsale[0].total;
    }

    if(sellerdepositamount.length > 0){
        sellerdepositamount = sellerdepositamount[0].total;
    }else{
        sellerdepositamount = 0
    }
     supplyAmout = await Supply.findOne({
        seller: sellerid,
    })
    
    supplyAmout = supplyAmout?.totalBalance;
    profit = sellbalance - supplyAmout;
    res.status(200).json({
        status: 'success',
        profit,
        sellbalance,
        supplyAmout,
        sellerdepositamount
    })
})


exports.depositpanel = catchAsync(async (req, res, next) => {

    const { sellerid } = req.params;
    let profit = 100, admincut = 0, supplyAmout, sellerdepositamount = 0;
     sellerdepositamount = await DepositRequest.aggregate([
        { $match: { seller: mongoose.Types.ObjectId(sellerid), paymentStatus: 'accept'} },
        { $group: { _id: null, total: { $sum: '$depositBalance' } } },

    ]);
    
    if(sellerdepositamount.length > 0){
        sellerdepositamount = sellerdepositamount[0].total;
    }

    admincut = await Admincut.aggregate([
        { $match: { seller: mongoose.Types.ObjectId(sellerid)} },
        { $group: { _id: null, total: { $sum: '$depositBalance' } } },
    ])

    if(admincut.length > 0){
        admincut = admincut[0].total;
    }
    res.status(200).json({
        status: 'success',
        sellerdepositamount,
        admincut
    })



})

exports.depositRequestlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let depositamount = await DepositRequest.find({
        depositor: id
    }).populate('depositor seller');

    res.status(200).json({
        status: 'success',
        depositamount
    })
})


exports.tranferRequestlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let transferamount = await Transfer.find({
        transferfrom: id
    }).populate('transferfrom transferto');

    res.status(200).json({
        status: 'success',
        transferamount
    })
})