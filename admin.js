// Deepak & Reshmi Wedding Portfolio: Admin Panel (Supabase Serverless)
// Correct IDs for Wishes Tab

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";

const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ADMIN_PASS = "DeepakReshmi2026";
let appData = null;

async function initAdmin() {
    document.querySelectorAll('.animate-up').forEach(el => el.classList.add('visible'));

    if (sbClient) {
        try {
            const { data, error } = await sbClient.from('wedding_config').select('*').single();
            if (!error && data) appData = data;
            else {
                appData = {
                    wedding: { title: "Deepak & Reshmi", date: "April 23 - April 26, 2026", videoUrl1: "https://www.youtube.com/embed/sZUVG46nkD8", heroUrl: "images/hero.png" },
                    groom: { name: "Deepak", parents: "Mrs. Khuman Bai - Mr. Hariram Ahir", residence: "Chhatarpur" },
                    bride: { name: "Reshmi", parents: "Mrs. Savitri - Mr. Nandram Ahirwar", residence: "Chhatarpur" },
                    events: [], wishes: []
                };
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

function loadDashboardData() {
    if (!appData) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    set('admin-title', appData.wedding.title);
    set('admin-date-text', appData.wedding.date);
    set('admin-video-url', appData.wedding.videoUrl1);
    set('admin-hero-url', appData.wedding.heroUrl);
    set('admin-groom-name', appData.groom.name);
    set('admin-groom-parents', appData.groom.parents);
    set('admin-groom-res', appData.groom.residence);
    set('admin-bride-name', appData.bride.name);
    set('admin-bride-parents', appData.bride.parents);
    set('admin-bride-res', appData.bride.residence);
    renderAdminEvents();
    renderAdminWishes();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        if (btn.getAttribute('data-tab') === 'wishes') renderAdminWishes();
    };
});

async function saveData() {
    if (!sbClient) return;
    const { error } = await sbClient.from('wedding_config').upsert({ id: 1, wedding: appData.wedding, groom: appData.groom, bride: appData.bride, events: appData.events });
    if (error) alert("Save fail!"); else alert("Wedding Settings Saved!");
}

async function renderAdminWishes() {
    if (!sbClient) return;
    const { data: wishes } = await sbClient.from('wishes').select('*').order('id', { ascending: false });
    if (!wishes) return;

    // Use THE CORRECT IDS FROM YOUR HTML: admin-wishes-pending and admin-wishes-approved
    const listPending = document.getElementById('admin-wishes-pending');
    if (listPending) {
        listPending.innerHTML = wishes.filter(w => !w.approved).map(w => `
            <div class='item-card' style='border-left:5px solid #FFD700;'>
                <div class='item-info'><strong>${w.name}</strong>: ${w.msg}</div>
                <button class='btn btn-primary btn-sm' onclick='approveWish(${w.id})'>Approve</button>
            </div>`).join('') || "No pending wishes.";
    }
    
    const listApproved = document.getElementById('admin-wishes-approved');
    if (listApproved) {
        listApproved.innerHTML = wishes.filter(w => w.approved).map(w => `
            <div class='item-card' style='border-left:5px solid #28a745;'>
                <div class='item-info'><strong>${w.name}</strong>: ${w.msg}</div>
                <button class='btn btn-danger btn-sm' onclick='deleteWish(${w.id})'>Delete</button>
            </div>`).join('') || "No approved wishes.";
    }
}

async function approveWish(id) { await sbClient.from('wishes').update({ approved: true }).eq('id', id); renderAdminWishes(); }
async function deleteWish(id) { if (confirm("Delete this blessing?")) { await sbClient.from('wishes').delete().eq('id', id); renderAdminWishes(); } }

document.getElementById('form-general').onsubmit = (e) => { e.preventDefault(); appData.wedding.title=document.getElementById('admin-title').value; saveData(); };
document.getElementById('form-couple').onsubmit = (e) => { e.preventDefault(); appData.groom.name=document.getElementById('admin-groom-name').value; saveData(); };

function renderAdminEvents() { const list = document.getElementById('admin-event-list'); if (list) list.innerHTML = appData.events.map(ev => `<div class='item-card'>${ev.title}</div>`).join('') || "No events."; }
document.addEventListener('DOMContentLoaded', initAdmin);
window.approveWish = approveWish; window.deleteWish = deleteWish;
