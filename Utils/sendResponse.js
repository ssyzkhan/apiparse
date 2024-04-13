const jwt = require('jsonwebtoken');
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
module.exports=createSendResponse;