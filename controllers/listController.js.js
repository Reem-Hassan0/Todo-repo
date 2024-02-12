const asyncHandler=require('express-async-handler');

const List=require("../models/listModel");
const factory=require('./handlersFactory');
const ApiError=require('../utils/ApiError');

exports.createList=factory.createOne(List);

exports.getList=asyncHandler(async(req,res)=>{
    const docs=await List.find().populate({'path':'user',select:'name-_id'});
    res.status(200).json(
        {data:docs}
    );
});

exports.updateList=factory.updateOne(List);

exports.getLists=
asyncHandler(async (req, res, next) => {
    const document=await List.find().populate({'path':'user',select:'name-_id'});
    res.status(200).json({ data: document });
});

exports.deleteList=factory.deleteOne(List);
