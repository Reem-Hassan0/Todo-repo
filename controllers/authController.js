const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const asyncHandler=require('express-async-handler');
const sendEmail=require('../utils/sendEmail');
const ApiError=require('../utils/ApiError');
const createToken=require('../utils/createToken');
const User=require('../models/userModel');

exports.signup=asyncHandler(async(req,res,next)=>{
    const user=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        role:req.body.role
    });

    const token=createToken(user._id);
    res.status(200).json({
        status:'success',
        data:user,
        token
    });

});

exports.login=asyncHandler(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});
    if(!user||! (await bcrypt.compare(req.body.password,user.password)))
    return next(new ApiError(`Incorrect email or password`));

    const token=createToken(user._id);
    delete user._doc.password;
    res.status(200).json({
        status:'success',
        data:user,
        token
    });

});

exports.protect=asyncHandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))
    token=req.headers.authorization.split(' ')[1];

    if(!token)
    return next(new ApiError(`You are not logged in, please log in to access this route`,401));

    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
    const currentUser=await User.findById(decoded.userId);
    if(!currentUser)
    return next(new ApiError(`The user belongs to this token is no longer available`,401));

    if(currentUser.passChangedAt){
        const passchangedTime=parseInt(currentUser.passChangedAt/1000,10);
        if(passchangedTime>decoded.iat)
        return next(new ApiError('User recently changed his password,please log in again',401));
    }
   req.user=currentUser;
   next();
});

exports.allowedTo=(...roles)=>
asyncHandler(async(req,res,next)=>{
    if(!roles.includes(req.user.role))
    return next(new ApiError('You are not allowed to access this route'),403);
next();
});

exports.forgetPassword=asyncHandler(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});
    if(!user)
    return next(new ApiError(`No user found with this email ${req.body.email}`));

    const resetCode=Math.floor(100000+Math.random()*900000).toString();
    const hashedResetCode= crypto.createHash('sha256').update(resetCode).digest('hex');
    user.passResetCode=hashedResetCode;
    user.passResetExpires=Date.now()+10*60*1000;
    user.passResetVerified=false;
    await user.save();

    const message=`Hi ${user.name},\n 
    we received a request to reset your password on your Organizify account,\n Here is your reset code : ${resetCode}. It's valid for 10 minutes.\n
    Thanks for helping us keep your account secure\n`;
    try{
        await sendEmail({
            email:user.email,
            subject:'Organzify password reset code',
            message,
        });
    }catch(err){
        user.passResetCode=undefined;
        user.passResetExpires=undefined;
        user.passResetVerified=undefined;

        await user.save();
        return next(new ApiError('There is an error sending the email',500));
}
res.status(200).json({
    status:'success',
    message:'Reset code send'
});
});

exports.verifyPassResetCode=asyncHandler(async(req,res,next)=>{
    const hashedResetCode=crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user=await User.findOne({
        passResetCode:hashedResetCode,
        passResetExpires:{$gt :Date.now()}
    });
    if(!user)
    return next(new ApiError('Reset code is invalid or expired'));

    user.passResetVerified=true;

await user.save();
res.status(200).json({satus:'success'});
});

exports.resetPassword=asyncHandler(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});
    if(!user)
    return next(new ApiError(`No user found with this email ${req.body.email}`,404));

    if(!user.passResetVerified)
    return next(new ApiError('Reset code not verified',400));

    user.password=req.body.newPassword;
    user.passResetCode=undefined;
    user.passResetExpires=undefined;
    user.passResetVerified=undefined;

    await user.save();

    const token=createToken(user._id);
    res.status(200).json({token});
});


