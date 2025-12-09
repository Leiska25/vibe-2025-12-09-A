const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Create products table and populate with sample data
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    category TEXT,
    image_url TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      // Check if table is empty
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          console.error('Error checking products:', err.message);
        } else if (row.count === 0) {
          // Populate with 20 sample products
          const sampleProducts = [
            { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', price: 29.99, quantity: 45, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Mouse' },
            { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical gaming keyboard', price: 89.99, quantity: 23, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Keyboard' },
            { name: 'USB-C Cable', description: 'High-speed USB-C charging cable 6ft', price: 14.99, quantity: 120, category: 'Accessories', image_url: 'https://via.placeholder.com/150/ff6600/ffffff?text=Cable' },
            { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand', price: 39.99, quantity: 34, category: 'Accessories', image_url: 'https://via.placeholder.com/150/ff6600/ffffff?text=Stand' },
            { name: 'Webcam HD', description: '1080p HD webcam with built-in microphone', price: 59.99, quantity: 18, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Webcam' },
            { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 34.99, quantity: 67, category: 'Office', image_url: 'https://via.placeholder.com/150/00cc66/ffffff?text=Lamp' },
            { name: 'Notebook Set', description: 'Set of 3 premium lined notebooks', price: 19.99, quantity: 89, category: 'Stationery', image_url: 'https://via.placeholder.com/150/cc00cc/ffffff?text=Notebooks' },
            { name: 'Pen Pack', description: 'Pack of 12 ballpoint pens', price: 9.99, quantity: 156, category: 'Stationery', image_url: 'https://via.placeholder.com/150/cc00cc/ffffff?text=Pens' },
            { name: 'Monitor 24"', description: '24-inch Full HD LED monitor', price: 179.99, quantity: 12, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Monitor' },
            { name: 'Headphones', description: 'Noise-cancelling over-ear headphones', price: 129.99, quantity: 28, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Headphones' },
            { name: 'Phone Stand', description: 'Adjustable phone holder for desk', price: 15.99, quantity: 73, category: 'Accessories', image_url: 'https://via.placeholder.com/150/ff6600/ffffff?text=Phone+Stand' },
            { name: 'Mouse Pad', description: 'Large gaming mouse pad with smooth surface', price: 19.99, quantity: 91, category: 'Accessories', image_url: 'https://via.placeholder.com/150/ff6600/ffffff?text=Mouse+Pad' },
            { name: 'Desk Organizer', description: 'Multi-compartment desk organizer', price: 24.99, quantity: 42, category: 'Office', image_url: 'https://via.placeholder.com/150/00cc66/ffffff?text=Organizer' },
            { name: 'Wireless Charger', description: 'Fast wireless charging pad', price: 29.99, quantity: 55, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Charger' },
            { name: 'Paper Clips Box', description: 'Box of 500 paper clips', price: 5.99, quantity: 203, category: 'Stationery', image_url: 'https://via.placeholder.com/150/cc00cc/ffffff?text=Clips' },
            { name: 'Stapler', description: 'Heavy-duty desktop stapler', price: 12.99, quantity: 64, category: 'Office', image_url: 'https://via.placeholder.com/150/00cc66/ffffff?text=Stapler' },
            { name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker', price: 49.99, quantity: 31, category: 'Electronics', image_url: 'https://via.placeholder.com/150/0066cc/ffffff?text=Speaker' },
            { name: 'USB Hub', description: '4-port USB 3.0 hub', price: 22.99, quantity: 47, category: 'Accessories', image_url: 'https://via.placeholder.com/150/ff6600/ffffff?text=USB+Hub' },
            { name: 'Sticky Notes', description: 'Colorful sticky notes pack of 6', price: 8.99, quantity: 137, category: 'Stationery', image_url: 'https://via.placeholder.com/150/cc00cc/ffffff?text=Notes' },
            { name: 'Cable Management', description: 'Cable organizer clips set of 20', price: 11.99, quantity: 82, category: 'Accessories', image_url: 'https://via.placeholder.com/150/ff6600/ffffff?text=Cable+Mgmt' }
          ];

          const stmt = db.prepare('INSERT INTO products (name, description, price, quantity, category, image_url) VALUES (?, ?, ?, ?, ?, ?)');
          sampleProducts.forEach(product => {
            stmt.run(product.name, product.description, product.price, product.quantity, product.category, product.image_url);
          });
          stmt.finalize();
          console.log('Sample products added to database.');
        }
      });
    }
  });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ products: rows });
    }
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ product: row });
    }
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, quantity, category, image_url } = req.body;
  
  if (!name || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Name, price, and quantity are required' });
  }
  
  const numPrice = parseFloat(price);
  const numQuantity = parseInt(quantity);
  
  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number' });
  }
  
  if (isNaN(numQuantity) || numQuantity < 0) {
    return res.status(400).json({ error: 'Quantity must be a valid non-negative integer' });
  }

  db.run(
    'INSERT INTO products (name, description, price, quantity, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description || '', numPrice, numQuantity, category || 'General', image_url || 'https://via.placeholder.com/150/999999/ffffff?text=Product'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, message: 'Product created successfully' });
      }
    }
  );
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { name, description, price, quantity, category, image_url } = req.body;
  
  if (!name || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Name, price, and quantity are required' });
  }
  
  const numPrice = parseFloat(price);
  const numQuantity = parseInt(quantity);
  
  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number' });
  }
  
  if (isNaN(numQuantity) || numQuantity < 0) {
    return res.status(400).json({ error: 'Quantity must be a valid non-negative integer' });
  }
  
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category = ?, image_url = ? WHERE id = ?',
    [name, description, numPrice, numQuantity, category, image_url, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ message: 'Product updated successfully' });
      }
    }
  );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
