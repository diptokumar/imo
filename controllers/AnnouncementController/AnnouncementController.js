const Announcement = require('../../models/AnnounceMent/anouncementModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const UserLiked = require('../../models/AnnounceMent/userLiked')


exports.createsAnnouncement = catchAsync(async (req, res, next) => {

    const announcement = await Announcement.create({...req.body
    });
    res.status(201).json({
        status: 'success',
        announcement
    })
})


exports.getAllannouncement = catchAsync(async (req, res, next) => {
    let {pageNo, limit} = req.query;
    pageNo = parseInt(pageNo);
    limit = parseInt(limit);
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let announcement
    let startIndex = value > 0 ? value : 0;
    let array = [];
    if (pageNo === 0 && limit === 0) {
        announcement = await Announcement.find({
            active: true
        })
    }else{
        announcement = await Announcement.find({
            active: true
        }).sort({ createdAt: -1 })
            .skip(startIndex).limit(parseInt(limit));
    }
    for (let i = 0; i < announcement.length; i++) {
        let userlike = await UserLiked.findOne({
            userId: req.user._id,
            likedDocuments: announcement[i]._id
        })
        let object = JSON.parse(JSON.stringify(announcement[i]));
        userlike ? object.userliked = true : object.userliked = false;
        array.push(object);
    }
    res.status(200).json({
        status: 'success',
        announcement: array
    });
})

exports.getSingleannouncement = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const announcement = await Announcement.findById(id);
    res.status(200).json({
        status: 'success',
         announcement
    });
})

exports.updateannouncement = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    let {value} = req.query;
    let announcement
    if(value === 'increment'){
        announcement = await Announcement.findOneAndUpdate({ _id: id }, {
            $inc:   {
                likeCount:  1
            }
        },
        {new: true});

        let userlike = await UserLiked.findOne({
            userId: req.user._id,
            likedDocuments: id
        });

        if (userlike === null) {
            userlike = await UserLiked.create({
                userId: req.user._id,
                likedDocuments: id
            });
        }
    }else if(value === 'decrement'){
        announcement = await Announcement.findOneAndUpdate({ _id: id }, {
            $inc: {
                likeCount: -1
            }
        },
            { new: true });

        let userlike = await UserLiked.findOneAndDelete({
            userId: req.user._id,
            likedDocuments: id
        });

    }else{
        announcement = await Announcement.findOneAndUpdate({ _id: id }, {
            ...req.body,
        },
            { new: true });
    }
     
        res.status(200).json({
            status: 'success',
             announcement
        });
    
})


exports.deleteannouncement = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const announcement = await Announcement.findOneAndDelete({_id: id});
    res.status(204).json({
        status: 'success',
         announcement
    });
})
