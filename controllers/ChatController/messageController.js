const Chat = require("../../models/ChatModel/chatModel");
const User = require("../../models/UserModel/userModel");
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const Message = require("../../models/ChatModel/messageModel");
const { cloudinary } = require('./../../middleware/cloudnary');

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
exports.allMessages = catchAsync(async (req, res) => {

  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat").sort({createdAt: -1});
  res.status(200).json({
    status: "success",
    messages
  });
});
//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
exports.sendMessage = catchAsync(async (req, res) => {
  const { content, chatId,messagetype } = req.body;

  let fileStr, result, newMessage
  // console.log(req.files )
  // console.log(req.body)
  if (req.files != null){
      fileStr = req.files.image;
      result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
      public_id: `${Date.now()}`,
      resource_type: "auto", //jpeg,png
    });
    newMessage = {
      sender: req.user._id,
      // content: content,
      chat: chatId,
      messagetype: messagetype,
      image: result.secure_url,
    };
  }else{
    newMessage = {
      sender: req.user._id,
      content: content,
      messagetype: messagetype,
      chat: chatId,
    };
  }
   
// console.log("hello",newMessage)


  if (!chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  
  var message = await Message.create(newMessage);
  console.log(message)
  message = await message.populate("sender", "name pic").execPopulate();
  message = await message.populate("chat").execPopulate();
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });
  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  res.status(200).json({
    status: "success",
    message
  });
});

exports.alluserlastmessage = catchAsync(async (req, res) => {
  // console.log(req.user)
  const {role} = req.user;
  let roledefine = role === 'SELLER'? 'BUYER': 'SELLER';

  let user = await User.aggregate([
    {
      '$match': {
        'role': roledefine
      }
    }, {
      '$lookup': {
        'from': 'chats', 
        'localField': '_id', 
        'foreignField': 'users', 
        'as': 'chats'
      }
    },

    {
      '$unwind': {
        'path': '$chats',
        'preserveNullAndEmptyArrays': false
      }
    },
    {
      '$lookup': {
        'from': 'messages', 
        'localField': 'chats.latestMessage', 
        'foreignField': '_id', 
        'as': 'message'
      }
    },
    {
      '$unwind': {
        'path': '$message',
        'preserveNullAndEmptyArrays': false
      }
    },
    {
      '$lookup': {
        'from': 'orders',
        'localField': 'chats.orderId',
        'foreignField': '_id',
        'as': 'order'
      }
    },
    {
      '$unwind': {
        'path': '$order',
        'preserveNullAndEmptyArrays': false
      }
    },
    {
      $sort: {
        "chats.createdAt": -1,
      }
    },
    {
      '$lookup': {
        'from': 'products',
        'localField': 'order.product',
        'foreignField': '_id',
        'as': 'order.product'
      }
    },
    {
      '$unwind': {
        'path': '$order.product',
        'preserveNullAndEmptyArrays': false
      }
    },
    {
      $project:{
            "_id": 1,
            "role": 1,
            "image": 1,
            "points": 1,
            "active": 1,
            "name": 1,
            "email": 1,
            "phoneNumber": 1,
            "password": 1,
            "online": 1,
        'message.content': 1,
        'message.messagetype': 1,
        'message.chat': 1,
        'message.createdAt': 1,
        'order._id': 1,
        'order.orderStatus': 1,
        'order.orderDate': 1,
        'order.orderMonth': 1,
        'order.orderPrice': 1,
        'order.product': 1,
        'order.gameId': 1,
        'order.gameName': 1,
        'order.gid': 1,
        'order.fbmail': 1,
        'order.fbpass': 1,
        'order.createdAt': 1,
        'order.updatedAt': 1,
        'order.orderno': 1,
      }
    },
    
  ]);

  res.status(200).json({
    status: "success",
    // length: user.length,
    user
  });
})