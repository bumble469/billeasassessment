const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {createBook} = require('../controller/booksController');

router.post('/create-book',authenticate,createBook);
module.exports = router
