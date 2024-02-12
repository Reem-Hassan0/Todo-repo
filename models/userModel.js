const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'User name required'],
        trim:true,
    },
    email:{
        type:String,
        required:[true,'Email required'],
        lowercase:true,
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Password required"],
        minlength:[5,'Too short password']
    },

    passResetCode:String,
    passResetExpires:Date,
    passResetVerified:Boolean,
    passChangedAt:Date,

    active:{
        type:Boolean,
        default:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }

},{timestamps:true});

userSchema.pre('save',async function(next){
    if (!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,12);
     next();
});
module.exports=mongoose.model('User',userSchema);
