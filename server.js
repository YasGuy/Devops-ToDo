import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const port = 3000;


// Create a MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Get all tasks
app.get('/tasks', (req, res) => {
    connection.query('SELECT * FROM tasks', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add a new task
app.post('/tasks', (req, res) => {
    const { description } = req.body;
    connection.query('INSERT INTO tasks (description) VALUES (?)', [description], (err, results) => {
        if (err) throw err;
        res.json({ id: results.insertId, description });
    });
});

// Mark a task as completed
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    connection.query('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id], (err) => {
        if (err) throw err;
        res.json({ id, completed });
    });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.json({ id });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;

