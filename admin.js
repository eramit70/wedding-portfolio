// Deepak & Reshmi Wedding Portfolio: Admin Panel (Supabase Serverless)
// For 100% Free Hosting on Netlify without a Node Server

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ADMIN_PASS = "DeepakReshmi2026";
let appData = null;

// ----------------------------------------------------
// 1. AUTH & INITIALIZATION
// ----------------------------------------------------
async function initAdmin() {
    // 1. Initial Load from Supabase (Persistent Source)
    if (supabase) {
        try {
            const { data, error } = await supabase.from('wedding_config').select('*').single();
            if (!error && data) {
                appData = data;
            } else {
                // Fallback to default if no config found
                appData = {
                    wedding: { title: "Deepak & Reshmi", date: "April 23 - April 26, 2026", announcement: "The Beginning of Forever", videoUrl1: "https://www.youtube.com/embed/sZUVG46nkD8", musicUrl: "music/music1.mp4", heroUrl: "images/hero.png", eventLayout: "grid" },
                    groom: { name: "Deepak", degree: "M.Tech", photo: "images/groom.jpeg", parents: "Mrs. Savitri - Mr. Nandram Ahirwar", residence: "Rampur Road, Chhatarpur" },
                    bride: { name: "Reshmi", degree: "B.A.", photo: "images/bride.jpeg", parents: "Mrs. Savitri - Mr. Nandram Ahirwar", residence: "Gram Post Sijai" },
                    events: [
                        { title: "Matra-Pujan, Mandap/Haldi", date: "23", time: "10:00 AM", venue: "Home (Nij-Niwas)", note: "Traditional rituals." },
                        { title: "Tilak & Sangeet", date: "24", time: "05:00 PM", venue: "Hotel / Community Hall", note: "An evening of dance & music." },
                        { title: "Baraat Prasthana", date: "25", time: "04:00 PM", venue: "To Chhatarpur", note: "The groom's departure." },
                        { title: "Wedding Ceremony", date: "26", time: "07:00 PM", venue: "Chhatarpur", note: "The main ceremony." }
                    ],
                    wishes: []
                };
            }
        } catch (e) {
            console.error("Supabase fail, check configuration.", e);
        }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const pass = document.getElementById('admin-pass').value.trim();
            if (pass === ADMIN_PASS) {
                document.getElementById('admin-login-section').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                loadDashboardData();
            } else {
                alert("Incorrect Password!");
            }
        };
    }
}

// ----------------------------------------------------
// 2. DASHBOARD LOGIC
// ----------------------------------------------------
function loadDashboardData() {
    if (!appData) return;

    // 1. GENERAL TAB
    document.getElementById('admin-title').value = appData.wedding.title || "";
    document.getElementById('admin-date-text').value = appData.wedding.date || "";
    document.getElementById('admin-music-url').value = appData.wedding.musicUrl || "";
    document.getElementById('admin-video-url').value = appData.wedding.videoUrl1 || "";
    document.getElementById('admin-hero-url').value = appData.wedding.heroUrl || "images/hero.png";

    // 2. COUPLE TAB
    document.getElementById('admin-groom-name').value = appData.groom.name || "";
    document.getElementById('admin-groom-degree').value = appData.groom.degree || "";
    document.getElementById('admin-groom-parents').value = appData.groom.parents || "";
    document.getElementById('admin-groom-residence').value = appData.groom.residence || "";

    document.getElementById('admin-bride-name').value = appData.bride.name || "";
    document.getElementById('admin-bride-degree').value = appData.bride.degree || "";
    document.getElementById('admin-bride-parents').value = appData.bride.parents || "";
    document.getElementById('admin-bride-residence').value = appData.bride.residence || "";

    // 3. EVENTS TAB
    renderAdminEvents();

    // 4. WISHES TAB
    renderAdminWishes();
}

// ----------------------------------------------------
// 3. TAB MANAGEMENT
// ----------------------------------------------------
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(btn => {
    btn.onclick = () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        if (btn.getAttribute('data-tab') === 'wishes') renderAdminWishes();
    };
});

// ----------------------------------------------------
// 4. DATA OPS (SUPABASE)
// ----------------------------------------------------
async function saveData() {
    if (!supabase) { alert("Supabase not configured!"); return; }
    
    const { error } = await supabase.from('wedding_config').upsert({
        id: 1, // Only one record for global config
        wedding: appData.wedding,
        groom: appData.groom,
        bride: appData.bride,
        events: appData.events
    });

    if (error) {
        alert("Fail to save config: " + error.message);
    } else {
        alert("Wedding Settings Saved Successfully!");
    }
}

// ----------------------------------------------------
// 5. WISHES MANAGEMENT
// ----------------------------------------------------
async function renderAdminWishes() {
    if (!supabase) return;
    const listPending = document.getElementById('list-pending');
    const listApproved = document.getElementById('list-approved');

    const { data: wishes, error } = await supabase
        .from('wishes')
        .select('*')
        .order('id', { ascending: false });

    if (error) return;

    const pending = wishes.filter(w => !w.approved);
    const approved = wishes.filter(w => w.approved);

    listPending.innerHTML = pending.map(w => `
        <div class="item-card" style="border-left: 5px solid var(--secondary);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${w.photo_url || 'https://i.pravatar.cc/100?u='+w.id}" class="wish-photo-circle" style="width: 45px; height: 45px;">
                <div class="item-info">
                    <strong>${w.name}</strong><br>
                    <span style="font-size: 0.9rem; opacity: 0.8;">"${w.msg}"</span>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary btn-sm" onclick="approveWish(${w.id})"><i class="fa-solid fa-check"></i> Approve</button>
                <button class="btn btn-danger btn-sm" onclick="deleteWish(${w.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('') || "No pending wishes.";

    listApproved.innerHTML = approved.map(w => `
        <div class="item-card" style="border-left: 5px solid #28a745;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${w.photo_url || 'https://i.pravatar.cc/100?u='+w.id}" class="wish-photo-circle" style="width: 45px; height: 45px;">
                <div class="item-info">
                    <strong>${w.name}</strong><br>
                    <span style="font-size: 0.9rem; opacity: 0.8;">"${w.msg}"</span>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-danger btn-sm" onclick="deleteWish(${w.id})" title="Remove"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('') || "No approved wishes yet.";
}

async function approveWish(id) {
    if (!supabase) return;
    const { error } = await supabase.from('wishes').update({ approved: true }).eq('id', id);
    if (!error) renderAdminWishes();
}

async function deleteWish(id) {
    if (!supabase) return;
    if (confirm("Permanently delete this blessing?")) {
        const { error } = await supabase.from('wishes').delete().eq('id', id);
        if (!error) renderAdminWishes();
    }
}

// ----------------------------------------------------
// 6. FORM HANDLERS
// ----------------------------------------------------
document.getElementById('general-form').onsubmit = (e) => {
    e.preventDefault();
    appData.wedding.title = document.getElementById('admin-title').value;
    appData.wedding.date = document.getElementById('admin-date-text').value;
    appData.wedding.musicUrl = document.getElementById('admin-music-url').value;
    appData.wedding.videoUrl1 = document.getElementById('admin-video-url').value;
    appData.wedding.heroUrl = document.getElementById('admin-hero-url').value;
    saveData();
};

document.getElementById('couple-form').onsubmit = (e) => {
    e.preventDefault();
    appData.groom.name = document.getElementById('admin-groom-name').value;
    appData.groom.degree = document.getElementById('admin-groom-degree').value;
    appData.groom.parents = document.getElementById('admin-groom-parents').value;
    appData.groom.residence = document.getElementById('admin-groom-residence').value;
    appData.bride.name = document.getElementById('admin-bride-name').value;
    appData.bride.degree = document.getElementById('admin-bride-degree').value;
    appData.bride.parents = document.getElementById('admin-bride-parents').value;
    appData.bride.residence = document.getElementById('admin-bride-residence').value;
    saveData();
};

function renderAdminEvents() {
    const list = document.getElementById('list-events');
    list.innerHTML = appData.events.map((ev, idx) => `
        <div class="item-card">
            <div class="item-info"><strong>${ev.title}</strong><br>${ev.date} APR | ${ev.venue}</div>
            <button class="btn btn-primary" onclick="alert('Manual event editing coming soon. Settings saved collectively.')">Info</button>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', initAdmin);
window.approveWish = approveWish;
window.deleteWish = deleteWish;
