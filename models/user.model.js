const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// name, eamil, password, confirmPassword, photo
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name.'],
        unique:true,
        maxlength:[100,'The name must not have more than 100 characters'],
        minlength:[4,"The name must have at least 4 characters"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,'Please enter an email.'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please enter a valid email.']
    },
    photo:String,
    role:{
        type:String,
        enum: ['user','admin','test1','test2'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please enter a password.'],
        minlength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'Please confirm your password.'],
        validate:{
            // this validator will only work for create() and save()
            validator:function(val){
                return val == this.password;
            },
            message:'Password & Confirm Password does not match!'
        }
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpire:Date,

});
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    // encrypt the password before saving it
    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next();
})
userSchema.pre(/^find/,function(next){
    //THIS KEYWORD IN THE FUNCTION WILL POINT TO CURRECT QUERY
    this.find({active:{$ne:false}});
    next();
})
userSchema.methods.comparePasswordInDb = async function(pswd,pswdDB){
    return await bcrypt.compare(pswd,pswdDB);
}

userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        console.log(pswdChangedTimestamp,JWTTimestamp);

        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}
userSchema.methods.createResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpire = Date.now() + 10*60*1000;
    console.log(resetToken,this.passwordResetToken);
    return resetToken;
}

const User = mongoose.model("User",userSchema);
module.exports = User;