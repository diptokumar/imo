const Supply = require('./../../models/SupplyModel/supplyModel');
const Supplylog = require('./../../models/SupplyModel/supplylogModel');

const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');
const { cloudinary } = require('./../../middleware/cloudnary');



exports.createsSupply = catchAsync(async (req, res, next) => {
    
    let supply, checkSupply, supplylogdata;
    
    checkSupply = await Supply.findOne({seller: req.body.seller});
    if(checkSupply){
        if(req.body.supplyStatus === 'Given'){
            supply = await Supply.findOneAndUpdate({seller: req.body.seller}, {
               
                $inc: {
                    totalBalance: req.body.givenBdt,
                }
            }, {new: true});
        }else{
            supply = await Supply.findOneAndUpdate({seller: req.body.seller}, {
                $inc: {
                    totalBalance: -req.body.takenBdt,
                }
            }, {new: true});
        }
    }else{
        supply = await Supply.create({
            seller: req.body.seller,
            totalBalance: req.body.givenBdt,
        });
    }
    supplylogdata = await Supplylog.create({...req.body});


        
    res.status(201).json({
        status: 'success',
        data: supply,
        supplylogdata
    })
})

exports.getAllSellersSupply = catchAsync(async (req, res, next) => {
    let {pageNo, limit} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    const supply = await Supply.find().sort({createdAt: -1}).populate('seller')
    .skip(startIndex).limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        data: supply
    });
})


exports.getSupplylog = catchAsync(async (req, res, next) => {
    let {pageNo, limit, sellerId} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let Object = {}, sellerBdt = 0;
    if(sellerId){
        Object = {seller: sellerId};
    
        let sellerdata = await Supply.findOne({seller: sellerId});
        sellerBdt = sellerdata.totalBalance;
        console.log(sellerdata);
    
    }
    console.log(Object);

    const sellerLog = await Supplylog.find(Object).sort({createdAt: -1}).populate('seller')
    .skip(startIndex).limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        sellerBdt,
        data: sellerLog
    });
});


exports.getSingleSellersSupplyData = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const ads = await Ads.findById(id);
    res.status(200).json({
        status: 'success',
        data: ads
    });
})


exports.givenAndtakenBdt = catchAsync(async (req, res, next)=> {
    const sellerLog = await Supplylog.aggregate([
        {
          '$facet': {
            'givenBdt': [
              {
                '$group': {
                  '_id': null, 
                  'givenValue': {
                    '$sum': '$givenBdt'
                  }
                }
              }
            ], 
            'takenBdt': [
              {
                '$group': {
                  '_id': null, 
                  'takenValue': {
                    '$sum': '$takenBdt'
                  }
                }
              }
            ]
          }
        }
      ]);
    let givenBdt = 0;
    let takenBdt = 0;
    if(sellerLog.length> 0){
        givenBdt = sellerLog[0].givenBdt[0].givenValue
        takenBdt = sellerLog[0].takenBdt[0].takenValue
    }
    res.status(200).json({
        status: 'success',
        givenBdt,
        takenBdt
    })
})


exports.updateAds = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
   


    if(req.files === null){
        const ads = await Ads.findOneAndUpdate({_id: id}, {
            ...req.body,
            
        }, {new: true});
        res.status(200).json({
            status: 'success',
            data: ads
        });
    }else{
        const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const ads = await Ads.findOneAndUpdate({_id: id}, {
        ...req.body,
        image: result.secure_url,
    }, {new: true});
    res.status(200).json({
        status: 'success',
        data: ads
    });
    }
})


exports.deleteAds = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const ads = await Ads.findOneAndDelete({_id: id});
    res.status(204).json({
        status: 'success',
        data: ads
    });
})
