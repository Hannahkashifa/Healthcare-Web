/* =====================================================
   HEALTHCARE EXPENSE TRACKER - MAIN JAVASCRIPT
   ===================================================== */

// =====================================================
// THEME SYSTEM
// =====================================================
function getTheme() {
    try { return localStorage.getItem('healthcare-theme') || 'light'; }
    catch(e) { return 'light'; }
}

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    try { localStorage.setItem('healthcare-theme', theme); } catch(e) {}

    var allOptions = document.querySelectorAll('.theme-option');
    for (var i = 0; i < allOptions.length; i++) {
        if (allOptions[i].getAttribute('data-theme') === theme) {
            allOptions[i].classList.add('active');
        } else {
            allOptions[i].classList.remove('active');
        }
    }

    var labels = { light: 'Light', dark: 'Dark', ocean: 'Ocean', rose: 'Rose' };
    var texts = document.querySelectorAll('#themeToggleText');
    for (var j = 0; j < texts.length; j++) {
        texts[j].textContent = labels[theme] || 'Light';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var saved = getTheme();
    setTheme(saved);

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
                var theme = this.getAttribute('data-theme');
                setTheme(theme);
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
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('show');
    if (overlay) overlay.style.display = sidebar && sidebar.classList.contains('show') ? 'block' : 'none';
}

function closeSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.style.display = 'none';
}

// =====================================================
// LOADING SPINNER
// =====================================================
function showLoading(text) {
    text = text || 'Loading...';
    var existing = document.getElementById('loadingOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner-border"></div><div class="spinner-text">' + text + '</div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    var overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

// =====================================================
// CONFIRM DIALOG
// =====================================================
function showConfirm(title, message, icon) {
    icon = icon || '\u26A0\uFE0F';
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
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
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    var icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    var colors = { success: 'text-success', danger: 'text-danger', warning: 'text-warning', info: 'text-primary' };

    var toast = document.createElement('div');
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
    var dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.classList.toggle('show');
    var td = document.getElementById('themeDropdown');
    if (td) td.classList.remove('show');
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
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var colors = [
        '#0071e3', '#30d158', '#ff9f0a', '#ff3b30', '#5ac8fa',
        '#bf5af2', '#ff6482', '#ffd60a', '#64d2ff', '#8e8e93'
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
                        padding: 16,
                        usePointStyle: true,
                        font: { size: 12, family: '-apple-system, BlinkMacSystemFont, sans-serif' }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function renderIncomeExpenseBarChart(canvasId, labels, incomeData, expenseData) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(48, 209, 88, 0.75)',
                    borderRadius: 8,
                    barThickness: 22
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 59, 48, 0.75)',
                    borderRadius: 8,
                    barThickness: 22
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true, font: { size: 12, family: '-apple-system, BlinkMacSystemFont, sans-serif' } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

// =====================================================
// SEARCH & FILTER (client-side)
// =====================================================
function filterTable(inputId, tableId) {
    var input = document.getElementById(inputId);
    var table = document.getElementById(tableId);
    if (!input || !table) return;

    input.addEventListener('keyup', function() {
        var filter = this.value.toLowerCase();
        var rows = table.querySelectorAll('tbody tr');
        for (var i = 0; i < rows.length; i++) {
            var text = rows[i].textContent.toLowerCase();
            rows[i].style.display = text.indexOf(filter) > -1 ? '' : 'none';
        }
    });
}

function sortTable(tableId, colIndex, type) {
    type = type || 'text';
    var table = document.getElementById(tableId);
    if (!table) return;

    var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
    var th = table.querySelectorAll('thead th')[colIndex];
    var asc = th.getAttribute('data-sort') !== 'asc';
    th.setAttribute('data-sort', asc ? 'asc' : 'desc');

    rows.sort(function(a, b) {
        var aVal = a.cells[colIndex].textContent.trim();
        var bVal = b.cells[colIndex].textContent.trim();
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

    var tbody = table.querySelector('tbody');
    for (var i = 0; i < rows.length; i++) { tbody.appendChild(rows[i]); }
}

// =====================================================
// DATE RANGE FILTER
// =====================================================
function filterByDate(tableId, startDateId, endDateId) {
    var table = document.getElementById(tableId);
    var startInput = document.getElementById(startDateId);
    var endInput = document.getElementById(endDateId);
    if (!table || !startInput || !endInput) return;

    function apply() {
        var start = startInput.value ? new Date(startInput.value) : null;
        var end = endInput.value ? new Date(endInput.value) : null;
        var rows = table.querySelectorAll('tbody tr');

        for (var i = 0; i < rows.length; i++) {
            var dateCell = rows[i].querySelector('[data-date]');
            if (!dateCell) { rows[i].style.display = ''; continue; }
            var rowDate = new Date(dateCell.getAttribute('data-date'));
            var show = true;
            if (start && rowDate < start) show = false;
            if (end) {
                var endDay = new Date(end);
                endDay.setHours(23, 59, 59);
                if (rowDate > endDay) show = false;
            }
            rows[i].style.display = show ? '' : 'none';
        }
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
// ANIMATED COUNTERS
// =====================================================
function animateCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    for (var i = 0; i < counters.length; i++) {
        var el = counters[i];
        var target = parseFloat(el.getAttribute('data-counter')) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var decimals = el.getAttribute('data-decimals') || '0';
        var duration = 1200;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = start + (target - start) * eased;
            el.textContent = prefix + current.toFixed(parseInt(decimals)).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }
}

// =====================================================
// FORM LOADING STATE
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    var forms = document.querySelectorAll('form[data-loading]');
    for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener('submit', function(e) {
            if (!this.checkValidity()) return;
            showLoading('Saving...');
            setTimeout(function() { hideLoading(); }, 10000);
        });
    }
});

// =====================================================
// DELETE WITH CONFIRM
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    var btns = document.querySelectorAll('[data-confirm-delete]');
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function(e) {
            e.preventDefault();
            var self = this;
            var url = self.getAttribute('href') || self.getAttribute('data-url');
            var name = self.getAttribute('data-name') || 'this item';
            showConfirm(
                'Delete ' + name + '?',
                'This action cannot be undone. Are you sure?',
                '\uD83D\uDDD1\uFE0F'
            ).then(function(confirmed) {
                if (confirmed) {
                    showLoading('Deleting...');
                    window.location.href = url;
                }
            });
        });
    }
});

// =====================================================
// AUTO-HIDE ALERTS
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        for (var i = 0; i < alerts.length; i++) {
            alerts[i].style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            alerts[i].style.opacity = '0';
            alerts[i].style.transform = 'translateY(-10px)';
            (function(alert) {
                setTimeout(function() { alert.remove(); }, 500);
            })(alerts[i]);
        }
    }, 5000);
});

// =====================================================
// ANIMATED COUNTERS ON LOAD
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    animateCounters();
});
