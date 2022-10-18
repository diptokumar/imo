const OrderModel = require('./../../models/OrderModel/orderModel');
const SellerProduct = require('./../../models/AssignSellerModel/assignProductModel');
const WalletModel = require('./../../models/WalletModel/walletModel')
const UserModel = require('./../../models/UserModel/userModel')
const catchAsync = require('./../../utils/catchAsync');
const CreditDebitLog = require('../../models/WalletModel/CreditDebitlogModel');
const SupplyModel = require('./../../models/SupplyModel/supplyModel');
const SupplylogModel = require('./../../models/SupplyModel/supplylogModel');


const AppError = require('./../../utils/appError');
const moment = require('moment');
const mongoose = require('mongoose');

exports.createOrder = catchAsync(async (req, res, next) => {
    console.log(req.user._id);
    const userWallet = await WalletModel.findOne({walletUser: req.user._id});
    console.log(userWallet)
    if (!userWallet || userWallet.currentbalance < req.body.orderPrice){
        return next(
            new AppError('You do not have enough ballance, please recharge', 400)
        );
    }

    let seller =await SellerProduct.aggregate([
        {
            $match: {
                product: mongoose.Types.ObjectId(req.body.product)
            }
        },
        {
            $sample: { size: 1}
        }
    ]);
    console.log(seller)
    if (seller.length === 0) {
        return next(
            new AppError('No Seller have this product', 400)
        );
    }
    let wallet = await WalletModel.findOneAndUpdate({ walletUser: req.user._id }, {
        $inc: {
            debit: req.body.orderPrice,
            currentbalance: -req.body.orderPrice
        }
    }, { new: true });
    let creditDebitLogseller = await CreditDebitLog.create({
        wallet: userWallet._id,
        method: 'debit',
        amount: req.body.orderPrice
    })


    let object = {
        product: req.body.product,
        seller: seller[0].seller,
        buyerId: req.user._id,
        orderPrice: req.body.orderPrice,
        gameId: req.body.gameId,
        gameName: req.body.gameName,
        gid: req.body.gid,
        fbmail: req.body.fbmail,
        fbpass: req.body.fbpass
    }

    let order = await OrderModel.create(object);

    res.status(201).json({
        status: 'success',
        order
    })


})

exports.getUserOrder = catchAsync(async (req, res, next) => {
    let { orderstatus, limit, pageNo, userid} = req.query;
    let user = await UserModel.findById(userid);
    if (!user) {
        next(new AppError('User not found', 404))
    }
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {}
    if (orderstatus != 'All'){
        object.orderStatus = orderstatus
    }
    if (user.role === 'BUYER'){
        object.buyerId = userid
    }else{
        object.seller = userid
    }
    
    let order;
    
        if(pageNo === 0 || limit ===0){
            order = await OrderModel.find(object).populate([{ path: 'product', select: 'productName points price' }, { path: 'seller', select: 'name image' }, { path: 'buyerId', select: 'name image' }])
        }else{
            order = await OrderModel.find(object).skip(startIndex).limit(parseInt(limit)).populate([{ path: 'product', select: 'productName points price' }, { path: 'seller', select: 'name image' }, { path: 'buyerId', select: 'name image' }]);}
    
    res.status(200).json({
        status: 'success',
        order
    })

})

exports.sellerOrderAccept = catchAsync(async (req, res, next) => {
    const userWallet = await WalletModel.findOne({ walletUser: req.user._id });
    const { orderid} = req.params;
    let order = await OrderModel.findById(orderid);
    if(!order){
        return next(
            new AppError('no order found With this id', 400)
        );
    }
    console.log(userWallet)
    if (!userWallet) {
        userWallet = await WalletModel.create({
            walletUser: req.user._id,
            credit: 0,
            currentbalance: 0,
            debit: 0
        });
        return next(
            new AppError('no wallet found With this user', 400)
        );
    }
    let orderupdate;
    if(req.body.status === 'accept'){
        orderupdate = await OrderModel.findByIdAndUpdate(orderid, {
            orderStatus: 'completed'
        },{new: true});
        
        let wallet = await WalletModel.findOneAndUpdate({ walletUser: req.user._id }, {
            $inc: {
                credit: order.orderPrice,
                currentbalance: order.orderPrice
            }
        }, { new: true });
        let creditDebitLogseller = await CreditDebitLog.create({
            wallet: userWallet._id,
            method: 'credit',
            amount: order.orderPrice
        })
    }else{
        orderupdate = await OrderModel.findByIdAndUpdate(orderid, {
            orderStatus: 'cancelled',
            remarks: req.body.remarks
        }, { new: true });

        let wallet = await WalletModel.findOneAndUpdate({ walletUser: order.buyerId }, {
            $inc: {
                credit: order.orderPrice,
                currentbalance: order.orderPrice
            }
        }, { new: true });
        let creditDebitLogseller = await CreditDebitLog.create({
            wallet: wallet._id,
            method: 'credit',
            amount: order.orderPrice
        })
    }


    res.status(203).json({
        status: 'success',
        orderupdate
    })

    
})


exports.totalsale = catchAsync(async (req, res, next) => {
  let monthData = new Date();
  monthData.setMonth(monthData.getMonth() - 6);
   
   let aggregate =  [
    {
      '$match': {
         'createdAt': { $gte: monthData },
        'orderStatus': 'completed'
      }
    }, {
      '$group': {
        '_id': {
          '$month': '$createdAt'
        }, 
        'price': {
          '$sum': '$orderPrice'
        }
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ];
  

    const totalSale = await OrderModel.aggregate(aggregate);
    res.status(200).json({
        status: 'success',
        totalSale
    })
})

exports.totalorder = catchAsync(async (req, res, next) => {
  let monthData = new Date();
  monthData.setMonth(monthData.getMonth() - 6);

  let aggregate = [
    {
      '$match': {
        'createdAt': { $gte: monthData },
        'orderStatus': 'completed'
      }
    }, {
      '$group': {
        '_id': {
          '$month': '$createdAt'
        },
        'price': {
          '$sum': '$orderPrice'
        }
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ];
  let supplyaggregate = [
    {
      '$match': {
        'createdAt': { $gte: monthData },
        'supplyStatus': 'Given'
      }
    }, {
      '$group': {
        '_id': {
          '$month': '$createdAt'
        },
        'price': {
          '$sum': '$givenBdt'
        }
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ];

  let totalprofit = [];
 
  const totalorder = await OrderModel.aggregate(aggregate);

  const totalsupply = await SupplylogModel.aggregate(supplyaggregate);

  for (let i = 0; i < totalsupply.length; i++) {
  for (let j = 0; j < totalorder.length; j++){

      let object = {};
    if (totalsupply[i]._id == totalorder[j]._id){
      let profit = totalorder[j].price - totalsupply[i].price;
        object.month = totalsupply[i]._id;
        object.profit = profit
      totalprofit.push(object);
        break;
    }
    else if (j + 1 === totalorder.length){
      object.month = totalsupply[i]._id;
      object.profit = - totalsupply[i].price
      totalprofit.push(object);
      break;}
  }}




     res.status(200).json({
         status: 'success',
       totalprofit
     })
 })

 exports.totalprofit = catchAsync(async (req, res, next) => {
        let totalsupply=0, sellamount=0, profit=0;
        let saleaggregate =  [
            {
                '$match': {
                  'orderStatus': 'completed'
                }
              },
             {
            '$group': {
                '_id': null, 
                'profit': {
                '$sum': '$orderPrice'
                }
            }
            }
        ];
        
        let supplyaggregate =  [
            
             {
            '$group': {
                '_id': null, 
                'supplytotal': {
                '$sum': '$totalBalance'
                }
            }
            }
        ];


        const supply = await SupplyModel.aggregate(supplyaggregate);

        const totalprofit = await OrderModel.aggregate(saleaggregate);
        if(supply.length>0)
      {
        totalsupply = supply[0].supplytotal;
      }
        if(totalprofit.length>0){
            sellamount = totalprofit[0].profit;
        }

        profit = sellamount - totalsupply;

        res.status(200).json({
            status: 'success',
            totalsupply,
            sellamount,
            profit
        })
 })


exports.leaderboard = catchAsync(async (req, res, next) => {

  const { pageNo, limit } = req.query

  let value = (parseInt(pageNo) - 1) * parseInt(limit);
  console.log(value)
  let startIndex = value > 0 ? value : 0;
    let leaderboard;
    if(req.user.role === 'BUYER'){
      let aggregate
      if(limit == 0 && pageNo == 0){
         aggregate =  [
          {
            '$match': {
              
              'orderStatus': 'completed'
            }
          }, {
            '$group': {
              '_id': '$buyerId', 
              'price': {
                '$sum': '$orderPrice'
              }
            }
          }, 
          {
            '$sort': {
              'price': -1
            }
          },
          {
              $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'buyer'
              }
          },
          {
              '$unwind': {
                'path': '$buyer'
              }
          },
          {
              '$project': {
                  '_id': '$buyer._id',
                  'name': '$buyer.name',
                  'image': '$buyer.image',
                  'price': '$price'
              }
          }
        ];
      }
      else{
         aggregate =  [
          {
            '$match': {
              
              'orderStatus': 'completed'
            }
          }, {
            '$group': {
              '_id': '$buyerId', 
              'price': {
                '$sum': '$orderPrice'
              }
            }
          }, 
          {
            '$sort': {
              'price': -1
            }
          },
          {
              $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'buyer'
              }
          },
          {
              '$unwind': {
                'path': '$buyer'
              }
        },
        , {
          '$skip': startIndex
        }, {
          '$limit': parseInt(limit)
        },
        {
          '$project': {
              '_id': '$buyer._id',
              'name': '$buyer.name',
              'image': '$buyer.image',
              'price': '$price'
          }
      }
        ]; 
      }
        
     
          leaderboard = await OrderModel.aggregate(aggregate);
         
    }else{
      let aggregate;
      if(limit == 0 && pageNo == 0){
        aggregate = [
          {
            '$match': {
              'orderStatus': 'completed'
            }
          }, {
            '$group': {
              '_id': '$seller',
              'price': {
                '$sum': '$orderPrice'
              }
            }
          }, {
            '$lookup': {
              'from': 'supplies',
              'localField': '_id',
              'foreignField': 'seller',
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$project': {
              '_id': 1,
              'price': {
                '$subtract': [
                  '$price', '$user.totalBalance'
                ]
              }
            }
          }, {
            '$lookup': {
              'from': 'users',
              'localField': '_id',
              'foreignField': '_id',
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          },
          {
            '$project': {
              '_id': '$user._id',
              'name': '$user.name',
              'image': '$user.image',
              'price': '$result'
            }
          }
        ];
      }
      else{
        aggregate = [
          {
            '$match': {
              'orderStatus': 'completed'
            }
          }, {
            '$group': {
              '_id': '$seller',
              'price': {
                '$sum': '$orderPrice'
              }
            }
          }, {
            '$lookup': {
              'from': 'supplies',
              'localField': '_id',
              'foreignField': 'seller',
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$project': {
              '_id': 1,
              'result': {
                '$subtract': [
                  '$price', '$user.totalBalance'
                ]
              }
            }
          }, {
            '$lookup': {
              'from': 'users',
              'localField': '_id',
              'foreignField': '_id',
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$skip': startIndex
          }, {
            '$limit': parseInt(limit)
          },
          ,
          {
            '$project': {
              '_id': '$user._id',
              'name': '$user.name',
              'image': '$user.image',
              'price': '$result'
            }
          }
        ];
      }

      
      
          leaderboard = await OrderModel.aggregate(aggregate);
         
    }

    res.status(200).json({
        status: 'success',
        leaderboard
    })


 })
 