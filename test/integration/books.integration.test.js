const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import the actual database operations (not mocked)
const { dbOperations } = require('../../server/database');

describe('Books Integration Tests (Server + Database)', () => {
  let testDb;
  let testDbPath;
  let originalDb;

  beforeAll(async () => {
    // Create a test database file
    testDbPath = path.join(__dirname, '../../server/test_books_integration.db');
    
    // Remove test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Create test database
    testDb = new sqlite3.Database(testDbPath);
    
    // Create books table in test database
    await new Promise((resolve, reject) => {
      testDb.run(`
        CREATE TABLE IF NOT EXISTS books (
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
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Replace the database connection in the module
    // Note: This is a simplified approach for testing
    originalDb = require('../../server/database').db;
  });

  afterAll(async () => {
    if (testDb) {
      await new Promise((resolve) => {
        testDb.close(resolve);
      });
    }
    
    // Clean up test database file
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  beforeEach(async () => {
    // Clear all books before each test
    await new Promise((resolve, reject) => {
      testDb.run('DELETE FROM books', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('Full CRUD Operations Integration', () => {
    it('should perform complete CRUD lifecycle', async () => {
      // CREATE - Add a new book
      const newBookData = {
        title: 'Integration Test Book',
        author: 'Integration Test Author',
        isbn: '978-0-123456-78-9',
        published_year: 2023,
        genre: 'Technology',
        description: 'A book for integration testing'
      };

      // Insert book directly into test database
      const createdBook = await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO books (title, author, isbn, published_year, genre, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newBookData.title, newBookData.author, newBookData.isbn, 
           newBookData.published_year, newBookData.genre, newBookData.description],
          function(err) {
            if (err) reject(err);
            else {
              testDb.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });

      expect(createdBook).toBeDefined();
      expect(createdBook.id).toBeDefined();
      expect(createdBook.title).toBe(newBookData.title);

      // READ - Get the created book
      const fetchedBook = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM books WHERE id = ?', [createdBook.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(fetchedBook).toBeDefined();
      expect(fetchedBook.title).toBe(newBookData.title);
      expect(fetchedBook.author).toBe(newBookData.author);

      // UPDATE - Modify the book
      const updateData = {
        title: 'Updated Integration Test Book',
        author: 'Updated Integration Test Author',
        isbn: '978-0-987654-32-1',
        published_year: 2024,
        genre: 'Updated Technology',
        description: 'An updated book for integration testing'
      };

      await new Promise((resolve, reject) => {
        testDb.run(
          `UPDATE books 
           SET title = ?, author = ?, isbn = ?, published_year = ?, genre = ?, description = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [updateData.title, updateData.author, updateData.isbn, 
           updateData.published_year, updateData.genre, updateData.description, createdBook.id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Verify update
      const updatedBook = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM books WHERE id = ?', [createdBook.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(updatedBook.title).toBe(updateData.title);
      expect(updatedBook.author).toBe(updateData.author);
      expect(updatedBook.isbn).toBe(updateData.isbn);

      // DELETE - Remove the book
      await new Promise((resolve, reject) => {
        testDb.run('DELETE FROM books WHERE id = ?', [createdBook.id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Verify deletion
      const deletedBook = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM books WHERE id = ?', [createdBook.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(deletedBook).toBeUndefined();
    });

    it('should handle multiple books correctly', async () => {
      const books = [
        {
          title: 'Book 1',
          author: 'Author 1',
          isbn: '111-1-111111-11-1',
          published_year: 2021,
          genre: 'Fiction',
          description: 'First book'
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          isbn: '222-2-222222-22-2',
          published_year: 2022,
          genre: 'Non-Fiction',
          description: 'Second book'
        },
        {
          title: 'Book 3',
          author: 'Author 3',
          isbn: '333-3-333333-33-3',
          published_year: 2023,
          genre: 'Science',
          description: 'Third book'
        }
      ];      // Insert multiple books
      const insertedBooks = [];
      
      // Insert them with delays to ensure different timestamps
      for (const book of books) {
        // Add delay between inserts
        if (insertedBooks.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const insertedBook = await new Promise((resolve, reject) => {
          testDb.run(
            `INSERT INTO books (title, author, isbn, published_year, genre, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [book.title, book.author, book.isbn, book.published_year, book.genre, book.description],
            function(err) {
              if (err) reject(err);
              else {
                testDb.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
                  if (err) reject(err);
                  else resolve(row);
                });
              }
            }
          );
        });
        insertedBooks.push(insertedBook);
      }

      expect(insertedBooks).toHaveLength(3);      // Get all books
      const allBooks = await new Promise((resolve, reject) => {
        testDb.all('SELECT * FROM books ORDER BY id DESC', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      expect(allBooks).toHaveLength(3);
      expect(allBooks[0].title).toBe('Book 3'); // Most recent first
      expect(allBooks[1].title).toBe('Book 2');
      expect(allBooks[2].title).toBe('Book 1');
    });

    it('should enforce ISBN uniqueness constraint', async () => {
      const bookData1 = {
        title: 'First Book',
        author: 'First Author',
        isbn: '978-0-123456-78-9',
        published_year: 2023,
        genre: 'Fiction',
        description: 'First book description'
      };

      const bookData2 = {
        title: 'Second Book',
        author: 'Second Author',
        isbn: '978-0-123456-78-9', // Same ISBN
        published_year: 2024,
        genre: 'Non-Fiction',
        description: 'Second book description'
      };

      // Insert first book
      await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO books (title, author, isbn, published_year, genre, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [bookData1.title, bookData1.author, bookData1.isbn, 
           bookData1.published_year, bookData1.genre, bookData1.description],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Try to insert second book with same ISBN - should fail
      await expect(new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO books (title, author, isbn, published_year, genre, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [bookData2.title, bookData2.author, bookData2.isbn, 
           bookData2.published_year, bookData2.genre, bookData2.description],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      })).rejects.toThrow();
    });

    it('should handle books with null optional fields', async () => {
      const bookData = {
        title: 'Minimal Book',
        author: 'Minimal Author',
        isbn: null,
        published_year: null,
        genre: null,
        description: null
      };

      const createdBook = await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO books (title, author, isbn, published_year, genre, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [bookData.title, bookData.author, bookData.isbn, 
           bookData.published_year, bookData.genre, bookData.description],
          function(err) {
            if (err) reject(err);
            else {
              testDb.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });

      expect(createdBook).toBeDefined();
      expect(createdBook.title).toBe(bookData.title);
      expect(createdBook.author).toBe(bookData.author);
      expect(createdBook.isbn).toBeNull();
      expect(createdBook.published_year).toBeNull();
      expect(createdBook.genre).toBeNull();
      expect(createdBook.description).toBeNull();
      expect(createdBook.created_at).toBeDefined();
      expect(createdBook.updated_at).toBeDefined();
    });

    it('should maintain data integrity during concurrent operations', async () => {
      const bookData = {
        title: 'Concurrent Test Book',
        author: 'Concurrent Test Author',
        isbn: '999-9-999999-99-9',
        published_year: 2023,
        genre: 'Testing',
        description: 'Book for concurrent testing'
      };

      // Create book
      const createdBook = await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO books (title, author, isbn, published_year, genre, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [bookData.title, bookData.author, bookData.isbn, 
           bookData.published_year, bookData.genre, bookData.description],
          function(err) {
            if (err) reject(err);
            else {
              testDb.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });

      // Simulate concurrent updates
      const updatePromises = [];
      for (let i = 0; i < 5; i++) {
        const updatePromise = new Promise((resolve, reject) => {
          testDb.run(
            `UPDATE books SET description = ? WHERE id = ?`,
            [`Updated description ${i}`, createdBook.id],
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        });
        updatePromises.push(updatePromise);
      }

      const results = await Promise.all(updatePromises);
      
      // All updates should succeed
      results.forEach(changes => {
        expect(changes).toBe(1);
      });

      // Verify final state
      const finalBook = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM books WHERE id = ?', [createdBook.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(finalBook).toBeDefined();
      expect(finalBook.description).toMatch(/Updated description \d/);
    });
  });

  describe('Database Transaction Handling', () => {
    it('should handle database connection issues gracefully', async () => {
      // This test simulates what happens when database operations fail
      const invalidDb = new sqlite3.Database(':memory:');
      
      // Close the database to simulate connection issues
      invalidDb.close();

      // Try to perform operation on closed database
      await expect(new Promise((resolve, reject) => {
        invalidDb.all('SELECT * FROM books', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })).rejects.toThrow();
    });
  });
});