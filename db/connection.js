const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connection Success!');
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}
// connectDB()
module.exports = { connectDB };