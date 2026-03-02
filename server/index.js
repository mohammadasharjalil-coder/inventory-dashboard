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

// ============================================
// 50 PROFESSIONAL PRODUCTS WITH IMAGES
// ============================================

const ALL_PRODUCTS = [
  // ========== ELECTRONICS (15 items) - Blue theme ==========
  ['MacBook Pro 16"', 'Electronics', 8, 2399.99, 'https://placehold.co/400x300/2563eb/white?text=MacBook+Pro'],
  ['Dell XPS 15', 'Electronics', 12, 1899.99, 'https://placehold.co/400x300/2563eb/white?text=Dell+XPS'],
  ['Lenovo ThinkPad', 'Electronics', 15, 1499.99, 'https://placehold.co/400x300/2563eb/white?text=ThinkPad'],
  ['Microsoft Surface', 'Electronics', 7, 1299.99, 'https://placehold.co/400x300/2563eb/white?text=Surface+Pro'],
  ['iPad Air', 'Electronics', 22, 599.99, 'https://placehold.co/400x300/2563eb/white?text=iPad+Air'],
  ['Samsung Galaxy Tab', 'Electronics', 18, 649.99, 'https://placehold.co/400x300/2563eb/white?text=Galaxy+Tab'],
  ['Kindle Paperwhite', 'Electronics', 31, 139.99, 'https://placehold.co/400x300/2563eb/white?text=Kindle'],
  ['Bose QC Headphones', 'Electronics', 9, 349.99, 'https://placehold.co/400x300/2563eb/white?text=Bose+QC'],
  ['Sony WH-1000XM4', 'Electronics', 5, 379.99, 'https://placehold.co/400x300/2563eb/white?text=Sony+Headphones'],
  ['AirPods Pro', 'Electronics', 27, 249.99, 'https://placehold.co/400x300/2563eb/white?text=AirPods+Pro'],
  ['Logitech MX Master', 'Electronics', 14, 99.99, 'https://placehold.co/400x300/2563eb/white?text=MX+Master'],
  ['Keychron K2', 'Electronics', 11, 89.99, 'https://placehold.co/400x300/2563eb/white?text=Keychron+K2'],
  ['LG 34" UltraWide', 'Electronics', 4, 799.99, 'https://placehold.co/400x300/2563eb/white?text=UltraWide'],
  ['Samsung 32" 4K', 'Electronics', 6, 449.99, 'https://placehold.co/400x300/2563eb/white?text=Samsung+4K'],
  ['GoPro Hero 11', 'Electronics', 13, 399.99, 'https://placehold.co/400x300/2563eb/white?text=GoPro+Hero'],

  // ========== FURNITURE (10 items) - Purple theme ==========
  ['Herman Miller Aeron', 'Furniture', 3, 1495.99, 'https://placehold.co/400x300/9333ea/white?text=Aeron+Chair'],
  ['Steelcase Leap', 'Furniture', 5, 1299.99, 'https://placehold.co/400x300/9333ea/white?text=Steelcase+Leap'],
  ['Standing Desk', 'Furniture', 8, 699.99, 'https://placehold.co/400x300/9333ea/white?text=Standing+Desk'],
  ['Executive Desk', 'Furniture', 4, 899.99, 'https://placehold.co/400x300/9333ea/white?text=Executive+Desk'],
  ['Bookshelf - 5 Tier', 'Furniture', 11, 249.99, 'https://placehold.co/400x300/9333ea/white?text=5+Tier+Bookshelf'],
  ['File Cabinet', 'Furniture', 16, 179.99, 'https://placehold.co/400x300/9333ea/white?text=File+Cabinet'],
  ['Conference Table', 'Furniture', 2, 1299.99, 'https://placehold.co/400x300/9333ea/white?text=Conference+Table'],
  ['Guest Chair', 'Furniture', 24, 189.99, 'https://placehold.co/400x300/9333ea/white?text=Guest+Chair'],
  ['Reception Desk', 'Furniture', 2, 2199.99, 'https://placehold.co/400x300/9333ea/white?text=Reception+Desk'],
  ['Monitor Stand', 'Furniture', 37, 49.99, 'https://placehold.co/400x300/9333ea/white?text=Monitor+Stand'],

  // ========== APPLIANCES (10 items) - Red theme ==========
  ['Espresso Machine', 'Appliances', 7, 799.99, 'https://placehold.co/400x300/dc2626/white?text=Espresso'],
  ['French Press', 'Appliances', 23, 39.99, 'https://placehold.co/400x300/dc2626/white?text=French+Press'],
  ['Smart Fridge', 'Appliances', 2, 2999.99, 'https://placehold.co/400x300/dc2626/white?text=Smart+Fridge'],
  ['Induction Cooktop', 'Appliances', 6, 849.99, 'https://placehold.co/400x300/dc2626/white?text=Induction+Cooktop'],
  ['Air Fryer', 'Appliances', 14, 179.99, 'https://placehold.co/400x300/dc2626/white?text=Air+Fryer'],
  ['Instant Pot', 'Appliances', 19, 129.99, 'https://placehold.co/400x300/dc2626/white?text=Instant+Pot'],
  ['Robot Vacuum', 'Appliances', 8, 399.99, 'https://placehold.co/400x300/dc2626/white?text=Robot+Vacuum'],
  ['Air Conditioner', 'Appliances', 3, 549.99, 'https://placehold.co/400x300/dc2626/white?text=Air+Conditioner'],
  ['Humidifier', 'Appliances', 21, 79.99, 'https://placehold.co/400x300/dc2626/white?text=Humidifier'],
  ['Dehumidifier', 'Appliances', 12, 229.99, 'https://placehold.co/400x300/dc2626/white?text=Dehumidifier'],

  // ========== OFFICE SUPPLIES (8 items) - Green theme ==========
  ['Premium Notebook', 'Office Supplies', 45, 12.99, 'https://placehold.co/400x300/16a34a/white?text=Notebook'],
  ['Ballpoint Pens (50pk)', 'Office Supplies', 78, 24.99, 'https://placehold.co/400x300/16a34a/white?text=Pens'],
  ['Desk Organizer', 'Office Supplies', 34, 29.99, 'https://placehold.co/400x300/16a34a/white?text=Organizer'],
  ['Whiteboard', 'Office Supplies', 15, 89.99, 'https://placehold.co/400x300/16a34a/white?text=Whiteboard'],
  ['Cork Board', 'Office Supplies', 18, 49.99, 'https://placehold.co/400x300/16a34a/white?text=Cork+Board'],
  ['Paper Shredder', 'Office Supplies', 9, 159.99, 'https://placehold.co/400x300/16a34a/white?text=Shredder'],
  ['Laminator', 'Office Supplies', 7, 89.99, 'https://placehold.co/400x300/16a34a/white?text=Laminator'],
  ['Binding Machine', 'Office Supplies', 5, 219.99, 'https://placehold.co/400x300/16a34a/white?text=Binding'],

  // ========== STATIONERY (7 items) - Yellow theme ==========
  ['Leather Journal', 'Stationery', 22, 34.99, 'https://placehold.co/400x300/eab308/white?text=Leather+Journal'],
  ['Fountain Pen Set', 'Stationery', 16, 89.99, 'https://placehold.co/400x300/eab308/white?text=Fountain+Pen'],
  ['Watercolor Set', 'Stationery', 13, 49.99, 'https://placehold.co/400x300/eab308/white?text=Watercolor'],
  ['Sketchbook A4', 'Stationery', 28, 19.99, 'https://placehold.co/400x300/eab308/white?text=Sketchbook'],
  ['Marker Set', 'Stationery', 31, 29.99, 'https://placehold.co/400x300/eab308/white?text=Markers'],
  ['Washi Tape Set', 'Stationery', 42, 14.99, 'https://placehold.co/400x300/eab308/white?text=Washi+Tape'],
  ['Sticky Notes Pack', 'Stationery', 67, 9.99, 'https://placehold.co/400x300/eab308/white?text=Sticky+Notes']
];

console.log(`📦 Loaded ${ALL_PRODUCTS.length} professional products`);

// Database initialization and migration (with clean slate)
db.serialize(() => {
  // Drop existing table to start fresh (ensures no old products)
  db.run(`DROP TABLE IF EXISTS products`, (dropErr) => {
    if (dropErr) {
      console.error('Error dropping table:', dropErr);
    } else {
      console.log('🗑️  Removed old products table');
      
      // Create fresh products table
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
      `, (createErr) => {
        if (createErr) {
          console.error('Error creating table:', createErr);
        } else {
          console.log('✅ Created new products table');
          
          // Insert all 50 products
          const stmt = db.prepare('INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)');
          
          ALL_PRODUCTS.forEach((product, index) => {
            stmt.run(product[0], product[1], product[2], product[3], product[4], function(insertErr) {
              if (insertErr) {
                console.error(`Error inserting ${product[0]}:`, insertErr);
              } else if (index === ALL_PRODUCTS.length - 1) {
                console.log(`✅ Successfully inserted ${ALL_PRODUCTS.length} fresh products`);
              }
            });
          });
          
          stmt.finalize();
        }
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
      tempDb.all("SELECT category, COUNT(*) as count FROM products GROUP BY category", (catErr, categories) => {
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
            categories: categories || [],
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
});

// Reset database endpoint (admin only - remove in production)
app.get('/api/reset', (req, res) => {
  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS products`, () => {
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
      `, () => {
        const stmt = db.prepare('INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)');
        
        ALL_PRODUCTS.forEach(product => {
          stmt.run(product[0], product[1], product[2], product[3], product[4]);
        });
        
        stmt.finalize();
        
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
          res.json({ 
            success: true, 
            message: 'Database reset complete',
            productCount: row ? row.count : 0,
            timestamp: new Date().toISOString()
          });
        });
      });
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
  console.log(`📦 Categories: Electronics, Furniture, Appliances, Office Supplies, Stationery`);
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