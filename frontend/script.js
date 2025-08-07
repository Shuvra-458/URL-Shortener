// Configuration
const API_BASE_URL = 'https://url-shortener-tb5k.onrender.com';

// State Management
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// DOM Elements
const elements = {
    // Navigation
    navMenu: document.getElementById('navMenu'),
    hamburger: document.getElementById('hamburger'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Forms
    shortenForm: document.getElementById('shortenForm'),
    originalUrl: document.getElementById('originalUrl'),
    customCode: document.getElementById('customCode'),
    expiryDays: document.getElementById('expiryDays'),
    shortenBtn: document.getElementById('shortenBtn'),
    toggleAdvanced: document.getElementById('toggleAdvanced'),
    advancedOptions: document.getElementById('advancedOptions'),
    
    // Results
    resultCard: document.getElementById('resultCard'),
    shortUrl: document.getElementById('shortUrl'),
    copyBtn: document.getElementById('copyBtn'),
    originalUrlDisplay: document.getElementById('originalUrlDisplay'),
    expiryDisplay: document.getElementById('expiryDisplay'),
    expiryDate: document.getElementById('expiryDate'),
    
    // Stats
    authRequired: document.getElementById('authRequired'),
    statsContainer: document.getElementById('statsContainer'),
    totalLinks: document.getElementById('totalLinks'),
    totalClicks: document.getElementById('totalClicks'),
    avgClicks: document.getElementById('avgClicks'),
    statsTableBody: document.getElementById('statsTableBody'),
    loginPrompt: document.getElementById('loginPrompt'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    closeLogin: document.getElementById('closeLogin'),
    closeRegister: document.getElementById('closeRegister'),
    
    // Toast and Loading
    toastContainer: document.getElementById('toastContainer'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    
    if (authToken) {
        updateAuthState(true);
        loadUserStats();
    }
});

function initializeApp() {
    // Set up smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function setupEventListeners() {
    // Navigation
    elements.hamburger.addEventListener('click', toggleMobileMenu);
    elements.loginBtn.addEventListener('click', () => showModal('login'));
    elements.registerBtn.addEventListener('click', () => showModal('register'));
    elements.logoutBtn.addEventListener('click', logout);
    elements.loginPrompt.addEventListener('click', () => showModal('login'));
    
    // Forms
    elements.shortenForm.addEventListener('submit', handleShortenUrl);
    elements.toggleAdvanced.addEventListener('click', toggleAdvancedOptions);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    
    // Modals
    elements.closeLogin.addEventListener('click', () => hideModal('login'));
    elements.closeRegister.addEventListener('click', () => hideModal('register'));
    
    // Close modals on outside click
    elements.loginModal.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) hideModal('login');
    });
    elements.registerModal.addEventListener('click', (e) => {
        if (e.target === elements.registerModal) hideModal('register');
    });
    
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal('login');
            hideModal('register');
        }
    });
}

// Navigation Functions
function toggleMobileMenu() {
    elements.navMenu.classList.toggle('show');
    elements.hamburger.classList.toggle('active');
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// URL Shortening Functions
async function handleShortenUrl(e) {
    e.preventDefault();
    
    const originalUrl = elements.originalUrl.value.trim();
    const customCode = elements.customCode.value.trim();
    const expiryDays = elements.expiryDays.value;
    
    if (!originalUrl) {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    // Validate URL format
    try {
        new URL(originalUrl);
    } catch {
        showToast('Please enter a valid URL format', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const payload = {
            original_url: originalUrl,
            ...(customCode && { custom_code: customCode }),
            ...(expiryDays && { expires_in_days: parseInt(expiryDays) })
        };
        
        const headers = {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Token ${authToken}` })
        };
        
        const response = await fetch(`${API_BASE_URL}/shorten/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayResult(data);
            elements.shortenForm.reset();
            elements.advancedOptions.classList.remove('show');
            showToast('URL shortened successfully!', 'success');
            
            // Refresh stats if user is logged in
            if (authToken) {
                setTimeout(loadUserStats, 1000);
            }
        } else {
            throw new Error(data.error || 'Failed to shorten URL');
        }
    } catch (error) {
        console.error('Error shortening URL:', error);
        showToast(error.message || 'Failed to shorten URL', 'error');
    } finally {
        showLoading(false);
    }
}

function displayResult(data) {
    elements.shortUrl.value = data.short_url;
    elements.originalUrlDisplay.textContent = data.original_url;
    
    if (data.expires_at) {
        elements.expiryDisplay.style.display = 'block';
        elements.expiryDate.textContent = new Date(data.expires_at).toLocaleDateString();
    } else {
        elements.expiryDisplay.style.display = 'none';
    }
    
    elements.resultCard.style.display = 'block';
    elements.resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleAdvancedOptions() {
    elements.advancedOptions.classList.toggle('show');
    const icon = elements.toggleAdvanced.querySelector('i');
    icon.classList.toggle('fa-cog');
    icon.classList.toggle('fa-times');
}

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(elements.shortUrl.value);
        showToast('URL copied to clipboard!', 'success');
        
        // Visual feedback
        const originalIcon = elements.copyBtn.innerHTML;
        elements.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        elements.copyBtn.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            elements.copyBtn.innerHTML = originalIcon;
            elements.copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        showToast('Failed to copy URL', 'error');
    }
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = username;
            
            updateAuthState(true);
            hideModal('login');
            elements.loginForm.reset();
            showToast(`Welcome back, ${username}!`, 'success');
            
            // Load user stats
            loadUserStats();
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            hideModal('register');
            elements.registerForm.reset();
            showToast('Account created successfully! Please log in.', 'success');
            
            // Auto-fill login form
            document.getElementById('loginUsername').value = username;
            setTimeout(() => showModal('login'), 1000);
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed', 'error');
    } finally {
        showLoading(false);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    
    updateAuthState(false);
    showToast('Logged out successfully', 'success');
    
    // Clear stats
    elements.statsContainer.style.display = 'none';
    elements.authRequired.style.display = 'flex';
}

function updateAuthState(isLoggedIn) {
    if (isLoggedIn) {
        elements.loginBtn.style.display = 'none';
        elements.registerBtn.style.display = 'none';
        elements.logoutBtn.style.display = 'inline-flex';
        elements.authRequired.style.display = 'none';
        elements.statsContainer.style.display = 'block';
    } else {
        elements.loginBtn.style.display = 'inline-flex';
        elements.registerBtn.style.display = 'inline-flex';
        elements.logoutBtn.style.display = 'none';
        elements.authRequired.style.display = 'flex';
        elements.statsContainer.style.display = 'none';
    }
}

// Stats Functions
async function loadUserStats() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/stats/`, {
            headers: {
                'Authorization': `Token ${authToken}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            displayStats(stats);
        } else if (response.status === 401) {
            // Token expired or invalid
            logout();
            showToast('Session expired. Please log in again.', 'warning');
        } else {
            throw new Error('Failed to load stats');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Failed to load statistics', 'error');
    }
}

function displayStats(stats) {
    // Calculate overview stats
    const totalLinks = stats.length;
    const totalClicks = stats.reduce((sum, url) => sum + url.click_count, 0);
    const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;
    
    // Update overview cards
    elements.totalLinks.textContent = totalLinks;
    elements.totalClicks.textContent = totalClicks.toLocaleString();
    elements.avgClicks.textContent = avgClicks;
    
    // Update table
    elements.statsTableBody.innerHTML = '';
    
    if (stats.length === 0) {
        elements.statsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    No URLs found. Create your first short URL above!
                </td>
            </tr>
        `;
        return;
    }
    
    stats.forEach(url => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <code style="background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.875rem;">
                    ${url.short_code}
                </code>
            </td>
            <td>
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${url.original_url}">
                    ${url.original_url}
                </div>
            </td>
            <td>
                <span style="font-weight: 600; color: var(--primary-color);">
                    ${url.click_count}
                </span>
            </td>
            <td>${new Date(url.created_at).toLocaleDateString()}</td>
            <td>${url.expires_at ? new Date(url.expires_at).toLocaleDateString() : 'Never'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn copy" onclick="copyShortUrl('${url.short_code}')" title="Copy short URL">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
        `;
        elements.statsTableBody.appendChild(row);
    });
}

// Utility Functions
function copyShortUrl(shortCode) {
    const shortUrl = `${API_BASE_URL}/s/${shortCode}/`;
    navigator.clipboard.writeText(shortUrl).then(() => {
        showToast('Short URL copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy URL', 'error');
    });
}

function showModal(type) {
    const modal = type === 'login' ? elements.loginModal : elements.registerModal;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

function hideModal(type) {
    const modal = type === 'login' ? elements.loginModal : elements.registerModal;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas ${iconMap[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeToast(toast);
    }, 5000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeToast(toast);
    });
}

function removeToast(toast) {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        elements.loadingOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Add CSS for toast slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Error handling for network issues
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('Connection lost. Please check your internet.', 'warning');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus URL input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.originalUrl.focus();
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === elements.originalUrl) {
            e.preventDefault();
            elements.shortenForm.dispatchEvent(new Event('submit'));
        }
    }
});
