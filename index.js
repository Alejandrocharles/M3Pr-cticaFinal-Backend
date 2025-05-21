const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const dbConfig = require('./config/db.config');
const routes = require('./routes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
const connectDB = async () => {
    try {
        console.log('Attempting to connect to database...');
        console.log('Connection details:', {
            server: dbConfig.server,
            database: dbConfig.database,
            user: dbConfig.user
        });
        
        await sql.connect(dbConfig);
        console.log('Database connection has been established successfully.');
    } catch (err) {
        console.error('Database connection error:', {
            message: err.message,
            code: err.code
        });
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Initial database connection
connectDB();

// Routes
app.use('/api', routes);

// Simple route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SpidersAP API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
