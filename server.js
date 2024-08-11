import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import client from 'prom-client';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const port = 3030;

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

// Prometheus Metrics Setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const upGauge = new client.Gauge({
    name: 'app_up',
    help: '1 if the app is up, 0 if the app is down',
    // Label to distinguish between instances if needed
    labelNames: ['instance']
});

upGauge.set({ instance: 'server' }, 1);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Simulated failure route
app.get('/fail', (req, res) => {
    // Simulate an error
    upGauge.set({ instance: 'server' }, 0);
    res.status(500).send('Simulated failure');
});


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

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        const metrics = await client.register.metrics();
        res.set('Content-Type', client.register.contentType);
        res.end(metrics);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;

// Handle process exit and errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    upGauge.set({ instance: 'server' }, 0);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    upGauge.set({ instance: 'server' }, 0);
});
