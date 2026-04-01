// Deepak & Reshmi: Smart Admin (v7.5 - Offline Protection)
// Features: Null-safety for sbClient, Auto-Refresh check, Staging & Live Grids.

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";
// Safety Check: Only create client if global Supabase is loaded
const sbClient = (window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ADMIN_PASS = "DeepakReshmi2026";
let appData = {
    wedding: { title: "", date: "", videoUrl1: "", musicUrl: "", heroUrl: "" },
    groom: { name: "", photo: "", parents: "", residence: "" },
    bride: { name: "", photo: "", parents: "", residence: "" },
    events: [], gallery: [], wishes: []
};

let pendingUploads = { hero: null, groom: null, bride: null, gallery: [] };

async function initAdmin() {
    console.log("🛠️ Admin Initializing...");
    
    if (!sbClient) {
        console.warn("⚠️ Supabase SDK not found. Please check your internet connection.");
        alert("Action Required: Your internet/network is blocking Supabase. Please refresh after checking your connection.");
    }

    document.querySelectorAll('.animate-up').forEach(el => el.classList.add('visible'));

    const session = sessionStorage.getItem('wedding_admin_session');
    if (session === 'true') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        if (sbClient) loadInitialData();
        else renderAdminGallery(); // Still show what we can
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            if (document.getElementById('admin-pass').value.trim() === ADMIN_PASS) {
                sessionStorage.setItem('wedding_admin_session', 'true');
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('dashboard-container').style.display = 'block';
                loadInitialData();
            } else { alert("Incorrect Password!"); }
        };
    }
}

async function loadInitialData() {
    if (!sbClient) return;
    try {
        const { data } = await sbClient.from('wedding_config').select('*').single();
        if (data) {
            appData = data;
            if (!appData.gallery) appData.gallery = [];
        }
        loadDashboardData();
    } catch (e) { console.error("Initial load failed", e); }
}

function handleLogout() {
    sessionStorage.removeItem('wedding_admin_session');
    location.reload();
}

function previewSingle(inputId, type) {
    const file = document.getElementById(inputId).files[0];
    if (!file || file.size > 5*1024*1024) return;
    pendingUploads[type] = file;
    const tempUrl = URL.createObjectURL(file);
    const imgEl = document.getElementById(`preview-${type}`);
    const boxEl = document.getElementById(`preview-${type}-box`);
    if (imgEl) imgEl.src = tempUrl;
    if (boxEl) boxEl.classList.add('pending');
}

async function prepareGallery() {
    const files = document.getElementById('gallery-uploader').files;
    if (!files) return;
    console.log(`📸 Staging ${files.length} photos...`);
    for (let f of files) {
        if (f.size > 5*1024*1024) { alert(`${f.name} is too large (>5MB)`); continue; }
        const id = Date.now() + Math.random();
        const tempUrl = URL.createObjectURL(f);
        pendingUploads.gallery.push({ file: f, id, url: tempUrl });
    }
    renderAdminGallery();
}

async function uploadOne(file) {
    if (!file || !sbClient) return null;
    const fname = `u-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    try {
        const { error } = await sbClient.storage.from('wedding-portfolio').upload(fname, file);
        if (error) throw error;
        return sbClient.storage.from('wedding-portfolio').getPublicUrl(fname).data.publicUrl;
    } catch (err) { console.error("Upload failed", err); return null; }
}

async function syncToCloud() {
    if (!sbClient) { alert("Cannot sync while offline! Please check your connection."); return; }
    const btn = document.getElementById('btn-sync');
    if (btn) { btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Syncing Cloud..."; btn.disabled = true; }

    try {
        if (pendingUploads.hero) { const u=await uploadOne(pendingUploads.hero); if(u) {appData.wedding.heroUrl=u; pendingUploads.hero=null;}}
        if (pendingUploads.groom) { const u=await uploadOne(pendingUploads.groom); if(u) {appData.groom.photo=u; pendingUploads.groom=null;}}
        if (pendingUploads.bride) { const u=await uploadOne(pendingUploads.bride); if(u) {appData.bride.photo=u; pendingUploads.bride=null;}}

        for (let pg of pendingUploads.gallery) {
            const u = await uploadOne(pg.file);
            if (u) appData.gallery.push({ url: u });
        }
        pendingUploads.gallery = [];

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

        const { error } = await sbClient.from('wedding_config').upsert({ id: 1, wedding:appData.wedding, groom:appData.groom, bride:appData.bride, events:appData.events, gallery: appData.gallery });
        if (!error) { alert("✨ Cloud Sync Success! Everything is live."); loadDashboardData(); }
    } catch(e) { console.error(e); }
    finally { if (btn) { btn.innerHTML = "<i class='fa-solid fa-cloud-arrow-up'></i> Sync to Cloud"; btn.disabled = false; } }
}

function loadDashboardData() {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
    s('admin-title', appData.wedding.title); s('admin-date-text', appData.wedding.date);
    s('admin-video-url', appData.wedding.videoUrl1); s('admin-hero-url', appData.wedding.heroUrl);
    s('admin-groom-name', appData.groom.name); s('admin-groom-parents', appData.groom.parents); s('admin-groom-res', appData.groom.residence);
    s('admin-bride-name', appData.bride.name); s('admin-bride-parents', appData.bride.parents); s('admin-bride-res', appData.bride.residence);
    const setImg = (id, url, boxId) => { const el = document.getElementById(id); const bx = document.getElementById(boxId); if (el) el.src = url || ""; if (bx) bx.classList.remove('pending'); };
    setImg('preview-hero', appData.wedding.heroUrl, 'preview-hero-box');
    setImg('preview-groom', appData.groom.photo, 'preview-groom-box');
    setImg('preview-bride', appData.bride.photo, 'preview-bride-box');
    renderAdminEvents(); renderAdminGallery(); renderAdminWishes();
}

function renderAdminGallery() {
    const pContainer = document.getElementById('admin-gallery-pending');
    if (pContainer) {
        pContainer.innerHTML = pendingUploads.gallery.map((pg, i) => `
            <div style="position:relative; border-radius:10px; overflow:hidden; border:3px dashed var(--secondary);">
                <img src="${pg.url}" style="width:100%; height:120px; object-fit:cover; opacity:0.6">
                <button onclick="window.removeDraft(${i})" style="position:absolute; top:5px; right:5px; background:rgba(180,0,0,0.8); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">X</button>
            </div>`).join('') || "<p style='grid-column:1/-1; opacity:0.4; font-size:0.8rem; text-align:center;'>Draft photos appear here.</p>";
    }
    const lContainer = document.getElementById('admin-gallery-live');
    if (lContainer) {
        lContainer.innerHTML = appData.gallery.map((img, i) => `
            <div style="position:relative; border-radius:10px; overflow:hidden; border:2px solid #eee;">
                <img src="${img.url}" style="width:100%; height:120px; object-fit:cover;">
                <button onclick="window.deleteFromGallery(${i})" style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">X</button>
            </div>`).join('') || "<p style='grid-column:1/-1; opacity:0.4; font-size:0.8rem; text-align:center;'>No live photos.</p>";
    }
}

function removeDraft(i) {
    if (pendingUploads.gallery[i]) {
        URL.revokeObjectURL(pendingUploads.gallery[i].url);
        pendingUploads.gallery.splice(i, 1);
        renderAdminGallery();
    }
}

async function deleteFromGallery(i) {
    if (!sbClient) { alert("Offline: Cannot delete cloud photos."); return; }
    if (confirm("Delete cloud photo?")) {
        const photo = appData.gallery[i];
        if (photo.url) {
            const parts = photo.url.split('wedding-portfolio/');
            if (parts[1]) await sbClient.storage.from('wedding-portfolio').remove([parts[1]]);
        }
        appData.gallery.splice(i, 1);
        await saveData();
        renderAdminGallery();
    }
}

async function saveData() {
    if (!sbClient) return;
    await sbClient.from('wedding_config').upsert({ id: 1, wedding:appData.wedding, groom:appData.groom, bride:appData.bride, events:appData.events, gallery: appData.gallery });
}

function renderAdminWishes() {
    const wishP = document.getElementById('admin-wishes-pending');
    if(!wishP || !sbClient) return;
    sbClient.from('wishes').select('*').order('id', { ascending: false }).then(({ data: ws }) => {
        if (!ws) return;
        const render = (w) => `<div class='item-card'>${w.name}: ${w.msg} <div style='display:flex;gap:5px;'>${!w.approved ? `<button class='btn btn-primary btn-sm' onclick='window.approveWish(${w.id})'>Ok</button>` : ''}<button class='btn btn-danger btn-sm' onclick='window.deleteWish(${w.id})'>X</button></div></div>`;
        document.getElementById('admin-wishes-pending').innerHTML = ws.filter(w => !w.approved).map(render).join('') || "None.";
        document.getElementById('admin-wishes-approved').innerHTML = ws.filter(w => w.approved).map(render).join('') || "None.";
    });
}
async function approveWish(id) { if(!sbClient)return; await sbClient.from('wishes').update({ approved: true }).eq('id', id); renderAdminWishes(); }
async function deleteWish(id) { if(!sbClient)return; if (confirm("Delete wish?")) { await sbClient.from('wishes').delete().eq('id', id); renderAdminWishes(); } }
function renderAdminEvents() { document.getElementById('admin-event-list').innerHTML = appData.events.map((ev, i) => `<div class="item-card"><div><strong>${ev.title}</strong> (${ev.date} APR)</div><button class="btn btn-danger btn-sm" onclick="window.deleteEvent(${i})">X</button></div>`).join('') || "No events."; }
function deleteEvent(idx) { if (confirm("Delete event?")) { appData.events.splice(idx, 1); renderAdminEvents(); } }

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        if (btn.getAttribute('data-tab') === 'wishes') renderAdminWishes();
        if (btn.getAttribute('data-tab') === 'gallery') renderAdminGallery();
    };
});

window.approveWish = approveWish; window.deleteWish = deleteWish; window.deleteEvent = deleteEvent; 
window.uploadToGallery = prepareGallery; window.deleteFromGallery = deleteFromGallery; window.removeDraft = removeDraft;
window.syncToCloud = syncToCloud; window.previewSingle = previewSingle;
window.handleLogout = handleLogout;

document.addEventListener('DOMContentLoaded', initAdmin);
