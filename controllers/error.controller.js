const CustomError = require('../Utils/customError.js');

const castErrorHandler = (err)=>{
    const msg =    `Invalid value for ${err.path}: ${err.path}!`;
    return new CustomError(msg,400);
}
const duplicateKeyErrorHandler=(err)=>{
    const name = err.keyValue.name;
    const msg = `There is already a enity with name ${name}. Please use another name!`;
    return new CustomError(msg,400);
}
const validationErrorHandler=(err)=>{
    const errors = Object.values(err.errors).map(val=>val.message);
    const errorMessages = errors.join('. ');
    const msg = `Invalid input data:${errorMessages}`;

    return new CustomError(msg,400);
}
const handleExpiredJWT = (err)=>{
    return new CustomError('JWT has expired. Please login again!',401);
}
const handleJWTError = (err)=>{
    return new CustomError('Invalid token. Please login again!',401);
}
const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}
const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }else{
        res.status(500).json({
            status:'error',
            message:'Something went wrong! Please try again later.'
        });
    }
}


module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';


    if (process.env.NODE_ENV === 'development') {
        console.log('Hello development');
        //res.status(error.statusCode).json({
        //    status: error.statusCode,
        //    message: error.message,
        //});
        devErrors(res.error);
    } else if (process.env.NODE_ENV === 'production') {
        console.log('Hello production');
       // res.status(error.statusCode).json({
        //    status: error.statusCode,
        //    message: error.message,
        //});
        //let err = {...err};
        if(error.name === 'CastError'){
            error=castErrorHandler(error);
            console.log('if statement called!');
        }
        if(error.code === 11000) error=duplicateKeyErrorHandler(error);
        if(error.name === 'ValidationError') error = validationErrorHandler(error);
        if(error.name === 'TokenExpiredError') error=handleExpiredJWT(error);
        if(error.name === 'JsonWebTokenError') error=handleJWTError(error);
        prodErrors(res, error);
    }else{
        console.log('Hello other');
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }

}
