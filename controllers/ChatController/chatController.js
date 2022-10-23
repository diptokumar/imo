const Chat = require("../../models/ChatModel/chatModel");
const Order = require("../../models/OrderModel/orderModel");
const User = require("../../models/UserModel/userModel");
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const { callbackPromise } = require("nodemailer/lib/shared");


function getuser(a, userid){
  // console.log(a, userid, 'jdnfjfdn')
  let temp;
  
   a.users.map(user => {
  
     if (user._id.equals(userid)){
      temp = user;
    }
  });
  let temp2 = a.users.filter(user => user._id.toString() !== userid.toString())
  temp2.unshift(temp)
  return temp2;
}

exports.accessChat = catchAsync(async (req, res, next) => {
    const { userId } = req.body;
    // console.log(req.user)
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length > 0) {

      let temp = getuser(isChat[0], req.user._id )

      let chats = isChat[0];

      chats.users = temp
      


      res.status(200).json({
          message: 'success',
          chat: chats
      });
    } else {
      let message =chatData = {
        users: [req.user._id, userId],
      };
  
      
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users"
        );
        res.status(200).json({
            message: 'success',
            chat: FullChat
        });
       
    }
  });


exports.fetchChats = catchAsync(async (req, res, next) => {
  
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic",
          });
          res.status(200).json({
            status: 'success',
            results
          });
        });
   
  });

exports.createGroupChat = catchAsync(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  
});



exports.renameGroup = catchAsync(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});




exports.removeFromGroup = catchAsync(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});



exports.addToGroup = catchAsync(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});
























// chat under order


exports.chatunderorder = catchAsync(async (req, res, next)=>{
  const { userId, orderId } = req.body;
  // console.log(req.user)
  if (!orderId) {
    console.log("orderId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({ _id: orderId})
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("orderId");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  
  if (isChat.length > 0) {

    let temp = getuser(isChat[0], req.user._id)

    let chats = isChat[0];

    chats.users = temp

    res.status(200).json({
      message: 'success',
      chat: chats
    });
  } else {
    var chatData = {
      users: [req.user._id, userId],
    };


    const createdChat = await Chat.create({
      _id: orderId,
      orderId: orderId,
      ...chatData
    })
    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    ).populate("orderId");
    res.status(200).json({
      message: 'success',
      chat: FullChat
    });
  }
})


exports.fetchChatsunderorder = catchAsync(async (req, res, next) => {

  Chat.findById(req.params.orderId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).send(results);
    });

});