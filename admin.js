// Deepak & Reshmi: Smart Admin (v3.1)
// Final Bug-Fix Edition: Corrected ID variables and confirmed all button classes.

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

async function initAdmin() {
    document.querySelectorAll('.animate-up').forEach(el => el.classList.add('visible'));
    if (sbClient) {
        try {
            const { data, error } = await sbClient.from('wedding_config').select('*').single();
            if (!error && data) {
                appData = data;
                if (!appData.gallery) appData.gallery = [];
            }
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

async function deleteFromStorage(url) {
    if (!url || !url.includes('wedding-portfolio/')) return;
    try {
        const parts = url.split('wedding-portfolio/');
        const fname = parts[1];
        if (fname) await sbClient.storage.from('wedding-portfolio').remove([fname]);
    } catch (err) { console.error(err); }
}

async function uploadToGallery() {
    const input = document.getElementById('gallery-uploader');
    const files = input.files; if (!files || files.length === 0) return;
    for (let f of files) {
        if (f.size > 5*1024*1024) continue;
        const fname = `g-${Date.now()}-${f.name.replace(/\s/g, '_')}`;
        const { error } = await sbClient.storage.from('wedding-portfolio').upload(fname, f);
        if (!error) {
            const url = sbClient.storage.from('wedding-portfolio').getPublicUrl(fname).data.publicUrl;
            appData.gallery.push({ url });
        }
    }
    await saveData();
    renderAdminGallery();
}

async function deleteFromGallery(i) {
    if (confirm("Delete photo permanently?")) {
        const photo = appData.gallery[i];
        if (photo) await deleteFromStorage(photo.url);
        appData.gallery.splice(i, 1);
        await saveData();
        renderAdminGallery();
    }
}

async function deleteWish(id) {
    if (confirm("Delete this blessing and its photo permanently?")) {
        const { data: wish } = await sbClient.from('wishes').select('photo_url').eq('id', id).single();
        if (wish && wish.photo_url) await deleteFromStorage(wish.photo_url);
        await sbClient.from('wishes').delete().eq('id', id);
        renderAdminWishes();
    }
}

async function approveWish(id) { await sbClient.from('wishes').update({ approved: true }).eq('id', id); renderAdminWishes(); }

async function saveData() {
    const getVal = (id) => document.getElementById(id)?.value || "";
    appData.wedding.title = getVal('admin-title');
    appData.wedding.date = getVal('admin-date-text');
    appData.wedding.videoUrl1 = getVal('admin-video-url');
    appData.wedding.heroUrl = getVal('admin-hero-url');
    appData.groom.name = getVal('admin-groom-name');
    appData.groom.parents = getVal('admin-groom-parents');
    appData.groom.residence = getVal('admin-groom-res');
    appData.bride.name = getVal('admin-bride-name');
    appData.bride.parents = document.getElementById('admin-bride-parents')?.value || ""; 
    appData.bride.residence = document.getElementById('admin-bride-res')?.value || "";

    const { error } = await sbClient.from('wedding_config').upsert({ id: 1, wedding:appData.wedding, groom:appData.groom, bride:appData.bride, events:appData.events, gallery: appData.gallery });
    if (!error) console.log("Cloud Saved!");
    loadDashboardData();
}

function loadDashboardData() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
    set('admin-title', appData.wedding.title); set('admin-date-text', appData.wedding.date);
    set('admin-video-url', appData.wedding.videoUrl1); set('admin-hero-url', appData.wedding.heroUrl);
    set('admin-groom-name', appData.groom.name); set('admin-groom-parents', appData.groom.parents); set('admin-groom-res', appData.groom.residence);
    set('admin-bride-name', appData.bride.name); set('admin-bride-parents', appData.bride.parents); set('admin-bride-res', appData.bride.residence);
    renderAdminEvents(); renderAdminGallery(); renderAdminWishes();
}

function renderAdminWishes() {
    if (!sbClient) return;
    sbClient.from('wishes').select('*').order('id', { ascending: false }).then(({ data: ws }) => {
        if (!ws) return;
        const pList = document.getElementById('admin-wishes-pending');
        if (pList) pList.innerHTML = ws.filter(w => !w.approved).map(w => `
            <div class="item-card" style="border-left:5px solid var(--secondary);">
                <div class="item-info"><strong>${w.name}</strong>: ${w.msg}</div>
                <div style="display:flex;gap:5px;">
                    <button class="btn btn-primary btn-sm" onclick="approveWish(${w.id})">Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWish(${w.id})">Delete</button>
                </div>
            </div>`).join('') || "None.";
        const aList = document.getElementById('admin-wishes-approved');
        if (aList) aList.innerHTML = ws.filter(w => w.approved).map(w => `
            <div class="item-card" style="border-left:5px solid #28a745;">
                <div class="item-info"><strong>${w.name}</strong>: ${w.msg}</div>
                <button class="btn btn-danger btn-sm" onclick="deleteWish(${w.id})">Delete</button>
            </div>`).join('') || "None.";
    });
}

function renderAdminEvents() {
    const l = document.getElementById('admin-event-list');
    if (l) l.innerHTML = appData.events.map((ev, i) => `<div class="item-card"><div><strong>${ev.title}</strong> (${ev.date} APR)</div><button class="btn btn-danger btn-sm" onclick="deleteEvent(${i})">X</button></div>`).join('') || "No events.";
}

function renderAdminGallery() {
    const grid = document.getElementById('admin-gallery-list'); if (!grid) return;
    grid.innerHTML = appData.gallery.map((img, i) => `
        <div style="position:relative; border-radius:10px; overflow:hidden; border:2px solid #eee;">
            <img src="${img.url}" style="width:100%; height:120px; object-fit:cover;">
            <button onclick="deleteFromGallery(${i})" style="position:absolute; top:5px; right:5px; background:rgba(220,53,69,0.9); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; font-weight:bold;">X</button>
        </div>`).join('') || "No photos.";
}

function deleteEvent(idx) { if (confirm("Delete event?")) { appData.events.splice(idx, 1); saveData(); renderAdminEvents(); } }
const forms = ['form-general', 'form-couple', 'form-event-add'];
forms.forEach(fid => { const f=document.getElementById(fid); if(f) f.onsubmit=(e)=>{e.preventDefault(); saveData();}; });

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        if (btn.getAttribute('data-tab') === 'wishes') renderAdminWishes();
    };
});

document.addEventListener('DOMContentLoaded', initAdmin);
window.approveWish = approveWish; window.deleteWish = deleteWish; window.deleteEvent = deleteEvent; window.uploadToGallery = uploadToGallery; window.deleteFromGallery = deleteFromGallery;
