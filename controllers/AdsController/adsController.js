const Ads = require('./../../models/AdsModel/adsModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');
const { cloudinary } = require('./../../middleware/cloudnary');



exports.createsAds = catchAsync(async (req, res, next) => {
    const fileStr = req.files.image;
    console.log(req.files.image)
    
    // const uploadResponse = await cloudinary.uploader.upload(fileStr, {
    //     upload_preset: 'dev_setups',
    // });
    console.log(fileStr)
    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    // console.log(result)
    const ads = await Ads.create({...req.body,
        image: result.secure_url,
    });
    res.status(201).json({
        status: 'success',
        data: ads
    })
})


exports.getAllAds = catchAsync(async (req, res, next) => {
    let {pageNo, limit} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    const ads = await Ads.find().sort({createdAt: -1})
    .skip(startIndex).limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        data: ads
    });
})

exports.getSingleAds = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const ads = await Ads.findById(id);
    res.status(200).json({
        status: 'success',
        data: ads
    });
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
