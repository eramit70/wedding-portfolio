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

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const passInput = document.getElementById('admin-pass').value.trim();
    console.log("Attempting login with password length:", passInput.length);
    
    if (passInput === ADMIN_PASS) {
        console.log("Login successful!");
        isAdmin = true;
        sessionStorage.setItem('wedding_admin_auth', 'true');
        await initAdmin();
    } else {
        console.error("Login failed: Incorrect password.");
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
    document.getElementById('admin-video-url').value = appData.wedding.videoUrl1 || "";

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
    const listPending = document.getElementById('admin-wishes-pending');
    const listApproved = document.getElementById('admin-wishes-approved');
    if (!listPending || !listApproved) return;

    const allWishes = appData.wishes || [];
    
    // Render Pending
    const pending = allWishes.filter(w => !w.approved);
    if (pending.length === 0) {
        listPending.innerHTML = `<p style="opacity:0.6; font-style:italic;">No pending wishes.</p>`;
    } else {
        listPending.innerHTML = pending.map(w => `
            <div class="item-card" style="border-left: 5px solid var(--secondary);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${w.photos[0].startsWith('/public') ? 'http://localhost:3000' + w.photos[0] : w.photos[0]}" 
                         class="wish-photo-circle" style="width: 45px; height: 45px;">
                    <div class="item-info">
                        <strong>${w.name}</strong><br>
                        <span style="font-size: 0.9rem; opacity: 0.8;">"${w.msg}"</span>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary btn-sm" onclick="approveWish(${w.id})"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn btn-outline btn-sm" onclick="editWish(${w.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWish(${w.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    // Render Approved
    const approved = allWishes.filter(w => w.approved);
    if (approved.length === 0) {
        listApproved.innerHTML = `<p style="opacity:0.6; font-style:italic;">No approved wishes yet.</p>`;
    } else {
        listApproved.innerHTML = approved.map(w => `
            <div class="item-card" style="border-left: 5px solid #28a745;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${w.photos[0].startsWith('/public') ? 'http://localhost:3000' + w.photos[0] : w.photos[0]}" 
                         class="wish-photo-circle" style="width: 45px; height: 45px;">
                    <div class="item-info">
                        <strong>${w.name}</strong><br>
                        <span style="font-size: 0.9rem; opacity: 0.8;">"${w.msg}"</span>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline btn-sm" onclick="editWish(${w.id})" title="Edit"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWish(${w.id})" title="Remove"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
    }
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
    appData.wedding.videoUrl1 = document.getElementById('admin-video-url').value;
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

async function deleteWish(id) {
    if (!confirm("Are you sure you want to delete this wish?")) return;
    
    try {
        const response = await fetch(`${API_BASE}/wishes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            appData.wishes = appData.wishes.filter(w => w.id !== id);
            renderAdminWishes();
            alert("Deleted successfully!");
        }
    } catch (e) {
        console.error("Delete failed:", e);
        // Fallback for local
        appData.wishes = appData.wishes.filter(w => w.id !== id);
        renderAdminWishes();
        saveData();
    }
}

async function approveWish(id) {
    try {
        const response = await fetch(`${API_BASE}/wishes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved: true })
        });
        if (response.ok) {
            const index = appData.wishes.findIndex(w => w.id === id);
            if (index !== -1) appData.wishes[index].approved = true;
            renderAdminWishes();
            alert("Wish approved and is now live on the slider!");
        }
    } catch (err) {
        console.error("Approval error:", err);
    }
}

async function editWish(id) {
    const wish = appData.wishes.find(w => w.id === id);
    if (!wish) return;

    const newMsg = prompt("Edit the blessing message:", wish.msg);
    if (newMsg === null) return; // User cancelled

    const newName = prompt("Edit guest name:", wish.name);
    if (newName === null) return;

    try {
        const response = await fetch(`${API_BASE}/wishes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ msg: newMsg, name: newName })
        });
        if (response.ok) {
            const index = appData.wishes.findIndex(w => w.id === id);
            if (index !== -1) {
                appData.wishes[index].msg = newMsg;
                appData.wishes[index].name = newName;
            }
            renderAdminWishes();
            alert("Wish updated!");
        }
    } catch (err) {
        console.error("Edit error:", err);
    }
}

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
