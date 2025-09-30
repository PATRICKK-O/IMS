// Sample inventory data with realistic stock levels
const inventoryData = [
  { name: "Rice (1kg)", current: 15, threshold: 50, status: "critical", reorderQty: 100, unitCost: 750 },
  { name: "Beans (1kg)", current: 25, threshold: 30, status: "low", reorderQty: 80, unitCost: 580 },
  { name: "Onions (1kg)", current: 8, threshold: 25, status: "critical", reorderQty: 60, unitCost: 240 },
  { name: "Garri (1kg)", current: 45, threshold: 40, status: "normal", reorderQty: 0, unitCost: 380 },
  { name: "Tomatoes (1kg)", current: 32, threshold: 20, status: "normal", reorderQty: 0, unitCost: 290 },
  { name: "Bread", current: 0, threshold: 15, status: "critical", reorderQty: 50, unitCost: 180 },
  { name: "Milk (1L)", current: 18, threshold: 20, status: "low", reorderQty: 40, unitCost: 340 },
  { name: "Eggs (12pcs)", current: 35, threshold: 15, status: "normal", reorderQty: 0, unitCost: 430 },
  { name: "Chicken (1kg)", current: 12, threshold: 10, status: "normal", reorderQty: 0, unitCost: 1150 },
  { name: "Fish (1kg)", current: 6, threshold: 10, status: "low", reorderQty: 25, unitCost: 950 }
];

// Sample sales performance data
const salesData = [
  { name: "Rice (1kg)", unitsSold: 45, revenue: 36000, performance: "excellent" },
  { name: "Beans (1kg)", unitsSold: 32, revenue: 19200, performance: "good" },
  { name: "Bread", unitsSold: 28, revenue: 5600, performance: "good" },
  { name: "Milk (1L)", unitsSold: 22, revenue: 7700, performance: "average" },
  { name: "Tomatoes (1kg)", unitsSold: 18, revenue: 5400, performance: "average" },
  { name: "Onions (1kg)", unitsSold: 15, revenue: 3750, performance: "poor" },
  { name: "Eggs (12pcs)", unitsSold: 12, revenue: 5400, performance: "average" },
  { name: "Chicken (1kg)", unitsSold: 8, revenue: 9600, performance: "poor" },
  { name: "Fish (1kg)", unitsSold: 5, revenue: 5000, performance: "poor" },
  { name: "Garri (1kg)", unitsSold: 38, revenue: 15200, performance: "excellent" }
];

// Sample staff performance data
const staffPerformanceData = [
  { name: "John Doe", transactions: 12, totalSales: 18500, performance: "excellent" },
  { name: "Mary Johnson", transactions: 9, totalSales: 14200, performance: "good" },
  { name: "David Wilson", transactions: 4, totalSales: 8900, performance: "average" },
  { name: "Sarah Brown", transactions: 3, totalSales: 4000, performance: "poor" }
];

// Function to generate critical alerts
function generateAlerts() {
  const alertsContainer = document.getElementById('alerts-section');
  const alerts = [];

  // Check for critical stock levels
  const criticalItems = inventoryData.filter(item => item.status === 'critical');
  const lowStockItems = inventoryData.filter(item => item.status === 'low');

  if (criticalItems.length > 0) {
    alerts.push({
      type: 'critical',
      icon: '🚨',
      title: 'Critical Stock Alert',
      description: `${criticalItems.length} items are critically low or out of stock: ${criticalItems.map(item => item.name).join(', ')}`,
      action: 'Reorder Now'
    });
  }

  if (lowStockItems.length > 0) {
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Low Stock Warning',
      description: `${lowStockItems.length} items are running low: ${lowStockItems.map(item => item.name).join(', ')}`,
      action: 'Review Stock'
    });
  }

  // Check for poor performing products
  const poorPerformers = salesData.filter(item => item.performance === 'poor');
  if (poorPerformers.length > 0) {
    alerts.push({
      type: 'info',
      icon: '📊',
      title: 'Performance Alert',
      description: `${poorPerformers.length} products showing poor sales performance this week`,
      action: 'Analyze'
    });
  }

  // Render alerts
  if (alerts.length === 0) {
    alertsContainer.innerHTML = `
      <div class="alert alert-info">
        <div class="alert-content">
          <span class="alert-icon">✅</span>
          <div class="alert-text">
            <div class="alert-title">All Systems Normal</div>
            <div class="alert-description">No critical issues detected. Business operations running smoothly.</div>
          </div>
        </div>
      </div>
    `;
  } else {
    alertsContainer.innerHTML = alerts.map(alert => `
      <div class="alert alert-${alert.type}">
        <div class="alert-content">
          <span class="alert-icon">${alert.icon}</span>
          <div class="alert-text">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-description">${alert.description}</div>
          </div>
        </div>
        <button class="alert-action btn-${alert.type}" onclick="handleAlertAction('${alert.type}')">${alert.action}</button>
      </div>
    `).join('');
  }
}

// Function to populate inventory table
function populateInventoryTable() {
  const tbody = document.getElementById('inventory-table');
  tbody.innerHTML = inventoryData.map(item => `
    <tr>
      <td class="product-name">${item.name}</td>
      <td>${item.current}</td>
      <td>
        <span class="stock-level stock-${item.status}">
          ${item.status.toUpperCase()}
        </span>
      </td>
      <td>
        ${item.status === 'critical' ? 
          '<span class="status-critical">URGENT REORDER</span>' :
          item.status === 'low' ? 
          '<span class="status-warning">Schedule Reorder</span>' :
          '<span class="status-good">Monitor</span>'
        }
      </td>
    </tr>
  `).join('');

  // Update summary
  document.getElementById('total-products').textContent = inventoryData.length;
  document.getElementById('low-stock-count').textContent = inventoryData.filter(i => i.status === 'low').length;
  document.getElementById('out-of-stock').textContent = inventoryData.filter(i => i.current === 0).length;
}

// Function to populate sales table
function populateSalesTable() {
  const tbody = document.getElementById('sales-table');
  tbody.innerHTML = salesData.slice(0, 6).map(item => `
    <tr>
      <td class="product-name">${item.name}</td>
      <td><span class="quantity-badge">${item.unitsSold}</span></td>
      <td class="amount">₦${item.revenue.toLocaleString()}</td>
      <td>
        <span class="status-${item.performance === 'excellent' ? 'good' : item.performance === 'good' ? 'good' : item.performance === 'average' ? 'warning' : 'critical'}">
          ${item.performance.toUpperCase()}
        </span>
      </td>
    </tr>
  `).join('');
}

// Function to populate staff table
function populateStaffTable() {
  const tbody = document.getElementById('staff-table');
  tbody.innerHTML = staffPerformanceData.map(staff => `
    <tr>
      <td class="cashier-name">${staff.name}</td>
      <td><span class="quantity-badge">${staff.transactions}</span></td>
      <td class="amount">₦${staff.totalSales.toLocaleString()}</td>
      <td>
        <span class="status-${staff.performance === 'excellent' ? 'good' : staff.performance === 'good' ? 'good' : staff.performance === 'average' ? 'warning' : 'critical'}">
          ${staff.performance.toUpperCase()}
        </span>
      </td>
    </tr>
  `).join('');
}

// Function to populate reorder table
function populateReorderTable() {
  const reorderItems = inventoryData.filter(item => item.reorderQty > 0);
  const tbody = document.getElementById('reorder-table');
  
  tbody.innerHTML = reorderItems.map(item => `
    <tr>
      <td class="product-name">${item.name}</td>
      <td>${item.current}</td>
      <td><span class="quantity-badge">${item.reorderQty}</span></td>
      <td>
        <span class="status-${item.status === 'critical' ? 'critical' : 'warning'}">
          ${item.status === 'critical' ? 'HIGH' : 'MEDIUM'}
        </span>
      </td>
    </tr>
  `).join('');

  // Update summary
  document.getElementById('items-to-reorder').textContent = reorderItems.length;
  const totalCost = reorderItems.reduce((sum, item) => sum + (item.reorderQty * item.unitCost), 0);
  document.getElementById('estimated-cost').textContent = `₦${totalCost.toLocaleString()}`;
}

// Function to handle alert actions
function handleAlertAction(type) {
  switch(type) {
    case 'critical':
      alert('Redirecting to inventory management for urgent restocking...');
      break;
    case 'warning':
      alert('Opening stock review dashboard...');
      break;
    case 'info':
      alert('Opening detailed sales analysis...');
      break;
  }
}

// Function to update reports based on period filter
function updateReports() {
  const period = document.getElementById('period-filter').value;
  
  // In a real application, this would fetch data based on the selected period
  // For demo purposes, we'll just show an alert
  console.log(`Updating reports for period: ${period}`);
  
  // Update the data display (in production, you'd fetch new data here)
  generateAlerts();
  populateInventoryTable();
  populateSalesTable();
  populateStaffTable();
  populateReorderTable();
  
  // Show feedback to user
  const periods = {
    'today': 'Today',
    'week': 'This Week', 
    'month': 'This Month',
    'quarter': 'This Quarter'
  };
  
  // You could add a small notification here
  console.log(`Reports updated for ${periods[period]}`);
}

// Function to export individual reports
function exportReport(reportType) {
  const reportNames = {
    'inventory': 'Inventory Status Report',
    'sales': 'Sales Performance Report', 
    'staff': 'Staff Performance Report',
    'reorder': 'Reorder Recommendations',
    'trends': 'Sales Trend Analysis',
    'financial': 'Financial Summary'
  };

  // In a real application, this would generate and download the actual report
  alert(`Exporting ${reportNames[reportType]}...\n\nThis would download a CSV/PDF file with detailed ${reportType} data.`);
  
  console.log(`Exporting ${reportType} report`);
  
  // Example of what the export might contain:
  if (reportType === 'inventory') {
    const csvContent = "Product,Current Stock,Status,Action Required\n" +
      inventoryData.map(item => 
        `${item.name},${item.current},${item.status},${item.status === 'critical' ? 'URGENT REORDER' : item.status === 'low' ? 'Schedule Reorder' : 'Monitor'}`
      ).join('\n');
    console.log('Inventory CSV content:', csvContent);
  }
}

// Function to export all reports
function exportAllReports() {
  alert('Exporting comprehensive business report package...\n\nThis would generate:\n• Inventory Status Report\n• Sales Performance Report\n• Staff Performance Report\n• Reorder Recommendations\n• Financial Summary\n• Trend Analysis\n\nAll reports would be packaged in a ZIP file.');
  
  console.log('Exporting all reports as package');
}

// Function to calculate and update dynamic summaries
function updateSummaries() {
  // Sales summary calculations
  const totalSalesValue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = staffPerformanceData.reduce((sum, staff) => sum + staff.transactions, 0);
  const avgTransaction = totalSalesValue / totalTransactions;

  document.getElementById('total-sales').textContent = `₦${totalSalesValue.toLocaleString()}`;
  document.getElementById('total-transactions').textContent = totalTransactions;
  document.getElementById('avg-transaction').textContent = `₦${Math.round(avgTransaction).toLocaleString()}`;

  // Staff summary
  const activeCashiers = staffPerformanceData.length;
  const topPerformer = staffPerformanceData.reduce((top, staff) => 
    staff.totalSales > top.totalSales ? staff : top
  );

  document.getElementById('active-cashiers').textContent = activeCashiers;
  document.getElementById('top-performer').textContent = topPerformer.name.split(' ')[0] + ' ' + topPerformer.name.split(' ')[1][0] + '.';
}

// Initialize page
window.onload = function() {
  generateAlerts();
  populateInventoryTable();
  populateSalesTable();
  populateStaffTable();
  populateReorderTable();
  updateSummaries();
  
  console.log('Reports dashboard initialized');
  console.log('Current period:', document.getElementById('period-filter').value);
};

// Auto-refresh reports every 5 minutes (300,000 ms)
setInterval(function() {
  console.log('Auto-refreshing reports...');
  updateReports();
}, 300000);

// Refresh when page becomes visible
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    console.log('Page visible - refreshing reports');
    updateReports();
  }
});