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

// Enhanced UI/UX Functions for Better Data Source Management
function showDataSourceSelection() {
    // Hide all analysis sections
    const elementsToHide = [
        'current-analysis', 'upload-section', 'upload-results', 
        'filter-section', 'formsTable'
    ];
    
    elementsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Show data source selection
    const dataSourceSection = document.querySelector('.data-source-section');
    if (dataSourceSection) {
        dataSourceSection.style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSampleAnalysis() {
    // Hide data source selection and upload sections
    const dataSourceSection = document.querySelector('.data-source-section');
    if (dataSourceSection) dataSourceSection.style.display = 'none';
    
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) uploadSection.style.display = 'none';
    
    const uploadResults = document.getElementById('upload-results');
    if (uploadResults) uploadResults.style.display = 'none';
    
    // Show current analysis header
    const currentAnalysis = document.getElementById('current-analysis');
    if (currentAnalysis) {
        currentAnalysis.style.display = 'block';
        
        const title = document.getElementById('analysis-title');
        if (title) title.textContent = '📊 Singapore American School Analysis';
        
        const source = document.getElementById('analysis-source');
        if (source) {
            source.textContent = 'Sample Data - 15,131 Transactions';
            source.className = 'analysis-source sample';
        }
    }
    
    // Show filter section and table
    const filterSection = document.getElementById('filter-section');
    if (filterSection) filterSection.style.display = 'block';
    
    const formsTable = document.getElementById('formsTable');
    if (formsTable) formsTable.style.display = 'table';
    
    // Reset to original data if custom data is present
    const customRows = document.querySelectorAll('#formsTable tbody tr[data-custom="true"]');
    if (customRows.length > 0) {
        location.reload(); // Only reload if custom data is present
        return;
    }
    
    // Scroll to analysis
    setTimeout(() => {
        const analysisElement = document.getElementById('current-analysis');
        if (analysisElement) {
            analysisElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

function showUploadAnalysis() {
    // Hide other sections
    const dataSourceSection = document.querySelector('.data-source-section');
    if (dataSourceSection) dataSourceSection.style.display = 'none';
    
    const elementsToHide = [
        'current-analysis', 'upload-results', 'filter-section', 'formsTable'
    ];
    
    elementsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Show upload section
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) uploadSection.style.display = 'block';
    
    // Reset upload area and initialize
    resetUploadArea();
    initializeUpload();
    
    // Scroll to upload section
    setTimeout(() => {
        const uploadElement = document.getElementById('upload-section');
        if (uploadElement) {
            uploadElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
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
        
        // Simple CSV parsing
        const lines = csvContent.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        // Find relevant columns
        const nameColumn = findColumn(headers, ['form', 'name', 'document', 'title']);
        const countColumn = findColumn(headers, ['count', 'volume', 'number', 'quantity', 'total']);
        
        if (nameColumn === -1) {
            throw new Error('Could not find form name column. Expected headers like "Form", "Name", "Document", or "Title"');
        }
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
            if (row.length >= Math.max(nameColumn + 1, countColumn !== -1 ? countColumn + 1 : 0)) {
                const formName = row[nameColumn];
                const count = countColumn !== -1 ? parseInt(row[countColumn]) || 0 : 0;
                
                if (formName) {
                    data.push({ formName, count });
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
        forms: results.sort((a, b) => b.count - a.count),
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
    // Hide upload section
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) uploadSection.style.display = 'none';
    
    // Show current analysis header with custom data indication
    const currentAnalysis = document.getElementById('current-analysis');
    if (currentAnalysis) {
        currentAnalysis.style.display = 'block';
        
        const title = document.getElementById('analysis-title');
        if (title) title.textContent = '🎯 Your School\'s Analysis Results';
        
        const source = document.getElementById('analysis-source');
        if (source) {
            source.textContent = `Custom Data - ${analysis.summary.totalVolume.toLocaleString()} Transactions`;
            source.className = 'analysis-source custom';
        }
    }
    
    // Show upload results
    const resultsDiv = document.getElementById('upload-results');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        
        // Generate enhanced results summary
        const summaryDiv = document.getElementById('results-summary');
        if (summaryDiv) {
            summaryDiv.innerHTML = generateResultsSummary(analysis);
        }
    }
    
    // Show filter section and table with custom data
    const filterSection = document.getElementById('filter-section');
    if (filterSection) filterSection.style.display = 'block';
    
    const formsTable = document.getElementById('formsTable');
    if (formsTable) formsTable.style.display = 'table';
    
    // Update table with new data
    updateTableWithCustomData(analysis.forms);
    
    // Show success message
    showSuccess(`Analysis complete! Found ${analysis.summary.optimizationPercent}% optimization potential in your data.`);
    
    // Scroll to results
    setTimeout(() => {
        const analysisElement = document.getElementById('current-analysis');
        if (analysisElement) {
            analysisElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

function generateResultsSummary(analysis) {
    return `
        <div class="results-grid">
            <div class="result-card">
                <span class="result-number">${analysis.summary.totalVolume.toLocaleString()}</span>
                <div class="result-label">Total Transactions</div>
                <div class="result-description">Across ${analysis.summary.totalForms} unique form types</div>
            </div>
            <div class="result-card optimization">
                <span class="result-number">${analysis.summary.optimizationPercent}%</span>
                <div class="result-label">Optimization Potential</div>
                <div class="result-description">${analysis.summary.approvalVolume.toLocaleString()} transactions can be streamlined</div>
            </div>
            <div class="result-card preserved">
                <span class="result-number">${(100 - analysis.summary.optimizationPercent).toFixed(1)}%</span>
                <div class="result-label">Preserved as Signature</div>
                <div class="result-description">${analysis.summary.signatureVolume.toLocaleString()} transactions remain as e-signature</div>
            </div>
        </div>
        
        <div class="optimization-summary">
            <h4>🎯 Key Insights for Your School:</h4>
            <div class="insight-grid">
                <div class="insight-item">
                    <strong>Quick Wins:</strong> ${analysis.forms.filter(f => f.newType === 'Approval' && f.count > 100).length} high-volume forms ready for optimization
                </div>
                <div class="insight-item">
                    <strong>Compliance:</strong> All legal contracts and parent consents automatically preserved as signatures
                </div>
                <div class="insight-item">
                    <strong>Impact:</strong> Estimated 60% faster processing for optimized forms
                </div>
            </div>
        </div>
        
        <div class="top-opportunities">
            <h5>📋 Top Optimization Opportunities:</h5>
            <div class="opportunities-list">
                ${analysis.forms
                    .filter(form => form.newType === 'Approval' && form.count > 20)
                    .slice(0, 5)
                    .map(form => `
                        <div class="opportunity-item">
                            <div class="opportunity-header">
                                <strong>${form.formName}</strong>
                                <span class="opportunity-count">${form.count.toLocaleString()} transactions</span>
                            </div>
                            <div class="opportunity-reason">${form.reason}</div>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;
}

function updateTableWithCustomData(forms) {
    const tbody = document.querySelector('#formsTable tbody');
    if (!tbody) return;
    
    // Clear existing rows except summary rows
    const existingRows = tbody.querySelectorAll('tr:not(.total-row)');
    existingRows.forEach(row => row.remove());
    
    // Add new data rows with custom data attribute
    forms.forEach(form => {
        const row = document.createElement('tr');
        row.className = form.newType === 'Approval' ? 'changed' : '';
        row.setAttribute('data-custom', 'true');
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
    
    // Update summary rows with custom data
    const totalVolume = forms.reduce((sum, form) => sum + form.count, 0);
    const approvalVolume = forms.filter(f => f.newType === 'Approval').reduce((sum, form) => sum + form.count, 0);
    const signatureVolume = forms.filter(f => f.newType === 'Signature').reduce((sum, form) => sum + form.count, 0);
    
    // Remove old total rows
    const totalRows = tbody.querySelectorAll('.total-row');
    totalRows.forEach(row => row.remove());
    
    // Add custom summary rows
    tbody.appendChild(createSummaryRow('📊 YOUR SCHOOL - Total Analysis', totalVolume, 'Mixed', 'Optimized', 'COMPLETE', 'Custom analysis of your school\'s data', 'total-row'));
    tbody.appendChild(createSummaryRow('✅ APPROVAL OPTIMIZED', approvalVolume, 'Current', 'Approval', `${((approvalVolume/totalVolume)*100).toFixed(1)}%`, 'Converted to streamlined approval workflow', '', '#e8f5e8'));
    tbody.appendChild(createSummaryRow('✍️ SIGNATURE PRESERVED', signatureVolume, 'Current', 'Signature', `${((signatureVolume/totalVolume)*100).toFixed(1)}%`, 'Maintained for legal/contractual requirements', '', '#ffe6e6'));
    
    // Reset filter to show all
    filterTable('all', document.querySelector('.filter-btn'));
}

function createSummaryRow(title, count, col3, col4, col5, col6, className = '', bgColor = '') {
    const row = document.createElement('tr');
    if (className) row.className = className;
    if (bgColor) row.style.backgroundColor = bgColor;
    
    row.innerHTML = `
        <td><strong>${title}</strong></td>
        <td class="count"><strong>${count.toLocaleString()}</strong></td>
        <td class="type-col"><strong>${col3}</strong></td>
        <td class="type-col"><strong>${col4}</strong></td>
        <td><strong>${col5}</strong></td>
        <td><strong>${col6}</strong></td>
    `;
    return row;
}

function resetAnalysis() {
    // Hide results and show upload section
    const elementsToHide = ['upload-results', 'current-analysis', 'filter-section', 'formsTable'];
    elementsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Show upload section
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) uploadSection.style.display = 'block';
    
    // Reset upload area
    resetUploadArea();
    initializeUpload();
    
    // Scroll to upload section
    setTimeout(() => {
        const uploadElement = document.getElementById('upload-section');
        if (uploadElement) {
            uploadElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// UI Helper Functions
function showSuccess(message) {
    // Remove any existing success messages
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 1.5rem;">✅</span>
            <span>${message}</span>
        </div>
    `;
    messageDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: #d4edda;
        color: #155724;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid #c3e6cb;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 5000);
}

function showError(message) {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;
    
    uploadArea.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <div class="error-message">
                <h4>Upload Error</h4>
                <p>${message}</p>
            </div>
            <button class="retry-btn" onclick="resetUploadArea(); initializeUpload();">
                🔄 Try Again
            </button>
        </div>
    `;
    uploadArea.style.cssText += `
        border-color: #dc3545;
        background: #f8d7da;
        color: #721c24;
    `;
}

function showProgress(message, percent) {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;
    
    uploadArea.innerHTML = `
        <div class="progress-state">
            <div class="progress-icon">
                <div class="loading-spinner"></div>
            </div>
            <div class="progress-text">
                <h4>${message}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <p>${percent}% Complete</p>
            </div>
        </div>
    `;
}

function resetUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;
    
    uploadArea.style.cssText = ''; // Reset any error styling
    uploadArea.innerHTML = `
        <div class="upload-icon">📁</div>
        <div class="upload-text">
            <h4>Drop your CSV file here or click to browse</h4>
            <p>Supported format: CSV with Form Name and Count columns</p>
        </div>
        <input type="file" id="csv-file" accept=".csv" style="display: none;">
    `;
}

// Navigation and utility functions
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

function initializeSearch() {
    const filterHeader = document.querySelector('.filter-header');
    if (!filterHeader) return;
    
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
    
    const searchIcon = document.createElement('span');
    searchIcon.textContent = '🔍';
    searchIcon.style.fontSize = '1.2rem';
    
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    
    const filterInfo = filterHeader.querySelector('.filter-info');
    if (filterInfo) {
        filterInfo.replaceWith(searchContainer);
    }
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#formsTable tbody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            if (row.classList.contains('total-row') || 
                row.classList.contains('summary-primary') || 
                row.classList.contains('summary-success') || 
                row.classList.contains('summary-preserved')) {
                return;
            }
            
            const formName = row.cells && row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
            const shouldShow = formName.includes(searchTerm);
            
            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        updateVisibleCount(visibleCount);
    });
    
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#3498db';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = '#e1e8ed';
    });
}

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

function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .error-state {
            text-align: center;
            padding: 2rem;
        }
        
        .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .error-message h4 {
            margin-bottom: 0.5rem;
            color: #721c24;
        }
        
        .error-message p {
            margin-bottom: 1.5rem;
            color: #721c24;
        }
        
        .retry-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }
        
        .retry-btn:hover {
            background: #c82333;
        }
        
        .progress-state {
            text-align: center;
            padding: 2rem;
        }
        
        .progress-icon {
            margin-bottom: 1rem;
        }
        
        .progress-text h4 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .progress-text p {
            color: #666;
            margin-top: 0.5rem;
        }
        
        .opportunity-item {
            background: #f8fafc;
            border: 1px solid #e1e8ed;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .opportunity-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .opportunity-count {
            background: #e8f4f8;
            color: #2980b9;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .opportunity-reason {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        
        .optimization-summary {
            background: #f8fafc;
            border: 1px solid #e1e8ed;
            border-radius: 8px;
            padding: 2rem;
            margin: 2rem 0;
        }
        
        .optimization-summary h4 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .insight-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .insight-item {
            background: white;
            padding: 1rem;
            border-radius: 6px;
            border-left: 3px solid #3498db;
        }
        
        .top-opportunities {
            margin-top: 2rem;
        }
        
        .top-opportunities h5 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .opportunities-list {
            max-height: 400px;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
}

// Main initialization function
function initialize() {
    try {
        // Start by showing data source selection
        showDataSourceSelection();
        
        // Initialize all core features
        initializeNavigation();
        initializeKeyboardShortcuts();
        initializeSearch();
        updateProgressIndicator();
        addAnimations();
        
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