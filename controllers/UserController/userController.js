const User = require('./../../models/UserModel/userModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
// const moment = require('moment')
var moment = require('moment-timezone');
const { cloudinary } = require('./../../middleware/cloudnary');





exports.createUsers = catchAsync(async (req, res, next) => {
    if(req.files === null){
        const user = await User.create({...req.body,
            
        });
        res.status(201).json({
            status: 'success',
            data: user
        })
    }else{
   
    const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const user = await User.create({...req.body,
        image: result.secure_url,
    });
    res.status(201).json({
        status: 'success',
        data: user
    })}
})



exports.getAllUsers = catchAsync(async (req, res, next) => {
    let {pageNo, limit, role, search} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {};
    if(role != null && role.length > 0){
        object.role = role;
    }

    if(search != null && search.length > 0){
        object = {};
        object['$or'] = [ { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
     ];
    }

    const users = await User.find(object).sort({createdAt: -1})
    .skip(startIndex).limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        length: users.length,
        data: users
    });
})

exports.updateUser = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    if(req.files === null){
        const user = await User.findOneAndUpdate({_id: id},{...req.body,
            
        },{new: true});
        res.status(201).json({
            status: 'success',
            data: user
        })
    }else{
   
    const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const user = await User.findOneAndUpdate({_id: id},{...req.body,
        image: result.secure_url,
    },{new: true});
    res.status(201).json({
        status: 'success',
        data: user
    })}
})

exports.getSingleUser = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const user = await User.findById(id);
    res.status(200).json({
        status: 'success',
        data: user
    });
})


exports.deleteUser = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const user = await User.findOneAndDelete({_id: id});
    res.status(200).json({
        status: 'success',
        data: user
    });
})



exports.findUsers = async (req, res, next) => {
    try {
        let { phoneNumber } = req.body
        let user = await User.find(
            { phoneNumber: { $in: phoneNumber } }
        );
        let users = [];

        for (let i = 0; i < phoneNumber.length; i++) {
            let temp = 0;
            for (let j = 0; j < user.length; j++) {

                if (phoneNumber[i] === user[j].phoneNumber) {
                    users.push({
                        hasAccount: true,
                        // phone: user[j]?.phoneNumber,
                        // avatar: user[j]?.avatar,
                        // handleId: user[j]?.userHandle,

                        "role": user[j]?.role,
                        "image": user[j]?.image,
                        "online": user[j]?.online,
                        "_id": user[j]?._id,
                        "phoneNumber":user[j]?.phoneNumber,
                        "name": user[j]?.name
                    });
                    temp = 1;
                    break;
                }
            }
            // if (temp === 0) {
            //     users.push({
            //         hasAccount: false,
            //         phone: req.body.phoneNumber[i],
            //     });
            // }
        }

        res.status(200).json({
            status: 'success',
            data: users
        });

    } catch (e) {
        return next(e);
    }
}


