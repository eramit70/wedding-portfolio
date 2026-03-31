// Deepak & Reshmi: All-Powerful Admin Dashboard (Supabase Edition)
// 100% Control: Upload Photos, Manage Events, & Edit Every Single Detail

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ADMIN_PASS = "DeepakReshmi2026";
let appData = {
    wedding: { title: "", date: "", videoUrl1: "", musicUrl: "", heroUrl: "" },
    groom: { name: "", photo: "", parents: "", residence: "" },
    bride: { name: "", photo: "", parents: "", residence: "" },
    events: [], wishes: []
};

async function initAdmin() {
    document.querySelectorAll('.animate-up').forEach(el => el.classList.add('visible'));

    if (sbClient) {
        try {
            const { data, error } = await sbClient.from('wedding_config').select('*').single();
            if (!error && data) appData = data;
        } catch (e) { console.error(e); }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            if (document.getElementById('admin-pass').value.trim() === ADMIN_PASS) {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('dashboard-container').style.display = 'block';
                loadDashboardData();
            } else { alert("Incorrect Password!"); }
        };
    }
}

function loadDashboardData() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    set('admin-title', appData.wedding.title);
    set('admin-date-text', appData.wedding.date);
    set('admin-video-url', appData.wedding.videoUrl1);
    set('admin-hero-url', appData.wedding.heroUrl);
    set('admin-music-url', appData.wedding.musicUrl);
    set('admin-groom-name', appData.groom.name);
    set('admin-groom-photo', appData.groom.photo);
    set('admin-groom-parents', appData.groom.parents);
    set('admin-groom-res', appData.groom.residence);
    set('admin-bride-name', appData.bride.name);
    set('admin-bride-photo', appData.bride.photo);
    set('admin-bride-parents', appData.bride.parents);
    set('admin-bride-res', appData.bride.residence);
    renderAdminEvents();
    renderAdminWishes();
}

async function uploadFile(inputId, storagePath) {
    const file = document.getElementById(inputId).files[0];
    if (!file || !sbClient) return null;
    const fname = `${Date.now()}-${file.name}`;
    const { error } = await sbClient.storage.from('wedding-portfolio').upload(fname, file);
    if (error) { alert("Upload fail: " + error.message); return null; }
    return sbClient.storage.from('wedding-portfolio').getPublicUrl(fname).data.publicUrl;
}

async function saveData() {
    // Collect all text
    appData.wedding.title = document.getElementById('admin-title').value;
    appData.wedding.date = document.getElementById('admin-date-text').value;
    appData.wedding.videoUrl1 = document.getElementById('admin-video-url').value;
    appData.wedding.musicUrl = document.getElementById('admin-music-url').value;
    appData.wedding.heroUrl = document.getElementById('admin-hero-url').value;

    appData.groom.name = document.getElementById('admin-groom-name').value;
    appData.groom.parents = document.getElementById('admin-groom-parents').value;
    appData.groom.residence = document.getElementById('admin-groom-res').value;
    appData.bride.name = document.getElementById('admin-bride-name').value;
    appData.bride.parents = document.getElementById('admin-bride-parents').value;
    appData.bride.residence = document.getElementById('admin-bride-res').value;

    // Handle Image Uploads (One by One)
    const newHero = await uploadFile('upload-hero', 'hero');
    if (newHero) appData.wedding.heroUrl = newHero;
    const newGroom = await uploadFile('upload-groom', 'groom');
    if (newGroom) appData.groom.photo = newGroom;
    const newBride = await uploadFile('upload-bride', 'bride');
    if (newBride) appData.bride.photo = newBride;

    const { error } = await sbClient.from('wedding_config').upsert({ id: 1, wedding: appData.wedding, groom: appData.groom, bride: appData.bride, events: appData.events });
    if (!error) alert("Full Wedding Updated Successfully!");
    loadDashboardData(); // Refresh URLs in inputs
}

// Event Management
function addEvent() {
    const e = { 
        title: document.getElementById('add-ev-title').value,
        date: document.getElementById('add-ev-day').value,
        time: document.getElementById('add-ev-time').value,
        venue: document.getElementById('add-ev-venue').value,
        note: ""
    };
    if (e.title) { appData.events.push(e); renderAdminEvents(); }
}
function deleteEvent(idx) { appData.events.splice(idx, 1); renderAdminEvents(); }
function renderAdminEvents() {
    const list = document.getElementById('admin-event-list');
    if (list) list.innerHTML = appData.events.map((ev, i) => `
        <div class="item-card">
            <div><strong>${ev.title}</strong> (${ev.date} APR)</div>
            <button class="btn btn-danger btn-sm" onclick="deleteEvent(${i})">X</button>
        </div>`).join('') || "No events.";
}

// Wishes Management
async function renderAdminWishes() {
    const { data: ws } = await sbClient.from('wishes').select('*').order('id', { ascending: false });
    if (!ws) return;
    document.getElementById('admin-wishes-pending').innerHTML = ws.filter(w => !w.approved).map(w => `<div class='item-card'>${w.name}: ${w.msg} <button onclick='approveWish(${w.id})'>Approve</button></div>`).join('') || "None.";
    document.getElementById('admin-wishes-approved').innerHTML = ws.filter(w => w.approved).map(w => `<div class='item-card'>${w.name}: ${w.msg} <button onclick='deleteWish(${w.id})'>Del</button></div>`).join('') || "None.";
}
async function approveWish(id) { await sbClient.from('wishes').update({ approved: true }).eq('id', id); renderAdminWishes(); }
async function deleteWish(id) { if (confirm("Delete blessing?")) { await sbClient.from('wishes').delete().eq('id', id); renderAdminWishes(); } }

// Config Save Hooks
const forms = ['form-general', 'form-couple', 'form-event-add'];
forms.forEach(fid => { const f = document.getElementById(fid); if (f) f.onsubmit = (e) => { e.preventDefault(); if (fid === 'form-event-add') addEvent(); saveData(); }; });

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        if (btn.getAttribute('data-tab') === 'wishes') renderAdminWishes();
    };
});

document.addEventListener('DOMContentLoaded', initAdmin);
window.approveWish = approveWish; window.deleteWish = deleteWish; window.deleteEvent = deleteEvent;
