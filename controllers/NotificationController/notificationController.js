const Notification = require('./../../models/NotificationModel/notificationModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');




exports.createsNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.create(req.body);
    res.status(201).json({
        status: 'success',
        data: notification
    })
})


exports.getAllNotifications = catchAsync(async (req, res, next) => {
    let {pageNo, limit} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let notification;

    if(pageNo === null && limit ===null){
        notification = await Notification.find().sort({createdAt: -1})
    }else{

        notification = await Notification.find().sort({createdAt: -1})
        .skip(startIndex).limit(parseInt(limit));
    }
    
    res.status(200).json({
        status: 'success',
        lentgth: notification.length,
        data: notification
    });
})

exports.getSingleNotification = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const notification = await Notification.findById(id);
    res.status(200).json({
        status: 'success',
        data: notification
    });
})

exports.updateNotification = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const notification = await Notification.findOneAndUpdate({_id: id}, req.body, {new: true});
    res.status(203).json({
        status: 'success',
        data: notification
    });
})


exports.deleteNotification = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const notification = await Notification.findOneAndDelete({_id: id});
    res.status(204).json({
        status: 'success',
        data: notification
    });
})
