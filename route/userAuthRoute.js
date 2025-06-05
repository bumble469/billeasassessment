const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {signupUser,loginUser,refreshAccessToken} = require('../controller/userAuthController');

router.post('/signup',signupUser);

router.post('/login', loginUser);

router.post('/refresh-access-token',authenticate,refreshAccessToken);

module.exports = router;