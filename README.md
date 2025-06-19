📚 Books Managment API (Documentation)
=========

A RESTful API for managing a book collection with full CRUD operations built with Node.js and Express.

The APIs You Created and Their Functionality
--------------------------------------------

This project includes 5 main API endpoints that provide complete CRUD operations for managing books:

-   **GET /api/books** - Retrieve all books from the database
-   **GET /api/books/:id** - Retrieve a specific book by its ID
-   **POST /api/books** - Add a new book to the database
-   **PUT /api/books/:id** - Update an existing book's information
-   **DELETE /api/books/:id** - Delete a book from the database

Each endpoint returns JSON responses with consistent structure including success status, data, and appropriate messages.

📊The Database You Used and How You Integrated It Into Your Server
----------------------------------------------------------------

This API uses a relational database to store book information with the following schema:

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

**Database Integration:**

-   Database connection is established in the server configuration
-   Database drivers are used to handle queries and connections
-   Connection pooling is implemented for optimal performance
-   Proper error handling for database operations
-   SQL queries are used for all CRUD operations

🚀How to Run Your Server
----------------------

Follow these steps to run the server locally:

1.  **Install dependencies**

    ```
    npm install

    ```

2.  **Start the server**

    ```
    npm start

    ```

3.  **Verify the server is running**

    -   The server will start on `http://localhost:3000`
    -   Check health endpoint: `http://localhost:3000/health`
    -   API base URL: `http://localhost:3000/api/books`

How to Run Your Frontend Locally (Optional)
-------------------------------------------

If your project includes a frontend:

1.  **Navigate to frontend directory**

    ```
    cd frontend

    ```

2.  **Install frontend dependencies**

    ```
    npm install

    ```

3.  **Start the frontend development server**

    ```
    npm start

    ```

4.  **Access the frontend**

    -   Frontend will be available at `http://localhost:3001`
    -   The frontend will communicate with the API backend

How to Interact With Your API
-----------------------------

### Base URL

```
http://localhost:3000/api/books

```

### Sample Requests and Responses

### 1\. Get All Books

-   **Method**: `GET`
-   **Endpoint**: `/api/books`
-   **Description**: Retrieve all books from the database
-   **Response**:

    ```
    {  "success": true,  "data": [    {      "id": 1,      "title": "The Great Gatsby",      "author": "F. Scott Fitzgerald",      "isbn": "978-0-7432-7356-5",      "published_year": 1925,      "genre": "Fiction",      "description": "A classic American novel",      "created_at": "2024-01-01 10:00:00",      "updated_at": "2024-01-01 10:00:00"    }  ],  "total": 1}

    ```

### 2\. Get Book by ID

-   **Method**: `GET`
-   **Endpoint**: `/api/books/:id`
-   **Description**: Retrieve a specific book by its ID
-   **Response**:

    ```
    {  "success": true,  "data": {    "id": 1,    "title": "The Great Gatsby",    "author": "F. Scott Fitzgerald",    "isbn": "978-0-7432-7356-5",    "published_year": 1925,    "genre": "Fiction",    "description": "A classic American novel"  }}

    ```

### 3\. Create New Book

-   **Method**: `POST`
-   **Endpoint**: `/api/books`
-   **Description**: Add a new book to the database
-   **Request Body**:

    ```
    {  "title": "New Book Title",  "author": "Author Name",  "isbn": "978-1-234-56789-0",  "published_year": 2024,  "genre": "Fiction",  "description": "Book description"}

    ```

-   **Response**:

    ```
    {  "success": true,  "message": "Book created successfully",  "data": {    "id": 2,    "title": "New Book Title",    "author": "Author Name",    "isbn": "978-1-234-56789-0",    "published_year": 2024,    "genre": "Fiction",    "description": "Book description"  }}

    ```

### 4\. Update Book

-   **Method**: `PUT`
-   **Endpoint**: `/api/books/:id`
-   **Description**: Update an existing book
-   **Request Body**: Same as POST request
-   **Response**:

    ```
    {  "success": true,  "message": "Book updated successfully",  "data": {    "id": 1,    "title": "Updated Book Title",    "author": "Updated Author",    "isbn": "978-1-234-56789-1",    "published_year": 2024,    "genre": "Updated Genre",    "description": "Updated description"  }}

    ```

### 5\. Delete Book

-   **Method**: `DELETE`
-   **Endpoint**: `/api/books/:id`
-   **Description**: Delete a book from the database
-   **Response**:

    ```
    {  "success": true,  "message": "Book deleted successfully",  "data": {    "deletedBook": {      "id": 1,      "title": "Deleted Book Title",      "author": "Author Name"    }  }}

    ```

### 🧪Testing With cURL Commands

**Get all books:**

```
curl -X GET http://localhost:3000/api/books

```

**Get a specific book:**

```
curl -X GET http://localhost:3000/api/books/1

```

**Create a new book:**

```
curl -X POST http://localhost:3000/api/books\
  -H "Content-Type: application/json"\
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "isbn": "978-1-234-56789-0",
    "published_year": 2024,
    "genre": "Test",
    "description": "A test book"
  }'

```

**Update a book:**

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

**Delete a book:**

```
curl -X DELETE http://localhost:3000/api/books/1

```

