const books = require('../models/books');

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

module.exports = {
    createBook
};
