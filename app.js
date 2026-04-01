// Deepak & Reshmi: Smart App (v12.0 - Gallery Perfection)
// Features: Full Photo Rendering, Premium Borders, & Mobile Responsive Grid.

const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let appData = {
    wedding: { title: "Deepak & Reshmi", date: "April 23-26, 2026", videoUrl1: "", heroUrl: "", musicUrl: "", bannersDesktop: [], bannersMobile: [] },
    groom: { name: "", photo: "images/profile-placeholder.png", parents: "", residence: "", insta: "" },
    bride: { name: "", photo: "images/profile-placeholder.png", parents: "", residence: "", insta: "" },
    events: [], gallery: [], wishes: []
};

let musicStarted = false;

async function initData() {
    if (sbClient) {
        try {
            const { data: dbConfig } = await sbClient.from('wedding_config').select('*').single();
            if (dbConfig) {
                appData.wedding = { ...appData.wedding, ...dbConfig.wedding };
                appData.groom = { ...appData.groom, ...dbConfig.groom };
                appData.bride = { ...appData.bride, ...dbConfig.bride };
                appData.events = dbConfig.events || [];
                appData.gallery = dbConfig.gallery || [];
            }
            const { data: ws } = await sbClient.from('wishes').select('*').eq('approved', true).order('created_at', { ascending: false });
            if (ws) appData.wishes = ws;
        } catch (err) { console.error(err); }
    }
    renderApp();
    startAutoSliders();
    setupCalendar();
    initPublicForms();
}

function renderApp() {
    const set = (id, val, attr = 'textContent') => { const el = document.getElementById(id); if (el) el[attr] = val || ""; };
    set('wedding-title', appData.wedding.title); set('wedding-date-main', appData.wedding.date);
    set('groom-name', appData.groom.name); set('groom-photo', appData.groom.photo, 'src'); set('groom-parents', appData.groom.parents); set('groom-res', appData.groom.residence);
    set('bride-name', appData.bride.name); set('bride-photo', appData.bride.photo, 'src'); set('bride-parents', appData.bride.parents); set('bride-res', appData.bride.residence);

    if (appData.wedding.heroUrl) {
        const h = document.querySelector('.header');
        if (h) h.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${appData.wedding.heroUrl}')`;
    }

    const evList = document.getElementById('event-list');
    if (evList) {
        evList.innerHTML = appData.events.map((ev, idx) => `
            <div class="event-card animate-up" onclick="window.addToCalendarSpecific(${idx})" style="cursor:pointer;" title="Add to Calendar">
                <div class="event-date-badge"><span>${ev.date}</span>APR</div>
                <div class="event-details"><h3>${ev.title}</h3><p><strong><i class='fa-solid fa-clock'></i> ${ev.time}</strong></p><p><i class='fa-solid fa-location-dot'></i> ${ev.venue}</p></div>
            </div>`).join('') || "<p style='text-align:center; width:100%; opacity:0.5;'>Coming soon.</p>";
    }

    renderVideo('video-container-1', appData.wedding.videoUrl1);
    renderGallery();
    renderWishes();
    setupMusic();
    initHeroSlider();
    initAnimations();
}

// 📸 FIXED GALLERY FOR MOBILE & FULL PHOTO
function renderGallery() {
    const grid = document.getElementById('gallery-grid'); if (!grid) return;
    if (!appData.gallery || appData.gallery.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%; opacity:0.6;">Photos arriving soon...</p>`;
        return;
    }

    // Using a more flexible card for full photo viewing
    grid.innerHTML = appData.gallery.map(img => `
        <div class="gallery-item animate-up" style="flex: 0 0 auto; max-width: 90vw; margin: 10px; transition: 0.3s;">
            <div class="glass-card" style="padding: 10px; border: 3px solid #fff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); background: white;">
                <img src="${img.url}" style="width: auto; height: 350px; border-radius: 12px; object-fit: contain; max-width: 100%;" loading="lazy">
            </div>
        </div>`).join('');
}

function renderWishes() {
    const car = document.getElementById('wishes-carousel'); if (!car) return;
    car.innerHTML = appData.wishes.map(w => `<div class='wish-card glass-card animate-up' style='min-width:300px; padding:20px; text-align:center;'>${w.photo_url ? `<img src='${w.photo_url}' style='width:60px;height:60px;border-radius:50%;margin-bottom:10px;'>` : ''}<p>"${w.msg}"</p><p style='font-weight:700;'>- ${w.name}</p></div>`).join('') || "Waiting for blessings.";
}

function addToCalendarSpecific(idx) {
    const ev = appData.events[idx];
    if (!ev) return;
    const s = `202604${ev.date.padStart(2, '0')}T100000Z`;
    const u = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${s}/${s}&details=Join+us+for+the+grand+wedding!&location=${encodeURIComponent(ev.venue)}`;
    window.open(u, '_blank');
}

function openInstagram(type) {
    const url = (type === 'groom') ? appData.groom.insta : appData.bride.insta;
    if (url && url.startsWith('http')) window.open(url, '_blank');
    else alert("Profile profile coming soon! Stay tuned.");
}

function setupCalendar() {
    const btn = document.getElementById('add-to-calendar');
    if (btn) btn.onclick = (e) => { e.preventDefault(); window.open('https://www.google.com/calendar/render?action=TEMPLATE&text=Deepak+%26+Reshmi+Wedding&dates=20260423/20260427&details=Grand+Wedding+Bihar!&location=Bihar', '_blank'); };
}

function initAnimations() {
    const obs = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }), { threshold: 0.1 });
    document.querySelectorAll('.animate-up').forEach(el => obs.observe(el));
}

function initHeroSlider() {
    const cont = document.getElementById('hero-slider');
    if (!cont) return;
    
    const isMobile = window.innerWidth <= 768;
    const banners = (isMobile ? appData.wedding.bannersMobile : appData.wedding.bannersDesktop) || [];
    
    // Choose images list, fallback to heroUrl or default image
    let images = banners.length > 0 ? banners : (appData.wedding.heroUrl ? [appData.wedding.heroUrl] : ['images/hero.png']);

    cont.innerHTML = images.map((src, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image: url('${src}')"></div>
    `).join('');
    
    if (images.length > 1) {
        let current = 0;
        const slides = cont.querySelectorAll('.hero-slide');
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 6000);
    }
}

function renderVideo(id, url) {
    const c = document.getElementById(id); if (!c || !url) return;
    const vId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    c.innerHTML = `<iframe style="width:100%; aspect-ratio:16/9; border-radius:15px; border:none;" src="https://www.youtube.com/embed/${vId}" allowfullscreen></iframe>`;
}

function setupMusic() {
    const audio = document.getElementById('bg-music');
    const control = document.getElementById('music-control');
    const icon = document.getElementById('music-icon');
    if (!audio || !control) return;

    // Set Source: Cloud music if available, else local fallback
    const musicSrc = appData.wedding.musicUrl || 'music/music1.mp4';
    if (musicSrc && !audio.src.includes(musicSrc)) {
        audio.src = musicSrc;
        audio.load();
    }

    const playMusic = () => {
        audio.play().then(() => {
            icon.className = 'fa-solid fa-pause';
            control.classList.add('pulse');
            musicStarted = true;
        }).catch(e => console.log("Autoplay still blocked"));
    };

    const pauseMusic = () => {
        audio.pause();
        icon.className = 'fa-solid fa-play';
        control.classList.remove('pulse');
        musicStarted = false; // Allow manual stop
    };

    control.onclick = () => (audio.paused ? playMusic() : pauseMusic());

    // Try playing immediately if browser allows
    if (!musicStarted) playMusic();
}

// Global Interaction Handler - Catch first click from guest
['click', 'touchstart', 'mousedown', 'keydown'].forEach(ev => 
    document.addEventListener(ev, () => {
        const audio = document.getElementById('bg-music');
        if (audio && audio.paused && !musicStarted) {
            audio.play().then(() => {
                const icon = document.getElementById('music-icon');
                const control = document.getElementById('music-control');
                if(icon) icon.className = 'fa-solid fa-pause';
                if(control) control.classList.add('pulse');
                musicStarted = true;
            }).catch(() => {});
        }
    }, { once: true })
);

function initPublicForms() {
    const form = document.getElementById('public-wish-form');
    if (form) form.onsubmit = async (e) => {
        e.preventDefault();
        const n = document.getElementById('guest-name').value;
        const m = document.getElementById('guest-msg').value;
        if (sbClient) { await sbClient.from('wishes').insert([{ name: n, msg: m, approved: false }]); alert("Sent for approval!"); form.reset(); }
    };
}

function startAutoSliders() { document.querySelectorAll('.carousel, .carousel-wishes').forEach(el => { let s = 0; setInterval(() => { s += 1; if (s >= el.scrollWidth - el.clientWidth) s = 0; el.scrollTo({ left: s, behavior: 'auto' }); }, 40); }); }

window.addToCalendarSpecific = addToCalendarSpecific;
window.openInstagram = openInstagram;
document.addEventListener('DOMContentLoaded', initData);
