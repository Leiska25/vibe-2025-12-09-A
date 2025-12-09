const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/api/', limiter);

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
          // Populate with 20 sample products for diving equipment store
          const sampleProducts = [
            { name: 'Competition Swimsuit - Women', description: 'Professional racing swimsuit with hydrodynamic design', price: 89.99, quantity: 45, category: 'Swimwear', image_url: 'https://via.placeholder.com/150/0088cc/ffffff?text=Women+Suit' },
            { name: 'Competition Swimsuit - Men', description: 'High-performance racing brief for competitive diving', price: 79.99, quantity: 38, category: 'Swimwear', image_url: 'https://via.placeholder.com/150/0088cc/ffffff?text=Men+Suit' },
            { name: 'Microfiber Towel Large', description: 'Quick-dry microfiber towel 30x60 inches', price: 24.99, quantity: 120, category: 'Towels', image_url: 'https://via.placeholder.com/150/00ccaa/ffffff?text=Large+Towel' },
            { name: 'Microfiber Towel Medium', description: 'Compact microfiber towel 20x40 inches', price: 18.99, quantity: 150, category: 'Towels', image_url: 'https://via.placeholder.com/150/00ccaa/ffffff?text=Medium+Towel' },
            { name: 'Pool Sandals - Adult', description: 'Non-slip pool sandals with arch support', price: 29.99, quantity: 85, category: 'Footwear', image_url: 'https://via.placeholder.com/150/ff8800/ffffff?text=Sandals' },
            { name: 'Pool Sandals - Youth', description: 'Comfortable non-slip sandals for young divers', price: 22.99, quantity: 67, category: 'Footwear', image_url: 'https://via.placeholder.com/150/ff8800/ffffff?text=Youth+Sandals' },
            { name: 'Diving Board - 1 Meter', description: 'Professional springboard with aluminum stand', price: 1299.99, quantity: 8, category: 'Equipment', image_url: 'https://via.placeholder.com/150/cc0066/ffffff?text=1M+Board' },
            { name: 'Diving Board - 3 Meter', description: 'Competition-grade 3-meter springboard', price: 1899.99, quantity: 5, category: 'Equipment', image_url: 'https://via.placeholder.com/150/cc0066/ffffff?text=3M+Board' },
            { name: 'Platform Diving Board', description: '5-meter platform diving board', price: 2499.99, quantity: 3, category: 'Equipment', image_url: 'https://via.placeholder.com/150/cc0066/ffffff?text=Platform' },
            { name: 'Swim Cap - Silicone', description: 'Durable silicone swim cap in multiple colors', price: 12.99, quantity: 200, category: 'Accessories', image_url: 'https://via.placeholder.com/150/6600cc/ffffff?text=Swim+Cap' },
            { name: 'Goggles - Competition', description: 'Anti-fog racing goggles with UV protection', price: 34.99, quantity: 95, category: 'Accessories', image_url: 'https://via.placeholder.com/150/6600cc/ffffff?text=Goggles' },
            { name: 'Nose Clip', description: 'Professional nose clip for synchronized diving', price: 8.99, quantity: 180, category: 'Accessories', image_url: 'https://via.placeholder.com/150/6600cc/ffffff?text=Nose+Clip' },
            { name: 'Training Fins', description: 'Short training fins for technique improvement', price: 44.99, quantity: 52, category: 'Training', image_url: 'https://via.placeholder.com/150/009900/ffffff?text=Fins' },
            { name: 'Kickboard', description: 'Foam kickboard for diving practice', price: 19.99, quantity: 75, category: 'Training', image_url: 'https://via.placeholder.com/150/009900/ffffff?text=Kickboard' },
            { name: 'Diving Robe', description: 'Absorbent microfiber changing robe', price: 54.99, quantity: 42, category: 'Apparel', image_url: 'https://via.placeholder.com/150/0088cc/ffffff?text=Robe' },
            { name: 'Team Backpack', description: 'Waterproof backpack with multiple compartments', price: 49.99, quantity: 68, category: 'Bags', image_url: 'https://via.placeholder.com/150/333333/ffffff?text=Backpack' },
            { name: 'Mesh Gear Bag', description: 'Large mesh bag for wet equipment', price: 24.99, quantity: 110, category: 'Bags', image_url: 'https://via.placeholder.com/150/333333/ffffff?text=Mesh+Bag' },
            { name: 'Chamois Towel', description: 'Super-absorbent synthetic chamois towel', price: 16.99, quantity: 88, category: 'Towels', image_url: 'https://via.placeholder.com/150/00ccaa/ffffff?text=Chamois' },
            { name: 'Dive Log Book', description: 'Waterproof log book for recording dives', price: 14.99, quantity: 45, category: 'Accessories', image_url: 'https://via.placeholder.com/150/6600cc/ffffff?text=Log+Book' },
            { name: 'Ear Plugs - Swimming', description: 'Moldable silicone ear plugs for water protection', price: 9.99, quantity: 165, category: 'Accessories', image_url: 'https://via.placeholder.com/150/6600cc/ffffff?text=Ear+Plugs' }
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
