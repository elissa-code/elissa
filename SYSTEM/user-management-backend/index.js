const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Use the promise-based version
const app = express();
const port = 3000; // Backend port

// Database configuration (REPLACE WITH YOUR ACTUAL CREDENTIALS)
const dbConfig = {
  host: 'localhost',
  user: 'your_db_user',       // <--- REPLACE WITH YOUR ACTUAL MYSQL USERNAME
  password: 'your_db_password', // <--- REPLACE WITH YOUR ACTUAL MYSQL PASSWORD
  database: 'i5_sod'         // <--- REPLACE WITH YOUR ACTUAL DATABASE NAME
};

let dbPool; // Use a connection pool for better performance

// Function to initialize the database connection pool
async function initializeDatabase() {
  try {
    dbPool = await mysql.createPool(dbConfig);
    console.log('Database connection pool created.');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    // Exit the process if database connection fails - it's a critical error
    process.exit(1);
  }
}

// --- Middleware ---
// Configure CORS to allow requests from your React frontend
// Assuming your React app is running on http://localhost:3001
const corsOptions = {
  origin: 'http://localhost:3001', // <--- MAKE SURE THIS MATCHES YOUR REACT FRONTEND'S PORT
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// --- API Routes ---

// GET /api/user - Get all users
app.get('/api/user', async (req, res) => {
  console.log('GET /api/user');
  try {
    // Execute the SQL query to select all users
    const [rows, fields] = await dbPool.execute('SELECT * FROM users');
    // Send the results back as JSON
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    // Send a 500 status code and an error message
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// POST /api/user - Create a new user
app.post('/api/user', async (req, res) => {
  console.log('POST /api/user', req.body);
  // Destructure the required fields from the request body
  const { name, class: userClass, age } = req.body;

  // Basic validation: Check if required fields are present
  if (!name || !userClass || age === undefined || age === null || age === '') {
    return res.status(400).json({ message: 'Name, class, and age are required' });
  }

  // Validate and parse age as an integer
  const parsedAge = parseInt(age, 10);
  if (isNaN(parsedAge)) {
     return res.status(400).json({ message: 'Age must be a valid number' });
  }

  try {
    // Execute the INSERT query with parameterized values to prevent SQL injection
    const [result] = await dbPool.execute(
      'INSERT INTO users (name, class, age) VALUES (?, ?, ?)',
      [name, userClass, parsedAge]
    );

    // Construct the new user object to return, including the auto-generated ID
    const newUser = { id: result.insertId, name, class: userClass, age: parsedAge };
    console.log('User created:', newUser);

    // Respond with the newly created user object and a 201 status code (Created)
    res.status(201).json(newUser);

  } catch (err) {
    console.error('Error creating user:', err);
    // Send a 500 status code and an error message
    res.status(500).json({ message: 'Error creating user' });
  }
});

// PUT /post/:id - Update a user by ID (Matches frontend's expected path)
app.put('/post/:id', async (req, res) => {
  // Get the user ID from the URL parameters
  const userId = parseInt(req.params.id, 10);
  console.log('PUT /post/:id', userId, req.body);
  // Destructure potential update fields from the request body
  const { name, class: userClass, age } = req.body;

  // Basic validation: Ensure at least one field is provided for update
  if (name === undefined && userClass === undefined && age === undefined) {
    return res.status(400).json({ message: 'No fields provided for update' });
  }

  // Build the update query dynamically based on which fields are provided
  const updateFields = [];
  const updateValues = [];

  if (name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  if (userClass !== undefined) {
    updateFields.push('class = ?');
    updateValues.push(userClass);
  }
  if (age !== undefined) {
    const parsedAge = parseInt(age, 10);
     if (isNaN(parsedAge)) {
        return res.status(400).json({ message: 'Age must be a valid number for update' });
     }
    updateFields.push('age = ?');
    updateValues.push(parsedAge);
  }

  // Construct the final SQL query
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  // Add the user ID to the end of the values array for the WHERE clause
  updateValues.push(userId);

  try {
    // Execute the UPDATE query
    const [result] = await dbPool.execute(query, updateValues);

    // Check if any rows were affected. If 0, the user with that ID was not found.
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the updated user data to return in the response
    const [rows] = await dbPool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = rows[0]; // Assuming id is unique, we get one row

    console.log('User updated:', updatedUser);

    // Respond with the updated user data
    res.json(updatedUser);

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// DELETE /user/:id - Delete a user by ID (Matches frontend's expected path)
app.delete('/user/:id', async (req, res) => {
  // Get the user ID from the URL parameters
  const userId = parseInt(req.params.id, 10);
  console.log('DELETE /user/:id', userId);

  // Basic validation for the ID
  if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    // Execute the DELETE query
    const [result] = await dbPool.execute('DELETE FROM users WHERE id = ?', [userId]);

    // Check if any rows were affected. If 0, the user with that ID was not found.
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User deleted:', userId);
    // Respond with a success message and a 200 status code
    res.status(200).json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// --- Error Handling Middleware ---
// This middleware catches any errors that were not handled by specific route handlers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack); // Log the full error stack for debugging
  res.status(500).send('Something broke!'); // Send a generic error response to the client
});


// --- Start the server ---
// First initialize the database connection pool, then start the Express server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}).catch(err => {
  // If database initialization fails, log the error and do not start the server
  console.error("Failed to initialize database, server not started.", err);
});