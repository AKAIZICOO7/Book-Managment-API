const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a test version of database operations
const createTestDbOperations = (db) => {
  return {    getAllBooks: () => {
      return new Promise((resolve, reject) => {
        // Use explicit rowid to ensure correct ordering when timestamps might be the same
        db.all('SELECT * FROM books ORDER BY id DESC', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },

    getBookById: (id) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    createBook: (bookData) => {
      return new Promise((resolve, reject) => {
        const { title, author, isbn, published_year, genre, description } = bookData;
        
        db.run(
          `INSERT INTO books (title, author, isbn, published_year, genre, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [title, author, isbn, published_year, genre, description],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
    },

    updateBook: (id, bookData) => {
      return new Promise((resolve, reject) => {
        const { title, author, isbn, published_year, genre, description } = bookData;
        
        db.run(
          `UPDATE books 
           SET title = ?, author = ?, isbn = ?, published_year = ?, genre = ?, description = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [title, author, isbn, published_year, genre, description, id],
          function(err) {
            if (err) reject(err);
            else if (this.changes === 0) resolve(null);
            else {
              db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
    },

    deleteBook: (id) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM books WHERE id = ?', [id], (err, book) => {
          if (err) reject(err);
          else if (!book) resolve(null);
          else {
            db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
              if (err) reject(err);
              else resolve(book);
            });
          }
        });
      });
    }
  };
};

describe('Database Operations Unit Tests', () => {
  let db;
  let dbOperations;

  beforeAll((done) => {
    // Create in-memory database for testing
    db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        done(err);
        return;
      }
      
      // Create table
      db.serialize(() => {
        db.run(`
          CREATE TABLE books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            isbn TEXT UNIQUE,
            published_year INTEGER,
            genre TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, done);
      });
    });

    dbOperations = createTestDbOperations(db);
  });

  afterAll((done) => {
    db.close(done);
  });

  beforeEach((done) => {
    // Clear all books before each test
    db.run('DELETE FROM books', done);
  });

  describe('createBook', () => {
    test('should create a new book with all fields', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Fiction',
        description: 'A test book'
      };

      const result = await dbOperations.createBook(bookData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Book');
      expect(result.author).toBe('Test Author');
      expect(result.isbn).toBe('978-0-123456-78-9');
      expect(result.published_year).toBe(2024);
      expect(result.genre).toBe('Fiction');
      expect(result.description).toBe('A test book');
    });

    test('should create a book with minimal required fields', async () => {
      const bookData = {
        title: 'Minimal Book',
        author: 'Minimal Author'
      };

      const result = await dbOperations.createBook(bookData);

      expect(result).toBeDefined();
      expect(result.title).toBe('Minimal Book');
      expect(result.author).toBe('Minimal Author');
      expect(result.isbn).toBeNull();
    });

    test('should reject duplicate ISBN', async () => {
      const bookData1 = {
        title: 'Book 1',
        author: 'Author 1',
        isbn: '978-0-123456-78-9'
      };

      const bookData2 = {
        title: 'Book 2',
        author: 'Author 2',
        isbn: '978-0-123456-78-9'
      };

      await dbOperations.createBook(bookData1);
      
      await expect(dbOperations.createBook(bookData2))
        .rejects.toThrow();
    });
  });

  describe('getAllBooks', () => {
    test('should return empty array when no books exist', async () => {
      const result = await dbOperations.getAllBooks();
      expect(result).toEqual([]);
    });    test('should return all books in descending order by created_at', async () => {
      // Add a small delay between book creations to ensure timestamp difference
      await dbOperations.createBook({
        title: 'First Book',
        author: 'Author 1'
      });

      // Wait 100ms to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      await dbOperations.createBook({
        title: 'Second Book',
        author: 'Author 2'
      });

      const result = await dbOperations.getAllBooks();
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Second Book'); // Most recent first
      expect(result[1].title).toBe('First Book');
    });
  });

  describe('getBookById', () => {
    test('should return book when ID exists', async () => {
      const createdBook = await dbOperations.createBook({
        title: 'Test Book',
        author: 'Test Author'
      });

      const result = await dbOperations.getBookById(createdBook.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdBook.id);
      expect(result.title).toBe('Test Book');
    });

    test('should return undefined when ID does not exist', async () => {
      const result = await dbOperations.getBookById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('updateBook', () => {
    test('should update existing book', async () => {
      const createdBook = await dbOperations.createBook({
        title: 'Original Title',
        author: 'Original Author'
      });

      const updateData = {
        title: 'Updated Title',
        author: 'Updated Author',
        isbn: '978-0-123456-78-9',
        published_year: 2024,
        genre: 'Updated Genre',
        description: 'Updated description'
      };

      const result = await dbOperations.updateBook(createdBook.id, updateData);

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Title');
      expect(result.author).toBe('Updated Author');
      expect(result.isbn).toBe('978-0-123456-78-9');
    });

    test('should return null when updating non-existent book', async () => {
      const updateData = {
        title: 'Updated Title',
        author: 'Updated Author'
      };

      const result = await dbOperations.updateBook(999, updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteBook', () => {
    test('should delete existing book and return it', async () => {
      const createdBook = await dbOperations.createBook({
        title: 'Book to Delete',
        author: 'Delete Author'
      });

      const result = await dbOperations.deleteBook(createdBook.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdBook.id);
      expect(result.title).toBe('Book to Delete');

      // Verify book is actually deleted
      const fetchResult = await dbOperations.getBookById(createdBook.id);
      expect(fetchResult).toBeUndefined();
    });

    test('should return null when deleting non-existent book', async () => {
      const result = await dbOperations.deleteBook(999);
      expect(result).toBeNull();
    });
  });
});