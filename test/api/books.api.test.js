// tests/api/books.api.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

// We need to create an instance of the app rather than importing it directly
// Import the routes instead
const bookRoutes = require('../../server/routes/books');

// Create a test app for testing
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/books', bookRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Book Management API is running'
    });
  });

  // Frontend route
  app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.status(200).send('<html><body><h1>Book Management App</h1></body></html>');
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  });

  return app;
}

describe('Books API Endpoints', () => {
  let testBookId;
  let app;
  const testDbPath = path.join(__dirname, '../../server/books_test.db');

  beforeAll(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    // Create test app
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up test database after tests
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('GET /api/books', () => {
    test('should return all books with success status', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    test('should return books with correct structure', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      if (response.body.data.length > 0) {
        const book = response.body.data[0];
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('author');
        expect(book).toHaveProperty('created_at');
        expect(book).toHaveProperty('updated_at');
      }
    });
  });

  describe('POST /api/books', () => {
    test('should create a new book with valid data', async () => {
      const newBook = {
        title: 'Test Book API',
        author: 'Test Author API',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Test Genre',
        description: 'A test book for API testing'
      };

      const response = await request(app)
        .post('/api/books')
        .send(newBook)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Book created successfully');
      expect(response.body).toHaveProperty('data');
      
      const createdBook = response.body.data;
      expect(createdBook).toHaveProperty('id');
      expect(createdBook.title).toBe(newBook.title);
      expect(createdBook.author).toBe(newBook.author);
      expect(createdBook.isbn).toBe(newBook.isbn);
      expect(createdBook.published_year).toBe(newBook.published_year);
      expect(createdBook.genre).toBe(newBook.genre);
      expect(createdBook.description).toBe(newBook.description);

      // Store the ID for later tests
      testBookId = createdBook.id;
    });

    test('should create a book with minimal required data', async () => {
      const minimalBook = {
        title: 'Minimal Test Book',
        author: 'Minimal Author'
      };

      const response = await request(app)
        .post('/api/books')
        .send(minimalBook)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(minimalBook.title);
      expect(response.body.data.author).toBe(minimalBook.author);
    });

    test('should return 400 when title is missing', async () => {
      const invalidBook = {
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBook)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Title and author are required');
    });

    test('should return 400 when author is missing', async () => {
      const invalidBook = {
        title: 'Test Title'
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBook)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Title and author are required');
    });

    test('should return 400 when both title and author are missing', async () => {
      const invalidBook = {
        isbn: '978-0-123456-78-0'
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBook)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Title and author are required');
    });

    test('should handle duplicate ISBN', async () => {
      const bookWithDuplicateISBN = {
        title: 'Another Test Book',
        author: 'Another Author',
        isbn: '978-0-123456-78-9' // Same ISBN as first test book
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookWithDuplicateISBN)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('ISBN already exists');
    });
  });

  describe('GET /api/books/:id', () => {
    test('should return a specific book by ID', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      const book = response.body.data;
      expect(book.id).toBe(testBookId);
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
    });

    test('should return 404 for non-existent book ID', async () => {
      const nonExistentId = 99999;
      
      const response = await request(app)
        .get(`/api/books/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Book not found');
    });    test('should handle invalid book ID format', async () => {
      const response = await request(app)
        .get('/api/books/invalid-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/books/:id', () => {
    test('should update an existing book', async () => {
      const updatedData = {
        title: 'Updated Test Book API',
        author: 'Updated Test Author API',
        isbn: '978-0-123456-78-9',
        published_year: 2025,
        genre: 'Updated Test Genre',
        description: 'An updated test book for API testing'
      };

      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Book updated successfully');
      expect(response.body).toHaveProperty('data');
      
      const updatedBook = response.body.data;
      expect(updatedBook.id).toBe(testBookId);
      expect(updatedBook.title).toBe(updatedData.title);
      expect(updatedBook.author).toBe(updatedData.author);
      expect(updatedBook.published_year).toBe(updatedData.published_year);
      expect(updatedBook.genre).toBe(updatedData.genre);
      expect(updatedBook.description).toBe(updatedData.description);
    });

    test('should update book with partial data', async () => {
      const partialUpdate = {
        title: 'Partially Updated Title',
        author: 'Updated Test Author API' // Keep author as required
      };

      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(partialUpdate.title);
      expect(response.body.data.author).toBe(partialUpdate.author);
    });

    test('should return 404 when updating non-existent book', async () => {
      const nonExistentId = 99999;
      const updateData = {
        title: 'Non-existent Book',
        author: 'Non-existent Author'
      };

      const response = await request(app)
        .put(`/api/books/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Book not found');
    });

    test('should return 400 when required fields are missing in update', async () => {
      const invalidUpdate = {
        isbn: '978-0-123456-78-1'
        // Missing title and author
      };

      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Title and author are required');
    });
  });

  describe('DELETE /api/books/:id', () => {
    test('should return 404 when deleting non-existent book', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .delete(`/api/books/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Book not found');
    });

    test('should delete an existing book', async () => {
      const response = await request(app)
        .delete(`/api/books/${testBookId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Book deleted successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('deletedBook');
      
      const deletedBook = response.body.data.deletedBook;
      expect(deletedBook.id).toBe(testBookId);
    });

    test('should confirm book is actually deleted', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Book not found');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for invalid endpoints', async () => {
      const response = await request(app)
        .get('/api/invalid-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });

    test('should handle malformed JSON in POST request', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    test('should handle malformed JSON in PUT request', async () => {
      // First create a book to update
      const newBook = {
        title: 'Book for JSON Test',
        author: 'JSON Test Author'
      };

      const createResponse = await request(app)
        .post('/api/books')
        .send(newBook);

      const bookId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('Data Validation', () => {
    test('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/books')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title and author are required');
    });

    test('should handle null values in request', async () => {
      const bookWithNulls = {
        title: 'Test Book with Nulls',
        author: 'Test Author',
        isbn: null,
        published_year: null,
        genre: null,
        description: null
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookWithNulls)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(bookWithNulls.title);
      expect(response.body.data.author).toBe(bookWithNulls.author);
    });

    test('should handle very long strings', async () => {
      const longString = 'A'.repeat(1000);
      const bookWithLongStrings = {
        title: longString,
        author: longString,
        description: longString
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookWithLongStrings);

      // Should either succeed or handle gracefully
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('Health Check', () => {
    test('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('message', 'Book Management API is running');
    });
  });

  describe('Frontend Serving', () => {
    test('should serve frontend at root path', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/html/);
    });
  });
});