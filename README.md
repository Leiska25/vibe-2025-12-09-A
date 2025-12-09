# Inventory Management System

A modern, easy-to-use web application for managing retail store inventory. Browse, add, delete, and update product quantities with a clean and intuitive interface.

## Features

- 📦 **Product Management**: Add, edit, and delete products
- 🔢 **Quantity Control**: Quick increment/decrement buttons and manual input
- 🔍 **Search & Filter**: Find products by name, description, or category
- 📊 **Statistics Dashboard**: View total products, items, and inventory value
- 💾 **Local Database**: SQLite database pre-populated with 20 sample products
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Technologies Used

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **UI Design**: Modern, clean interface with CSS Grid and Flexbox

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Leiska25/vibe-2025-12-09-A.git
cd vibe-2025-12-09-A
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Browse Products
- View all products in a grid layout
- Each product card shows image, name, category, description, price, and stock quantity
- Color-coded stock indicators (red for out of stock, yellow for low stock)

### Add New Product
1. Click the "+ Add New Product" button
2. Fill in the product details:
   - Name (required)
   - Description
   - Price (required)
   - Quantity (required)
   - Category
   - Image URL
3. Click "Save Product"

### Edit Product
1. Click the "Edit" button on any product card
2. Modify the desired fields
3. Click "Save Product"

### Update Quantity
- Use the +/- buttons for quick adjustments
- Or directly type a new quantity in the input field

### Delete Product
1. Click the "Delete" button on any product card
2. Confirm the deletion in the modal

### Search & Filter
- Use the search box to find products by name or description
- Use the category dropdown to filter by specific categories

## Database

The application uses SQLite3 for data persistence. On first run, it automatically:
- Creates the `products` table
- Populates it with 20 sample products across various categories:
  - Electronics (monitors, keyboards, mice, etc.)
  - Accessories (cables, stands, hubs)
  - Office supplies (lamps, organizers, staplers)
  - Stationery (notebooks, pens, sticky notes)

The database file (`inventory.db`) is created automatically in the root directory and is excluded from version control via `.gitignore`.

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Project Structure

```
vibe-2025-12-09-A/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles
│   └── app.js          # Frontend JavaScript
├── server.js           # Express server and API
├── package.json        # Dependencies and scripts
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Development

The app is designed to be simple and easy to modify:
- All frontend code is in the `public/` directory
- Backend API is in `server.js`
- No build process required - just edit and refresh

## License

MIT
