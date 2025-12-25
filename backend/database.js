const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use different database paths for development vs production
let dbPath;

if (process.env.NODE_ENV === 'production') {
    // In production, use a persistent location
    dbPath = path.join(process.cwd(), 'data', 'finance.db');
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
} else {
    // In development, use local file
    dbPath = path.join(__dirname, 'finance.db');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        createTables();
    }
});

function createTables() {
    // Create transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT,
        category TEXT,
        type TEXT CHECK(type IN ('income', 'expense')),
        date TEXT DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        
        console.log('Table created/verified successfully');
        
        // Insert sample data only if table is empty
        db.get("SELECT COUNT(*) as count FROM transactions", (err, row) => {
            if (err) {
                console.error('Error counting transactions:', err);
                return;
            }
            
            if (row.count === 0) {
                console.log('Inserting sample data...');
                const stmt = db.prepare(
                    "INSERT INTO transactions (amount, description, category, type) VALUES (?, ?, ?, ?)"
                );
                
                const sampleData = [
                    [1000, 'Monthly Salary', 'Salary', 'income'],
                    [50, 'Groceries', 'Food', 'expense'],
                    [30, 'Uber ride', 'Transport', 'expense'],
                    [200, 'Freelance work', 'Other', 'income']
                ];
                
                sampleData.forEach(data => {
                    stmt.run(data);
                });
                
                stmt.finalize();
                console.log('Sample data inserted');
            }
        });
    });
}

module.exports = db;