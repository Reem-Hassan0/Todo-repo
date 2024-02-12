const asyncHandler=require('express-async-handler');
const ApiError=require('../utils/ApiError');

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document=await Model.findById(req.params.id)

    if (!document) {
      return next(new ApiError(`No document for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll=(Model)=>asyncHandler(async(req,res)=>{
    const docs=await Model.find();
    res.status(200).json(
        {data:docs}
    );
});

exports.updateOne=(Model)=>asyncHandler(async(req,res,next)=>{
  
    const doc=await Model.findByIdAndUpdate(req.params.id,req.body,
        {new:true});

    if(!doc)
    return next(new ApiError(`No doc found with this is ${req.params.id}`),404);

    doc.save();
    res.status(200).json({data:doc});
});

exports.createOne=(Model)=>asyncHandler(async(req,res)=>{
    const doc=await Model.create(req.body);
    res.status(200).json({data:doc});
});

exports.deleteOne=(Model)=>asyncHandler(async(req,res,next)=>{
    const doc=await Model.findByIdAndDelete(req.params.id,
        req.body,{new:true});

    if(!doc)
    return next(new ApiError(`No doc found with this is ${req.params.id}`),404);

    res.status(200).json({message:"one doc deleted"});
});
