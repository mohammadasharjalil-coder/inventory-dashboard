const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, 'db', 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// After database connection, ensure tables exist
db.serialize(() => {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", (err, table) => {
    if (err) {
      console.error("Error checking database:", err);
    } else if (!table) {
      console.log("Database empty. Running setup...");
      
      // Create products table
      db.run(`
        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          stock INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert sample data
      const sampleProducts = [
        ['Laptop Pro', 'Electronics', 12, 1299.99, 'https://placehold.co/400x300/2563eb/white?text=Laptop+Pro'],
        ['Wireless Mouse', 'Electronics', 3, 29.99, 'https://placehold.co/400x300/16a34a/white?text=Wireless+Mouse'],
        ['Office Desk', 'Furniture', 2, 449.99, 'https://placehold.co/400x300/9333ea/white?text=Office+Desk'],
        ['Coffee Maker', 'Appliances', 8, 89.99, 'https://placehold.co/400x300/dc2626/white?text=Coffee+Maker'],
        ['Notebook Set', 'Stationery', 15, 12.99, 'https://placehold.co/400x300/eab308/white?text=Notebook+Set'],
        ['Desk Chair', 'Furniture', 4, 299.99, 'https://placehold.co/400x300/0891b2/white?text=Desk+Chair'],
        ['Monitor 27"', 'Electronics', 6, 349.99, 'https://placehold.co/400x300/7c3aed/white?text=27"+Monitor']
      ];

      const stmt = db.prepare('INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)');
      
      sampleProducts.forEach(product => {
        stmt.run(product[0], product[1], product[2], product[3], product[4]);
      });
      
      stmt.finalize();
      console.log("Database initialized with sample data!");
    } else {
      console.log("Database already exists with tables");
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products';
  const params = [];

  if (search || category) {
    query += ' WHERE 1=1';
    
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
  }
  
  query += ' ORDER BY name';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Failed to fetch products' });
      return;
    }
    res.json(rows);
  });
});

// Update product stock
app.patch('/api/products/:id/stock', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: 'Valid stock quantity required' });
  }

  db.run(
    'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [stock, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Get categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Add this debug endpoint to help diagnose issues
app.get('/api/debug', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'db', 'inventory.db');
  
  // Check if database file exists
  let dbExists = false;
  let dbStats = null;
  try {
    dbExists = fs.existsSync(dbPath);
    if (dbExists) {
      dbStats = fs.statSync(dbPath);
    }
  } catch (err) {
    console.error('Error checking database file:', err);
  }

  // Get database tables
  const sqlite3 = require('sqlite3').verbose();
  const tempDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database for debug:', err);
    }
  });

  tempDb.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    // Get product count if products table exists
    if (!err && tables && tables.some(t => t.name === 'products')) {
      tempDb.get("SELECT COUNT(*) as count FROM products", (countErr, result) => {
        const debug = {
          server: {
            status: 'running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
          },
          database: {
            path: dbPath,
            exists: dbExists,
            fileSize: dbStats ? dbStats.size : null,
            lastModified: dbStats ? dbStats.mtime : null,
            tables: tables,
            productCount: result ? result.count : 0,
            error: err ? err.message : null
          },
          environment: {
            node_env: process.env.NODE_ENV,
            port: process.env.PORT,
            cors_origin: process.env.CORS_ORIGIN,
            db_path: process.env.DB_PATH
          },
          system: {
            cwd: process.cwd(),
            dirname: __dirname,
            platform: process.platform,
            node_version: process.version
          }
        };
        res.json(debug);
        tempDb.close();
      });
    } else {
      const debug = {
        server: {
          status: 'running',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        },
        database: {
          path: dbPath,
          exists: dbExists,
          fileSize: dbStats ? dbStats.size : null,
          lastModified: dbStats ? dbStats.mtime : null,
          tables: tables || [],
          error: err ? err.message : 'No tables found'
        },
        environment: {
          node_env: process.env.NODE_ENV,
          port: process.env.PORT,
          cors_origin: process.env.CORS_ORIGIN,
          db_path: process.env.DB_PATH
        },
        system: {
          cwd: process.cwd(),
          dirname: __dirname,
          platform: process.platform,
          node_version: process.version
        }
      };
      res.json(debug);
      tempDb.close();
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});