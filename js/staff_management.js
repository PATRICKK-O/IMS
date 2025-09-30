// Sample staff data (in real application, this would come from a database)

let staffData = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@inventory.com",
    phone: "+234 803 123 4567",
    role: "cashier",
    department: "sales",
    status: "active",
    joinDate: "2024-01-15",
    lastActive: "2025-09-20T14:30:00Z"
  },
  {
    id: 2,
    fullName: "Mary Johnson",
    email: "mary.johnson@inventory.com",
    phone: "+234 803 234 5678",
    role: "cashier",
    department: "sales",
    status: "active",
    joinDate: "2024-02-20",
    lastActive: "2025-09-20T13:45:00Z"
  },
  {
    id: 3,
    fullName: "David Wilson",
    email: "david.wilson@inventory.com",
    phone: "+234 803 345 6789",
    role: "warehouse",
    department: "inventory",
    status: "active",
    joinDate: "2024-03-10",
    lastActive: "2025-09-20T12:20:00Z"
  },
  {
    id: 4,
    fullName: "Sarah Brown",
    email: "sarah.brown@inventory.com",
    phone: "+234 803 456 7890",
    role: "manager",
    department: "management",
    status: "active",
    joinDate: "2023-11-05",
    lastActive: "2025-09-20T15:10:00Z"
  },
  {
    id: 5,
    fullName: "Michael Davis",
    email: "michael.davis@inventory.com",
    phone: "+234 803 567 8901",
    role: "warehouse",
    department: "inventory",
    status: "inactive",
    joinDate: "2024-01-30",
    lastActive: "2025-09-15T10:30:00Z"
  }
];

// Sample pending approvals
let pendingApprovals = [
  {
    id: 6,
    fullName: "Jane Smith",
    email: "jane.smith@inventory.com",
    phone: "+234 803 678 9012",
    role: "cashier",
    department: "sales",
    appliedDate: "2025-09-18"
  },
  {
    id: 7,
    fullName: "Robert Taylor",
    email: "robert.taylor@inventory.com",
    phone: "+234 803 789 0123",
    role: "warehouse",
    department: "inventory",
    appliedDate: "2025-09-19"
  }
];

let currentStaffId = 8; // For generating new IDs

// Function to get role badge class
function getRoleBadgeClass(role) {
  const roleClasses = {
    'cashier': 'role-cashier',
    'warehouse': 'role-warehouse',
    'manager': 'role-manager',
    'admin': 'role-admin'
  };
  return roleClasses[role] || 'role-cashier';
}

// Function to get status badge class
function getStatusBadgeClass(status) {
  const statusClasses = {
    'active': 'status-active',
    'pending': 'status-pending',
    'inactive': 'status-inactive'
  };
  return statusClasses[status] || 'status-active';
}

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Function to update statistics
function updateStatistics() {
  const totalStaff = staffData.length;
  const activeStaff = staffData.filter(staff => staff.status === 'active').length;
  const pendingStaff = pendingApprovals.length;
  const inactiveStaff = staffData.filter(staff => staff.status === 'inactive').length;

  document.getElementById('total-staff').textContent = totalStaff;
  document.getElementById('active-staff').textContent = activeStaff;
  document.getElementById('pending-staff').textContent = pendingStaff;
  document.getElementById('inactive-staff').textContent = inactiveStaff;
}

// Function to populate staff table
function populateStaffTable(data = staffData) {
  const tbody = document.getElementById('staff-table-body');
  tbody.innerHTML = '';

  data.forEach(staff => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="staff-name">${staff.fullName}</div>
        <div class="staff-email">${staff.email}</div>
      </td>
      <td>
        <span class="role-badge ${getRoleBadgeClass(staff.role)}">${staff.role}</span>
      </td>
      <td>
        <span class="status-badge ${getStatusBadgeClass(staff.status)}">${staff.status}</span>
      </td>
      <td>${formatDate(staff.joinDate)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-primary" onclick="viewStaffDetails(${staff.id})">View</button>
          <button class="btn btn-sm btn-warning" onclick="changeStaffRole(${staff.id})">Edit Role</button>
          ${staff.status === 'active' ? 
            `<button class="btn btn-sm btn-danger" onclick="deactivateStaff(${staff.id})">Deactivate</button>` :
            `<button class="btn btn-sm btn-success" onclick="activateStaff(${staff.id})">Activate</button>`
          }
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Function to populate pending approvals
function populatePendingApprovals() {
  const container = document.getElementById('pending-list');
  
  if (pendingApprovals.length === 0) {
    container.innerHTML = `
      <div class="pending-item" style="justify-content: center; color: #64748b; font-style: italic;">
        No pending approvals
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  pendingApprovals.forEach(staff => {
    const item = document.createElement('div');
    item.className = 'pending-item';
    item.innerHTML = `
      <div class="pending-info">
        <div class="pending-name">${staff.fullName}</div>
        <div class="pending-details">${staff.role} • Applied ${formatDate(staff.appliedDate)}</div>
      </div>
      <div class="pending-actions">
        <button class="btn btn-sm btn-success" onclick="approveStaff(${staff.id})">Approve</button>
        <button class="btn btn-sm btn-danger" onclick="rejectStaff(${staff.id})">Reject</button>
      </div>
    `;
    container.appendChild(item);
  });
}

// Function to search staff
function searchStaff() {
  const searchTerm = document.getElementById('staff-search').value.toLowerCase();
  const filteredData = staffData.filter(staff => 
    staff.fullName.toLowerCase().includes(searchTerm) ||
    staff.email.toLowerCase().includes(searchTerm) ||
    staff.role.toLowerCase().includes(searchTerm)
  );
  populateStaffTable(filteredData);
}

// Function to open add staff modal
function openAddStaffModal() {
  document.getElementById('addStaffModal').style.display = 'block';
}

// Function to close modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  if (modalId === 'addStaffModal') {
    document.getElementById('addStaffForm').reset();
  }
}

// Function to add new staff
function addNewStaff() {
  const form = document.getElementById('addStaffForm');
  const formData = new FormData(form);
  
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const newStaff = {
    id: currentStaffId++,
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: formData.get('role'),
    department: formData.get('department'),
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString()
  };

  // Check for duplicate email
  if (staffData.some(staff => staff.email === newStaff.email)) {
    alert('A staff member with this email already exists!');
    return;
  }

  staffData.push(newStaff);
  updateStatistics();
  populateStaffTable();
  closeModal('addStaffModal');
  
  // Show success message
  alert(`Staff member ${newStaff.fullName} has been added successfully!`);
}

// Function to view staff details
function viewStaffDetails(staffId) {
  const staff = staffData.find(s => s.id === staffId);
  if (!staff) return;

  const content = document.getElementById('staff-details-content');
  content.innerHTML = `
    <div class="form-group">
      <label class="form-label">Full Name</label>
      <input type="text" class="form-input" value="${staff.fullName}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Email Address</label>
      <input type="email" class="form-input" value="${staff.email}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Phone Number</label>
      <input type="tel" class="form-input" value="${staff.phone}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Role</label>
      <input type="text" class="form-input" value="${staff.role}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Department</label>
      <input type="text" class="form-input" value="${staff.department || 'Not assigned'}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Status</label>
      <input type="text" class="form-input" value="${staff.status}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Join Date</label>
      <input type="text" class="form-input" value="${formatDate(staff.joinDate)}" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Last Active</label>
      <input type="text" class="form-input" value="${new Date(staff.lastActive).toLocaleString()}" readonly>
    </div>
  `;

  document.getElementById('staffDetailsModal').style.display = 'block';
}

// Function to change staff role
function changeStaffRole(staffId) {
  const staff = staffData.find(s => s.id === staffId);
  if (!staff) return;

  const newRole = prompt(`Current role: ${staff.role}\n\nEnter new role (cashier/warehouse/manager/admin):`, staff.role);
  
  if (newRole && ['cashier', 'warehouse', 'manager', 'admin'].includes(newRole.toLowerCase())) {
    staff.role = newRole.toLowerCase();
    populateStaffTable();
    alert(`${staff.fullName}'s role has been updated to ${newRole}!`);
  } else if (newRole) {
    alert('Invalid role! Please enter: cashier, warehouse, manager, or admin');
  }
}

// Function to activate staff
function activateStaff(staffId) {
  const staff = staffData.find(s => s.id === staffId);
  if (!staff) return;

  if (confirm(`Are you sure you want to activate ${staff.fullName}?`)) {
    staff.status = 'active';
    staff.lastActive = new Date().toISOString();
    updateStatistics();
    populateStaffTable();
    alert(`${staff.fullName} has been activated!`);
  }
}

// Function to deactivate staff
function deactivateStaff(staffId) {
  const staff = staffData.find(s => s.id === staffId);
  if (!staff) return;

  if (confirm(`Are you sure you want to deactivate ${staff.fullName}?`)) {
    staff.status = 'inactive';
    updateStatistics();
    populateStaffTable();
    alert(`${staff.fullName} has been deactivated!`);
  }
}

// Function to approve pending staff
function approveStaff(staffId) {
  const pendingStaff = pendingApprovals.find(s => s.id === staffId);
  if (!pendingStaff) return;

  if (confirm(`Approve ${pendingStaff.fullName} as ${pendingStaff.role}?`)) {
    // Move from pending to active staff
    const newStaff = {
      ...pendingStaff,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
    };
    
    staffData.push(newStaff);
    pendingApprovals = pendingApprovals.filter(s => s.id !== staffId);
    
    updateStatistics();
    populateStaffTable();
    populatePendingApprovals();
    
    alert(`${pendingStaff.fullName} has been approved and added to active staff!`);
  }
}

// Function to reject pending staff
function rejectStaff(staffId) {
  const pendingStaff = pendingApprovals.find(s => s.id === staffId);
  if (!pendingStaff) return;

  if (confirm(`Reject ${pendingStaff.fullName}'s application?`)) {
    pendingApprovals = pendingApprovals.filter(s => s.id !== staffId);
    updateStatistics();
    populatePendingApprovals();
    alert(`${pendingStaff.fullName}'s application has been rejected.`);
  }
}

// Function to edit staff (placeholder)
function editStaff() {
  alert('Edit functionality would be implemented here with a detailed edit form.');
  closeModal('staffDetailsModal');
}

// Function to export staff data
function exportStaffData() {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Name,Email,Phone,Role,Department,Status,Join Date\n"
    + staffData.map(staff => 
      `${staff.fullName},${staff.email},${staff.phone},${staff.role},${staff.department || ''},${staff.status},${staff.joinDate}`
    ).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `staff_data_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert('Staff data exported successfully!');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Initialize page when loaded
window.onload = function() {
  updateStatistics();
  populateStaffTable();
  populatePendingApprovals();
};