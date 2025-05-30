const sql = require('mssql');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/db.config');

class Charles {
    static async register(userData) {
        try {
            const pool = await sql.connect(dbConfig);
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const result = await pool.request()
                .input('username', sql.NVarChar(50), userData.username)
                .input('email', sql.NVarChar(100), userData.email)
                .input('password', sql.NVarChar(100), hashedPassword)
                .query(`
                    INSERT INTO charles (username, email, password)
                    VALUES (@username, @email, @password);
                    SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async login(email, password) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('email', sql.NVarChar(100), email)
                .query('SELECT * FROM charles WHERE email = @email');
            
            const user = result.recordset[0];
            
            if (!user) {
                throw new Error('User not found');
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid password');
            }

            // Remove password from user object and ensure id is a number
            return {
                id: parseInt(user.id),
                username: user.username,
                email: user.email
            };
        } catch (err) {
            throw err;
        }
    }

    static async findAll() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT id, username, email FROM charles');
            return result.recordset.map(user => ({
                ...user,
                id: parseInt(user.id)
            }));
        } catch (err) {
            throw err;
        }
    }

    static async findById(id) {
        try {
            if (!id || isNaN(parseInt(id))) {
                throw new Error('Invalid ID parameter');
            }

            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('id', sql.Int, parseInt(id))
                .query('SELECT id, username, email FROM charles WHERE id = @id');
            
            const user = result.recordset[0];
            if (!user) {
                throw new Error('User not found');
            }

            return {
                ...user,
                id: parseInt(user.id)
            };
        } catch (err) {
            throw err;
        }
    }

    static async update(id, userData) {
        try {
            if (!id || isNaN(parseInt(id))) {
                throw new Error('Invalid ID parameter');
            }

            const pool = await sql.connect(dbConfig);
            let query = 'UPDATE charles SET ';
            const inputs = [];
            
            if (userData.username) {
                inputs.push('username = @username');
            }
            if (userData.email) {
                inputs.push('email = @email');
            }
            if (userData.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);
                inputs.push('password = @password');
                userData.password = hashedPassword;
            }

            query += inputs.join(', ') + ' WHERE id = @id;';
            query += ' SELECT id, username, email FROM charles WHERE id = @id;';

            const request = pool.request()
                .input('id', sql.Int, parseInt(id));

            if (userData.username) request.input('username', sql.NVarChar(50), userData.username);
            if (userData.email) request.input('email', sql.NVarChar(100), userData.email);
            if (userData.password) request.input('password', sql.NVarChar(100), userData.password);

            const result = await request.query(query);
            const updatedUser = result.recordset[0];
            
            if (!updatedUser) {
                throw new Error('User not found');
            }

            return {
                ...updatedUser,
                id: parseInt(updatedUser.id)
            };
        } catch (err) {
            throw err;
        }
    }

    static async delete(id) {
        try {
            if (!id || isNaN(parseInt(id))) {
                throw new Error('Invalid ID parameter');
            }

            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('id', sql.Int, parseInt(id))
                .query('DELETE FROM charles WHERE id = @id');
            
            if (result.rowsAffected[0] === 0) {
                throw new Error('User not found');
            }
            
            return true;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Charles; 