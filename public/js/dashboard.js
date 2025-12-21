// Modern Banking Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.portfolioData = {
            totalValue: 12500.50,
            totalStaked: 8000.00,
            availableBalance: 4500.50,
            totalRewards: 250.75,
            performance: {
                daily: 2.5,
                weekly: 8.3,
                monthly: 15.7
            }
        };
        this.transactions = [
            {
                id: 1,
                type: 'stake',
                amount: 1000,
                token: 'BLU',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                status: 'completed',
                hash: '0x1234...5678'
            },
            {
                id: 2,
                type: 'reward',
                amount: 25.50,
                token: 'BLU',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                status: 'completed',
                hash: '0x8765...4321'
            },
            {
                id: 3,
                type: 'deposit',
                amount: 500,
                token: 'USDC',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                status: 'completed',
                hash: '0xabcd...efgh'
            },
            {
                id: 4,
                type: 'withdrawal',
                amount: 200,
                token: 'BLU',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: 'pending',
                hash: '0xefgh...ijkl'
            }
        ];
        
        this.charts = {};
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadUserData();
        this.setupEventListeners();
        this.renderDashboard();
        this.initCharts();
        this.setupRealTimeUpdates();
        this.hideLoading();
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    async loadUserData() {
        try {
            // Check if user is authenticated
            const token = this.getAuthToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            // Load user data from API
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.currentUser = await response.json();
            } else {
                throw new Error('Failed to load user data');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // For demo purposes, use mock data
            this.currentUser = {
                name: 'John Doe',
                email: 'john@example.com',
                accountId: 'BLU-1234-ABCD'
            };
        }
    }

    getAuthToken() {
        // Check localStorage
        let token = localStorage.getItem('token');
        
        // Check URL parameters
        if (!token) {
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get('token');
        }
        
        // Check cookies
        if (!token) {
            token = this.getCookie('token');
        }
        
        return token;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.closest('.nav-item').dataset.section);
            });
        });

        // Wallet connection
        document.getElementById('walletStatus').addEventListener('click', () => {
            this.connectWallet();
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileOverlay = document.getElementById('mobileOverlay');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Responsive sidebar toggle
        this.setupResponsiveSidebar();
    }

    setupResponsiveSidebar() {
        // Add mobile menu toggle if needed
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        // Close sidebar when clicking outside on mobile
        mainContent.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (sidebar.classList.contains('open')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        sidebar.classList.add('open');
        if (mobileOverlay) {
            mobileOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        sidebar.classList.remove('open');
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    handleNavigation(section) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Handle different sections
        switch(section) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'portfolio':
                this.renderPortfolio();
                break;
            case 'investments':
                this.renderInvestments();
                break;
            case 'transactions':
                this.renderTransactions();
                break;
            case 'rewards':
                this.renderRewards();
                break;
            case 'achievements':
                this.renderAchievements();
                break;
            case 'settings':
                this.renderSettings();
                break;
            case 'support':
                this.renderSupport();
                break;
        }
    }

    renderDashboard() {
        // Update user name
        const userName = this.currentUser?.name || 'User';
        document.getElementById('userName').textContent = userName;
        document.getElementById('userNameTitle').textContent = userName;
        document.getElementById('userEmail').textContent = this.currentUser?.email || 'user@example.com';
        document.getElementById('userAvatar').textContent = userName.split(' ').map(n => n[0]).join('');

        // Update portfolio stats
        document.getElementById('totalValue').textContent = this.formatCurrency(this.portfolioData.totalValue);
        document.getElementById('stakedAmount').textContent = this.formatCurrency(this.portfolioData.totalStaked);
        document.getElementById('availableBalance').textContent = this.formatCurrency(this.portfolioData.availableBalance);
        document.getElementById('totalRewards').textContent = this.formatCurrency(this.portfolioData.totalRewards);

        // Render transactions
        this.renderTransactionsTable();
        
        // Update performance bars
        this.updatePerformanceBars();
    }

    renderTransactionsTable() {
        const tbody = document.getElementById('transactionsTable');
        tbody.innerHTML = '';

        this.transactions.forEach(tx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Type">
                    <div class="transaction-type">
                        <i class="fas ${this.getTransactionIcon(tx.type)} transaction-icon" style="color: ${this.getTransactionColor(tx.type)}"></i>
                        <span>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                    </div>
                </td>
                <td data-label="Amount"><strong>${tx.amount} ${tx.token}</strong></td>
                <td data-label="Token"><span class="status-badge status-completed">${tx.token}</span></td>
                <td data-label="Date">${this.formatDate(tx.timestamp)}</td>
                <td data-label="Status"><span class="status-badge status-${tx.status}">${tx.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePerformanceBars() {
        const performanceData = this.portfolioData.performance;
        
        // Update daily performance
        const dailyBar = document.querySelector('.performance-item:nth-child(1) .performance-fill');
        if (dailyBar) {
            dailyBar.style.width = `${Math.min(Math.abs(performanceData.daily) * 4, 100)}%`;
        }
        
        // Update weekly performance
        const weeklyBar = document.querySelector('.performance-item:nth-child(2) .performance-fill');
        if (weeklyBar) {
            weeklyBar.style.width = `${Math.min(Math.abs(performanceData.weekly) * 10, 100)}%`;
        }
        
        // Update monthly performance
        const monthlyBar = document.querySelector('.performance-item:nth-child(3) .performance-fill');
        if (monthlyBar) {
            monthlyBar.style.width = `${Math.min(Math.abs(performanceData.monthly) * 6.67, 100)}%`;
        }
    }

    initCharts() {
        // Portfolio Growth Chart
        const ctx = document.getElementById('portfolioChart');
        if (ctx) {
            this.charts.portfolio = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Portfolio Value',
                        data: [8000, 8500, 9200, 9800, 11200, 12500],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }
    }

    setupRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updatePortfolioValues();
        }, 30000);
    }

    updatePortfolioValues() {
        // Simulate small changes in portfolio values
        const change = (Math.random() - 0.5) * 0.02; // ±1% change
        this.portfolioData.totalValue *= (1 + change);
        
        // Update display
        document.getElementById('totalValue').textContent = this.formatCurrency(this.portfolioData.totalValue);
        
        // Update chart if it exists
        if (this.charts.portfolio) {
            const newData = this.charts.portfolio.data.datasets[0].data;
            newData.push(this.portfolioData.totalValue);
            if (newData.length > 6) {
                newData.shift();
            }
            this.charts.portfolio.update('none');
        }
    }

    getTransactionIcon(type) {
        const icons = {
            'stake': 'fa-piggy-bank',
            'unstake': 'fa-wallet',
            'reward': 'fa-trophy',
            'deposit': 'fa-arrow-up',
            'withdrawal': 'fa-arrow-down'
        };
        return icons[type] || 'fa-history';
    }

    getTransactionColor(type) {
        const colors = {
            'stake': '#10b981',
            'deposit': '#10b981',
            'reward': '#10b981',
            'unstake': '#ef4444',
            'withdrawal': '#ef4444'
        };
        return colors[type] || '#6b7280';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    async connectWallet() {
        const walletStatus = document.getElementById('walletStatus');
        
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    const account = accounts[0];
                    walletStatus.innerHTML = `
                        <i class="fas fa-wallet"></i>
                        <span>${account.slice(0, 6)}...${account.slice(-4)}</span>
                    `;
                    walletStatus.classList.add('wallet-connected');
                    
                    // Load blockchain data
                    this.loadBlockchainData(account);
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
                this.showNotification('Failed to connect wallet', 'error');
            }
        } else {
            this.showNotification('Please install MetaMask or another Web3 wallet', 'warning');
        }
    }

    async loadBlockchainData(account) {
        // This would load real blockchain data
        console.log('Loading blockchain data for account:', account);
        
        // Simulate loading blockchain data
        setTimeout(() => {
            this.showNotification('Wallet connected successfully!', 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Section rendering methods
    renderPortfolio() {
        console.log('Rendering portfolio view');
        // Implement portfolio view
    }

    renderInvestments() {
        console.log('Rendering investments view');
        // Implement investments view
    }

    renderTransactions() {
        console.log('Rendering transactions view');
        // Implement transactions view
    }

    renderRewards() {
        console.log('Rendering rewards view');
        // Implement rewards view
    }

    renderAchievements() {
        console.log('Rendering achievements view');
        // Implement achievements view
    }

    renderSettings() {
        console.log('Rendering settings view');
        // Implement settings view
    }

    renderSupport() {
        console.log('Rendering support view');
        // Implement support view
    }
}

// Global functions
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.btn-outline i');
    if (icon) {
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    }
}

function showDepositModal() {
    // Create a simple modal for deposit
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Deposit Funds</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Deposit functionality coming soon!</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

function showWithdrawModal() {
    // Create a simple modal for withdrawal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Withdraw Funds</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Withdrawal functionality coming soon!</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}
