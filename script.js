// Enhanced table filtering with improved UX
function filterTable(filterType, clickedButton) {
    const table = document.getElementById('formsTable');
    if (!table) return;
    
    const rows = table.getElementsByTagName('tr');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button state
    buttons.forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    let visibleCount = 0;
    
    // Filter rows based on type
    for (let i = 1; i < rows.length; i++) { // Skip header row
        const row = rows[i];
        
        // Skip if row doesn't have enough cells
        if (!row.cells || row.cells.length < 5) continue;
        
        const status = row.cells[4] ? row.cells[4].textContent.trim() : '';
        const newType = row.cells[3] ? row.cells[3].textContent.trim() : '';
        const countText = row.cells[1] ? row.cells[1].textContent.replace(/,/g, '') : '0';
        const count = parseInt(countText) || 0;
        
        let showRow = false;
        
        switch(filterType) {
            case 'all':
                showRow = true;
                break;
            case 'signature':
                showRow = newType.includes('Signature');
                break;
            case 'approval':
                showRow = newType.includes('Approval');
                break;
            case 'changed':
                showRow = status === 'OPTIMIZED';
                break;
            case 'high-volume':
                showRow = count > 100;
                break;
            default:
                showRow = true;
        }
        
        if (showRow) {
            row.style.display = '';
            if (!row.classList.contains('total-row') && 
                !row.classList.contains('summary-primary') && 
                !row.classList.contains('summary-success') && 
                !row.classList.contains('summary-preserved')) {
                visibleCount++;
            }
        } else {
            row.style.display = 'none';
        }
    }
    
    // Update visible count display
    updateVisibleCount(visibleCount);
}

// Update the visible forms counter
function updateVisibleCount(count) {
    const countElement = document.getElementById('visible-count');
    if (countElement) {
        countElement.textContent = count.toLocaleString();
    }
}

// Enhanced table sorting functionality
function sortTable(columnIndex) {
    const table = document.getElementById('formsTable');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => 
        !row.classList.contains('total-row') && 
        !row.classList.contains('summary-primary') && 
        !row.classList.contains('summary-success') && 
        !row.classList.contains('summary-preserved')
    );
    
    // Determine sort direction
    const header = table.querySelectorAll('th')[columnIndex];
    if (!header) return;
    
    const currentSort = header.getAttribute('data-sort') || 'desc';
    const newSort = currentSort === 'desc' ? 'asc' : 'desc';
    
    // Clear all sort indicators
    table.querySelectorAll('th').forEach(th => {
        th.removeAttribute('data-sort');
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.textContent = '↕️';
    });
    
    // Set new sort direction
    header.setAttribute('data-sort', newSort);
    const sortIcon = header.querySelector('.sort-icon');
    if (sortIcon) {
        sortIcon.textContent = newSort === 'asc' ? '↑' : '↓';
    }
    
    // Sort rows
    rows.sort((a, b) => {
        if (!a.cells || !b.cells || !a.cells[columnIndex] || !b.cells[columnIndex]) {
            return 0;
        }
        
        const aVal = a.cells[columnIndex].textContent.trim();
        const bVal = b.cells[columnIndex].textContent.trim();
        
        let comparison = 0;
        
        // Handle numeric columns (count column)
        if (columnIndex === 1) {
            const aNum = parseInt(aVal.replace(/,/g, '')) || 0;
            const bNum = parseInt(bVal.replace(/,/g, '')) || 0;
            comparison = aNum - bNum;
        } else {
            // Handle text columns
            comparison = aVal.localeCompare(bVal);
        }
        
        return newSort === 'asc' ? comparison : -comparison;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
    
    // Re-append summary rows at the end
    const summaryRows = tbody.querySelectorAll('.total-row, .summary-primary, .summary-success, .summary-preserved');
    summaryRows.forEach(row => tbody.appendChild(row));
}

// Smooth scrolling for navigation links
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Enhanced keyboard navigation
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            const buttons = document.querySelectorAll('.filter-btn');
            
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    if (buttons[0]) buttons[0].click();
                    break;
                case '2':
                    e.preventDefault();
                    if (buttons[1]) buttons[1].click();
                    break;
                case '3':
                    e.preventDefault();
                    if (buttons[2]) buttons[2].click();
                    break;
                case '4':
                    e.preventDefault();
                    if (buttons[3]) buttons[3].click();
                    break;
                case '5':
                    e.preventDefault();
                    if (buttons[4]) buttons[4].click();
                    break;
            }
        }
    });
}

// Initialize search functionality
function initializeSearch() {
    const filterHeader = document.querySelector('.filter-header');
    if (!filterHeader) return;
    
    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search forms...';
    searchInput.id = 'search-input';
    searchInput.style.cssText = `
        padding: 0.5rem 1rem;
        border: 2px solid #e1e8ed;
        border-radius: 6px;
        font-size: 0.9rem;
        width: 250px;
        outline: none;
        transition: border-color 0.3s ease;
    `;
    
    // Add search icon
    const searchIcon = document.createElement('span');
    searchIcon.textContent = '🔍';
    searchIcon.style.fontSize = '1.2rem';
    
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    
    // Replace the filter info with search
    const filterInfo = filterHeader.querySelector('.filter-info');
    if (filterInfo) {
        filterInfo.replaceWith(searchContainer);
    }
    
    // Add search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#formsTable tbody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            if (row.classList.contains('total-row') || 
                row.classList.contains('summary-primary') || 
                row.classList.contains('summary-success') || 
                row.classList.contains('summary-preserved')) {
                return; // Skip summary rows
            }
            
            const formName = row.cells && row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
            const shouldShow = formName.includes(searchTerm);
            
            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        updateVisibleCount(visibleCount);
    });
    
    // Style focus state
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#3498db';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = '#e1e8ed';
    });
}

// Add loading animation
function showLoadingAnimation() {
    const table = document.getElementById('formsTable');
    if (table) {
        table.style.opacity = '0.7';
        table.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            table.style.opacity = '1';
        }, 300);
    }
}

// Add progress indicator
function updateProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
        transition: width 0.3s ease;
        width: 0%;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

// Main initialization function
function initialize() {
    try {
        // Set initial filter to show all forms
        const firstButton = document.querySelector('.filter-btn');
        if (firstButton) {
            filterTable('all', firstButton);
        }
        
        // Initialize all features
        initializeNavigation();
        initializeKeyboardShortcuts();
        initializeSearch();
        updateProgressIndicator();
        
        // Add enhanced filter click handlers
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                showLoadingAnimation();
            });
        });
        
        // Initialize visible count
        const totalRows = document.querySelectorAll('#formsTable tbody tr:not(.total-row):not(.summary-primary):not(.summary-success):not(.summary-preserved)').length;
        updateVisibleCount(totalRows);
        
        console.log('📊 SAS E-Signature Study Dashboard Initialized');
        console.log('💡 Tip: Use Ctrl+1,2,3,4,5 for quick filtering');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}