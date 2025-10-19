// Sample product data
const products = [
  { id: 1, name: "Rice (1kg)", price: 800 },
  { id: 2, name: "Beans (1kg)", price: 600 },
  { id: 3, name: "Garri (1kg)", price: 400 },
  { id: 4, name: "Tomatoes (1kg)", price: 300 },
  { id: 5, name: "Onions (1kg)", price: 250 },
  { id: 6, name: "Bread", price: 200 },
  { id: 7, name: "Milk (1L)", price: 350 },
  { id: 8, name: "Eggs (12pcs)", price: 450 },
  { id: 9, name: "Chicken (1kg)", price: 1200 },
  { id: 10, name: "Fish (1kg)", price: 1000 }
];

// Customer management - Enhanced for persistence
let customers = [];
let currentCustomerId = null;
let customerCounter = 0;
let rowCounters = {};
const MAX_CUSTOMERS = 5;

// Function to get next available customer number (1-5)
function getNextCustomerNumber() {
  // Create array of existing customer numbers
  const existingNumbers = customers.map(c => c.customerNumber).filter(n => n);
  
  // Find first available number from 1 to MAX_CUSTOMERS
  for (let i = 1; i <= MAX_CUSTOMERS; i++) {
    if (!existingNumbers.includes(i)) {
      return i;
    }
  }
  
  // Fallback (shouldn't happen if MAX_CUSTOMERS logic works)
  return MAX_CUSTOMERS + 1;
}

// Function to check if customer has items in cart
function customerHasItems(customerId) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return false;
  
  // Check if customer has saved items
  if (customer.savedItems && customer.savedItems.length > 0) {
    return true;
  }
  
  // Check if there are rows with selected products
  const rows = document.querySelectorAll(`#tbody-${customerId} tr`);
  for (let row of rows) {
    const productSelect = row.querySelector('select');
    if (productSelect && productSelect.value) {
      return true;
    }
  }
  
  return false;
}

// Save customers to localStorage for persistence
function saveCustomersToStorage() {
  const customerData = {
    customers: customers,
    currentCustomerId: currentCustomerId,
    customerCounter: customerCounter,
    rowCounters: rowCounters
  };
  localStorage.setItem('customerSessions', JSON.stringify(customerData));
}

// Load customers from localStorage 

function loadCustomersFromStorage() {
  const stored = localStorage.getItem('customerSessions');
  if (stored) {
    const customerData = JSON.parse(stored);
    customers = customerData.customers || [];
    currentCustomerId = customerData.currentCustomerId;
    customerCounter = customerData.customerCounter || 0;
    rowCounters = customerData.rowCounters || {};

    // Recreate tabs and content for existing customers
    customers.forEach(customer => {
      createCustomerTab(customer);
      createCustomerContent(customer);
      
      // Restore customer data
      if (customer.savedItems) {
        restoreCustomerItems(customer.id, customer.savedItems);
      }
    });

    if (customers.length > 0) {
      switchToCustomer(currentCustomerId || customers[0].id);
    }
    
    updateNewCustomerButton();
    return true;
  }
  return false;
}



// Initialize with customer restoration or new customer
window.onload = function() {
  if (!loadCustomersFromStorage()) {
    addNewCustomer();
  }
};

// Add new customer function
function addNewCustomer() {
  if (customers.length >= MAX_CUSTOMERS) {
    alert(`Maximum of ${MAX_CUSTOMERS} customers allowed. Complete a transaction to add more.`);
    return;
  }

  // Get next available customer number (sequential 1-5)
  const customerNumber = getNextCustomerNumber();
  const customerId = `customer-${customerNumber}`;
  
  const customer = {
    id: customerId,
    name: `Customer ${customerNumber}`,
    customerNumber: customerNumber,
    items: [],
    subtotal: 0,
    discount: { type: 'none', amount: 0, percentage: 0 },
    total: 0,
    savedItems: [] // For persistence
  };

  customers.push(customer);
  rowCounters[customerId] = 0;

  createCustomerTab(customer);
  createCustomerContent(customer);
  switchToCustomer(customerId);
  
  updateNewCustomerButton();
  saveCustomersToStorage();
}

// Create customer tab
function createCustomerTab(customer) {
  const tabsContainer = document.getElementById('customer-tabs');
  const tab = document.createElement('div');
  tab.className = 'customer-tab';
  tab.id = `tab-${customer.id}`;
  tab.onclick = () => switchToCustomer(customer.id);
  
  tab.innerHTML = `
    <span class="tab-name">${customer.name}</span>
    <span class="item-count" id="count-${customer.id}">0</span>
    ${customers.length > 1 ? `<button class="close-tab" id="close-${customer.id}" onclick="closeCustomer('${customer.id}', event)">×</button>` : ''}
  `;
  
  tabsContainer.appendChild(tab);
}

// Create customer content
function createCustomerContent(customer) {
  const container = document.querySelector('.sales-container');
  const content = document.createElement('div');
  content.className = 'customer-content';
  content.id = `content-${customer.id}`;
  
  content.innerHTML = `
    <div class="form-header">
      <h3 class="form-title">Transaction - ${customer.name}</h3>
      <div class="customer-info">
        <input type="text" class="customer-name-input" placeholder="Customer Name (Optional)" 
                value="${customer.customName || ''}" onchange="updateCustomerName('${customer.id}', this.value)">
      </div>
    </div>

    <div class="table-container">
      <table class="sales-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="tbody-${customer.id}">
          <!-- Product rows will be added here -->
        </tbody>
      </table>

      <button class="add-product-btn" onclick="addProductRow('${customer.id}')">
        <span>+</span> Add Product
      </button>
    </div>

    <div class="form-footer">
      <div class="discount-section">
        <div class="discount-title">Apply Discount</div>
        <div class="discount-options" id="discount-options-${customer.id}">
          <div class="discount-option active" data-discount="none">
            <input type="radio" name="discount-${customer.id}" value="none" checked>
            <span class="discount-label">No Discount</span>
            <span class="discount-value">0%</span>
          </div>
          <div class="discount-option" data-discount="volume">
            <input type="radio" name="discount-${customer.id}" value="volume">
            <span class="discount-label">Volume Discount (10+ items)</span>
            <span class="discount-value">5%</span>
          </div>
          <div class="discount-option" data-discount="bulk">
            <input type="radio" name="discount-${customer.id}" value="bulk">
            <span class="discount-label">Bulk Purchase (₦5000+)</span>
            <span class="discount-value">3%</span>
          </div>
          <div class="discount-option" data-discount="premium">
            <input type="radio" name="discount-${customer.id}" value="premium">
            <span class="discount-label">Premium Customer (₦10000+)</span>
            <span class="discount-value">7%</span>
          </div>
          <div class="discount-option" data-discount="custom">
            <input type="radio" name="discount-${customer.id}" value="custom">
            <span class="discount-label">Custom Discount</span>
            <div class="custom-discount">
              <input type="number" min="0" max="50" placeholder="%" id="custom-${customer.id}" 
                      onchange="handleCustomDiscount('${customer.id}', this.value)">
              <span>%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="totals-section">
        <div class="subtotal">Subtotal: <span id="subtotal-${customer.id}">₦0.00</span></div>
        <div class="discount-applied" id="discount-display-${customer.id}">
          Discount: -<span id="discount-amount-${customer.id}">₦0.00</span>
        </div>
        <div class="total-amount" id="total-${customer.id}">₦0.00</div>
        <button class="checkout-btn" onclick="proceedToCheckout('${customer.id}')">
          Proceed to Checkout
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(content);
  
  // Add event listeners for discount options
  setupDiscountEventListeners(customer.id);
  
  // Add initial product row if no saved items
  if (!customer.savedItems || customer.savedItems.length === 0) {
    addProductRow(customer.id);
  }
}

// Setup discount event listeners
function setupDiscountEventListeners(customerId) {
  const discountOptions = document.querySelectorAll(`#discount-options-${customerId} .discount-option`);
  discountOptions.forEach(option => {
    option.addEventListener('click', function() {
      const discountType = this.getAttribute('data-discount');
      selectDiscount(customerId, discountType, this);
    });
  });
}

// Switch to customer
function switchToCustomer(customerId) {
  // Update tabs
  document.querySelectorAll('.customer-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.getElementById(`tab-${customerId}`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Update content
  document.querySelectorAll('.customer-content').forEach(content => {
    content.classList.remove('active');
  });
  const activeContent = document.getElementById(`content-${customerId}`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
  
  currentCustomerId = customerId;
  saveCustomersToStorage();
}

// Close customer - UPDATED WITH PROTECTION
function closeCustomer(customerId, event) {
  event.stopPropagation();
  
  // Check if customer has items in cart
  if (customerHasItems(customerId)) {
    alert('Cannot close this tab. Customer has items in their cart.\n\nPlease complete the transaction or remove all items first.');
    return;
  }

  // Remove from customers array
  customers = customers.filter(c => c.id !== customerId);
  
  // Remove tab and content
  const tab = document.getElementById(`tab-${customerId}`);
  const content = document.getElementById(`content-${customerId}`);
  if (tab) tab.remove();
  if (content) content.remove();
  
  // Switch to first available customer
  if (customers.length > 0) {
    switchToCustomer(customers[0].id);
  } else {
    addNewCustomer();
  }
  
  updateNewCustomerButton();
  saveCustomersToStorage();
}

// Update new customer button
function updateNewCustomerButton() {
  const btn = document.getElementById('new-customer-btn');
  if (customers.length >= MAX_CUSTOMERS) {
    btn.disabled = true;
    btn.innerHTML = '<span>📋</span> Max Customers (5)';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<span>+</span> New Customer';
  }
}

// Update customer name
function updateCustomerName(customerId, name) {
  const customer = customers.find(c => c.id === customerId);
  if (customer) {
    customer.customName = name;
    const displayName = name || `Customer ${customer.customerNumber}`;
    customer.name = displayName;
    
    const tabName = document.querySelector(`#tab-${customerId} .tab-name`);
    const formTitle = document.querySelector(`#content-${customerId} .form-title`);
    
    if (tabName) tabName.textContent = displayName;
    if (formTitle) formTitle.textContent = `Transaction - ${displayName}`;
    
    saveCustomersToStorage();
  }
}

// Create product options
function createProductOptions() {
  let options = '<option value="">Select a product...</option>';
  products.forEach(product => {
    options += `<option value="${product.id}" data-price="${product.price}">${product.name} - ₦${product.price.toFixed(2)}</option>`;
  });
  return options;
}

// Add product row
function addProductRow(customerId) {
  if (!rowCounters[customerId]) {
    rowCounters[customerId] = 0;
  }
  
  rowCounters[customerId]++;
  const rowId = rowCounters[customerId];
  const tbody = document.getElementById(`tbody-${customerId}`);
  
  if (!tbody) return;
  
  const newRow = document.createElement('tr');
  newRow.id = `row-${customerId}-${rowId}`;
  newRow.innerHTML = `
    <td>
      <select onchange="selectProduct('${customerId}', ${rowId}, this)" id="product-${customerId}-${rowId}">
        ${createProductOptions()}
      </select>
    </td>
    <td>
      <input type="number" value="1" min="1" id="quantity-${customerId}-${rowId}" 
              onchange="updateRowTotal('${customerId}', ${rowId})" />
    </td>
    <td>
      <span class="price-display" id="price-${customerId}-${rowId}">₦0.00</span>
    </td>
    <td>
      <span class="total-display" id="total-${customerId}-${rowId}">₦0.00</span>
    </td>
    <td>
      <button class="remove-btn" onclick="removeRow('${customerId}', ${rowId})">Remove</button>
    </td>
  `;
  
  tbody.appendChild(newRow);
  saveCustomersToStorage();
}

// Select product
function selectProduct(customerId, rowId, selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
  
  const priceDisplay = document.getElementById(`price-${customerId}-${rowId}`);
  const quantityInput = document.getElementById(`quantity-${customerId}-${rowId}`);
  
  if (priceDisplay) {
    priceDisplay.textContent = `₦${price.toFixed(2)}`;
  }
  if (quantityInput) {
    quantityInput.value = 1;
  }
  
  updateRowTotal(customerId, rowId);
  saveCustomersToStorage();
}

// Update row total
function updateRowTotal(customerId, rowId) {
  const quantityInput = document.getElementById(`quantity-${customerId}-${rowId}`);
  const priceDisplay = document.getElementById(`price-${customerId}-${rowId}`);
  const totalDisplay = document.getElementById(`total-${customerId}-${rowId}`);
  
  if (!quantityInput || !priceDisplay || !totalDisplay) return;
  
  const quantity = parseInt(quantityInput.value) || 0;
  const price = parseFloat(priceDisplay.textContent.replace('₦', '').replace(',', '')) || 0;
  const total = quantity * price;
  
  totalDisplay.textContent = `₦${total.toFixed(2)}`;
  
  calculateTotals(customerId);
  saveCustomersToStorage();
}

// Remove row
function removeRow(customerId, rowId) {
  const row = document.getElementById(`row-${customerId}-${rowId}`);
  if (row) {
    row.remove();
    calculateTotals(customerId);
    saveCustomersToStorage();
  }
}

// Select discount - FIXED VERSION
function selectDiscount(customerId, discountType, optionElement) {
  // Update visual selection
  document.querySelectorAll(`#discount-options-${customerId} .discount-option`).forEach(option => {
    option.classList.remove('active');
  });
  optionElement.classList.add('active');
  
  // Update radio button
  const radioButton = optionElement.querySelector('input[type="radio"]');
  if (radioButton) {
    radioButton.checked = true;
  }
  
  // Recalculate totals with new discount
  calculateTotals(customerId);
  saveCustomersToStorage();
}

// Handle custom discount
function handleCustomDiscount(customerId, percentage) {
  // Select the custom discount option
  const customOption = document.querySelector(`#discount-options-${customerId} [data-discount="custom"]`);
  if (customOption) {
    selectDiscount(customerId, 'custom', customOption);
  }
}

// Calculate discount amount - FIXED VERSION
function calculateDiscountAmount(customerId, subtotal, totalItems) {
  const selectedRadio = document.querySelector(`input[name="discount-${customerId}"]:checked`);
  if (!selectedRadio) return { amount: 0, percentage: 0, type: 'No discount' };
  
  const selectedDiscount = selectedRadio.value;
  
  switch (selectedDiscount) {
    case 'none':
      return { amount: 0, percentage: 0, type: 'No discount' };
    
    case 'volume':
      if (totalItems >= 10) {
        const amount = subtotal * 0.05;
        return { amount, percentage: 5, type: 'Volume discount (10+ items)' };
      }
      return { amount: 0, percentage: 0, type: 'Volume discount not applicable (need 10+ items)' };
    
    case 'bulk':
      if (subtotal >= 5000) {
        const amount = subtotal * 0.03;
        return { amount, percentage: 3, type: 'Bulk purchase discount (₦5000+)' };
      }
      return { amount: 0, percentage: 0, type: 'Bulk discount not applicable (need ₦5000+)' };
    
    case 'premium':
      if (subtotal >= 10000) {
        const amount = subtotal * 0.07;
        return { amount, percentage: 7, type: 'Premium customer discount (₦10000+)' };
      }
      return { amount: 0, percentage: 0, type: 'Premium discount not applicable (need ₦10000+)' };
    
    case 'custom':
      const customInput = document.getElementById(`custom-${customerId}`);
      const customPercentage = parseFloat(customInput ? customInput.value : 0) || 0;
      if (customPercentage > 0 && customPercentage <= 50) {
        const amount = subtotal * (customPercentage / 100);
        return { amount, percentage: customPercentage, type: `Custom discount (${customPercentage}%)` };
      }
      return { amount: 0, percentage: 0, type: 'Invalid custom discount (0-50% allowed)' };
    
    default:
      return { amount: 0, percentage: 0, type: 'No discount' };
  }
}

// Calculate totals - ENHANCED VERSION
function calculateTotals(customerId) {
  const totalDisplays = document.querySelectorAll(`#tbody-${customerId} .total-display`);
  let subtotal = 0;
  let totalItems = 0;
  
  // Calculate subtotal and total items
  totalDisplays.forEach(display => {
    const amount = parseFloat(display.textContent.replace('₦', '').replace(',', '')) || 0;
    subtotal += amount;
  });

  // Count total items
  const quantityInputs = document.querySelectorAll(`#tbody-${customerId} input[type="number"]`);
  quantityInputs.forEach(input => {
    totalItems += parseInt(input.value) || 0;
  });
  
  // Update subtotal display
  const subtotalElement = document.getElementById(`subtotal-${customerId}`);
  if (subtotalElement) {
    subtotalElement.textContent = `₦${subtotal.toFixed(2)}`;
  }
  
  // Calculate discount
  const discount = calculateDiscountAmount(customerId, subtotal, totalItems);
  const finalTotal = Math.max(0, subtotal - discount.amount);
  
  // Update discount display
  const discountDisplay = document.getElementById(`discount-display-${customerId}`);
  const discountAmountSpan = document.getElementById(`discount-amount-${customerId}`);
  
  if (discount.amount > 0) {
    if (discountDisplay) {
      discountDisplay.classList.add('show');
      discountDisplay.innerHTML = `${discount.type}: -<span id="discount-amount-${customerId}">₦${discount.amount.toFixed(2)}</span>`;
    }
  } else {
    if (discountDisplay) {
      discountDisplay.classList.remove('show');
    }
  }
  
  // Update final total
  const totalElement = document.getElementById(`total-${customerId}`);
  if (totalElement) {
    totalElement.textContent = `₦${finalTotal.toFixed(2)}`;
  }
  
  // Update item count in tab
  const countElement = document.getElementById(`count-${customerId}`);
  if (countElement) {
    countElement.textContent = totalItems;
  }
  
  // Update customer data
  const customer = customers.find(c => c.id === customerId);
  if (customer) {
    customer.subtotal = subtotal;
    customer.discount = discount;
    customer.total = finalTotal;
    customer.itemCount = totalItems;
    
    // Save current items for persistence
    customer.savedItems = [];
    const rows = document.querySelectorAll(`#tbody-${customerId} tr`);
    rows.forEach(row => {
      const productSelect = row.querySelector('select');
      const quantityInput = row.querySelector('input[type="number"]');
      if (productSelect && quantityInput && productSelect.value) {
        customer.savedItems.push({
          productId: productSelect.value,
          quantity: quantityInput.value
        });
      }
    });
  }
}

// Restore customer items from saved data
function restoreCustomerItems(customerId, savedItems) {
  if (!savedItems || savedItems.length === 0) return;
  
  savedItems.forEach(item => {
    addProductRow(customerId);
    const currentRowId = rowCounters[customerId];
    
    // Set product selection
    const productSelect = document.getElementById(`product-${customerId}-${currentRowId}`);
    if (productSelect) {
      productSelect.value = item.productId;
      selectProduct(customerId, currentRowId, productSelect);
    }
    
    // Set quantity
    const quantityInput = document.getElementById(`quantity-${customerId}-${currentRowId}`);
    if (quantityInput) {
      quantityInput.value = item.quantity;
      updateRowTotal(customerId, currentRowId);
    }
  });
}

// Proceed to checkout
function proceedToCheckout(customerId) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;

  const hasProducts = document.querySelectorAll(`#tbody-${customerId} tr`).length > 0;
  if (!hasProducts) {
    alert('Please add at least one product before proceeding to checkout.');
    return;
  }

  // Check if any product is selected
  const rows = document.querySelectorAll(`#tbody-${customerId} tr`);
  let hasValidProducts = false;
  
  rows.forEach(row => {
    const productSelect = row.querySelector('select');
    if (productSelect && productSelect.value) {
      hasValidProducts = true;
    }
  });
  
  if (!hasValidProducts) {
    alert('Please select at least one product before proceeding to checkout.');
    return;
  }

  // Collect transaction data
  const transactionData = {
    customerId: customerId,
    customerName: customer.customName || customer.name,
    items: [],
    subtotal: `₦${customer.subtotal.toFixed(2)}`,
    discount: customer.discount,
    total: `₦${customer.total.toFixed(2)}`,
    timestamp: new Date().toISOString()
  };

  // Collect all product data
  rows.forEach(row => {
    const productSelect = row.querySelector('select');
    const quantityInput = row.querySelector('input[type="number"]');
    const priceSpan = row.querySelector('.price-display');
    const totalSpan = row.querySelector('.total-display');
    
    if (productSelect && productSelect.value && quantityInput && priceSpan && totalSpan) {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      transactionData.items.push({
        productId: productSelect.value,
        productName: selectedOption.text.split(' - ')[0],
        quantity: parseInt(quantityInput.value),
        unitPrice: priceSpan.textContent,
        total: totalSpan.textContent
      });
    }
  });

  // Save to localStorage
  localStorage.setItem('currentTransaction', JSON.stringify(transactionData));
  
  // Save customer sessions before leaving
  saveCustomersToStorage();
  
  // Redirect to checkout
  window.location.href = 'checkout.html';
}

// Clear specific customer data after checkout
function clearCustomerData(customerId) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;

  // Reset customer data
  customer.items = [];
  customer.subtotal = 0;
  customer.discount = { amount: 0, percentage: 0, type: 'No discount' };
  customer.total = 0;
  customer.savedItems = [];

  // Clear table
  const tbody = document.getElementById(`tbody-${customerId}`);
  if (tbody) {
    tbody.innerHTML = '';
  }
  
  // Reset totals displays
  const subtotalElement = document.getElementById(`subtotal-${customerId}`);
  const totalElement = document.getElementById(`total-${customerId}`);
  const discountDisplay = document.getElementById(`discount-display-${customerId}`);
  const countElement = document.getElementById(`count-${customerId}`);
  
  if (subtotalElement) subtotalElement.textContent = '₦0.00';
  if (totalElement) totalElement.textContent = '₦0.00';
  if (discountDisplay) discountDisplay.classList.remove('show');
  if (countElement) countElement.textContent = '0';

  // Reset discount selection
  const noneRadio = document.querySelector(`input[name="discount-${customerId}"][value="none"]`);
  if (noneRadio) {
    noneRadio.checked = true;
  }
  
  const discountOptions = document.querySelectorAll(`#discount-options-${customerId} .discount-option`);
  discountOptions.forEach((option, index) => {
    if (index === 0) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });

  // Clear custom discount input
  const customInput = document.getElementById(`custom-${customerId}`);
  if (customInput) {
    customInput.value = '';
  }

  // Add initial product row
  addProductRow(customerId);
  
  // Save updated state
  saveCustomersToStorage();
}

// Enhanced return from checkout handling
window.addEventListener('pageshow', function(event) {
  // Check if we're returning from checkout
  const completedTransaction = localStorage.getItem('transactionCompleted');
  if (completedTransaction) {
    try {
      const transactionData = JSON.parse(completedTransaction);
      const customerId = transactionData.customerId;
      
      // Only clear the specific customer who completed checkout
      if (customerId) {
        clearCustomerData(customerId);
        
        // Switch to the cleared customer to show the reset state
        if (customers.find(c => c.id === customerId)) {
          switchToCustomer(customerId);
        }
      }
      
      // Remove the completion flag
      localStorage.removeItem('transactionCompleted');
      
      // Show success message
      setTimeout(() => {
        const customerNumber = customerId ? customerId.split('-')[1] : '';
        alert(`Receipt printed successfully for ${transactionData.customerName || 'Customer'}!\n\nCustomer ${customerNumber} is ready for the next transaction.`);
      }, 500);
      
    } catch (error) {
      console.error('Error processing completed transaction:', error);
      localStorage.removeItem('transactionCompleted');
    }
  }
});

// Save customer state when page is about to unload
window.addEventListener('beforeunload', function() {
  saveCustomersToStorage();
});

// Periodic save (every 10 seconds as backup)
setInterval(saveCustomersToStorage, 10000);

// Debug helpers
window.debugCustomers = () => {
  console.log('Current customers:', customers);
  console.log('Current customer ID:', currentCustomerId);
  console.log('Stored sessions:', localStorage.getItem('customerSessions'));
};