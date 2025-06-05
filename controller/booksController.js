const books = require('../models/books');
const reviews = require('../models/reviews');
const mongoose = require('mongoose');

const createBook = async (req, res) => {
    const { title, author, genre, description } = req.body;
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    if (!title || !author || !genre) {
        return res.status(400).json({ message: 'Title, author, and genre are required' });
    }

    try {
        const newBook = new books({
            title,
            author,
            genre,
            description,
            createdBy: userId
        });

        await newBook.save();

        res.status(201).json({ message: 'Book created successfully', book: newBook });
    } catch (err) {
        console.error('Error creating book:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllBooks = async(req,res) => {
    try{
        const {author, genre} = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const allBooks = await books.aggregate([
            {
                $match: {
                    ...(genre && { genre: { $regex: genre, $options: 'i' } }), //optional filtering
                    ...(author && { author: { $regex: author, $options: 'i' } })
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            {
                $unwind: '$creator'
            },
            {
                $project: {
                    title: 1,
                    author: 1,
                    genre: 1,
                    description: 1,
                    creatorName: '$creator.fullname',
                    creatorEmail: '$creator.email'
                }
            },
            { $skip: skip }, // used for pagination
            { $limit: limit } // used for pagination
        ]);


        const totalBooks = await books.countDocuments(); // counting filtered books

        res.status(200).json({
            page,
            totalPages: Math.ceil(totalBooks / limit),
            totalBooks,
            books: allBooks
        });

    }catch(err){
        res.status(500).json({message:"error getting books"})
    }
}

const getBookById = async(req,res) => {
    try{
        const bookId = req.params.id;
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page-1) * limit;

        if(!bookId){
            return res.status(400).json({message:"Id is required"});
        }

        const getBook = await books.findById(bookId);
        if(!getBook){
            return res.status(404).json({message:"Book not found!"});
        }
        
        const totalReviews = await reviews.countDocuments({book:bookId});
        const getReview = await reviews.find({book:bookId}).skip(skip).limit(limit);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);
        const getRatings = await reviews.aggregate([
            {$match:{book:bookObjectId}},
            {$group:{_id:null,avgRating:{$avg:"$rating"}}}
        ]);

        res.status(200).json({
            book: getBook,
            averageRating: getRatings,
            currentPage: page,
            totalPages: Math.ceil(totalReviews / limit),
            reviews: getReview
        })

    }catch(err){
        console.log(err)
        res.status(500).json({message:"error getting books"})
    }
}

const reviewBook = async(req,res) => {
    try{
        const userId = req.user && req.user.id;
        const bookId = req.params.id;
        const {rating,comment} = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }

        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required in URL" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const getBooks = await books.findById(bookId);
        if(!getBooks){
            return res.status(404).json({message:"No such books found"});
        }

        const existingReview = await reviews.findOne({book:bookId,user:userId});
        if(existingReview){
            return res.status(400).json({message:"you have already reviewed this book"});
        }

        const newReview = new reviews({
            book:bookId,
            user:userId,
            rating,
            comment
        });

        await newReview.save();

        res.status(201).json({ message: "Review added successfully", review: newReview });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"error reviewing book"})
    }
}

const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user && req.user.id;
        const { rating, comment } = req.body;

        if (!reviewId || !userId) {
            return res.status(400).json({ message: "Could not find userid or reviewid" });
        }

        const getReview = await reviews.findOne({ _id: reviewId, user: userId });
        if (!getReview) {
            return res.status(404).json({ message: "Your review does not exist or you are not authorized" });
        }

        const updatedReview = await reviews.findOneAndUpdate(
            { _id: reviewId, user: userId },
            { rating, comment },
            { new: true }
        );

        res.status(200).json({ message: "Review updated", review: updatedReview });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating review" });
    }
};


const deleteReview = async(req,res) => {
    const reviewId = req.params.id;
    const userId = req.user && req.user.id;

    try{
        if(!reviewId || !userId){
            return res.status(400).json({message:"could not find reviewid or userid in request"})
        }
        
        const getReview = await reviews.findOneAndDelete({ _id: reviewId, user: userId });

        if (!getReview) {
            return res.status(404).json({ message: "Review not found or not authorized to delete." });
        }

        return res.status(200).json({message:"Your review has been deleted"})
    }catch(err){
        console.log(err);
        res.status(500).json({message:"error deleting review!"})
    }
}

const searchBooks = async (req, res) => {
  try {
    const title = req.query.title || "";
    const author = req.query.author || "";
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const filters = [];
    if (title) filters.push({ title: { $regex: new RegExp(title, "i") } });
    if (author) filters.push({ author: { $regex: new RegExp(author, "i") } });

    const queryFilter = filters.length > 0 ? { $and: filters } : {};

    const booksList = await books.find(queryFilter).skip(skip).limit(limit);
    const total = await books.countDocuments(queryFilter);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total,
      books: booksList,
    });
  } catch (err) {
    res.status(500).json({ message: "Error searching books" });
  }
};



module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    reviewBook,
    updateReview,
    deleteReview,
    searchBooks
};
