📚 Book Management API
======================

A RESTful API for managing a book collection with full CRUD operations built with Node.js and Express.js.

🚀 Features
-----------

-   Complete CRUD operations for book management
-   RESTful API design with consistent JSON responses
-   SQLite database integration
-   Comprehensive test coverage (81.81%)
-   CORS support for cross-origin requests

🛠️ Tech Stack
--------------

-   **Backend**: Node.js with Express.js framework
-   **Database**: SQLite (lightweight, file-based database)
-   **Testing Framework**: Jest with Supertest
-   **Additional Libraries**:
    -   CORS for cross-origin requests
    -   Express.json() for JSON parsing

📊 Database Schema
------------------

sql

```
Books Table:
- id (Primary Key, Auto Increment)
- title (VARCHAR)
- author (VARCHAR)
- isbn (VARCHAR)
- published_year (INTEGER)
- genre (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

🔧 Installation & Setup
-----------------------

1.  **Clone the repository**

    bash

    ```
    git clone <repository-url>
    cd book-management-api
    ```

2.  **Install dependencies**

    bash

    ```
    npm install
    ```

3.  **Start the server**

    bash

    ```
    npm start
    ```

4.  **Verify the server is running**
    -   Server runs on: `http://localhost:3000`
    -   Health check: `http://localhost:3000/health`
    -   API base URL: `http://localhost:3000/api/books`

🧪 Testing
----------

### Run Tests

bash

```
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
# or
npm test -- --coverage
```

### Testing Frameworks/Tools Used

-   **Jest**: Primary testing framework for unit, integration, and API tests
-   **Supertest**: HTTP assertion library for testing Express.js APIs

### Test Structure

```
tests/
├── unit/
│   ├── database.test.js
│   └── routes.test.js
├── integration/
│   └── books.integration.test.js
└── api/
    └── books.api.test.js
```

### Test Coverage Results

<img width="478" alt="npm test coverage" src="https://github.com/user-attachments/assets/22784b1b-6e43-4407-997b-a0e70e48418d" />


**Coverage Summary:**

-   **Overall Coverage**: 81.81% statements, 83.33% branches, 96.29% functions, 87% lines
-   **Test Suites**: 4/4 passed
-   **Total Tests**: 59/59 passed

**File-specific Coverage:**

-   `server/database.js`: 74.19% coverage
-   `server/routes/books.js`: 91.66% coverage

📡 API Endpoints
----------------

### Base URL

```
http://localhost:3000/api/books
```

### Available Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/books` | Retrieve all books |
| GET | `/api/books/:id` | Retrieve a specific book by ID |
| POST | `/api/books` | Create a new book |
| PUT | `/api/books/:id` | Update an existing book |
| DELETE | `/api/books/:id` | Delete a book |

📝 API Usage Examples
---------------------

### 1\. Get All Books

bash

```
curl -X GET http://localhost:3000/api/books
```

**Response:**

json

```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "published_year": 1925,
      "genre": "Fiction",
      "description": "A classic American novel",
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    }
  ],
  "total": 1
}
```

### 2\. Get Book by ID

bash

```
curl -X GET http://localhost:3000/api/books/1
```

### 3\. Create New Book

bash

```
curl -X POST http://localhost:3000/api/books\
  -H "Content-Type: application/json"\
  -d '{
    "title": "New Book Title",
    "author": "Author Name",
    "isbn": "978-1-234-56789-0",
    "published_year": 2024,
    "genre": "Fiction",
    "description": "Book description"
  }'
```

### 4\. Update Book

bash

```
curl -X PUT http://localhost:3000/api/books/1\
  -H "Content-Type: application/json"\
  -d '{
    "title": "Updated Book Title",
    "author": "Updated Author",
    "isbn": "978-1-234-56789-1",
    "published_year": 2024,
    "genre": "Updated Genre",
    "description": "Updated description"
  }'
```

### 5\. Delete Book

bash

```
curl -X DELETE http://localhost:3000/api/books/1
```

📁 Project Structure
--------------------

```
book-management-api/
├── server/
│   ├── database.js
│   └── routes/
│       └── books.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
├── package.json
├── package-lock.json
└── README.md
```

🔍 Database Integration
-----------------------

-   **Connection**: Database connection established in server configuration
-   **Drivers**: SQLite drivers handle queries and connections
-   **Performance**: Connection pooling implemented for optimal performance
-   **Error Handling**: Proper error handling for all database operations
-   **Queries**: SQL queries used for all CRUD operations

🌐 CORS Support
---------------

The API includes CORS middleware to handle cross-origin requests, making it accessible from different domains and ports.

📈 Performance
--------------

-   Lightweight SQLite database for fast local development
-   Connection pooling for database optimization
-   Efficient JSON parsing with Express.js middleware
