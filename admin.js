// Deepak & Reshmi Wedding: Admin Logic (Data Sync & Validation)

const ADMIN_PASS = "DeepakReshmi2026";
let isAdmin = sessionStorage.getItem('wedding_admin_auth') === 'true';

const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    };
});

async function initAdmin() {
    // 1. Ensure data is loaded from the server before filling the form
    if (typeof initData === 'function') {
        await initData(); 
    }

    if (isAdmin) {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        loadAdminData();
    } else {
        loginContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
    }
}

loginForm.onsubmit = (e) => {
    e.preventDefault();
    if (document.getElementById('admin-pass').value === ADMIN_PASS) {
        isAdmin = true;
        sessionStorage.setItem('wedding_admin_auth', 'true');
        initAdmin();
    } else {
        alert("Incorrect Password. (DeepakReshmi2026)");
    }
};

logoutBtn.onclick = () => {
    sessionStorage.removeItem('wedding_admin_auth');
    location.reload();
};

function loadAdminData() {
    if (!appData || !appData.wedding) return;

    // 1. GENERAL TAB
    document.getElementById('admin-title').value = appData.wedding.title || "";
    document.getElementById('admin-date-text').value = appData.wedding.date || "";
    document.getElementById('admin-music-url').value = appData.wedding.musicUrl || "";
    document.getElementById('admin-hero-url').value = appData.wedding.heroUrl || "images/hero.png";

    // 2. COUPLE TAB
    document.getElementById('admin-groom-name').value = appData.groom.name || "";
    document.getElementById('admin-groom-degree').value = appData.groom.degree || "";
    document.getElementById('admin-groom-photo').value = appData.groom.photo || "";
    document.getElementById('admin-groom-parents').value = appData.groom.parents || "";
    document.getElementById('admin-groom-res').value = appData.groom.residence || "";

    document.getElementById('admin-bride-name').value = appData.bride.name || "";
    document.getElementById('admin-bride-degree').value = appData.bride.degree || "";
    document.getElementById('admin-bride-photo').value = appData.bride.photo || "";
    document.getElementById('admin-bride-parents').value = appData.bride.parents || "";
    document.getElementById('admin-bride-res').value = appData.bride.residence || "";

    renderAdminEvents();
    renderAdminGallery();
    renderAdminWishes();
}

function renderAdminEvents() {
    const list = document.getElementById('admin-event-list');
    list.innerHTML = (appData.events || []).map(ev => `
        <div class="item-card">
            <div class="item-info"><strong>${ev.title}</strong> - ${ev.date} ${ev.month}</div>
            <button class="btn-sm btn-danger" onclick="deleteEvent(${ev.id})">Delete</button>
        </div>
    `).join('');
}

function renderAdminGallery() {
    const list = document.getElementById('admin-gallery-list');
    list.innerHTML = (appData.gallery || []).map((img, idx) => `
        <div class="item-card" style="flex-direction: column; padding:10px;">
            <img src="${img.url}">
            <button class="btn-sm btn-danger" onclick="deleteGallery(${idx})" style="margin-top:10px;">Remove</button>
        </div>
    `).join('');
}

function renderAdminWishes() {
    const list = document.getElementById('admin-wishes-list');
    list.innerHTML = (appData.wishes || []).map(w => `
        <div class="item-card">
            <div class="item-info"><strong>${w.name}</strong>: ${w.msg}</div>
            <button class="btn-sm btn-danger" onclick="deleteWish(${w.id})">Delete</button>
        </div>
    `).join('');
}

async function validateUpload(file, maxMB, targetW, targetH, errorId) {
    if (!file) return true;
    const errEl = document.getElementById(errorId);
    errEl.style.display = 'none';
    if (file.size > maxMB * 1024 * 1024) {
        errEl.textContent = `Size exceeds ${maxMB}MB.`;
        errEl.style.display = 'block';
        return false;
    }
    return true;
}

// Form Handlers
document.getElementById('form-general').onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById('upload-hero').files[0];
    const isValid = await validateUpload(file, 3, 1920, 1080, 'hero-error');
    if (!isValid) return;

    appData.wedding.title = document.getElementById('admin-title').value;
    appData.wedding.date = document.getElementById('admin-date-text').value;
    appData.wedding.musicUrl = document.getElementById('admin-music-url').value;
    appData.wedding.heroUrl = file ? "images/" + file.name : document.getElementById('admin-hero-url').value;
    saveData();
};

document.getElementById('form-couple').onsubmit = async (e) => {
    e.preventDefault();
    const groomFile = document.getElementById('upload-groom').files[0];
    const brideFile = document.getElementById('upload-bride').files[0];

    if (!await validateUpload(groomFile, 1, 400, 400, 'groom-error')) return;
    if (!await validateUpload(brideFile, 1, 400, 400, 'bride-error')) return;

    appData.groom.name = document.getElementById('admin-groom-name').value;
    appData.groom.degree = document.getElementById('admin-groom-degree').value;
    appData.groom.parents = document.getElementById('admin-groom-parents').value;
    appData.groom.residence = document.getElementById('admin-groom-res').value;
    appData.groom.photo = groomFile ? "images/" + groomFile.name : document.getElementById('admin-groom-photo').value;

    appData.bride.name = document.getElementById('admin-bride-name').value;
    appData.bride.degree = document.getElementById('admin-bride-degree').value;
    appData.bride.parents = document.getElementById('admin-bride-parents').value;
    appData.bride.residence = document.getElementById('admin-bride-res').value;
    appData.bride.photo = brideFile ? "images/" + brideFile.name : document.getElementById('admin-bride-photo').value;

    saveData();
};

document.getElementById('form-event-add').onsubmit = (e) => {
    e.preventDefault();
    appData.events.push({
        id: Date.now(), title: document.getElementById('add-ev-title').value,
        date: document.getElementById('add-ev-day').value, month: document.getElementById('add-ev-month').value,
        time: document.getElementById('add-ev-time').value, venue: document.getElementById('add-ev-venue').value
    });
    renderAdminEvents(); saveData(); e.target.reset();
};

document.getElementById('form-gallery-add').onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById('add-photo-file').files[0];
    if (!await validateUpload(file, 1, 200, 300, 'gallery-error')) return;

    const url = file ? "images/" + file.name : document.getElementById('add-photo-url').value;
    appData.gallery.push({ url, caption: "New Memory" });
    renderAdminGallery(); saveData(); e.target.reset();
};

function deleteEvent(id) { appData.events = appData.events.filter(ev => ev.id !== id); renderAdminEvents(); saveData(); }
function deleteGallery(idx) { appData.gallery.splice(idx, 1); renderAdminGallery(); saveData(); }
function deleteWish(id) { appData.wishes = appData.wishes.filter(w => w.id !== id); renderAdminWishes(); saveData(); }

async function saveData() {
    localStorage.setItem('deep_resh_wedding_v1', JSON.stringify(appData));
    try {
        await fetch('http://localhost:3000/api/saveData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
        });
        alert("Success: Changes saved to server!");
    } catch (e) {
        alert("Saved to local memory only.");
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);
