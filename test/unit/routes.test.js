const request = require('supertest');
const express = require('express');

// Mock the database module
jest.mock('../../server/database', () => ({
  dbOperations: {
    getAllBooks: jest.fn(),
    getBookById: jest.fn(),
    createBook: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn()
  }
}));

const { dbOperations } = require('../../server/database');
const bookRoutes = require('../../server/routes/books');

describe('Book Routes Unit Tests (Mocked Database)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/books', bookRoutes);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/books', () => {
    test('should return all books successfully', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Test Book 1',
          author: 'Author 1',
          isbn: '978-0-123456-78-9',
          published_year: 2024,
          genre: 'Fiction',
          description: 'A test book'
        },
        {
          id: 2,
          title: 'Test Book 2',
          author: 'Author 2',
          isbn: '978-0-123456-78-8',
          published_year: 2023,
          genre: 'Non-Fiction',
          description: 'Another test book'
        }
      ];

      dbOperations.getAllBooks.mockResolvedValue(mockBooks);

      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockBooks,
        total: 2
      });

      expect(dbOperations.getAllBooks).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when no books exist', async () => {
      dbOperations.getAllBooks.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        total: 0
      });
    });

    test('should handle database errors', async () => {
      dbOperations.getAllBooks.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/books')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error retrieving books');
    });
  });

  describe('GET /api/books/:id', () => {
    test('should return book by ID successfully', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Fiction',
        description: 'A test book'
      };

      dbOperations.getBookById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockBook
      });

      expect(dbOperations.getBookById).toHaveBeenCalledWith('1');
    });

    test('should return 404 when book not found', async () => {
      dbOperations.getBookById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/books/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Book not found'
      });
    });

    test('should handle database errors', async () => {
      dbOperations.getBookById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/books/1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error retrieving book');
    });
  });

  describe('POST /api/books', () => {
    test('should create book successfully', async () => {
      const newBookData = {
        title: 'New Book',
        author: 'New Author',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Fiction',
        description: 'A new book'
      };

      const createdBook = {
        id: 1,
        ...newBookData,
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 10:00:00'
      };

      dbOperations.createBook.mockResolvedValue(createdBook);

      const response = await request(app)
        .post('/api/books')
        .send(newBookData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Book created successfully',
        data: createdBook
      });

      expect(dbOperations.createBook).toHaveBeenCalledWith(newBookData);
    });

    test('should return 400 when title is missing', async () => {
      const invalidBookData = {
        author: 'Author without title'
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBookData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Title and author are required'
      });

      expect(dbOperations.createBook).not.toHaveBeenCalled();
    });

    test('should return 400 when author is missing', async () => {
      const invalidBookData = {
        title: 'Title without author'
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBookData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Title and author are required'
      });
    });

    test('should handle duplicate ISBN error', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-123456-78-9'
      };

      dbOperations.createBook.mockRejectedValue(
        new Error('UNIQUE constraint failed: books.isbn')
      );

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'ISBN already exists'
      });
    });
  });

  describe('PUT /api/books/:id', () => {
    test('should update book successfully', async () => {
      const updateData = {
        title: 'Updated Book',
        author: 'Updated Author',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Updated Fiction',
        description: 'Updated description'
      };

      const updatedBook = {
        id: 1,
        ...updateData,
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 11:00:00'
      };

      dbOperations.updateBook.mockResolvedValue(updatedBook);

      const response = await request(app)
        .put('/api/books/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Book updated successfully',
        data: updatedBook
      });

      expect(dbOperations.updateBook).toHaveBeenCalledWith('1', updateData);
    });

    test('should return 404 when updating non-existent book', async () => {
      const updateData = {
        title: 'Updated Book',
        author: 'Updated Author'
      };

      dbOperations.updateBook.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/books/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Book not found'
      });
    });

    test('should return 400 when title is missing', async () => {
      const invalidUpdateData = {
        author: 'Author without title'
      };

      const response = await request(app)
        .put('/api/books/1')
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Title and author are required'
      });
    });
  });

  describe('DELETE /api/books/:id', () => {
    test('should delete book successfully', async () => {
      const deletedBook = {
        id: 1,
        title: 'Book to Delete',
        author: 'Delete Author',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Fiction',
        description: 'A book to be deleted'
      };

      dbOperations.deleteBook.mockResolvedValue(deletedBook);

      const response = await request(app)
        .delete('/api/books/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Book deleted successfully',
        data: { deletedBook }
      });

      expect(dbOperations.deleteBook).toHaveBeenCalledWith('1');
    });

    test('should return 404 when deleting non-existent book', async () => {
      dbOperations.deleteBook.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/books/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Book not found'
      });
    });

    test('should handle database errors', async () => {
      dbOperations.deleteBook.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/books/1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting book');
    });
  });
});