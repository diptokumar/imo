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


//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
// exports.allUsers = asyncHandler(async (req, res) => {
//     const keyword = req.query.search
//       ? {
//           $or: [
//             { name: { $regex: req.query.search, $options: "i" } },
//             { email: { $regex: req.query.search, $options: "i" } },
//           ],
//         }
//       : {};
  
//     const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
//     res.send(users);
//   });




exports.findUsers = async (req, res, next) => {
    try {
        let { phoneNumber } = req.body
        let user = await DB.User.find(
            { phoneNumber: { $in: phoneNumber } }
        );
        let users = [];

        for (let i = 0; i < phoneNumber.length; i++) {
            let temp = 0;
            console.log("Hello")
            for (let j = 0; j < user.length; j++) {

                if (phoneNumber[i] === user[j].phoneNumber) {
                    users.push({
                        hasAccount: true,
                        phone: user[j]?.phoneNumber,
                        avatar: user[j]?.avatar,
                        handleId: user[j]?.userHandle
                    });
                    temp = 1;
                    break;
                }
            }
            if (temp === 0) {
                users.push({
                    hasAccount: false,
                    phone: req.body.phoneNumber[i],
                });
            }
        }

        res.locals.User = { users };

        return next();

    } catch (e) {
        return next(e);
    }
}