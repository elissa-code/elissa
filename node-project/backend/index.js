const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001; // Ensure this matches your frontend API_URL

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON request bodies

// Database Connection
const db = mysql.createConnection({
    host: 'localhost', // Your MySQL host
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'library_system' // The database you created
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as ID ' + db.threadId);
});

// --- IMPORTANT: SQL for the 'users' table ---
// Make sure you have created this table in your 'library_system' database:
/*
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255)
);
*/
// NOTE: This basic example stores passwords in plain text.
// In a real application, you MUST hash passwords for security (e.g., using bcrypt).


// Helper function to execute SQL queries (basic error logging)
const executeQuery = (sql, params, callback) => {
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database query error:', err.message);
        }
        callback(err, results);
    });
};

// --- User Authentication Endpoints ---

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    // IMPORTANT: Storing plain text password - NOT SECURE for production!
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    executeQuery(sql, [username, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username already exists' });
            }
            console.error('Signup error:', err); // Log other errors
            return res.status(500).json({ message: 'Error creating user' });
        }
        res.status(201).json({ message: 'Signup successful' });
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const sql = 'SELECT * FROM users WHERE username = ?';
    executeQuery(sql, [username], (err, results) => {
        if (err) {
            console.error('Login query error:', err); // Log query error
            return res.status(500).json({ message: 'Error during login' });
        }
        if (results.length === 0) {
            // User not found
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const user = results[0];
        // IMPORTANT: Comparing plain text password - NOT SECURE for production!
        if (user.password !== password) {
            // Password doesn't match
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // Login successful
        res.json({ message: 'Login successful', username: user.username }); // Optionally send back user info
    });
});


// --- Book API Endpoints ---

// Get all books (with publisher and supplier names)
app.get('/api/books', (req, res) => {
    const sql = 'SELECT b.*, p.name AS publisher_name, s.name AS supplier_name FROM Bookb LEFT JOIN Publisher p ON b.publisher_id = p.publisher_id LEFT JOIN Supplier s ON b.supplier_id = s.supplier_id';
    executeQuery(sql, [], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch books' });
            return;
        }
        res.json(results);
    });
});

// Create a new book
app.post('/api/books', (req, res) => {
    const { title, author, ISBN, genre, publication_year, publisher_id, supplier_id } = req.body;
    const sql = 'INSERT INTO Book (title, author, ISBN, genre, publication_year, publisher_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [title, author, ISBN, genre, publication_year, publisher_id, supplier_id];
    executeQuery(sql, values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to add book' });
            return;
        }
        res.status(201).json({ message: 'Book created successfully', book_id: result.insertId });
    });
});

// Update a book by ID
app.put('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, ISBN, genre, publication_year, publisher_id, supplier_id } = req.body;
    const sql = 'UPDATE Book SET title = ?, author = ?, ISBN = ?, genre = ?, publication_year = ?, publisher_id = ?, supplier_id = ? WHERE book_id = ?';
    const values = [title, author, ISBN, genre, publication_year, publisher_id, supplier_id, id];
    executeQuery(sql, values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to update book' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }
        res.json({ message: 'Book updated successfully' });
    });
});

// Delete a book by ID
app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Book WHERE book_id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to delete book' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }
        res.json({ message: 'Book deleted successfully' });
    });
});

// --- Member API Endpoints ---

// Get all members
app.get('/api/members', (req, res) => {
    const sql = 'SELECT * FROM Member';
    executeQuery(sql, [], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch members' });
            return;
        }
        res.json(results);
    });
});

// Create a new member
app.post('/api/members', (req, res) => {
    const { name, type, contact_info } = req.body;
    const sql = 'INSERT INTO Member (name, type, contact_info) VALUES (?, ?, ?)';
    const values = [name, type, contact_info];
    executeQuery(sql, values, (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to add member' });
            return;
        }
        res.status(201).json({ message: 'Member created successfully', member_id: result.insertId });
    });
});

// Update a member by ID
app.put('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, contact_info } = req.body;
    const sql = 'UPDATE Member SET name = ?, type = ?, contact_info = ? WHERE member_id = ?';
    const values = [name, type, contact_info, id];
    executeQuery(sql, values, (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to update member' });
            return;
        }
         if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Member not found' });
            return;
        }
        res.json({ message: 'Member updated successfully' });
    });
});

// Delete a member by ID
app.delete('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Member WHERE member_id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to delete member' });
            return;
        }
         if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Member not found' });
            return;
        }
        res.json({ message: 'Member deleted successfully' });
    });
});


// --- Publisher API Endpoints ---

// Get all publishers
app.get('/api/publishers', (req, res) => {
    const sql = 'SELECT * FROM Publisher';
    executeQuery(sql, [], (err, results) => {
        if (err) {
             res.status(500).json({ error: 'Failed to fetch publishers' });
            return;
        }
        res.json(results);
    });
});

// Create a new publisher
app.post('/api/publishers', (req, res) => {
    const { name, contact_info } = req.body;
    const sql = 'INSERT INTO Publisher (name, contact_info) VALUES (?, ?)';
    const values = [name, contact_info];
    executeQuery(sql, values, (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to add publisher' });
            return;
        }
        res.status(201).json({ message: 'Publisher created successfully', publisher_id: result.insertId });
    });
});

// Update a publisher by ID
app.put('/api/publishers/:id', (req, res) => {
    const { id } = req.params;
    const { name, contact_info } = req.body;
    const sql = 'UPDATE Publisher SET name = ?, contact_info = ? WHERE publisher_id = ?';
    const values = [name, contact_info, id];
    executeQuery(sql, values, (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to update publisher' });
            return;
        }
         if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Publisher not found' });
            return;
        }
        res.json({ message: 'Publisher updated successfully' });
    });
});

// Delete a publisher by ID
app.delete('/api/publishers/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Publisher WHERE publisher_id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to delete publisher' });
            return;
        }
         if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Publisher not found' });
            return;
        }
        res.json({ message: 'Publisher deleted successfully' });
    });
});


// --- Supplier API Endpoints ---

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
    const sql = 'SELECT * FROM Supplier';
    executeQuery(sql, [], (err, results) => {
        if (err) {
             res.status(500).json({ error: 'Failed to fetch suppliers' });
            return;
        }
        res.json(results);
    });
});

// Create a new supplier
app.post('/api/suppliers', (req, res) => {
    const { name, contact_info } = req.body;
    const sql = 'INSERT INTO Supplier (name, contact_info) VALUES (?, ?)';
    const values = [name, contact_info];
    executeQuery(sql, values, (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to add supplier' });
            return;
        }
        res.status(201).json({ message: 'Supplier created successfully', supplier_id: result.insertId });
    });
});

// Update a supplier by ID
app.put('/api/suppliers/:id', (req, res) => {
    const { id } = req.params;
    const { name, contact_info } = req.body;
    const sql = 'UPDATE Supplier SET name = ?, contact_info = ? WHERE supplier_id = ?';
    const values = [name, contact_info, id];
    executeQuery(sql, values, (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to update supplier' });
            return;
        }
         if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json({ message: 'Supplier updated successfully' });
    });
});

// Delete a supplier by ID
app.delete('/api/suppliers/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Supplier WHERE supplier_id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) {
             res.status(500).json({ error: 'Failed to delete supplier' });
            return;
        }
         if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json({ message: 'Supplier deleted successfully' });
    });
});

// --- Borrowing API Endpoints (Read Only for Simplicity) ---

// Get all borrowings (joining with Book and Member for display)
app.get('/api/borrowings', (req, res) => {
    const sql = `
        SELECT
            b.borrowing_id,
            bk.title AS book_title,
            m.name AS member_name,
            b.borrow_date,
            b.return_date
        FROM Borrowing b
        JOIN Book bk ON b.book_id = bk.book_id
        JOIN Member m ON b.member_id = m.member_id
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) {
             res.status(500).json({ error: 'Failed to fetch borrowings' });
            return;
        }
        res.json(results);
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});

// Close the database connection when the server stops (optional, but good practice)
process.on('SIGINT', () => {
    db.end((err) => {
        if (err) {
            console.error('Error closing database connection:', err.stack);
            return;
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});