const User = require('../models/user.model');
const asyncErrorHandler = require('../Utils/asyncErrorHandler.js');
const customError = require('../Utils/customError.js');
const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const sendEmail = require('../Utils/email.js');
const createSendResponse = require('../Utils/sendResponse.js');
const CustomError = require('../Utils/customError.js');
const filterReqObj = (obj,...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(prop=>{
        if(allowedFields.includes(prop))
            newObj[prop]=obj[prop];
    })
    return newObj;
}

const getUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find({});
    if(!users){
        const err=new customError('user is not found!',404);
        return next(err);
    }
    res.status(200).json({
        status:'success',
        result:users.length,
        data:{
            users
        }
    });
});
const getUser = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if(!user){
        const err=new customError('user with that ID is not found!',404);
        return next(err);
    }
    res.status(200).json(user);
});
const createUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    if(!user){
        const err=new customError('user with that ID is not found!',404);
        return next(err);
    }
    res.status(200).json(user);
});
// update a user
const updateUser = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body)
    if(!user){
        const err=new customError('user created fail!',404);
        return next(err);
    }
   
    const updateUser = await User.findById(id);
    res.status(200).json(updateUser);
});
// delete an user
const deleteUser = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if(!user){
        const err=new customError('user with that ID is not found!',404);
        return next(err);
    }

    res.status(200).json({ message: "User deleted successfully" });
});

const updatePassword = asyncErrorHandler(async (req,res,next)=>{
    console.log(req.user._id);
    //GET CURRENT UsER DATA FROM DATABASE
    const user = await User.findById(req.user._id).select('+password');
    
    //CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
    if(!await user.comparePasswordInDb(req.body.currentPassword,user.password)){
        return next(new CustomError('The current pasword you provided is wrong',401));
    }
    //IF SUPPLIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH NEW VALUE
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    
    await user.save();
    console.log(req.user._id);
    //LOGIN USER & SEND JWT
    
    createSendResponse(user,200,res);
});
const updateMe =asyncErrorHandler(async  (req,res,next)=>{
    //1. CHECK IF REQUEST DATA CONTAIN PASSWORD | CONFIRM PASSWORD
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError('You cannot update your password using this endpoint',400))
    }
    //UPDATE USER DETAIL
    const filterObj = filterReqObj(req.body,'name','email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id,filterObj,{runValidators:true,new:true});;

    //createSendResponse(user,200,res);
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    });
})
const deleteMe = asyncErrorHandler(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:'success',
        data:null
    });
})

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updatePassword,
    updateMe,
    deleteMe
}