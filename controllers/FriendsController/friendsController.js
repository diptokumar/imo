const Friendslog = require('./../../models/FrendsModel/friendLogModel');
const Friends = require('./../../models/FrendsModel/friendsModel');

const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');
const mongoose = require('mongoose');


exports.createFriendRequest= catchAsync(async (req,res, next)=> {
    let friendRequest
    let object = {
        userOne: req.user._id,
        userTwo: req.body.friend,
        request: 'pending'
    }
    let check = await Friendslog.findOne(object);
    let friendcheck = await Friends.findOne({
        mainUserID: req.user._id,
        freindId: req.body.friend
    })
    console.log(check)
    console.log(friendcheck)
    if(check === null && friendcheck === null){
        friendRequest = await Friendslog.create(object)
        res.status(200).json({
            status: 'success',
            friendRequest
        })
    }else{
        res.status(200).json({
            status: 'success',
            message: 'You already requested'
        })
    }
    

})

exports.acceptFriendRequest= catchAsync(async (req,res, next)=> {

    
    const {requestId} = req.params;

    let request = await Friendslog.findById(requestId);
    console.log(request)
    if(request ===null || request.request != 'pending'){
     return  next(new AppError("Request not found or allready accept", 400));
    }
    let check
    if(req.body.request === 'accept'){
         check = await Friends.findOne({
            mainUserID: request.userOne,
            freindId: request.userTwo
        });
        if(check != null){
            next(
                new  AppError("All ready friend", 400)
              )
          
        
        }
        let friend = await Friends.create({
            mainUserID: request.userOne,
            freindId: request.userTwo
        });
        let friendtwo = await Friends.create({
            freindId: request.userOne,
            mainUserID: request.userTwo
        })
        let requestupdate = await Friendslog.findByIdAndUpdate(requestId,{
            request: 'accept'
        });
        res.status(200).json({
            status: 'success',
            friend,
            friendtwo
        })
    }else{
        let requestupdate = await Friendslog.findByIdAndUpdate(requestId,{
            request: 'reject'
        });
        res.status(200).json({
            status: 'success',
            requestupdate
        })
    }   

})

exports.doUnfriend = catchAsync(async (req, res, next)=>{
    let object = {
        userOne: req.user._id,
        userTwo: req.body.friend,
        unfriend: true,
        unfriendRequestBy: req.user._id
    };

    let friends = await Friends.findOneAndDelete({
        mainUserID : req.user._id,
        freindId: req.body.friend
    });

    let friendclear = await Friends.findOneAndDelete({
        freindId : req.user._id,
        mainUserID: req.body.friend
    });

    let friendlog = await Friendslog.create(object);

    res.status(200).json({
        status: 'success',
        friendlog
    })

})

exports.getAllfriend = catchAsync(async (req, res, next)=>{
    let {pageNo, limit,search} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {};
    

    if(search != null && search.length > 0){
        object['$or'] = [ { "name": { $regex: search, $options: "i" } },
        { "email": { $regex: search, $options: "i" } },
     ];
    }
    // console.log(object)

    let friends = await Friends.aggregate([
        {
            $match: {
                mainUserID: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'freindId',
                foreignField: '_id',
                as: 'frienddata'
            }
        },
        {
            $unwind: '$frienddata'
        },
        {
            $project: {
                _id: 1,
                name: "$frienddata.name",
                email: "$frienddata.email",
                image: "$frienddata.image",
                online: "$frienddata.online",
                phoneNumber: "$frienddata.phoneNumber",
                friendid: "$frienddata._id",

            }
        },
        {
            $match: object
                
            // {$or: [{ "name": { $regex: search, $options: "i" } },{ "email": { $regex: search, $options: "i" } }]}
            
        },
        {
            '$skip': startIndex
        }, 
        {
            '$limit': parseInt(limit)
        },
        
    ])


    res.status(200).json({
        status: 'success',
        friends
    })
})


exports.getAllfriendrequest = catchAsync(async (req, res, next)=>{
    let {pageNo, limit,search} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let page = await Friendslog.count({
        userTwo: req.user._id,
        request: 'pending'
    });
    let totalpage = Math.ceil(page/limit);
    let friends = await Friendslog.find({
        userTwo: req.user._id,
        request: 'pending'
    }).populate('userOne').skip(startIndex).limit(parseInt(limit));


    res.status(200).json({
        status: 'success',
        friends,
        totalpage
    })
})