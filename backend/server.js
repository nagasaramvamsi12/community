const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit if there’s a connection error
  }
  console.log('MySQL connected...');
});

// Test route to verify the server is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Registration route
app.post('/api/users/register', (req, res) => {
  const { email, password } = req.body;

  // Check if the user already exists
  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ msg: 'Database error occurred' });
    }

    if (results.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Insert the new user into the database
    const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(insertUserQuery, [email, password], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ msg: 'Registration failed. Try again.' });
      }

      res.status(201).json({ msg: 'User registered successfully', userId: result.insertId });
    });
  });
});

// Login route
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists with the provided email and password
  const loginQuery = 'SELECT id, email FROM users WHERE email = ? AND password = ?';
  
  db.query(loginQuery, [email, password], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ msg: 'Server error' });
    }

    // If no user is found, return invalid credentials message
    if (results.length === 0) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // If user is found, return success message with userId and email
    const user = results[0];
    res.status(200).json({
      msg: 'Login successful',
      userId: user.id,
      email: user.email
    });
  });
});

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Retrieve the chat history from the database and send it to the connected user
  const chatHistoryQuery = 'SELECT * FROM chats ORDER BY timestamp ASC';
  db.query(chatHistoryQuery, (err, results) => {
    if (err) {
      console.error('Error retrieving chat history:', err);
      return;
    }

    console.log('Chat history retrieved:', results); // Log the chat history
    socket.emit('load_chat_history', results); // Emit chat history to the client
  });

  // Listen for incoming messages and save them to the database
  socket.on('send_message', (data) => {
    console.log('Received message:', data);  // Log the received message
    const { userId, message } = data;

    const insertMessageQuery = 'INSERT INTO chats (userId, message) VALUES (?, ?)';
    db.query(insertMessageQuery, [userId, message], (err, result) => {
      if (err) {
        console.error('Error saving message:', err);
        return;
      }

      console.log('Message saved to database:', result);  // Log success message
      // Broadcast the message to all users
      io.emit('receive_message', data);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server and listen on a port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
