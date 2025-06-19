// server/database.js - Windows Compatible Version
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or connect to database
const dbPath = path.join(__dirname, 'books.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create books table if it doesn't exist
db.serialize(() => {
  db.run(`
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
  `);

  // Insert sample data if table is empty
  db.get('SELECT COUNT(*) as count FROM books', (err, result) => {
    if (err) {
      console.error('Error checking book count:', err.message);
      return;
    }

    if (result.count === 0) {
      const sampleBooks = [
        ['The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 1925, 'Fiction', 'A classic American novel'],
        ['To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 1960, 'Fiction', 'A story of racial injustice and childhood'],
        ['1984', 'George Orwell', '978-0-452-28423-4', 1949, 'Dystopian Fiction', 'A dystopian social science fiction novel'],
        ['Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 1813, 'Romance', 'A romantic novel of manners']
      ];

      const stmt = db.prepare(`
        INSERT INTO books (title, author, isbn, published_year, genre, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleBooks.forEach(book => {
        stmt.run(...book);
      });

      stmt.finalize();
      console.log('Sample books inserted into database');
    }
  });
});

// Database helper functions
const dbOperations = {
  // Get all books
  getAllBooks: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM books ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get book by ID
  getBookById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Create new book
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
            // Get the newly created book
            db.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  },

  // Update book
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
          else if (this.changes === 0) resolve(null); // No rows updated
          else {
            // Get the updated book
            db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  },

  // Delete book
  deleteBook: (id) => {
    return new Promise((resolve, reject) => {
      // First get the book before deleting
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

module.exports = { db, dbOperations };