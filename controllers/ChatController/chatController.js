const Chat = require("../../models/ChatModel/chatModel");
const User = require("../../models/UserModel/userModel");
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');

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
  let { isGroupChat} = req.query;

  if (!isGroupChat){
    isGroupChat = false;
  }

  Chat.find({ users: { $elemMatch: { $eq: req.user._id } }, isGroupChat: isGroupChat })
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
    return res.status(400).json({ message: "Please Fill all the feilds" });
  }

  var users = req.body.users

  if (users.length < 2) {
    return res
      .status(400)
      .json("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users")
      .populate("groupAdmin");

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
    .populate("users", )
    .populate("groupAdmin");

  if (!updatedChat) {
    res.status(404);
    throw new AppError("Chat Not Found", 404);
  } else {
    res.status(200).json(updatedChat);
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
    throw new AppError("Chat Not Found", 400);
  } else {
    res.status(200).json(removed);
  }
});

exports.addToGroup = catchAsync(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $addToSet: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!added) {
    res.status(404);
    throw new AppError("Chat Not Found");
  } else {
    res.status(200).json(added);
  }
});


















