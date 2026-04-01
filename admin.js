// Deepak & Reshmi: Smart Admin (v8.5 - Social Edition)
// Features: Instagram URLs, Batch Sync, Local Previews, Persistent Session.

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";
const sbClient = (window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ADMIN_PASS = "DeepakReshmi2026";
let appData = {
    wedding: { title: "", date: "", videoUrl1: "", musicUrl: "", heroUrl: "" },
    groom: { name: "", photo: "", parents: "", residence: "", insta: "" },
    bride: { name: "", photo: "", parents: "", residence: "", insta: "" },
    events: [], gallery: [], wishes: []
};

let pendingUploads = { hero: null, groom: null, bride: null, gallery: [] };

async function initAdmin() {
    console.log("🛠️ Admin Initializing...");
    document.querySelectorAll('.animate-up').forEach(el => el.classList.add('visible'));

    const session = sessionStorage.getItem('wedding_admin_session');
    if (session === 'true') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        if (sbClient) loadInitialData();
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
            if (!appData.groom.insta) appData.groom.insta = "";
            if (!appData.bride.insta) appData.bride.insta = "";
            if (!appData.gallery) appData.gallery = [];
        }
        loadDashboardData();
    } catch (e) { console.error(e); }
}

function previewSingle(inputId, type) {
    const file = document.getElementById(inputId).files[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
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
    for (let f of files) {
        if (f.size > 5 * 1024 * 1024) continue;
        const id = Date.now() + Math.random();
        const tUrl = URL.createObjectURL(f);
        pendingUploads.gallery.push({ file: f, id, url: tUrl });
    }
    renderAdminGallery();
}

async function uploadOne(file) {
    if (!file || !sbClient) return null;
    const fn = `u-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error } = await sbClient.storage.from('wedding-portfolio').upload(fn, file);
    if (error) return null;
    return sbClient.storage.from('wedding-portfolio').getPublicUrl(fn).data.publicUrl;
}

async function syncToCloud() {
    if (!sbClient) return;
    const btn = document.getElementById('btn-sync');
    if (btn) { btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Syncing Cloud..."; btn.disabled = true; }

    try {
        if (pendingUploads.hero) { const u = await uploadOne(pendingUploads.hero); if (u) appData.wedding.heroUrl = u; }
        if (pendingUploads.groom) { const u = await uploadOne(pendingUploads.groom); if (u) appData.groom.photo = u; }
        if (pendingUploads.bride) { const u = await uploadOne(pendingUploads.bride); if (u) appData.bride.photo = u; }
        for (let pg of pendingUploads.gallery) {
            const u = await uploadOne(pg.file);
            if (u) appData.gallery.push({ url: u });
        }
        pendingUploads = { hero:null, groom:null, bride:null, gallery:[] };

        const getVal = (id) => document.getElementById(id)?.value || "";
        appData.wedding.title = getVal('admin-title');
        appData.wedding.date = getVal('admin-date-text');
        appData.wedding.videoUrl1 = getVal('admin-video-url');
        appData.wedding.musicUrl = getVal('admin-music-url');
        appData.groom.name = getVal('admin-groom-name');
        appData.groom.insta = getVal('admin-groom-insta'); // SOCIAL LINK
        appData.groom.parents = getVal('admin-groom-parents');
        appData.groom.residence = getVal('admin-groom-res');
        appData.bride.name = getVal('admin-bride-name');
        appData.bride.insta = getVal('admin-bride-insta'); // SOCIAL LINK
        appData.bride.parents = getVal('admin-bride-parents');
        appData.bride.residence = getVal('admin-bride-res');

        await sbClient.from('wedding_config').upsert({ id: 1, wedding:appData.wedding, groom:appData.groom, bride:appData.bride, events:appData.events, gallery: appData.gallery });
        alert("✨ Cloud Sync Success!"); loadDashboardData();
    } catch(e) { console.error(e); }
    finally { if (btn) { btn.innerHTML = "<i class='fa-solid fa-cloud-arrow-up'></i> Sync to Cloud"; btn.disabled = false; } }
}

function loadDashboardData() {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
    s('admin-title', appData.wedding.title); s('admin-date-text', appData.wedding.date);
    s('admin-video-url', appData.wedding.videoUrl1); s('admin-hero-url', appData.wedding.heroUrl);
    s('admin-groom-name', appData.groom.name); s('admin-groom-insta', appData.groom.insta);
    s('admin-groom-parents', appData.groom.parents); s('admin-groom-res', appData.groom.residence);
    s('admin-bride-name', appData.bride.name); s('admin-bride-insta', appData.bride.insta);
    s('admin-bride-parents', appData.bride.parents); s('admin-bride-res', appData.bride.residence);
    
    const setImg = (id, url, boxId) => { const el = document.getElementById(id); const bx = document.getElementById(boxId); if (el) el.src = url || ""; if (bx) bx.classList.remove('pending'); };
    setImg('preview-hero', appData.wedding.heroUrl, 'preview-hero-box');
    setImg('preview-groom', appData.groom.photo, 'preview-groom-box');
    setImg('preview-bride', appData.bride.photo, 'preview-bride-box');
    renderAdminEvents(); renderAdminGallery(); renderAdminWishes();
}

function renderAdminGallery() {
    const p = document.getElementById('admin-gallery-pending');
    if (p) p.innerHTML = pendingUploads.gallery.map((pg, i) => `<div style='position:relative;border-radius:10px;overflow:hidden;border:3px dashed var(--secondary);'><img src='${pg.url}' style='width:100%;height:120px;object-fit:cover;opacity:0.6'><button onclick='window.removeDraft(${i})' style='position:absolute;top:5px;right:5px;background:rgba(180,0,0,0.8);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;'>X</button></div>`).join('') || "<p style='grid-column:1/-1;text-align:center;opacity:0.4;'>Drafts appear here.</p>";
    const l = document.getElementById('admin-gallery-live');
    if (l) l.innerHTML = appData.gallery.map((img, i) => `<div style='position:relative;border-radius:10px;overflow:hidden;border:2px solid #eee;'><img src='${img.url}' style='width:100%;height:120px;object-fit:cover;'><button onclick='window.deleteFromGallery(${i})' style='position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;'>X</button></div>`).join('') || "<p style='grid-column:1/-1;text-align:center;opacity:0.4;'>Live Gallery.</p>";
}

function removeDraft(i) { pendingUploads.gallery.splice(i, 1); renderAdminGallery(); }
async function deleteFromGallery(i) {
    if (confirm("Delete cloud photo?")) {
        const photo = appData.gallery[i];
        if (photo.url && sbClient) { const parts = photo.url.split('wedding-portfolio/'); if (parts[1]) await sbClient.storage.from('wedding-portfolio').remove([parts[1]]); }
        appData.gallery.splice(i, 1);
        await sbClient.from('wedding_config').upsert({ id: 1, wedding:appData.wedding, groom:appData.groom, bride:appData.bride, events:appData.events, gallery: appData.gallery });
        renderAdminGallery();
    }
}

function renderAdminWishes() {
    if(!sbClient) return;
    sbClient.from('wishes').select('*').order('id', { ascending: false }).then(({ data: ws }) => {
        if(!ws) return;
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
        if (btn.getAttribute('data-tab') === 'gallery') renderAdminGallery();
    };
});

window.approveWish = approveWish; window.deleteWish = deleteWish; window.deleteEvent = deleteEvent; 
window.uploadToGallery = prepareGallery; window.deleteFromGallery = deleteFromGallery; window.removeDraft = removeDraft;
window.syncToCloud = syncToCloud; window.previewSingle = previewSingle; window.handleLogout = () => { sessionStorage.clear(); location.reload(); };

document.addEventListener('DOMContentLoaded', initAdmin);
