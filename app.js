// Deepak & Reshmi Wedding Portfolio: Visibility Fix
// Adding Scroll Observer to fix the "Invisible Sections" problem

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";

const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let appData = {
    wedding: { title: "Deepak & Reshmi", date: "April 23 - April 26, 2026", videoUrl1: "https://www.youtube.com/embed/sZUVG46nkD8", heroUrl: "images/hero.png" },
    groom: { name: "Deepak", photo: "images/groom.jpeg", parents: "Mrs. Khuman Bai - Mr. Hariram Ahir", residence: "Chhatarpur (M.P.)" },
    bride: { name: "Reshmi", photo: "images/bride.jpeg", parents: "Mrs. Savitri - Mr. Nandram Ahirwar", residence: "District Chhatarpur (M.P.)" },
    events: [
        { title: "Matra-Pujan, Mandap/Haldi", date: "23", time: "10:00 AM", venue: "Home (Nij-Niwas)", note: "Traditional rituals." },
        { title: "Tilak & Sangeet", date: "24", time: "05:00 PM", venue: "Hotel / Community Hall", note: "An evening." },
        { title: "Wedding Ceremony", date: "26", time: "07:00 PM", venue: "Chhatarpur", note: "The main ceremony." }
    ],
    wishes: []
};

async function initData() {
    console.log("🔄 Loading Registry...");
    if (sbClient) {
        try {
            const { data: dbConfig } = await sbClient.from('wedding_config').select('*').single();
            if (dbConfig) {
                console.log("✅ Live Data Found!");
                appData.wedding = { ...appData.wedding, ...dbConfig.wedding };
                appData.groom = { ...appData.groom, ...dbConfig.groom };
                appData.bride = { ...appData.bride, ...dbConfig.bride };
                appData.events = dbConfig.events || appData.events;
            }
            const { data: wishesData } = await sbClient.from('wishes').select('*').eq('approved', true).order('created_at', { ascending: false });
            if (wishesData) appData.wishes = wishesData;
        } catch (err) { console.error(err); }
    }
    
    renderApp();
    initAnimations(); // THE FIX: This makes them visible!
    startAutoSliders();
    attemptAutoplay();
    initPublicForms();
}

function initAnimations() {
    // This observer detects when sections enter the screen and makes them fade in
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate-up').forEach(el => obs.observe(el));
}

function renderApp() {
    console.log("🎨 Painting Screen...");
    const set = (id, val, attr = 'textContent') => { const el = document.getElementById(id); if (el) el[attr] = val; };
    
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

    const hero = document.querySelector('.header');
    if (hero) hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${appData.wedding.heroUrl}')`;

    const eventList = document.getElementById('event-list');
    if (eventList) {
        eventList.innerHTML = appData.events.map((ev, idx) => `
            <div class="event-card animate-up" onclick="window.addToCalendarSpecific(${idx})">
                <div class="event-date-badge"><span>${ev.date}</span>APR</div>
                <div class="event-details"><h3>${ev.title}</h3><p><strong><i class='fa-solid fa-clock'></i> ${ev.time}</strong></p><p><i class='fa-solid fa-location-dot'></i> ${ev.venue}</p></div>
            </div>`).join('');
        // Re-observe newly added cards
        document.querySelectorAll('.event-card.animate-up').forEach(el => {
             const obs = new IntersectionObserver((entries) => {
                 if (entries[0].isIntersecting) entries[0].target.classList.add('visible');
             }, { threshold: 0.1 });
             obs.observe(el);
        });
    }
    
    renderVideo('video-container-1', appData.wedding.videoUrl1);
    renderWishes();
}

function renderVideo(id, url) {
    const container = document.getElementById(id); if (!container || !url) return;
    let vidId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : (url.includes('youtu.be/') ? url.split('youtu.be/')[1].split('?')[0] : '');
    if (!vidId && url.includes('embed/')) vidId = url.split('embed/')[1].split('?')[0];
    container.innerHTML = `<div class="video-frame" style="width:100%; height:auto; background:linear-gradient(135deg, var(--secondary), #f9e394); padding:4px; border-radius:15px; margin:0 auto; overflow:hidden;"><div style="position:relative; width:100%; padding-bottom:42%; overflow:hidden; border-radius:12px;"><iframe style="position:absolute; top:50%; left:50%; width:100%; height:145%; border:none; transform:translate(-50%, -50%);" src="https://www.youtube.com/embed/${vidId}?autoplay=1&mute=1&loop=1" allow="autoplay; encrypted-media; gyroscope;" allowfullscreen></iframe></div></div>`;
}

function renderWishes() {
    const carousel = document.getElementById('wishes-carousel'); if (!carousel) return;
    if (appData.wishes.length === 0) { carousel.innerHTML = `<p style='text-align:center; padding:20px; font-style:italic;'>Waiting for blessings...</p>`; return; }
    carousel.innerHTML = appData.wishes.map(w => `<div class='wish-card glass-card' style='min-width:300px; display:flex; align-items:center; gap:15px; padding:20px;'><img src='${w.photo_url || 'https://i.pravatar.cc/100?u='+w.id}' style='width:65px; height:65px; border-radius:50%; object-fit:cover;'><div><p>"${w.msg}"</p><p style='font-weight:700;'>— ${w.name}</p></div></div>`).join('');
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
            btn.innerHTML = "Wait..."; btn.disabled = true;
            try {
                let photoUrl = null;
                if (photo && sbClient) {
                    const fname = `${Date.now()}-${photo.name}`;
                    await sbClient.storage.from('wedding-portfolio').upload(fname, photo);
                    photoUrl = sbClient.storage.from('wedding-portfolio').getPublicUrl(fname).data.publicUrl;
                }
                const { error } = await sbClient.from('wishes').insert([{ name, msg, photo_url: photoUrl, approved: false }]);
                if (!error) { alert("Sent for approval!"); form.reset(); }
            } catch (err) { alert("Fail to send."); }
            finally { btn.innerHTML = "Submit Wish"; btn.disabled = false; }
        };
    }
}

function attemptAutoplay() { const a = document.getElementById('bg-music'); if (a) a.play().catch(() => {}); }
function startAutoSliders() { document.querySelectorAll('.carousel, .carousel-wishes').forEach(el => { let sc = 0; setInterval(() => { sc += 1.5; if (sc >= el.scrollWidth - el.clientWidth) sc = 0; el.scrollTo({ left: sc, behavior: 'auto' }); }, 50); }); }
window.addToCalendarSpecific = (idx) => { const ev = appData.events[idx]; if (ev) window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=202604${ev.date}/202604${parseInt(ev.date)+1}`, '_blank'); };
window.toggleMusic = () => { const a = document.getElementById('bg-music'); if (a.paused) a.play(); else a.pause(); };
document.addEventListener('DOMContentLoaded', initData);
