// Global variables
let currentTransaction = null;
let cashierName = 'John Doe'; // Default cashier name

// Function to generate receipt number
function generateReceiptNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INV-${year}${month}${day}-${time}${random}`;
}

// Function to format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Function to load transaction data from localStorage
function loadTransactionData() {
  try {
    // Get transaction data from localStorage
    const transactionData = localStorage.getItem('currentTransaction');
    
    if (!transactionData) {
      showNoTransactionMessage();
      return;
    }

    currentTransaction = JSON.parse(transactionData);
    
    // Check if transaction has items
    if (!currentTransaction.items || currentTransaction.items.length === 0) {
      showNoTransactionMessage();
      return;
    }

    displayTransactionData();
    
  } catch (error) {
    console.error('Error loading transaction data:', error);
    showNoTransactionMessage();
  }
}

// Function to show no transaction message
function showNoTransactionMessage() {
  document.getElementById('no-transaction').style.display = 'block';
  document.getElementById('receipt-content').style.display = 'none';
  document.querySelector('.receipt-content').style.display = 'none';
  document.querySelector('.receipt-footer').style.display = 'none';
  document.querySelector('.cashier-section').style.display = 'none';
  document.querySelector('.actions').style.display = 'none';
  document.getElementById('transaction-summary').style.display = 'none';
  document.getElementById('customer-indicator').style.display = 'none';
}

// Function to display transaction data
function displayTransactionData() {
  // Show receipt sections
  document.getElementById('no-transaction').style.display = 'none';
  document.getElementById('receipt-content').style.display = 'block';
  document.querySelector('.receipt-content').style.display = 'block';
  document.querySelector('.receipt-footer').style.display = 'block';
  document.querySelector('.cashier-section').style.display = 'flex';
  document.querySelector('.actions').style.display = 'flex';
  document.getElementById('transaction-summary').style.display = 'block';

  // Update customer indicator
  const customerIndicator = document.getElementById('customer-indicator');
  const customerDisplayName = getCustomerDisplayName();
  customerIndicator.textContent = customerDisplayName;

  // Update transaction summary
  const summaryDetails = document.getElementById('summary-details');
  const itemCount = currentTransaction.items.length;
  const totalItems = currentTransaction.items.reduce((sum, item) => sum + parseInt(item.quantity), 0);
  summaryDetails.textContent = `${customerDisplayName} • ${itemCount} products (${totalItems} items) • ${currentTransaction.total}`;

  // Set transaction details
  document.getElementById('transaction-date').textContent = formatDate(currentTransaction.timestamp);
  document.getElementById('receipt-number').textContent = generateReceiptNumber();
  
  // Set customer name with improved logic
  const customerNameElement = document.getElementById('customer-name');
  customerNameElement.textContent = currentTransaction.customerName || 'Walk-in Customer';
  
  // Set cashier name
  const savedCashier = localStorage.getItem('currentCashier');
  if (savedCashier) {
    cashierName = savedCashier;
  }
  document.getElementById('cashier-name').textContent = cashierName;
  document.getElementById('cashier-input').value = cashierName;

  // Populate products table
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = ''; // Clear existing rows

  currentTransaction.items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="product-name">${item.productName}</td>
      <td><span class="quantity">${item.quantity}</span></td>
      <td class="price">${item.unitPrice}</td>
      <td class="item-total">${item.total}</td>
    `;
    tbody.appendChild(row);
  });

  // Set totals
  document.getElementById('receipt-subtotal').textContent = currentTransaction.subtotal;
  document.getElementById('receipt-total').textContent = currentTransaction.total;

  // Handle enhanced discount system with improved display
  if (currentTransaction.discount && currentTransaction.discount.amount > 0) {
    const discountRow = document.getElementById('discount-row');
    const discountLabel = document.getElementById('discount-label');
    const discountAmount = document.getElementById('receipt-discount');
    
    // Set discount label with more detailed info
    const discountType = currentTransaction.discount.type || 'Discount';
    discountLabel.textContent = discountType;
    discountAmount.textContent = `-₦${currentTransaction.discount.amount.toFixed(2)}`;
    
    discountRow.style.display = 'flex';
  } else {
    document.getElementById('discount-row').style.display = 'none';
  }
}

// Function to get customer display name for indicator
function getCustomerDisplayName() {
  if (!currentTransaction) return 'Unknown Customer';
  
  const customerId = currentTransaction.customerId;
  const customerName = currentTransaction.customerName;
  
  if (customerId) {
    const customerNumber = customerId.split('-')[1];
    if (customerName && !customerName.startsWith('Customer ')) {
      return `${customerName} (Customer ${customerNumber})`;
    }
    return `Customer ${customerNumber}`;
  }
  
  return customerName || 'Walk-in Customer';
}

// Function to update cashier name
function updateCashierName() {
  const newCashierName = document.getElementById('cashier-input').value.trim();
  
  if (newCashierName === '') {
    alert('Please enter a cashier name');
    return;
  }

  // Update cashier name in display
  cashierName = newCashierName;
  document.getElementById('cashier-name').textContent = cashierName;
  
  // Save cashier name to localStorage for future use
  localStorage.setItem('currentCashier', cashierName);
  
  // Update transaction data with new cashier
  if (currentTransaction) {
    currentTransaction.cashier = cashierName;
    localStorage.setItem('currentTransaction', JSON.stringify(currentTransaction));
  }

  // Show success message
  const button = document.querySelector('.update-cashier-btn');
  const originalText = button.textContent;
  button.textContent = 'Updated!';
  button.style.background = '#059669';
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = '#8b5cf6';
  }, 1500);
}

// Function to print receipt and complete transaction
function printReceipt() {
  if (!validateReceiptData()) {
    alert('Invalid receipt data. Please return to sales and try again.');
    return;
  }

  // Save transaction to sales history before printing
  saveToSalesHistory();
  
  // Mark transaction as completed for specific customer only
  if (currentTransaction && currentTransaction.customerId) {
    localStorage.setItem('transactionCompleted', JSON.stringify({
      customerId: currentTransaction.customerId,
      customerName: currentTransaction.customerName || 'Walk-in Customer',
      completedAt: new Date().toISOString(),
      action: 'print_complete'
    }));
  }
  
  // Print the page
  window.print();
}

// Function to cancel transaction (return without completing)
function cancelTransaction() {
  if (currentTransaction && currentTransaction.customerId) {
    // Don't mark as completed, just return to sales
    localStorage.setItem('transactionCancelled', JSON.stringify({
      customerId: currentTransaction.customerId,
      customerName: currentTransaction.customerName || 'Walk-in Customer',
      cancelledAt: new Date().toISOString(),
      action: 'cancel_return'
    }));
  }

  // Clear current transaction and return to sales
  localStorage.removeItem('currentTransaction');
  window.location.href = 'sales.html';
}

// Function to clear transaction (complete new sale)
function clearTransaction() {
  // Save to history if not already saved
  if (currentTransaction) {
    saveToSalesHistory();
    
    // Mark transaction as completed
    if (currentTransaction.customerId) {
      localStorage.setItem('transactionCompleted', JSON.stringify({
        customerId: currentTransaction.customerId,
        customerName: currentTransaction.customerName || 'Walk-in Customer',
        completedAt: new Date().toISOString(),
        action: 'new_sale_complete'
      }));
    }
  }
  
  // Clear current transaction from localStorage
  localStorage.removeItem('currentTransaction');
  
  // Go to sales page
  window.location.href = 'sales.html';
}

// Function to save transaction to sales history
function saveToSalesHistory() {
  if (!currentTransaction) return;

  try {
    // Get existing sales history
    let salesHistory = localStorage.getItem('salesHistory');
    salesHistory = salesHistory ? JSON.parse(salesHistory) : [];

    // Add current transaction to history with enhanced data
    const transactionRecord = {
      ...currentTransaction,
      cashier: cashierName,
      receiptNumber: document.getElementById('receipt-number').textContent,
      printedAt: new Date().toISOString(),
      status: 'completed',
      // Enhanced fields for multi-customer system
      customerId: currentTransaction.customerId || 'walk-in',
      customerName: currentTransaction.customerName || 'Walk-in Customer',
      discountDetails: currentTransaction.discount || { amount: 0, type: 'No discount' },
      // Additional metadata
      totalItems: currentTransaction.items.reduce((sum, item) => sum + parseInt(item.quantity), 0),
      productCount: currentTransaction.items.length
    };

    salesHistory.push(transactionRecord);

    // Save updated history
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    
    console.log('Transaction saved to history:', transactionRecord);
    
  } catch (error) {
    console.error('Error saving transaction to history:', error);
  }
}

// Validate receipt data before processing
function validateReceiptData() {
  if (!currentTransaction) {
    console.error('No transaction data available');
    return false;
  }

  if (!currentTransaction.items || currentTransaction.items.length === 0) {
    console.error('No items in transaction');
    return false;
  }

  // Validate required fields
  const requiredFields = ['subtotal', 'total', 'timestamp'];
  for (const field of requiredFields) {
    if (!currentTransaction[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate item data
  for (const item of currentTransaction.items) {
    if (!item.productName || !item.quantity || !item.unitPrice || !item.total) {
      console.error('Invalid item data:', item);
      return false;
    }
  }

  return true;
}

// Load transaction data when page loads
window.onload = function() {
  loadTransactionData();
};

// Handle browser back button and tab closing
window.addEventListener('beforeunload', function() {
  // Only save to history if not already completed/cancelled
  const completed = localStorage.getItem('transactionCompleted');
  const cancelled = localStorage.getItem('transactionCancelled');
  
  if (!completed && !cancelled && currentTransaction) {
    // Mark as cancelled since user is leaving without completing
    localStorage.setItem('transactionCancelled', JSON.stringify({
      customerId: currentTransaction.customerId,
      customerName: currentTransaction.customerName || 'Walk-in Customer',
      cancelledAt: new Date().toISOString(),
      action: 'page_exit'
    }));
  }
});

// Handle print completion
window.addEventListener('afterprint', function() {
  // Show success message after printing
  const customerName = currentTransaction ? 
    (currentTransaction.customerName || 'Walk-in Customer') : 
    'Customer';
  
  setTimeout(() => {
    alert(`Receipt printed successfully for ${customerName}!\n\n✅ Transaction completed\n✅ Customer data will be reset\n✅ Other customers remain active\n\nReturning to sales...`);
    
    // Redirect to sales after showing message
    setTimeout(() => {
      window.location.href = 'sales.html';
    }, 1000);
  }, 100);
});

// Enhanced error handling
window.addEventListener('error', function(event) {
  console.error('Checkout system error:', event.error);
  
  // Show user-friendly error message
  if (event.error.message.includes('localStorage')) {
    alert('Unable to access transaction data. Please ensure cookies are enabled and try again.');
  } else {
    alert('An error occurred while processing the checkout. Please try refreshing the page.');
  }
});

// Format currency for thermal receipt
function formatCurrency(amount) {
  if (typeof amount === 'string') {
    // Extract number from string like "₦1,500.00"
    const numericValue = parseFloat(amount.replace(/[₦,]/g, ''));
    return `₦${numericValue.toFixed(2)}`;
  }
  return `₦${parseFloat(amount).toFixed(2)}`;
}

// Debug helpers for development
function debugTransactionData() {
  console.log('Current Transaction:', currentTransaction);
  console.log('Sales History:', localStorage.getItem('salesHistory'));
  console.log('Current Cashier:', localStorage.getItem('currentCashier'));
  console.log('Customer Sessions:', localStorage.getItem('customerSessions'));
}

// Make debug function available in console
window.debugCheckout = debugTransactionData;

// Additional helper functions for UI feedback
function showProcessingIndicator(message) {
  const indicator = document.getElementById('customer-indicator');
  const originalText = indicator.textContent;
  indicator.textContent = message;
  indicator.style.background = '#f59e0b';
  
  setTimeout(() => {
    indicator.textContent = originalText;
    indicator.style.background = '#3b82f6';
  }, 2000);
}

// Show loading state for better UX
document.addEventListener('DOMContentLoaded', function() {
  showProcessingIndicator('Loading transaction...');
});