const Charles = require('../models/charles.model');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate request
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        // Register user
        const user = await Charles.register({
            username,
            email,
            password
        });

        res.status(201).json({
            message: "User registered successfully!",
            data: user
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while registering the user."
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required!"
            });
        }

        // Login user
        const user = await Charles.login(email, password);

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful!",
            data: user,
            token: token
        });
    } catch (err) {
        res.status(401).json({
            message: err.message || "Invalid credentials"
        });
    }
};

// Retrieve all users
exports.findAll = async (req, res) => {
    try {
        const users = await Charles.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
};

// Find a single user with an id
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await Charles.findById(id);
        res.json(user);
    } catch (err) {
        if (err.message === 'Invalid ID parameter') {
            return res.status(400).json({
                message: err.message
            });
        }
        if (err.message === 'User not found') {
            return res.status(404).json({
                message: err.message
            });
        }
        res.status(500).json({
            message: err.message || `Error retrieving user with id ${req.params.id}`
        });
    }
};

// Update a user
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { username, email, password } = req.body;

        const updatedUser = await Charles.update(id, {
            username,
            email,
            password
        });

        res.json({
            message: "User was updated successfully.",
            data: updatedUser
        });
    } catch (err) {
        if (err.message === 'Invalid ID parameter') {
            return res.status(400).json({
                message: err.message
            });
        }
        if (err.message === 'User not found') {
            return res.status(404).json({
                message: err.message
            });
        }
        res.status(500).json({
            message: err.message || `Error updating user with id ${req.params.id}`
        });
    }
};

// Delete a user
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Charles.delete(id);
        res.json({
            message: "User was deleted successfully!"
        });
    } catch (err) {
        if (err.message === 'Invalid ID parameter') {
            return res.status(400).json({
                message: err.message
            });
        }
        if (err.message === 'User not found') {
            return res.status(404).json({
                message: err.message
            });
        }
        res.status(500).json({
            message: err.message || `Error deleting user with id ${req.params.id}`
        });
    }
}; 