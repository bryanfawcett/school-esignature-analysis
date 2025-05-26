function filterTable(filterType, clickedButton) {
    const table = document.getElementById('formsTable');
    const rows = table.getElementsByTagName('tr');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    } else {
        // Find the button that was clicked by filterType
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(filterType.toLowerCase()) || 
                (filterType === 'all' && btn.textContent === 'All Forms')) {
                btn.classList.add('active');
            }
        });
    }
    
    // Show/hide rows based on filter
    for (let i = 1; i < rows.length; i++) { // Skip header row
        const row = rows[i];
        const status = row.cells[4] ? row.cells[4].textContent : '';
        const newType = row.cells[3] ? row.cells[3].textContent : '';
        const count = row.cells[1] ? parseInt(row.cells[1].textContent.replace(/,/g, '')) : 0;
        
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
                showRow = status === 'CHANGED';
                break;
            case 'high-volume':
                showRow = count > 100;
                break;
        }
        
        row.style.display = showRow ? '' : 'none';
    }
    
    // Update visible row count (optional enhancement)
    updateRowCount(filterType);
}

function updateRowCount(filterType) {
    const table = document.getElementById('formsTable');
    const rows = table.getElementsByTagName('tr');
    let visibleCount = 0;
    
    for (let i = 1; i < rows.length; i++) { // Skip header row
        if (rows[i].style.display !== 'none') {
            visibleCount++;
        }
    }
    
    // Update filter button text to show count (optional)
    const activeButton = document.querySelector('.filter-btn.active');
    if (activeButton && filterType !== 'all') {
        const originalText = activeButton.textContent.split(' (')[0];
        activeButton.textContent = `${originalText} (${visibleCount})`;
    }
}

// Add smooth scrolling to table when filters are applied
function smoothScrollToTable() {
    document.getElementById('formsTable').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Initialize with all forms showing
window.onload = function() {
    filterTable('all', document.querySelector('.filter-btn.active'));
    
    // Add click handlers for enhanced UX
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(smoothScrollToTable, 100);
        });
    });
};

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        const buttons = document.querySelectorAll('.filter-btn');
        const activeIndex = Array.from(buttons).findIndex(btn => btn.classList.contains('active'));
        
        switch(e.key) {
            case '1':
                e.preventDefault();
                buttons[0].click();
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

// Add table sorting functionality (optional enhancement)
function sortTable(columnIndex) {
    const table = document.getElementById('formsTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.classList.contains('total-row'));
    
    rows.sort((a, b) => {
        const aVal = a.cells[columnIndex].textContent;
        const bVal = b.cells[columnIndex].textContent;
        
        // Handle numeric columns
        if (columnIndex === 1) { // Count column
            return parseInt(bVal.replace(/,/g, '')) - parseInt(aVal.replace(/,/g, ''));
        }
        
        // Handle text columns
        return aVal.localeCompare(bVal);
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
    
    // Re-append total rows at the end
    const totalRows = table.querySelectorAll('.total-row');
    totalRows.forEach(row => tbody.appendChild(row));
}