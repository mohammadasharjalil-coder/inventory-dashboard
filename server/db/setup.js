const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Drop existing tables
  db.run(`DROP TABLE IF EXISTS products`);
  
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
    ['Laptop Pro', 'Electronics', 12, 1299.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200'],
    ['Wireless Mouse', 'Electronics', 3, 29.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200'],
    ['Office Desk', 'Furniture', 2, 449.99, 'https://images.unsplash.com/photo-1518455027359-f3f8164d3e9d?w=200'],
    ['Coffee Maker', 'Appliances', 8, 89.99, 'https://images.unsplash.com/photo-1517668808822-9ebb3f2a0e15?w=200'],
    ['Notebook Set', 'Stationery', 15, 12.99, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200'],
    ['Desk Chair', 'Furniture', 4, 299.99, 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=200'],
    ['Monitor 27"', 'Electronics', 6, 349.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200']
  ];

  const stmt = db.prepare('INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)');
  
  sampleProducts.forEach(product => {
    stmt.run(product[0], product[1], product[2], product[3], product[4]);
  });
  
  stmt.finalize();

  console.log('Database setup complete!');
});

db.close();