const express = require('express');
const cors = require('cors');
const {connectDB} = require('./db/connection');
const userAuthRoute = require('./route/userAuthRoute');
const bookRoute = require('./route/bookRoute');
const app = express();

const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:"*", // for postman testing all sources are allowed
    credentials:true
}))

app.use('/api',userAuthRoute,bookRoute);

connectDB(); // connecting to mongodb
const port = process.env.port || 5000;

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})