const bcrypt = require('bcrypt');
const users = require('../models/users');
const {createAccessToken,createRefreshToken,verifyRefreshToken} = require('../services/jwtservice');

const signupUser = async(req,res) => {
    const {fullname, email, password} = req.body;
    try{    
        if(!fullname || !email || !password){
            return res.status(400).json({message:"all fields required!"});
        }

        const existinguser = await users.findOne({email});
        if(existinguser){
            return res.status(409).json({message:"User exists!"});
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new users({fullname,email,password:hashedPassword});

        await newUser.save();

        res.status(200).json({message:"User signup success!"});
    }catch(err){
        res.status(500).json({message:"Error signing up!"});
        console.log("Could not signup!", err)
    }
}

const loginUser = async(req, res) => {
    const {email,password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message:"All fields required!"});
        }

        const getUser = await users.findOne({email});

        if(!getUser){
            return res.status(404).json({message:"No such user!"});
        }

        const isCorrectPassword = bcrypt.compare(password, getUser.password);
        if(!isCorrectPassword){
            return res.status(401).json({message:"Incorrect password!"});
        }

        const payload = { id: getUser._id, email: getUser.email };

        const accessToken = createAccessToken(payload)
        const refreshToken = createRefreshToken(payload);

        res.cookie('accessToken',accessToken,{
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            secure: false,
            sameSite: 'lax'
        });

        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'lax'
        });

        return res.status(200).json({message:"Login Success!"});
    }
    catch(err){
        res.status(500).json({message:"Error during login"});
        console.log("Could not login", err);
    }
}

const refreshAccessToken = async(req,res) => {
    const {refreshToken} = req.cookies;
    try{
        if(!refreshToken){
            return res.status(400).json({message:"Refresh token not found"});
        }
        const decoded = await verifyRefreshToken(refreshToken);

        if(!decoded){
            return res.status(401).json({message:"Not authorized invalid refresh token"});
        }

        const accessToken = createAccessToken({ id: decoded.id, email: decoded.email });

        res.cookie('accessToken',accessToken,{
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            secure: false,     
            sameSite: 'lax',
        });
        res.status(200).json({message:"Access token refreshed!",accessToken})
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Error refreshing token!"});
    }
}

module.exports = {
    signupUser,
    loginUser,
    refreshAccessToken
}