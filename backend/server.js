const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's port or 3000 locally

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes

// GET all transactions
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST new transaction
app.post('/api/transactions', (req, res) => {
    const { amount, description, category, type, date } = req.body;
    
    if (!amount || !description || !category || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        `INSERT INTO transactions (amount, description, category, type, date) 
         VALUES (?, ?, ?, ?, ?)`,
        [amount, description, category, type, date || new Date().toISOString()],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                id: this.lastID, 
                message: 'Transaction added successfully' 
            });
        }
    );
});

// DELETE transaction
app.delete('/api/transactions/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM transactions WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ 
            message: 'Transaction deleted',
            changes: this.changes 
        });
    });
});

// Health check endpoint (for Render)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Database path: ${process.env.NODE_ENV === 'production' ? '/data/finance.db' : 'local'}`);
});