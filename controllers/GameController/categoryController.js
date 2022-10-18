const Category = require('./../../models/GameModel/catagoryModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');




exports.createsCategory = catchAsync(async (req, res, next) => {
    const category = await Category.create(req.body);
    res.status(201).json({
        status: 'success',
        data: category
    })
})


exports.getAllcategorys = catchAsync(async (req, res, next) => {
    let {pageNo, limit, gameId} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {};
    let category
    if(gameId!=null && gameId.length> 0){
        object.gameId = gameId
    }
    if(pageNo ===null && limit ===null){
        category = await Category.find(object).sort({createdAt: -1})
        
    }else{
     category = await Category.find(object).sort({createdAt: -1})
    .skip(startIndex).limit(parseInt(limit));}
    res.status(200).json({
        status: 'success',
        length: category.length,
        data: category
    });
})

exports.getSinglecategory = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const category = await Category.findById(id);
    res.status(200).json({
        status: 'success',
        data: category
    });
})

exports.updatecategory = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const category = await Category.findOneAndUpdate({_id: id}, req.body, {new: true});
    res.status(203).json({
        status: 'success',
        data: category
    });
})


exports.deletecategory = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const category = await Category.findOneAndDelete({_id: id});
    res.status(204).json({
        status: 'success',
        data: category
    });
})
