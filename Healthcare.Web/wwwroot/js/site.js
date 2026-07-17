/* =====================================================
   HEALTHCARE EXPENSE TRACKER - MAIN JAVASCRIPT
   ===================================================== */

// =====================================================
// THEME SYSTEM
// =====================================================
function getTheme() {
    return localStorage.getItem('healthcare-theme') || 'light';
}

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('healthcare-theme', theme);
    document.querySelectorAll('.theme-option').forEach(function(o) {
        o.classList.toggle('active', o.getAttribute('data-theme') === theme);
    });
    var btn = document.getElementById('themeToggleText');
    if (btn) {
        var labels = { light: 'Light', dark: 'Dark', ocean: 'Ocean', rose: 'Rose' };
        btn.textContent = labels[theme] || 'Light';
    }
}

function initTheme() {
    var saved = getTheme();
    setTheme(saved);
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();

    var themeBtn = document.getElementById('themeToggle');
    var themeDrop = document.getElementById('themeDropdown');
    if (themeBtn && themeDrop) {
        themeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var nd = document.getElementById('notifDropdown');
            if (nd) nd.classList.remove('show');
            themeDrop.classList.toggle('show');
        });

        var options = themeDrop.querySelectorAll('.theme-option');
        for (var i = 0; i < options.length; i++) {
            options[i].addEventListener('click', function() {
                setTheme(this.getAttribute('data-theme'));
                themeDrop.classList.remove('show');
            });
        }
    }

    document.addEventListener('click', function() {
        if (themeDrop) themeDrop.classList.remove('show');
        var nd = document.getElementById('notifDropdown');
        if (nd) nd.classList.remove('show');
    });
});

// =====================================================
// HAMBURGER MENU
// =====================================================
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('show');
    overlay.style.display = 'none';
}

// =====================================================
// LOADING SPINNER
// =====================================================
function showLoading(text) {
    text = text || 'Loading...';
    const existing = document.getElementById('loadingOverlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner-border"></div><div class="spinner-text">' + text + '</div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

// =====================================================
// CONFIRM DIALOG
// =====================================================
function showConfirm(title, message, icon) {
    icon = icon || '⚠️';
    return new Promise(function(resolve) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML =
            '<div class="confirm-dialog">' +
                '<div class="confirm-icon">' + icon + '</div>' +
                '<h5>' + title + '</h5>' +
                '<p>' + message + '</p>' +
                '<div class="confirm-buttons">' +
                    '<button class="btn btn-secondary" id="confirmNo">Cancel</button>' +
                    '<button class="btn btn-danger" id="confirmYes">Delete</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        overlay.querySelector('#confirmNo').addEventListener('click', function() {
            overlay.remove();
            resolve(false);
        });
        overlay.querySelector('#confirmYes').addEventListener('click', function() {
            overlay.remove();
            resolve(true);
        });
    });
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================
function showToast(message, type) {
    type = type || 'info';
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const colors = { success: 'text-success', danger: 'text-danger', warning: 'text-warning', info: 'text-primary' };

    const toast = document.createElement('div');
    toast.className = 'toast-item toast-' + type;
    toast.innerHTML =
        '<i class="bi ' + (icons[type] || icons.info) + ' ' + (colors[type] || colors.info) + '"></i>' +
        '<span class="toast-text">' + message + '</span>' +
        '<button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';

    container.appendChild(toast);
    setTimeout(function() { if (toast.parentElement) toast.remove(); }, 4000);
}

// =====================================================
// NOTIFICATION BELL
// =====================================================
function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('show');
    document.getElementById('themeDropdown').classList.remove('show');
}

function loadNotifications() {
    var list = document.getElementById('notifList');
    var count = document.getElementById('notifCount');

    fetch('/Dashboard/GetNotifications', { credentials: 'same-origin' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!list) return;

            if (!data || data.length === 0) {
                list.innerHTML = '<div class="notification-empty"><i class="bi bi-bell-slash"></i><br>No notifications</div>';
                if (count) count.style.display = 'none';
                return;
            }

            if (count) {
                count.textContent = data.length;
                count.style.display = data.length > 0 ? 'inline' : 'none';
            }

            var html = '';
            data.forEach(function(n) {
                html += '<div class="notification-item">' +
                    '<i class="bi ' + (n.icon || 'bi-bell') + ' ' + (n.color || 'text-primary') + '"></i>' +
                    '<div><div class="notif-text">' + n.message + '</div>' +
                    '<div class="notif-time">' + n.time + '</div></div></div>';
            });
            list.innerHTML = html;
        })
        .catch(function() {
            if (list) list.innerHTML = '<div class="notification-empty"><i class="bi bi-bell-slash"></i><br>No notifications</div>';
            if (count) count.style.display = 'none';
        });
}

// =====================================================
// CHARTS
// =====================================================
function renderExpensePieChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const colors = [
        '#667eea', '#764ba2', '#00b894', '#e17055', '#fdcb6e',
        '#74b9ff', '#a29bfe', '#ff7675', '#fd79a8', '#636e72'
    ];

    new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function renderIncomeExpenseBarChart(canvasId, labels, incomeData, expenseData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(0, 184, 148, 0.7)',
                    borderRadius: 6,
                    barThickness: 24
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    backgroundColor: 'rgba(225, 112, 85, 0.7)',
                    borderRadius: 6,
                    barThickness: 24
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 15, usePointStyle: true, font: { size: 12 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// =====================================================
// SEARCH & FILTER (client-side)
// =====================================================
function filterTable(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;

    input.addEventListener('keyup', function() {
        const filter = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.indexOf(filter) > -1 ? '' : 'none';
        });
    });
}

function sortTable(tableId, colIndex, type) {
    type = type || 'text';
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const th = table.querySelectorAll('thead th')[colIndex];
    const asc = th.dataset.sort !== 'asc';
    th.dataset.sort = asc ? 'asc' : 'desc';

    rows.sort(function(a, b) {
        let aVal = a.cells[colIndex].textContent.trim();
        let bVal = b.cells[colIndex].textContent.trim();
        if (type === 'number') {
            aVal = parseFloat(aVal.replace(/[₹,]/g, '')) || 0;
            bVal = parseFloat(bVal.replace(/[₹,]/g, '')) || 0;
        } else if (type === 'date') {
            aVal = new Date(aVal).getTime() || 0;
            bVal = new Date(bVal).getTime() || 0;
        } else {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        return asc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(function(row) { tbody.appendChild(row); });
}

// =====================================================
// DATE RANGE FILTER
// =====================================================
function filterByDate(tableId, startDateId, endDateId) {
    const table = document.getElementById(tableId);
    const startInput = document.getElementById(startDateId);
    const endInput = document.getElementById(endDateId);
    if (!table || !startInput || !endInput) return;

    function apply() {
        const start = startInput.value ? new Date(startInput.value) : null;
        const end = endInput.value ? new Date(endInput.value) : null;
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(function(row) {
            const dateCell = row.querySelector('[data-date]');
            if (!dateCell) { row.style.display = ''; return; }
            const rowDate = new Date(dateCell.dataset.date);
            let show = true;
            if (start && rowDate < start) show = false;
            if (end) {
                const endDay = new Date(end);
                endDay.setHours(23, 59, 59);
                if (rowDate > endDay) show = false;
            }
            row.style.display = show ? '' : 'none';
        });
    }

    startInput.addEventListener('change', apply);
    endInput.addEventListener('change', apply);
}

// =====================================================
// EXPORT TO PDF (using browser print)
// =====================================================
function exportToPDF(title) {
    showLoading('Generating PDF...');
    setTimeout(function() {
        hideLoading();
        window.print();
    }, 500);
}

// =====================================================
// FORM LOADING STATE
// =====================================================
document.querySelectorAll('form[data-loading]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
        if (!form.checkValidity()) return;
        showLoading('Saving...');
        setTimeout(function() { hideLoading(); }, 10000);
    });
});

// =====================================================
// DELETE WITH CONFIRM
// =====================================================
document.querySelectorAll('[data-confirm-delete]').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
        e.preventDefault();
        const url = this.href || this.dataset.url;
        const name = this.dataset.name || 'this item';
        const confirmed = await showConfirm(
            'Delete ' + name + '?',
            'This action cannot be undone. Are you sure?',
            '🗑️'
        );
        if (confirmed) {
            showLoading('Deleting...');
            window.location.href = url;
        }
    });
});

// =====================================================
// AUTO-HIDE ALERTS
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.querySelectorAll('.alert').forEach(function(alert) {
            alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            setTimeout(function() { alert.remove(); }, 500);
        });
    }, 4000);
});
