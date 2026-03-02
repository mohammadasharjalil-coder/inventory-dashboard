const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

const newProducts = [
  // Electronics (10 items)
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

  // Furniture (6 items)
  ['Bookshelf', 'Furniture', 11, 189.99, 'https://placehold.co/400x300/16a34a/white?text=Bookshelf'],
  ['Floor Lamp', 'Furniture', 24, 79.99, 'https://placehold.co/400x300/9333ea/white?text=Floor+Lamp'],
  ['Coffee Table', 'Furniture', 6, 159.99, 'https://placehold.co/400x300/dc2626/white?text=Coffee+Table'],
  ['TV Stand', 'Furniture', 4, 219.99, 'https://placehold.co/400x300/eab308/white?text=TV+Stand'],
  ['Wardrobe', 'Furniture', 2, 449.99, 'https://placehold.co/400x300/0891b2/white?text=Wardrobe'],
  ['Nightstand', 'Furniture', 13, 89.99, 'https://placehold.co/400x300/2563eb/white?text=Nightstand'],

  // Appliances (6 items)
  ['Microwave Oven', 'Appliances', 9, 149.99, 'https://placehold.co/400x300/7c3aed/white?text=Microwave'],
  ['Refrigerator', 'Appliances', 2, 799.99, 'https://placehold.co/400x300/16a34a/white?text=Refrigerator'],
  ['Air Purifier', 'Appliances', 7, 179.99, 'https://placehold.co/400x300/9333ea/white?text=Air+Purifier'],
  ['Electric Kettle', 'Appliances', 31, 39.99, 'https://placehold.co/400x300/dc2626/white?text=Kettle'],
  ['Toaster', 'Appliances', 18, 49.99, 'https://placehold.co/400x300/eab308/white?text=Toaster'],
  ['Blender', 'Appliances', 12, 69.99, 'https://placehold.co/400x300/0891b2/white?text=Blender'],

  // Stationery (4 items)
  ['Ballpoint Pens (Pack)', 'Stationery', 67, 12.99, 'https://placehold.co/400x300/2563eb/white?text=Pens'],
  ['Desk Organizer', 'Stationery', 23, 24.99, 'https://placehold.co/400x300/7c3aed/white?text=Desk+Organizer'],
  ['Whiteboard', 'Stationery', 8, 34.99, 'https://placehold.co/400x300/16a34a/white?text=Whiteboard'],
  ['Paper Clips (Box)', 'Stationery', 42, 5.99, 'https://placehold.co/400x300/9333ea/white?text=Paper+Clips']
];

console.log(`Adding ${newProducts.length} new products...`);

db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  const stmt = db.prepare('INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)');
  
  newProducts.forEach(product => {
    stmt.run(product[0], product[1], product[2], product[3], product[4], function(err) {
      if (err) {
        console.error(`Error adding ${product[0]}:`, err);
      }
    });
  });
  
  stmt.finalize();

  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing:', err);
    } else {
      console.log(`\n✅ Successfully added ${newProducts.length} new products!`);
      
      // Show total count
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        console.log(`📊 Total products in inventory: ${row.count}`);
        db.close();
      });
    }
  });
});