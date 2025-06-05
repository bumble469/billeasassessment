const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); //middleware to ensure that token is there
const {createBook,getAllBooks,getBookById,reviewBook,updateReview,deleteReview,searchBooks} = require('../controller/booksController');

router.post('/books',authenticate,createBook);
router.get('/books',getAllBooks);
router.get('/books/:id',getBookById)
router.post('/books/:id/reviews',authenticate,reviewBook);
router.put('/reviews/:id',authenticate,updateReview)
router.delete('/reviews/:id',authenticate,deleteReview)
router.get('/search',searchBooks);

module.exports = router
