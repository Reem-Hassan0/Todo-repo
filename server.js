const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const morgan=require('morgan');
const compression=require('compression');

const globalError=require('./middlewares/errMW');
const mountRoutes=require("./routes");

const connectToDB=require("./config/database");
const ApiError = require('./utils/ApiError');


dotenv.config({path:"config.env"});

const app=express();

//enable other domains to access app
app.use(cors());
app.options('*',cors());

//compress responses
app.use(compression());

const PORT=process.env.PORT ||8000;
const server =app.listen(PORT,()=>{
console.log(`App running on port ${PORT}`);
});

//connect db
connectToDB()

//middle wares
app.use(express.json());
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
    console.log(`Mode:${process.env.NODE_ENV}`)
};

//mount routes
mountRoutes(app);


app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
  });
  
app.use(globalError);

//Handle rejection outside express
process.on('unhandledRejection',(err)=>{
    console.error(`unhandeledRejection errors: ${err.name}| ${err.message}`);
    server.close(()=>{
        console.error('Shutting down...');
        process.exit(1);
    })
})