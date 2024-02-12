const mongoose=require('mongoose');

const TaskSchema=new mongoose.Schema({
    title:{
      type:String,
      required:[true,'Write a title for your list']
    },
    body:{
        type:String,
        maxLength:[600,'Too long list body']
    },
    user:[{
      type:mongoose.Types.ObjectId,
      ref:'User'
    }]
},{timestamps:true});

module.exports=mongoose.model('List',TaskSchema);