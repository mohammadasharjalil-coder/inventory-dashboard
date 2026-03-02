const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

// Reliable image URLs using placeholder services
const imageUpdates = {
  'Laptop Pro': 'https://placehold.co/400x300/2563eb/white?text=Laptop+Pro',
  'Wireless Mouse': 'https://placehold.co/400x300/16a34a/white?text=Wireless+Mouse',
  'Office Desk': 'https://placehold.co/400x300/9333ea/white?text=Office+Desk',
  'Coffee Maker': 'https://placehold.co/400x300/dc2626/white?text=Coffee+Maker',
  'Notebook Set': 'https://placehold.co/400x300/eab308/white?text=Notebook+Set',
  'Desk Chair': 'https://placehold.co/400x300/0891b2/white?text=Desk+Chair',
  'Monitor 27"': 'https://placehold.co/400x300/7c3aed/white?text=27"+Monitor'
};

console.log('Updating product images...');

db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  Object.entries(imageUpdates).forEach(([productName, imageUrl]) => {
    db.run(
      'UPDATE products SET image_url = ? WHERE name = ?',
      [imageUrl, productName],
      function(err) {
        if (err) {
          console.error(`Error updating ${productName}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Updated: ${productName}`);
        }
      }
    );
  });

  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing:', err);
    } else {
      console.log('\n✅ All images updated successfully!');
    }
    db.close();
  });
});