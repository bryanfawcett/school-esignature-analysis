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

// Form classification logic for any school
function classifyFormForAnySchool(formName, count = 0) {
    if (!formName || formName === null || formName === '') {
        return {
            newType: 'Approval',
            reason: 'Default classification for unclear forms',
            priority: 'Low',
            category: 'Unknown'
        };
    }
    
    const form = formName.toLowerCase();
    
    // High priority signatures (legal/contractual - must remain signatures)
    const contractualKeywords = [
        'contract', 'employment', 'faculty', 'teacher', 'coach', 'staff contract',
        'agreement', 'legal', 'consent form', 'permission form', 'waiver',
        'transcript', 'record release', 'participation agreement',
        'board', 'petition', 'governance', 'vendor agreement',
        'financial agreement', 'loan', 'mortgage', 'insurance'
    ];
    
    // Medium priority signatures (important consents)
    const consentKeywords = [
        'parent consent', 'field trip', 'medical', 'emergency contact',
        'yearlong consent', 'trip permission', 'activity consent',
        'photo release', 'media consent', 'student contract'
    ];
    
    // High priority approvals (policies, acknowledgments)
    const policyKeywords = [
        'digital citizenship', 'code of conduct', 'athletic code', 'policy',
        'acknowledgment', 'handbook', 'rules', 'guidelines', 'acceptable use',
        'technology policy', 'internet policy', 'behavior agreement'
    ];
    
    // Medium priority approvals (administrative processes)
    const adminKeywords = [
        'device acceptance', 'devices acceptance', 'equipment', 'laptop',
        'ipad', 'technology', 'computer', 'device responsibility',
        'reimbursement', 'expense', 'payroll', 'hr form', 'time sheet',
        'professional development', 'training', 'workshop',
        'substitute', 'sub form', 'replacement', 'interim',
        'passport', 'information update', 'data update', 'profile update',
        'emergency info', 'contact info', 'personal info'
    ];
    
    // Application and enrollment forms (typically signatures)
    const applicationKeywords = [
        'application', 'enrollment', 'admission', 'registration form',
        'new student', 'transfer', 'program application'
    ];
    
    // Check contractual (highest priority for signatures)
    for (let keyword of contractualKeywords) {
        if (form.includes(keyword)) {
            return {
                newType: 'Signature',
                reason: `Legal/contractual document requiring signature: contains "${keyword}"`,
                priority: 'Critical',
                category: 'Legal Contract'
            };
        }
    }
    
    // Check consent forms
    for (let keyword of consentKeywords) {
        if (form.includes(keyword)) {
            return {
                newType: 'Signature',
                reason: `Parent/guardian consent required: contains "${keyword}"`,
                priority: 'High',
                category: 'Consent Form'
            };
        }
    }
    
    // Check applications
    for (let keyword of applicationKeywords) {
        if (form.includes(keyword)) {
            return {
                newType: 'Signature',
                reason: `Formal application requiring signature: contains "${keyword}"`,
                priority: 'High',
                category: 'Application'
            };
        }
    }
    
    // Check policy acknowledgments (high priority for conversion)
    for (let keyword of policyKeywords) {
        if (form.includes(keyword)) {
            return {
                newType: 'Approval',
                reason: `Policy acknowledgment suitable for approval workflow: contains "${keyword}"`,
                priority: 'High',
                category: 'Policy Acknowledgment'
            };
        }
    }
    
    // Check administrative processes
    for (let keyword of adminKeywords) {
        if (form.includes(keyword)) {
            return {
                newType: 'Approval',
                reason: `Administrative process suitable for approval: contains "${keyword}"`,
                priority: count > 100 ? 'High' : 'Medium',
                category: 'Administrative Process'
            };
        }
    }
    
    // Default classification based on volume and common patterns
    if (count > 500) {
        return {
            newType: 'Approval',
            reason: 'High volume form likely suitable for approval workflow',
            priority: 'Medium',
            category: 'High Volume Form'
        };
    }
    
    // Conservative default - keep as signature if unclear
    return {
        newType: 'Signature',
        reason: 'Conservative classification - review manually to confirm requirements',
        priority: 'Low',
        category: 'Requires Review'
    };
}

// CSV Upload and Analysis Functions
function initializeUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('csv-file');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function handleFileUpload(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showError('Please upload a CSV file.');
        return;
    }
    
    showProgress('Reading file...', 10);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        showProgress('Parsing CSV data...', 30);
        parseAndAnalyzeCSV(e.target.result);
    };
    reader.onerror = function() {
        showError('Error reading file. Please try again.');
    };
    reader.readAsText(file);
}

function parseAndAnalyzeCSV(csvContent) {
    try {
        showProgress('Analyzing forms...', 50);
        
        // Simple CSV parsing (handles basic cases)
        const lines = csvContent.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        // Find relevant columns
        const nameColumn = findColumn(headers, ['form', 'name', 'document', 'title']);
        const countColumn = findColumn(headers, ['count', 'volume', 'number', 'quantity', 'total']);
        const typeColumn = findColumn(headers, ['type', 'category', 'classification']);
        
        if (nameColumn === -1) {
            throw new Error('Could not find form name column. Expected headers like "Form", "Name", "Document", or "Title"');
        }
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
            if (row.length >= Math.max(nameColumn + 1, countColumn + 1)) {
                const formName = row[nameColumn];
                const count = countColumn !== -1 ? parseInt(row[countColumn]) || 0 : 0;
                const existingType = typeColumn !== -1 ? row[typeColumn] : '';
                
                if (formName) {
                    data.push({ formName, count, existingType });
                }
            }
        }
        
        if (data.length === 0) {
            throw new Error('No valid form data found in CSV');
        }
        
        showProgress('Generating recommendations...', 80);
        
        // Analyze the data
        const analysis = analyzeUploadedData(data);
        
        showProgress('Complete!', 100);
        
        setTimeout(() => {
            displayAnalysisResults(analysis);
        }, 500);
        
    } catch (error) {
        showError(`Error processing CSV: ${error.message}`);
    }
}

function findColumn(headers, possibleNames) {
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase();
        for (let name of possibleNames) {
            if (header.includes(name)) {
                return i;
            }
        }
    }
    return -1;
}

function analyzeUploadedData(data) {
    const results = data.map(item => {
        const classification = classifyFormForAnySchool(item.formName, item.count);
        return {
            ...item,
            ...classification,
            impact: item.count > 100 ? 'High' : item.count > 20 ? 'Medium' : 'Low'
        };
    });
    
    // Calculate summary statistics
    const totalForms = results.length;
    const totalVolume = results.reduce((sum, item) => sum + item.count, 0);
    const approvalForms = results.filter(item => item.newType === 'Approval');
    const signatureForms = results.filter(item => item.newType === 'Signature');
    const approvalVolume = approvalForms.reduce((sum, item) => sum + item.count, 0);
    const signatureVolume = signatureForms.reduce((sum, item) => sum + item.count, 0);
    
    const optimizationPercent = totalVolume > 0 ? (approvalVolume / totalVolume * 100).toFixed(1) : 0;
    
    return {
        forms: results.sort((a, b) => b.count - a.count), // Sort by volume
        summary: {
            totalForms,
            totalVolume,
            approvalForms: approvalForms.length,
            signatureForms: signatureForms.length,
            approvalVolume,
            signatureVolume,
            optimizationPercent
        }
    };
}

function displayAnalysisResults(analysis) {
    // Hide upload section and show results
    document.getElementById('upload-section').style.display = 'none';
    
    const resultsDiv = document.getElementById('upload-results');
    resultsDiv.style.display = 'block';
    
    // Generate summary
    const summaryDiv = document.getElementById('results-summary');
    summaryDiv.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <span class="result-number">${analysis.summary.totalVolume.toLocaleString()}</span>
                <div class="result-label">Total Transactions</div>
                <div class="result-description">Across ${analysis.summary.totalForms} form types</div>
            </div>
            <div class="result-card optimization">
                <span class="result-number">${analysis.summary.optimizationPercent}%</span>
                <div class="result-label">Optimization Potential</div>
                <div class="result-description">${analysis.summary.approvalVolume.toLocaleString()} transactions</div>
            </div>
            <div class="result-card preserved">
                <span class="result-number">${(100 - analysis.summary.optimizationPercent).toFixed(1)}%</span>
                <div class="result-label">Preserved as Signature</div>
                <div class="result-description">${analysis.summary.signatureVolume.toLocaleString()} transactions</div>
            </div>
        </div>
        
        <div class="analysis-recommendations">
            <h5>📋 Top Optimization Opportunities:</h5>
            <ul>
                ${analysis.forms
                    .filter(form => form.newType === 'Approval' && form.count > 50)
                    .slice(0, 5)
                    .map(form => `<li><strong>${form.formName}</strong> (${form.count.toLocaleString()} transactions) - ${form.reason}</li>`)
                    .join('')}
            </ul>
        </div>
    `;
    
    // Update table with new data
    updateTableWithCustomData(analysis.forms);
    
    // Show success message
    showSuccess(`Analysis complete! Found ${analysis.summary.optimizationPercent}% optimization potential in your data.`);
    
    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function updateTableWithCustomData(forms) {
    const tbody = document.querySelector('#formsTable tbody');
    
    // Clear existing rows except summary rows
    const existingRows = tbody.querySelectorAll('tr:not(.total-row)');
    existingRows.forEach(row => row.remove());
    
    // Add new data rows
    forms.forEach(form => {
        const row = document.createElement('tr');
        row.className = form.newType === 'Approval' ? 'changed' : '';
        row.innerHTML = `
            <td class="form-name">${form.formName}</td>
            <td class="count">${form.count.toLocaleString()}</td>
            <td class="type-col">Current Process</td>
            <td class="type-col ${form.newType.toLowerCase()}">${form.newType}</td>
            <td>${form.newType === 'Approval' ? 'OPTIMIZED' : 'PRESERVED'}</td>
            <td>${form.reason}</td>
        `;
        tbody.insertBefore(row, tbody.querySelector('.total-row'));
    });
    
    // Update summary rows
    const totalVolume = forms.reduce((sum, form) => sum + form.count, 0);
    const approvalVolume = forms.filter(f => f.newType === 'Approval').reduce((sum, form) => sum + form.count, 0);
    const signatureVolume = forms.filter(f => f.newType === 'Signature').reduce((sum, form) => sum + form.count, 0);
    
    // Update totals
    const totalRow = tbody.querySelector('.total-row');
    if (totalRow) {
        totalRow.cells[1].innerHTML = `<strong>${totalVolume.toLocaleString()}</strong>`;
    }
    
    // Reset filter to show all
    filterTable('all', document.querySelector('.filter-btn'));
}

// Data Source Toggle Functions
function showSampleData() {
    document.getElementById('sample-btn').classList.add('active');
    document.getElementById('upload-btn').classList.remove('active');
    
    // Hide upload sections
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('upload-results').style.display = 'none';
    
    // Show filter section and original table
    document.getElementById('filter-section').style.display = 'block';
    document.getElementById('formsTable').style.display = 'table';
    
    // Reset to original Singapore American School data
    location.reload(); // Simple way to reset to original state
}

function showUploadSection() {
    document.getElementById('upload-btn').classList.add('active');
    document.getElementById('sample-btn').classList.remove('active');
    
    // Show upload section
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('upload-results').style.display = 'none';
    
    // Reset upload area if needed
    resetUploadArea();
    initializeUpload();
}

function resetAnalysis() {
    document.getElementById('upload-results').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    resetUploadArea();
    initializeUpload();
}

// UI Helper Functions
function showProgress(message, percent) {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.innerHTML = `
        <div class="progress-container">
            <div class="loading-spinner"></div>
            <div class="progress-text">${message}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}

function showError(message) {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.innerHTML = `
        <div class="error-message">
            ❌ ${message}
        </div>
        <div class="upload-text">
            <h4>Click to try again</h4>
            <p>Upload a CSV file with your e-signature data</p>
        </div>
    `;
    
    // Re-initialize upload after error
    setTimeout(() => {
        resetUploadArea();
        initializeUpload();
    }, 3000);
}

function showSuccess(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = `✅ ${message}`;
    
    const resultsDiv = document.getElementById('upload-results');
    resultsDiv.insertBefore(messageDiv, resultsDiv.firstChild);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function resetUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.innerHTML = `
        <div class="upload-icon">📁</div>
        <div class="upload-text">
            <h4>Drop your CSV file here or click to browse</h4>
            <p>Supported format: CSV with columns for Form Name, Count/Volume, and optionally Type</p>
        </div>
        <input type="file" id="csv-file" accept=".csv" style="display: none;">
    `;
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
        
        // Initialize upload functionality
        initializeUpload();
        
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
        console.log('🔄 Upload your school\'s CSV data for custom analysis');
        
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