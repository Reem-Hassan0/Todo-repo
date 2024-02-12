const mongoose=require('mongoose');
const dotenv=require('dotenv');

const connectToDB=()=>{
    mongoose.connect(process.env.URL).then((conn)=>{
        if(conn)
        console.log(`Database connected :${conn.connection.host}`);
    });
};
module.exports=connectToDB;