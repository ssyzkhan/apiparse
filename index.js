const express=require('express')
const cors = require('cors')
const compression = require('compression')
const app = express()
require('dotenv').config({path: './.env'});
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const sanitize = require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp = require('hpp')
const taskRoute = require('./routes/task.route.js')
const productRoute = require('./routes/product.route.js')
const userRoute = require('./routes/user.route.js')
const authRoute = require('./routes/auth.route.js')
// Using Node.js `require()`
const mongoose = require('mongoose');
const {authPage} = require('./middlewares.js');
const CustomError = require('./Utils/customError.js');
const globalErrorHandler = require('./controllers/error.controller.js');
// middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({limit:'10kb'}));
app.use(sanitize());
app.use(xss());
app.use(hpp({whitelist:['name','price']}));

app.use(express.urlencoded({extended:false}));

let limiter = rateLimit({
    limit:1000,
    windowMs:60*60*1000,
    message:'We have recieved too many requests from this IP. Please try after an hour.'
})
app.use('/api',limiter)

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
    process.exit(1);
});


app.get('/',(req,res)=>{
    res.send("Hello from Node API Server Helo there")
})

// routes
//app.use("/api/products",authPage(["teacher","admin"]), productRoute);
app.use("/api/tasks",taskRoute);
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/auths",authRoute);

app.all('*',(req,res,next)=>{
    //res.status(404).json({
    //    status:'fail',
    //    message:`Can't find ${req.originalUrl} on the server!`
    //});
    //const err = new Error(`Can't find ${req.originalUrl} on the server!`);
    //err.status = 'fail';
    //err.statusCode = 404;
    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`,404);
    next(err);
});

app.use(globalErrorHandler);

/*
app.post('/api/products',async (req,res)=>{
    try{
        const product = await Product.create(req.body);
        res.status(200).json(product);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

app.get('/api/products',async (req,res)=>{
    try{
        const products = await Product.find({});
        res.status(200).json(products);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

app.get('/api/product/:id',async (req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        res.status(200).json(product);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

// update a product
app.put('/api/product/:id',async (req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findByIdAndUpdate(id,req.body)
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        const updateProduct = await Product.findById(id);
        res.status(200).json(product);
    }catch (eroor){
        res.status(500).json({message:error.message});
    }
});

// delete a product
app.delete('/api/product/:id',async (req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        
        res.status(200).json({message:"Product deleted successfully"});
    }catch (eroor){
        res.status(500).json({message:error.message});
    }
});

*/

const uri = "mongodb+srv://1990029:fNtYzBoMjhgWA0WX@youtubevideocluster.sbjabot.mongodb.net/?retryWrites=true&w=majority&appName=YouTubeVideoCluster"

async function connect(){
    try{
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    }catch(error){
        console.error(error);
    }
}
connect()
const port = process.env.PORT || 3000;
const server = app.listen(port,()=>{
    console.log('Servere is sunning on port 3000')
})

process.on('unhandledRejection',(err)=>{
    console.log(err.name,err.message);
    console.log('unhandled rejection occured! Shutting down...');
    server.close(()=>{
        process.exit(1);
    });
});

