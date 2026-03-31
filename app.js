// Deepak & Reshmi: Clean Production Edition (Supabase Serverless)
// ALL data managed via Database ONLY

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";

const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Clean Data Structure (Waiting for DB)
let appData = {
    wedding: { title: "Loading...", date: "", videoUrl1: "", heroUrl: "" },
    groom: { name: "", photo: "images/profile-placeholder.png", parents: "", residence: "" },
    bride: { name: "", photo: "images/profile-placeholder.png", parents: "", residence: "" },
    events: [],
    wishes: []
};

async function initData() {
    console.log("🛠️ Fetching Wedding Data from Supabase...");
    if (sbClient) {
        try {
            // Load live configuration
            const { data: dbConfig } = await sbClient.from('wedding_config').select('*').single();
            if (dbConfig) {
                appData.wedding = { ...appData.wedding, ...dbConfig.wedding };
                appData.groom = { ...appData.groom, ...dbConfig.groom };
                appData.bride = { ...appData.bride, ...dbConfig.bride };
                appData.events = dbConfig.events || [];
            }
            // Load live wishes
            const { data: wishesData } = await sbClient.from('wishes').select('*').eq('approved', true).order('created_at', { ascending: false });
            if (wishesData) appData.wishes = wishesData;
        } catch (err) { console.error("Database fetch failed. Using empty defaults.", err); }
    }
    
    renderApp();
    initAnimations();
    startAutoSliders();
    attemptAutoplay();
    initPublicForms();
}

// Visual Renderers
function renderApp() {
    const set = (id, val, attr = 'textContent') => { const el = document.getElementById(id); if (el) el[attr] = val || ""; };
    set('wedding-title', appData.wedding.title);
    set('wedding-date-main', appData.wedding.date);
    set('groom-name', appData.groom.name);
    set('groom-photo', appData.groom.photo, 'src');
    set('groom-parents', appData.groom.parents);
    set('groom-res', appData.groom.residence);
    set('bride-name', appData.bride.name);
    set('bride-photo', appData.bride.photo, 'src');
    set('bride-parents', appData.bride.parents);
    set('bride-res', appData.bride.residence);

    const h = document.querySelector('.header');
    if (h && appData.wedding.heroUrl) h.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${appData.wedding.heroUrl}')`;

    const evList = document.getElementById('event-list');
    if (evList) {
        evList.innerHTML = appData.events.map((ev, idx) => `
            <div class="event-card animate-up" onclick="window.addToCalendarSpecific(${idx})">
                <div class="event-date-badge"><span>${ev.date}</span>APR</div>
                <div class="event-details"><h3>${ev.title}</h3><p><strong><i class='fa-solid fa-clock'></i> ${ev.time}</strong></p><p><i class='fa-solid fa-location-dot'></i> ${ev.venue}</p></div>
            </div>`).join('') || "<p style='text-align:center; width:100%;'>Will be announced soon.</p>";
    }
    
    renderVideo('video-container-1', appData.wedding.videoUrl1);
    renderWishes();
}

function initAnimations() {
    const obs = new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-up, .event-card').forEach(el => obs.observe(el));
}

function renderVideo(id, url) {
    const container = document.getElementById(id); if (!container || !url) return;
    let vidId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : (url.includes('youtu.be/') ? url.split('youtu.be/')[1].split('?')[0] : '');
    if (!vidId && url.includes('embed/')) vidId = url.split('embed/')[1].split('?')[0];
    container.innerHTML = `<div class="video-frame" style="width:100%; background:linear-gradient(135deg, var(--secondary), #f9e394); padding:4px; border-radius:15px; overflow:hidden;"><div style="position:relative; width:100%; padding-bottom:42%; overflow:hidden; border-radius:12px;"><iframe style="position:absolute; top:50%; left:50%; width:100%; height:145%; border:none; transform:translate(-50%, -50%);" src="https://www.youtube.com/embed/${vidId}?autoplay=1&mute=1&loop=1" allow="autoplay; encrypted-media; gyroscope;" allowfullscreen></iframe></div></div>`;
}

function renderWishes() {
    const car = document.getElementById('wishes-carousel'); if (!car) return;
    car.innerHTML = appData.wishes.map(w => `<div class='wish-card glass-card' style='min-width:300px; display:flex; align-items:center; gap:15px; padding:20px;'><img src='${w.photo_url || 'https://i.pravatar.cc/100?u='+w.id}' style='width:65px; height:65px; border-radius:50%; object-fit:cover;'><div><p>"${w.msg}"</p><p style='font-weight:700;'>— ${w.name}</p></div></div>`).join('') || "<p style='width:100%; text-align:center;'>Waiting for blessings...</p>";
}

function initPublicForms() {
    const form = document.getElementById('public-wish-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const name = document.getElementById('guest-name').value;
            const msg = document.getElementById('guest-msg').value;
            const photo = document.getElementById('guest-photo').files[0];
            btn.innerHTML = "Submitting..."; btn.disabled = true;
            try {
                let photoUrl = null;
                if (photo && sbClient) {
                    const fname = `${Date.now()}-${photo.name}`;
                    const { error: upErr } = await sbClient.storage.from('wedding-portfolio').upload(fname, photo);
                    if (!upErr) photoUrl = sbClient.storage.from('wedding-portfolio').getPublicUrl(fname).data.publicUrl;
                }
                const { error } = await sbClient.from('wishes').insert([{ name, msg, photo_url: photoUrl, approved: false }]);
                if (!error) { alert("Sent for approval!"); form.reset(); }
            } catch (err) { alert("Fail to send."); }
            finally { btn.innerHTML = "Submit Wish"; btn.disabled = false; }
        };
    }
}

// Utils
function attemptAutoplay() { const a = document.getElementById('bg-music'); if (a) a.play().catch(() => {}); }
function startAutoSliders() { document.querySelectorAll('.carousel, .carousel-wishes').forEach(el => { let sc = 0; setInterval(() => { sc += 1.5; if (sc >= el.scrollWidth - el.clientWidth) sc = 0; el.scrollTo({ left: sc, behavior: 'auto' }); }, 50); }); }
window.addToCalendarSpecific = (idx) => { const ev = appData.events[idx]; if (ev) window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=202604${ev.date}/202604${parseInt(ev.date)+1}`, '_blank'); };
window.toggleMusic = () => { const a = document.getElementById('bg-music'); if (a.paused) a.play(); else a.pause(); };
document.addEventListener('DOMContentLoaded', initData);
