// Redirect to login if not logged in
if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
}

const menuButton = document.getElementById('menuButton');
const sideMenu = document.getElementById('sideMenu');
menuButton.addEventListener('click', () => sideMenu.classList.toggle('open'));

const pages = document.querySelectorAll('.page');
function showPage(id) {
    pages.forEach(p => p.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

document.querySelectorAll('#sideMenu a[data-page]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
        sideMenu.classList.remove('open');
    });
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
});

// Hide login link if already logged in
if (localStorage.getItem('loggedIn') === 'true') {
    const loginLink = document.getElementById('loginLink');
    if (loginLink) loginLink.style.display = 'none';
}

// Pump control
const pumpButtons = document.querySelectorAll('.pump-controls button');
pumpButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        fetch(`/pump?mode=${mode}`).catch(() => {});
    });
});

// Charts
const liveCtx = document.getElementById('liveChart').getContext('2d');
const liveChart = new Chart(liveCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'pH', data: [], borderColor: 'red', fill: false },
            { label: 'Chlorine', data: [], borderColor: 'green', fill: false },
            { label: 'Temp', data: [], borderColor: 'blue', fill: false }
        ]
    },
    options: { animation: false }
});

const analyticsCtx = document.getElementById('analyticsChart').getContext('2d');
const analyticsChart = new Chart(analyticsCtx, {
    type: 'line',
    data: liveChart.data,
    options: {}
});

function updateCharts(data) {
    const now = new Date().toLocaleTimeString();
    liveChart.data.labels.push(now);
    if (liveChart.data.labels.length > 20) liveChart.data.labels.shift();
    liveChart.data.datasets[0].data.push(data.ph);
    liveChart.data.datasets[1].data.push(data.chlorine);
    liveChart.data.datasets[2].data.push(data.temperature);
    liveChart.data.datasets.forEach(ds => { if (ds.data.length > 20) ds.data.shift(); });
    liveChart.update();
    analyticsChart.update();
}

function updateReadings(data) {
    document.getElementById('phReading').textContent = data.ph;
    document.getElementById('chlorineReading').textContent = data.chlorine;
    document.getElementById('tempReading').textContent = data.temperature;
    document.getElementById('statusInfo').textContent = `Power: ${data.power || 'N/A'}`;
    document.getElementById('powerStatus').textContent = `Power: ${data.power || 'N/A'}`;
    document.getElementById('commStatus').textContent = 'Comm: OK';
    const now = new Date();
    document.getElementById('lastUpdate').textContent = `Last update: ${now.toLocaleTimeString()}`;
}

function fetchData() {
    fetch('/data')
        .then(r => r.json())
        .then(d => {
            updateReadings(d);
            updateCharts(d);
        })
        .catch(() => {
            document.getElementById('commStatus').textContent = 'Comm: Error';
        });
}

setInterval(fetchData, 5000);
fetchData();

// Test Page
const testBtn = document.getElementById('testButton');
if (testBtn) {
    testBtn.addEventListener('click', () => {
        fetch('/data')
            .then(r => r.text())
            .then(t => document.getElementById('testOutput').textContent = t)
            .catch(() => document.getElementById('testOutput').textContent = 'Error');
    });
}
