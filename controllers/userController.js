const asyncHandler=require('express-async-handler');
const bcrypt=require('bcryptjs');
const createToken=require('../utils/createToken')
const User=require("../models/userModel");
const factory=require('./handlersFactory');
const ApiError=require("../utils/ApiError");

exports.createUser=factory.createOne(User);

exports.getUser=factory.getOne(User);

exports.updateUser = asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      },
      {
        new: true,
      }
    );
  
    if (!document) {
      return next(new ApiError(`No document for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getUsers=factory.getAll(User);

exports.deleteUser=factory.deleteOne(User);

exports.changePassword=asyncHandler(async(req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.params.id,{
        password:await bcrypt.hash(req.body.password,12),
        passChangedAt:Date.now()
    },{new:true});
    if(!user)
    return next(new ApiError(`No user found with this id ${req.params.id}`,404));

res.status(200).json({data:user});

});

exports.getLoggedUserDate=asyncHandler(async(req,res,next)=>{
    req.params.id=req.user._id;
    next();
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      { new: true }
    );
  
    res.status(200).json({ data: updatedUser });
  });

  exports.deactivate = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
  
    res.status(204).json({ status: 'Success' });
  });

  exports.updateLoggedUserPassword=asyncHandler(async(req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.user._id,{
        password:await bcrypt.hash(req.body.password,12),
        passChangedAt:Date.now()
    },
    {new:true});
const token=createToken(user._id);

res.status(200).json({data:user,token});

});

