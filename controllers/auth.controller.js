const User = require('../models/user.model');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/customError');
const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const sendEmail = require('../Utils/email.js');
const signToken = id =>{
    return jwt.sign({id},'fieldruan',{
        expiresIn:1000000
    })
}
const createSendResponse = (user,statusCode,res)=>{
    console.log('create send response');
    const token = signToken(user._id);
    const options = {
        maxAge:10000000,
        httpOnly:true
    }
    if(process.env.NODE_ENV==='production') 
        options.secure=true;
    res.cookie('jwt',token,options);
    user.password=undefined
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    });
}
exports.signup = asyncErrorHandler(async (req,res,next)=>{
    //const newUser = await User.create(req.body);
    const newUser = await User.create(req.body);
    if(!newUser){
        const err=new customError('user with that ID is not found!',404);
        return next(err);
    }
    //res.status(200).json(newUser);
    //const token = signToken(newUser._id);

    //res.status(201).json({
    //    status:'success',
    //    token,
     //   data:{
     //       user:newUser
     //   }
    //});
    createSendResponse(newUser,201,res);
});
exports.login = asyncErrorHandler(async (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;

    // const {email,password} = req.body;
    if(!email || !password){
        const error = new CustomError('Please provide email ID & Password for login in!',400);
        return next(error);
    }
    // Check if email & password is present in request body
    const user = await User.findOne({email}).select('+password');
    // const isMatch = await user.comparePasswordInDb(password,user.password);

    // Check if the user exists & password matches
    if(!user || !await user.comparePasswordInDb(password,user.password)){
        const error = new CustomError('Incorrect email or password',400);
        return next(error);
    }

    createSendResponse(user,201,res);
});

exports.protect = asyncErrorHandler(async (req,res,next)=>{
    // 1. Read the token & check if it exist
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1]
    }
    if(!token){
        next(new CustomError('You are not logged in!',401))
    }
    // 2. validate the token
    const decodedToken = await util.promisify(jwt.verify)(token,'fieldruan');

    // 3. If the user exists
    const user = await User.findById(decodedToken.id);

    if(!user){
        const error = new CustomError('The user with given token does not exist',401);
        next(error);
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    // 4. If the user changed password after the token was isused
    if(isPasswordChanged){
        const error = new CustomError('The password has been changed recently. Please login again',401);
        return next(error);
    };
    // 5. Allow user to access the route
    req.user = user;
    next();
});
exports.restrict = (role)=>{
    return (req,res,next)=>{
        if (req.user.role != role){
            const error = new CustomError('You do not have permisseion to perform this action',403);
            next(error)
        }
        next();
    }
};
exports.restrict = (...role)=>{
    return (req,res,next)=>{
        if (!role.includes(req.user.role)){
            const error = new CustomError('You do not have permisseion to perform this action',403);
            next(error)
        }
        next();
    }
};
exports.forgotPassword = asyncErrorHandler(async (req,res,next)=>{
    // 1. GET USER BASED EMAIL ON POST EMAIL
    const user = await User.findOne({email:req.body.email});
    console.log(user.email);
    if(!user){
        const error = new CustomError('We do not find the user with the given email',404);
        return  next(error);
    }

    // 2. GENERATE A RANDOM RESET TOKEN
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave:false});
    // 3. SEND THE TOKEN BACK TO THE USER EMAIL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auths/resetPassword/${resetToken}`;
    const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes`;
    
    try{
        await sendEmail({
        email:user.email,
        subject: 'Password change request received',
        message:message
        });
        res.status(200).json({
            status:'success',
            message:'password reset link send to the user email'
        });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpire = undefined;
        user.save({validateBeforeSave:false});

        return next(new CustomError('There was an error sending password reset email. Please try again later',500));
    }
    
});

exports.resetPassword = asyncErrorHandler(async (req,res,next)=>{
    
    // 1. IF THE USER EXISTS WITH THE GIVEN TOKEN & TOKEN HAS NOT EXPIRED
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken:token,passwordResetTokenExpire:{$gt:Date.now()}});

    if(!user){
        const error = new CustomError('Token is invalid or has expired!',400);
        next(error);
    }

    // 2. RESTING THE USER PASSWORD
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken=undefined;
    user.passwordResetTokenExpire=undefined;
    user.passwordChangedAt=Date.now();
    user.save();

    // 3. LOGIN THE USER
    const loginToken = signToken(user._id);
    res.status(200).json({
        status:'success',
        token:loginToken
    })
});

exports.updatePassword = asyncErrorHandler(async (req,res,next)=>{
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
    createSendResponse(user,201,res);
});