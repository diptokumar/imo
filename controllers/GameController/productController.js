const Product = require('./../../models/GameModel/productModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');
const { cloudinary } = require('./../../middleware/cloudnary');




exports.createProducts = catchAsync(async (req, res, next) => {
    const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const product = await Product.create({...req.body,
        image: result.secure_url,
    });
    res.status(201).json({
        status: 'success',
        data: product
    })
})


exports.getAllproducts = catchAsync(async (req, res, next) => {
    let {pageNo, limit, category, gameid} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let product, object = {};
    if(category!=null && category.length> 0){
        object.category = category
    }
    if(gameid!=null && gameid.length> 0){
        object.game = gameid
    }
    if(pageNo === 0 && limit === 0){
         product = await Product.find(object).sort({createdAt: -1})
    }else{

     product = await Product.find(object).sort({createdAt: -1})
     .skip(startIndex).limit(parseInt(limit));
    }
    res.status(200).json({
        status: 'success',
        data: product
    });
})

exports.getSingleproduct = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const product = await Product.findById(id);
    res.status(200).json({
        status: 'success',
        data: product
    });
})

exports.updateproduct = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const product = await Product.findOneAndUpdate({_id: id}, req.body, {new: true});
    res.status(200).json({
        status: 'success',
        data: product
    });
})


exports.deleteproduct = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const product = await Product.findOneAndDelete({_id: id});
    res.status(200).json({
        status: 'success',
        data: product
    });
})
