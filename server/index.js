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
// Ensure db directory exists
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created db directory');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Complete list of all products
const ALL_PRODUCTS = [
  // Original 7 products
  ['Laptop Pro', 'Electronics', 12, 1299.99, 'https://placehold.co/400x300/2563eb/white?text=Laptop+Pro'],
  ['Wireless Mouse', 'Electronics', 3, 29.99, 'https://placehold.co/400x300/16a34a/white?text=Wireless+Mouse'],
  ['Office Desk', 'Furniture', 2, 449.99, 'https://placehold.co/400x300/9333ea/white?text=Office+Desk'],
  ['Coffee Maker', 'Appliances', 8, 89.99, 'https://placehold.co/400x300/dc2626/white?text=Coffee+Maker'],
  ['Notebook Set', 'Stationery', 15, 12.99, 'https://placehold.co/400x300/eab308/white?text=Notebook+Set'],
  ['Desk Chair', 'Furniture', 4, 299.99, 'https://placehold.co/400x300/0891b2/white?text=Desk+Chair'],
  ['Monitor 27"', 'Electronics', 6, 349.99, 'https://placehold.co/400x300/7c3aed/white?text=27"+Monitor'],
  
  // Electronics (10 new)
  ['Smartphone Galaxy', 'Electronics', 15, 699.99, 'https://placehold.co/400x300/2563eb/white?text=Smartphone'],
  ['iPad Pro', 'Electronics', 8, 899.99, 'https://placehold.co/400x300/7c3aed/white?text=iPad+Pro'],
  ['Bluetooth Speaker', 'Electronics', 22, 79.99, 'https://placehold.co/400x300/16a34a/white?text=Speaker'],
  ['USB-C Hub', 'Electronics', 45, 39.99, 'https://placehold.co/400x300/dc2626/white?text=USB+Hub'],
  ['External SSD 1TB', 'Electronics', 12, 129.99, 'https://placehold.co/400x300/9333ea/white?text=SSD'],
  ['Webcam 4K', 'Electronics', 7, 89.99, 'https://placehold.co/400x300/eab308/white?text=Webcam'],
  ['Gaming Keyboard', 'Electronics', 18, 149.99, 'https://placehold.co/400x300/0891b2/white?text=Keyboard'],
  ['Noise Cancelling Headphones', 'Electronics', 5, 249.99, 'https://placehold.co/400x300/dc2626/white?text=Headphones'],
  ['Smart Watch', 'Electronics', 9, 199.99, 'https://placehold.co/400x300/2563eb/white?text=Smart+Watch'],
  ['Drone', 'Electronics', 3, 399.99, 'https://placehold.co/400x300/7c3aed/white?text=Drone'],
  
  // Furniture (6 new)
  ['Bookshelf', 'Furniture', 11, 189.99, 'https://placehold.co/400x300/16a34a/white?text=Bookshelf'],
  ['Floor Lamp', 'Furniture', 24, 79.99, 'https://placehold.co/400x300/9333ea/white?text=Floor+Lamp'],
  ['Coffee Table', 'Furniture', 6, 159.99, 'https://placehold.co/400x300/dc2626/white?text=Coffee+Table'],
  ['TV Stand', 'Furniture', 4, 219.99, 'https://placehold.co/400x300/eab308/white?text=TV+Stand'],
  ['Wardrobe', 'Furniture', 2, 449.99, 'https://placehold.co/400x300/0891b2/white?text=Wardrobe'],
  ['Nightstand', 'Furniture', 13, 89.99, 'https://placehold.co/400x300/2563eb/white?text=Nightstand'],
  
  // Appliances (6 new)
  ['Microwave Oven', 'Appliances', 9, 149.99, 'https://placehold.co/400x300/7c3aed/white?text=Microwave'],
  ['Refrigerator', 'Appliances', 2, 799.99, 'https://placehold.co/400x300/16a34a/white?text=Refrigerator'],
  ['Air Purifier', 'Appliances', 7, 179.99, 'https://placehold.co/400x300/9333ea/white?text=Air+Purifier'],
  ['Electric Kettle', 'Appliances', 31, 39.99, 'https://placehold.co/400x300/dc2626/white?text=Kettle'],
  ['Toaster', 'Appliances', 18, 49.99, 'https://placehold.co/400x300/eab308/white?text=Toaster'],
  ['Blender', 'Appliances', 12, 69.99, 'https://placehold.co/400x300/0891b2/white?text=Blender'],
  
  // Stationery (4 new)
  ['Ballpoint Pens (Pack)', 'Stationery', 67, 12.99, 'https://placehold.co/400x300/2563eb/white?text=Pens'],
  ['Desk Organizer', 'Stationery', 23, 24.99, 'https://placehold.co/400x300/7c3aed/white?text=Desk+Organizer'],
  ['Whiteboard', 'Stationery', 8, 34.99, 'https://placehold.co/400x300/16a34a/white?text=Whiteboard'],
  ['Paper Clips (Box)', 'Stationery', 42, 5.99, 'https://placehold.co/400x300/9333ea/white?text=Paper+Clips']
];

// Database initialization and migration
db.serialize(() => {
  // First, check if products table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", (err, table) => {
    if (err) {
      console.error("Error checking database:", err);
    } else if (!table) {
      console.log("📦 Database empty. Creating table and adding all products...");
      
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
      `, function(createErr) {
        if (createErr) {
          console.error("Error creating table:", createErr);
          return;
        }
        
        // Insert all products
        const stmt = db.prepare('INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)');
        
        ALL_PRODUCTS.forEach(product => {
          stmt.run(product[0], product[1], product[2], product[3], product[4]);
        });
        
        stmt.finalize();
        console.log(`✅ Database initialized with ${ALL_PRODUCTS.length} products!`);
      });
    } else {
      console.log("📊 Database exists. Checking for missing products...");
      
      // Check each product and add if missing
      let addedCount = 0;
      let processedCount = 0;
      
      ALL_PRODUCTS.forEach(product => {
        db.get('SELECT id FROM products WHERE name = ?', [product[0]], (err, row) => {
          processedCount++;
          
          if (!row) {
            // Product doesn't exist, add it
            db.run(
              'INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)',
              product,
              function(insertErr) {
                if (!insertErr) {
                  addedCount++;
                  console.log(`➕ Added missing product: ${product[0]}`);
                }
              }
            );
          }
          
          // Log summary when all products have been processed
          if (processedCount === ALL_PRODUCTS.length) {
            setTimeout(() => {
              if (addedCount > 0) {
                console.log(`✅ Migration complete: Added ${addedCount} new products`);
              } else {
                console.log(`✅ All ${ALL_PRODUCTS.length} products already exist`);
              }
            }, 500);
          }
        });
      });
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

// Get all products with optional filtering
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

// Get low stock products (stock < 5)
app.get('/api/products/low-stock', (req, res) => {
  db.all('SELECT * FROM products WHERE stock < 5 ORDER BY stock ASC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
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

// Get all unique categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Debug endpoint to check database status
app.get('/api/debug', (req, res) => {
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

  // Get database tables and product count
  const tempDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database for debug:', err);
    }
  });

  tempDb.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
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
          tables: tables || [],
          productCount: result ? result.count : 0,
          expectedProductCount: ALL_PRODUCTS.length,
          error: err ? err.message : null
        },
        environment: {
          node_env: process.env.NODE_ENV,
          port: process.env.PORT,
          cors_origin: process.env.CORS_ORIGIN,
          db_path: process.env.DB_PATH
        }
      };
      res.json(debug);
      tempDb.close();
    });
  });
});

// Migration endpoint (can be removed after use)
app.get('/api/migrate', (req, res) => {
  let added = 0;
  let existing = 0;
  let processed = 0;

  ALL_PRODUCTS.forEach(product => {
    db.get('SELECT id FROM products WHERE name = ?', [product[0]], (err, row) => {
      processed++;
      
      if (!row) {
        db.run(
          'INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)',
          product,
          function(insertErr) {
            if (!insertErr) {
              added++;
            }
          }
        );
      } else {
        existing++;
      }

      if (processed === ALL_PRODUCTS.length) {
        setTimeout(() => {
          res.json({ 
            success: true,
            message: 'Migration complete',
            added: added,
            existing: existing,
            total: ALL_PRODUCTS.length,
            timestamp: new Date().toISOString()
          });
        }, 1000);
      }
    });
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Total products configured: ${ALL_PRODUCTS.length}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});