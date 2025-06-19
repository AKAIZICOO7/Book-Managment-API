class BookManager {
    constructor() {
        this.API_BASE = '/api/books';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadBooks();
    }

    bindEvents() {
        document.getElementById('bookForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadBooks());
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelEdit());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            isbn: document.getElementById('isbn').value || null,
            published_year: document.getElementById('published_year').value || null,
            genre: document.getElementById('genre').value || null,
            description: document.getElementById('description').value || null
        };

        try {
            if (this.editingId) {
                await this.updateBook(this.editingId, formData);
            } else {
                await this.createBook(formData);
            }
            this.resetForm();
            this.loadBooks();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async loadBooks() {
        const container = document.getElementById('booksContainer');
        container.innerHTML = '<div class="loading">Loading books...</div>';

        try {
            const response = await fetch(this.API_BASE);
            const result = await response.json();

            if (result.success) {
                this.displayBooks(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            container.innerHTML = `<div class="error">Error loading books: ${error.message}</div>`;
        }
    }

    displayBooks(books) {
        const container = document.getElementById('booksContainer');
        
        if (books.length === 0) {
            container.innerHTML = '<div class="loading">No books found. Add your first book!</div>';
            return;
        }

        const booksHTML = books.map(book => `
            <div class="book-card">
                <div class="book-header">
                    <div>
                        <div class="book-title">${this.escapeHtml(book.title)}</div>
                        <div class="book-author">by ${this.escapeHtml(book.author)}</div>
                    </div>
                    <div class="book-actions">
                        <button class="edit-btn" onclick="bookManager.editBook(${book.id})">Edit</button>
                        <button class="delete-btn" onclick="bookManager.deleteBook(${book.id})">Delete</button>
                    </div>
                </div>
                <div class="book-details">
                    ${book.isbn ? `<div><strong>ISBN:</strong> ${this.escapeHtml(book.isbn)}</div>` : ''}
                    ${book.published_year ? `<div><strong>Published:</strong> ${book.published_year}</div>` : ''}
                    ${book.genre ? `<div><strong>Genre:</strong> ${this.escapeHtml(book.genre)}</div>` : ''}
                    ${book.description ? `<div><strong>Description:</strong> ${this.escapeHtml(book.description)}</div>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = booksHTML;
    }

    async createBook(bookData) {
        const response = await fetch(this.API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }

        this.showMessage('Book added successfully!', 'success');
        return result.data;
    }

    async updateBook(id, bookData) {
        const response = await fetch(`${this.API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }

        this.showMessage('Book updated successfully!', 'success');
        return result.data;
    }

    async editBook(id) {
        try {
            const response = await fetch(`${this.API_BASE}/${id}`);
            const result = await response.json();

            if (result.success) {
                const book = result.data;
                
                // Fill form with book data
                document.getElementById('title').value = book.title;
                document.getElementById('author').value = book.author;
                document.getElementById('isbn').value = book.isbn || '';
                document.getElementById('published_year').value = book.published_year || '';
                document.getElementById('genre').value = book.genre || '';
                document.getElementById('description').value = book.description || '';

                // Update UI for editing mode
                this.editingId = id;
                document.getElementById('submitBtn').textContent = 'Update Book';
                document.getElementById('cancelBtn').style.display = 'inline-block';
                
                // Scroll to form
                document.querySelector('.add-book-section').scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showMessage(`Error loading book: ${error.message}`, 'error');
        }
    }

    async deleteBook(id) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/${id}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                this.showMessage('Book deleted successfully!', 'success');
                this.loadBooks();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showMessage(`Error deleting book: ${error.message}`, 'error');
        }
    }

    cancelEdit() {
        this.resetForm();
    }

    resetForm() {
        document.getElementById('bookForm').reset();
        this.editingId = null;
        document.getElementById('submitBtn').textContent = 'Add Book';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMsg = document.querySelector('.success, .error');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create new message
        const msgDiv = document.createElement('div');
        msgDiv.className = type;
        msgDiv.textContent = message;

        // Insert after header
        const header = document.querySelector('header');
        header.parentNode.insertBefore(msgDiv, header.nextSibling);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const bookManager = new BookManager();