const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

// Reliable image URLs (using placeholder images that always work)
const imageUpdates = [
  {
    name: 'Laptop Pro',
    url: 'https://placehold.co/400x300/2563eb/white?text=Laptop+Pro'
  },
  {
    name: 'Wireless Mouse',
    url: 'https://placehold.co/400x300/16a34a/white?text=Wireless+Mouse'
  },
  {
    name: 'Office Desk',
    url: 'https://placehold.co/400x300/9333ea/white?text=Office+Desk'
  },
  {
    name: 'Coffee Maker',
    url: 'https://placehold.co/400x300/dc2626/white?text=Coffee+Maker'
  },
  {
    name: 'Notebook Set',
    url: 'https://placehold.co/400x300/eab308/white?text=Notebook+Set'
  },
  {
    name: 'Desk Chair',
    url: 'https://placehold.co/400x300/0891b2/white?text=Desk+Chair'
  },
  {
    name: 'Monitor 27"',
    url: 'https://placehold.co/400x300/7c3aed/white?text=27"+Monitor'
  }
];

console.log('Fixing product images...');

db.serialize(() => {
  // Start transaction
  db.run('BEGIN TRANSACTION');

  imageUpdates.forEach(product => {
    db.run(
      'UPDATE products SET image_url = ? WHERE name = ?',
      [product.url, product.name],
      function(err) {
        if (err) {
          console.error(`Error updating ${product.name}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Updated: ${product.name}`);
        } else {
          console.log(`❌ Not found: ${product.name}`);
        }
      }
    );
  });

  // Commit transaction
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing transaction:', err);
    } else {
      console.log('\n✅ All images updated successfully!');
      
      // Show all products with their new image URLs
      db.all('SELECT name, image_url FROM products', (err, rows) => {
        if (err) {
          console.error('Error fetching products:', err);
        } else {
          console.log('\nCurrent product images:');
          rows.forEach(row => {
            console.log(`${row.name}: ${row.image_url}`);
          });
        }
        db.close();
      });
    }
  });
});