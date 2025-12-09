// State management
let products = [];
let currentEditId = null;
let deleteProductId = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupEventListeners();
});

// Trigger confetti animation
function triggerConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
    }));
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
    }));
  }, 250);
}

// Setup event listeners
function setupEventListeners() {
  // Add product button
  addProductBtn.addEventListener('click', () => {
    openModal();
  });

  // Confetti button
  document.getElementById('confettiBtn').addEventListener('click', () => {
    triggerConfetti();
  });

  // Close modal buttons
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeModals();
    });
  });

  // Cancel buttons
  document.getElementById('cancelBtn').addEventListener('click', closeModals);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeModals);

  // Form submit
  productForm.addEventListener('submit', handleFormSubmit);

  // Delete confirm
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

  // Search and filter
  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);

  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target === productModal || e.target === deleteModal) {
      closeModals();
    }
  });
}

// Load products from API
async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    products = data.products || [];
    displayProducts(products);
    updateStats();
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('Failed to load products', 'error');
  } finally {
    showLoading(false);
  }
}

// Display products in grid
function displayProducts(productsToDisplay) {
  productsGrid.innerHTML = '';
  
  if (productsToDisplay.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  productsToDisplay.forEach(product => {
    const card = createProductCard(product);
    productsGrid.appendChild(card);
  });
}

// Create product card HTML
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  const quantityClass = product.quantity === 0 ? 'out-of-stock' : 
                       product.quantity < 10 ? 'low-stock' : '';
  
  card.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/150/999999/ffffff?text=No+Image'">
    <div class="product-info">
      <div class="product-header">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <span class="product-category">${product.category}</span>
        </div>
      </div>
      <p class="product-description">${product.description || 'No description available'}</p>
      <div class="product-details">
        <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
        <div class="product-quantity">
          <span class="quantity-label">Stock:</span>
          <span class="quantity-value ${quantityClass}">${product.quantity}</span>
        </div>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="updateQuantity(${product.id}, ${product.quantity - 1})" ${product.quantity === 0 ? 'disabled' : ''}>−</button>
        <input type="number" class="quantity-input" value="${product.quantity}" 
               onchange="updateQuantity(${product.id}, this.value)" min="0">
        <button class="quantity-btn" onclick="updateQuantity(${product.id}, ${product.quantity + 1})">+</button>
      </div>
      <div class="product-actions">
        <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">✏️ Edit</button>
        <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Update product quantity
async function updateQuantity(productId, newQuantity) {
  if (isNaN(newQuantity) || newQuantity < 0) {
    showNotification('Quantity cannot be negative', 'error');
    return;
  }
  
  newQuantity = parseInt(newQuantity);
  
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        quantity: newQuantity
      })
    });
    
    if (response.ok) {
      await loadProducts();
      showNotification('Quantity updated successfully', 'success');
    } else {
      throw new Error('Failed to update quantity');
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    showNotification('Failed to update quantity', 'error');
  }
}

// Open modal for adding/editing
function openModal(product = null) {
  currentEditId = product ? product.id : null;
  
  document.getElementById('modalTitle').textContent = 
    product ? 'Edit Product' : 'Add New Product';
  
  if (product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image_url || '';
  } else {
    productForm.reset();
  }
  
  productModal.classList.add('show');
}

// Close all modals
function closeModals() {
  productModal.classList.remove('show');
  deleteModal.classList.remove('show');
  productForm.reset();
  currentEditId = null;
  deleteProductId = null;
}

// Handle form submit
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('productName').value.trim(),
    description: document.getElementById('productDescription').value.trim(),
    price: parseFloat(document.getElementById('productPrice').value),
    quantity: parseInt(document.getElementById('productQuantity').value),
    category: document.getElementById('productCategory').value,
    image_url: document.getElementById('productImage').value.trim() || 
               'https://via.placeholder.com/150/999999/ffffff?text=Product'
  };
  
  try {
    const url = currentEditId ? `/api/products/${currentEditId}` : '/api/products';
    const method = currentEditId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      await loadProducts();
      closeModals();
      showNotification(
        currentEditId ? 'Product updated successfully' : 'Product added successfully',
        'success'
      );
    } else {
      throw new Error('Failed to save product');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('Failed to save product', 'error');
  }
}

// Edit product
function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    openModal(product);
  }
}

// Delete product
function deleteProduct(productId) {
  deleteProductId = productId;
  deleteModal.classList.add('show');
}

// Confirm delete
async function confirmDelete() {
  if (!deleteProductId) return;
  
  try {
    const response = await fetch(`/api/products/${deleteProductId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadProducts();
      closeModals();
      showNotification('Product deleted successfully', 'success');
    } else {
      throw new Error('Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Failed to delete product', 'error');
  }
}

// Filter products
function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  
  let filtered = products;
  
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
  }
  
  if (selectedCategory) {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }
  
  displayProducts(filtered);
}

// Update statistics
function updateStats() {
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
}

// Show/hide loading spinner
function showLoading(show) {
  loadingSpinner.style.display = show ? 'block' : 'none';
  productsGrid.style.display = show ? 'none' : 'grid';
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
