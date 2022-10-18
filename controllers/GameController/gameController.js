const Game = require('./../../models/GameModel/gameModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment');
const { cloudinary } = require('./../../middleware/cloudnary');




exports.createGames = catchAsync(async (req, res, next) => {
    const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const game = await Game.create({...req.body,
        image: result.secure_url,
    });
    res.status(201).json({
        status: 'success',
        data: game
    })
})


exports.getAllGames = catchAsync(async (req, res, next) => {
    let {pageNo, limit} = req.query;
    let games;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    if(pageNo === null && limit ===null){
        games = await Game.find().sort({createdAt: -1})        
    }else{
        games = await Game.find().sort({createdAt: -1})
        .skip(startIndex).limit(parseInt(limit));
    } 
    res.status(200).json({
        status: 'success',
        length: games.length,
        data: games
    });
})

exports.getSingleGame = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const game = await Game.findById(id);
    res.status(200).json({
        status: 'success',
        data: game
    });
})

exports.updateGame = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    console.log(req.files)
    if(req.files === null){
        const game = await Game.findOneAndUpdate({_id: id}, {
            ...req.body,
            
        }, {new: true});
        res.status(200).json({
            status: 'success',
            data: game
        });
    }else{
        const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const game = await Game.findOneAndUpdate({_id: id}, {
        ...req.body,
        image: result.secure_url,
    }, {new: true});
    res.status(200).json({
        status: 'success',
        data: game
    });
    }

    
})


exports.deleteGame = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const game = await Game.findOneAndDelete({_id: gameId});
    res.status(200).json({
        status: 'success',
        data: game
    });
})
