const AssignProduct = require('./../../models/AssignSellerModel/assignProductModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');




exports.createsAssignProduct = catchAsync(async (req, res, next) => {
    const assignProduct = await AssignProduct.create(req.body);
    res.status(201).json({
        status: 'success',
        assignProduct
    })
})


exports.getAllAssignProducts = catchAsync(async (req, res, next) => {
    let {pageNo, limit, sellerId} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {};
    if(sellerId!=null && sellerId.length> 0){
        object.seller = sellerId
    }
    const assignProduct = await AssignProduct.find(object).sort({createdAt: -1})
    .skip(startIndex).limit(parseInt(limit)).populate('product');
    res.status(200).json({
        status: 'success',
        assignProduct
    });
})

exports.getSingleAssignProduct = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const assignProduct = await AssignProduct.findById(id);
    res.status(200).json({
        status: 'success',
        assignProduct
    });
})

exports.updateAssignProduct = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const assignProduct = await AssignProduct.findOneAndUpdate({_id: id}, req.body, {new: true});
    res.status(203).json({
        status: 'success',
        assignProduct
    });
})


exports.deleteAssignProduct = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const assignProduct = await AssignProduct.findOneAndDelete({_id: id});
    res.status(204).json({
        status: 'success',
        assignProduct
    });
})
