// Deepak & Reshmi: Smart Admin (v5.5 - Ultimate Visual Dash)
// Features: Full-site Previews, Adaptive Borders, Batch Cloud Sync

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ADMIN_PASS = "DeepakReshmi2026";
let appData = {
    wedding: { title: "", date: "", videoUrl1: "", musicUrl: "", heroUrl: "" },
    groom: { name: "", photo: "", parents: "", residence: "" },
    bride: { name: "", photo: "", parents: "", residence: "" },
    events: [], gallery: [], wishes: []
};

// 📂 THE STAGING QUEUE
let pendingUploads = {
    hero: null, groom: null, bride: null,
    gallery: [] 
};

async function initAdmin() {
    document.querySelectorAll('.animate-up').forEach(el => el.classList.add('visible'));

    if (sbClient) {
        try {
            const { data } = await sbClient.from('wedding_config').select('*').single();
            if (data) {
                appData = data;
                if (!appData.gallery) appData.gallery = [];
            }
        } catch (e) { console.error("Initial load failed", e); }
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

// 👁️ LOCAL PREVIEW HANDLERS
function previewSingle(inputId, type) {
    const file = document.getElementById(inputId).files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { alert("Max 5MB!"); return; }
    pendingUploads[type] = file;

    const tempUrl = URL.createObjectURL(file);
    const imgEl = document.getElementById(`preview-${type}`);
    const boxEl = document.getElementById(`preview-${type}-box`);
    
    if (imgEl) imgEl.src = tempUrl;
    if (boxEl) boxEl.classList.add('pending'); // Dash border for pending!

    // Also update temp background in appData for sync
    if (type === 'hero') appData.wedding.heroUrl = tempUrl;
    else if (type === 'groom') appData.groom.photo = tempUrl;
    else if (type === 'bride') appData.bride.photo = tempUrl;
}

async function prepareGallery() {
    const files = document.getElementById('gallery-uploader').files;
    if (!files) return;
    for (let f of files) {
        if (f.size > 5*1024*1024) continue;
        const id = Date.now() + Math.random();
        const tempUrl = URL.createObjectURL(f);
        pendingUploads.gallery.push({ file: f, id });
        appData.gallery.push({ url: tempUrl, isPending: true, pendingId: id });
    }
    renderAdminGallery();
}

async function uploadOne(file) {
    if (!file || !sbClient) return null;
    const fname = `u-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error } = await sbClient.storage.from('wedding-portfolio').upload(fname, file);
    if (error) return null;
    return sbClient.storage.from('wedding-portfolio').getPublicUrl(fname).data.publicUrl;
}

// 🚀 THE FINAL COMMIT
async function syncToCloud() {
    console.log("🛠️ Starting Batch Upload & Global Sync...");
    const btn = document.getElementById('btn-sync');
    if (btn) { btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Syncing Cloud..."; btn.disabled = true; }

    try {
        // 1. Upload Pending Single Items
        if (pendingUploads.hero) {
            const url = await uploadOne(pendingUploads.hero);
            if (url) { appData.wedding.heroUrl = url; pendingUploads.hero = null; }
        }
        if (pendingUploads.groom) {
            const url = await uploadOne(pendingUploads.groom);
            if (url) { appData.groom.photo = url; pendingUploads.groom = null; }
        }
        if (pendingUploads.bride) {
            const url = await uploadOne(pendingUploads.bride);
            if (url) { appData.bride.photo = url; pendingUploads.bride = null; }
        }

        // 2. Upload Pending Gallery Items
        for (let pg of pendingUploads.gallery) {
            const url = await uploadOne(pg.file);
            if (url) {
                const idx = appData.gallery.findIndex(g => g.pendingId === pg.id);
                if (idx !== -1) { appData.gallery[idx] = { url }; } // No isPending=True
            }
        }
        pendingUploads.gallery = [];

        // 3. Collect Text Fields
        const getVal = (id) => document.getElementById(id)?.value || "";
        appData.wedding.title = getVal('admin-title');
        appData.wedding.date = getVal('admin-date-text');
        appData.wedding.videoUrl1 = getVal('admin-video-url');
        appData.wedding.musicUrl = getVal('admin-music-url');
        appData.groom.name = getVal('admin-groom-name');
        appData.groom.parents = getVal('admin-groom-parents');
        appData.groom.residence = getVal('admin-groom-res');
        appData.bride.name = getVal('admin-bride-name');
        appData.bride.parents = getVal('admin-bride-parents');
        appData.bride.residence = getVal('admin-bride-res');

        // 4. Final Upsert
        const { error } = await sbClient.from('wedding_config').upsert({ 
            id: 1, 
            wedding:appData.wedding, groom:appData.groom, bride:appData.bride, 
            events:appData.events, gallery: appData.gallery 
        });

        if (!error) {
            alert("✨ Site Optimized & Cloud Updated Successfully! All changes are live.");
            loadDashboardData(); // Refresh all preview boxes & borders!
        } else { alert("Sync Error: " + error.message); }
    } catch (e) { console.error(e); }
    finally { if (btn) { btn.innerHTML = "<i class='fa-solid fa-cloud-arrow-up'></i> Sync to Cloud"; btn.disabled = false; } }
}

function loadDashboardData() {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
    s('admin-title', appData.wedding.title); s('admin-date-text', appData.wedding.date);
    s('admin-video-url', appData.wedding.videoUrl1); s('admin-hero-url', appData.wedding.heroUrl);
    s('admin-groom-name', appData.groom.name); s('admin-groom-parents', appData.groom.parents); s('admin-groom-res', appData.groom.residence);
    s('admin-bride-name', appData.bride.name); s('admin-bride-parents', appData.bride.parents); s('admin-bride-res', appData.bride.residence);
    
    // Set Preview Images
    const setImg = (id, url, boxId) => {
        const el = document.getElementById(id);
        const bx = document.getElementById(boxId);
        if (el) el.src = url || "images/profile-placeholder.png";
        if (bx) bx.classList.remove('pending'); // Reset to solid after load/sync
    };
    setImg('preview-hero', appData.wedding.heroUrl, 'preview-hero-box');
    setImg('preview-groom', appData.groom.photo, 'preview-groom-box');
    setImg('preview-bride', appData.bride.photo, 'preview-bride-box');

    renderAdminEvents(); renderAdminGallery(); renderAdminWishes();
}

function renderAdminGallery() {
    document.getElementById('admin-gallery-list').innerHTML = appData.gallery.map((img, i) => `
        <div style="position:relative; border-radius:10px; overflow:hidden; border:${img.isPending ? '3px dashed var(--secondary)' : '2px solid #eee'};">
            <img src="${img.url}" style="width:100%; height:120px; object-fit:cover; opacity:${img.isPending ? '0.6' : '1'}">
            ${img.isPending ? `<div style="position:absolute; bottom:5px; left:5px; background:var(--secondary); color:white; font-size:10px; padding:2px 5px; border-radius:5px;">Staged</div>` : ''}
            <button onclick="window.deleteFromGallery(${i})" style="position:absolute; top:5px; right:5px; background:rgba(180,0,0,0.8); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">X</button>
        </div>`).join('') || "Empty Gallery.";
}

async function deleteFromGallery(i) {
    const photo = appData.gallery[i];
    if (photo.isPending) {
        pendingUploads.gallery = pendingUploads.gallery.filter(pg => pg.id !== photo.pendingId);
    } else {
        if (confirm("Delete cloud photo permanently? This cannot be undone!")) {
            const parts = photo.url.split('wedding-portfolio/');
            if (parts[1]) await sbClient.storage.from('wedding-portfolio').remove([parts[1]]);
        }
    }
    appData.gallery.splice(i, 1);
    renderAdminGallery();
}

function renderAdminWishes() {
    sbClient.from('wishes').select('*').order('id', { ascending: false }).then(({ data: ws }) => {
        if (!ws) return;
        const render = (w) => `<div class='item-card'>${w.name}: ${w.msg} <div style='display:flex;gap:5px;'>${!w.approved ? `<button class='btn btn-primary btn-sm' onclick='window.approveWish(${w.id})'>Ok</button>` : ''}<button class='btn btn-danger btn-sm' onclick='window.deleteWish(${w.id})'>X</button></div></div>`;
        document.getElementById('admin-wishes-pending').innerHTML = ws.filter(w => !w.approved).map(render).join('') || "None.";
        document.getElementById('admin-wishes-approved').innerHTML = ws.filter(w => w.approved).map(render).join('') || "None.";
    });
}
async function approveWish(id) { await sbClient.from('wishes').update({ approved: true }).eq('id', id); renderAdminWishes(); }
async function deleteWish(id) { if (confirm("Delete wish?")) { await sbClient.from('wishes').delete().eq('id', id); renderAdminWishes(); } }
function renderAdminEvents() { document.getElementById('admin-event-list').innerHTML = appData.events.map((ev, i) => `<div class="item-card"><div><strong>${ev.title}</strong> (${ev.date} APR)</div><button class="btn btn-danger btn-sm" onclick="window.deleteEvent(${i})">X</button></div>`).join('') || "No events."; }
function deleteEvent(idx) { if (confirm("Delete event?")) { appData.events.splice(idx, 1); renderAdminEvents(); } }

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        if (btn.getAttribute('data-tab') === 'wishes') renderAdminWishes();
    };
});

window.approveWish = approveWish; window.deleteWish = deleteWish; window.deleteEvent = deleteEvent; 
window.uploadToGallery = prepareGallery; window.deleteFromGallery = deleteFromGallery;
window.syncToCloud = syncToCloud;
window.previewSingle = previewSingle;

document.addEventListener('DOMContentLoaded', initAdmin);
