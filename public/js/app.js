// Base URL for API calls
const API_URL = 'http://localhost:3000/api';

// Chart instances
let categoryChart = null;
let monthlyChart = null;

// Category icons mapping
const CATEGORY_ICONS = {
    'Food': 'fas fa-utensils',
    'Transport': 'fas fa-bus',
    'Shopping': 'fas fa-shopping-bag',
    'Entertainment': 'fas fa-film',
    'Bills': 'fas fa-file-invoice-dollar',
    'Healthcare': 'fas fa-heartbeat',
    'Education': 'fas fa-graduation-cap',
    'Salary': 'fas fa-money-bill-wave',
    'Investment': 'fas fa-chart-line',
    'Other': 'fas fa-circle'
};

// Category colors for charts
const CATEGORY_COLORS = {
    'Food': '#4cc9f0',
    'Transport': '#7209b7',
    'Shopping': '#f72585',
    'Entertainment': '#f8961e',
    'Bills': '#4361ee',
    'Healthcare': '#38b000',
    'Education': '#9d4edd',
    'Salary': '#06d6a0',
    'Investment': '#ff9e00',
    'Other': '#6c757d'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    
    // Load initial data
    loadTransactions();
    updateStats();
    
    // Initialize charts
    initializeCharts();
    
    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const labels = document.querySelectorAll('label[for="income-type"], label[for="expense-type"]');
            labels.forEach(label => label.classList.remove('active'));
            if (this.checked) {
                const label = document.querySelector(`label[for="${this.id}"]`);
                label.classList.add('active');
            }
        });
    });
});

// Load transactions from server
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const transactions = await response.json();
        
        // Display transactions
        displayTransactions(transactions);
        
        // Update summary stats
        updateSummaryStats(transactions);
        
        // Update charts
        updateCharts(transactions);
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        showError('Failed to load transactions. Please check your connection.');
    }
}

// Display transactions in table
function displayTransactions(transactions) {
    const tbody = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-inbox fa-3x mb-3"></i>
                        <h5>No transactions yet</h5>
                        <p>Add your first transaction above!</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';
        const typeBadge = isIncome ? 
            '<span class="income-badge"><i class="fas fa-arrow-down me-1"></i>Income</span>' :
            '<span class="expense-badge"><i class="fas fa-arrow-up me-1"></i>Expense</span>';
        
        const iconClass = CATEGORY_ICONS[transaction.category] || CATEGORY_ICONS['Other'];
        
        html += `
            <tr class="fade-in">
                <td>
                    <div class="d-flex align-items-center">
                        <div class="transaction-icon ${isIncome ? 'transaction-income' : 'transaction-expense'}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div>
                            <div class="transaction-title">${formattedDate}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.description}</div>
                    </div>
                </td>
                <td>
                    <span class="category-badge">${transaction.category}</span>
                </td>
                <td>${typeBadge}</td>
                <td class="text-end">
                    <span class="transaction-amount ${amountClass} fw-bold">
                        ${amountPrefix}$${parseFloat(transaction.amount).toFixed(2)}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn-action" onclick="deleteTransaction(${transaction.id})" 
                            title="Delete transaction">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Update summary statistics
function updateSummaryStats(transactions) {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
            totalIncome += amount;
        } else {
            totalExpenses += amount;
        }
    });
    
    const totalBalance = totalIncome - totalExpenses;
    
    // Update DOM elements
    document.getElementById('balance').textContent = `$${totalBalance.toFixed(2)}`;
    document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
}

// Add new transaction
async function addTransaction() {
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    
    // Validation
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (!description.trim()) {
        showError('Please enter a description');
        return;
    }
    
    const transaction = {
        amount: parseFloat(amount),
        description: description.trim(),
        category,
        type,
        date: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
            // Clear form
            document.getElementById('amount').value = '';
            document.getElementById('description').value = '';
            
            // Show success message
            showSuccess('Transaction added successfully!');
            
            // Reload data
            loadTransactions();
            
            // Update stats
            updateStats();
        } else {
            throw new Error('Failed to add transaction');
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showError('Failed to add transaction. Please try again.');
    }
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Transaction deleted successfully!');
            loadTransactions();
            updateStats();
        } else {
            throw new Error('Failed to delete transaction');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Failed to delete transaction. Please try again.');
    }
}

// Update stats from server
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const transactions = await response.json();
        updateSummaryStats(transactions);
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Initialize charts
function initializeCharts() {
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    
    // Category chart
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Transport', 'Shopping', 'Entertainment'],
            datasets: [{
                data: [50, 30, 0, 0],
                backgroundColor: [
                    CATEGORY_COLORS.Food,
                    CATEGORY_COLORS.Transport,
                    CATEGORY_COLORS.Shopping,
                    CATEGORY_COLORS.Entertainment
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
    
    // Monthly chart
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Income',
                    data: [1200, 1300, 1250, 1400, 1350, 1500],
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: [400, 450, 380, 420, 500, 480],
                    borderColor: '#f72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update charts with real data
function updateCharts(transactions) {
    // Group transactions by category
    const categoryData = {};
    const currentMonth = new Date().getMonth();
    
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            const category = transaction.category;
            const amount = parseFloat(transaction.amount);
            
            if (!categoryData[category]) {
                categoryData[category] = 0;
            }
            categoryData[category] += amount;
        }
    });
    
    // Update category chart
    if (categoryChart) {
        const categories = Object.keys(categoryData);
        const amounts = Object.values(categoryData);
        const colors = categories.map(cat => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other);
        
        categoryChart.data.labels = categories;
        categoryChart.data.datasets[0].data = amounts;
        categoryChart.data.datasets[0].backgroundColor = colors;
        categoryChart.update();
    }
}

// Show success message
function showSuccess(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'alert alert-success alert-dismissible fade show position-fixed';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    `;
    toast.innerHTML = `
        <strong><i class="fas fa-check-circle me-2"></i>Success!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Show error message
function showError(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    `;
    toast.innerHTML = `
        <strong><i class="fas fa-exclamation-circle me-2"></i>Error!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Filter transactions by period
function filterTransactions(period) {
    // This is a simplified version - in a real app, you'd filter on the server
    const buttons = document.querySelectorAll('.filter-buttons .btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // For now, just reload all transactions
    loadTransactions();
}
// Base URL for API calls - automatically adjusts for production/development
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// For example, if your app is at https://your-app.onrender.com
// API_URL will automatically be https://your-app.onrender.com/api