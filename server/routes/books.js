// server/routes/books.js - Updated for standard sqlite3
const express = require('express');
const router = express.Router();
const { dbOperations } = require('../database');

// API 1: GET /api/books - Retrieve all books
router.get('/', async (req, res) => {
  try {
    const books = await dbOperations.getAllBooks();
    res.json({
      success: true,
      data: books,
      total: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving books',
      error: error.message
    });
  }
});

// API 2: GET /api/books/:id - Retrieve a specific book
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await dbOperations.getBookById(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving book',
      error: error.message
    });
  }
});

// API 3: POST /api/books - Create a new book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, published_year, genre, description } = req.body;
    
    // Basic validation
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and author are required'
      });
    }
    
    const newBook = await dbOperations.createBook({
      title,
      author,
      isbn,
      published_year,
      genre,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({
        success: false,
        message: 'ISBN already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating book',
        error: error.message
      });
    }
  }
});

// API 4: PUT /api/books/:id - Update a book
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, published_year, genre, description } = req.body;
    
    // Basic validation
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and author are required'
      });
    }
    
    const updatedBook = await dbOperations.updateBook(id, {
      title,
      author,
      isbn,
      published_year,
      genre,
      description
    });
    
    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({
        success: false,
        message: 'ISBN already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating book',
        error: error.message
      });
    }
  }
});

// API 5: DELETE /api/books/:id - Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedBook = await dbOperations.deleteBook(id);
    
    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book deleted successfully',
      data: { deletedBook }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

module.exports = router;