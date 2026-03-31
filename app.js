// Deepak & Reshmi Wedding Portfolio: Supabase Serverless Edition
// Using Supabase for 100% Free, Perpetual Hosting on Netlify

/**
 * --- STEP 1: CONFIGURE YOUR SUPABASE ---
 * After you create a Supabase project, replace these two strings with your 
 * Project URL and your public 'anon' Key from the Project Settings -> API page.
 */
const SUPABASE_URL = "https://cmozswraxmorgprvvmwx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUC4eQ2Q3SgWFBG4Fsm7qQ_glvLslVy";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const WEDDING_DATA_KEY = 'deep_resh_wedding_v1';

let appData = {
    wedding: {
        title: "Deepak & Reshmi",
        date: "April 23 - April 26, 2026",
        announcement: "The Beginning of Forever",
        videoUrl1: "https://www.youtube.com/embed/sZUVG46nkD8",
        musicUrl: "music/music1.mp4",
        heroUrl: "images/hero.png",
        eventLayout: "grid"
    },
    groom: {
        name: "Deepak",
        degree: "M.Tech",
        photo: "images/groom.jpeg",
        parents: "Mrs. Khuman Bai - Mr. Hariram Ahir (BSP, Politician)",
        residence: "Rampur Road, Near Water Tank, Gram Post Ishanagar, District Chhatarpur (M.P.)"
    },
    bride: {
        name: "Reshmi",
        degree: "B.A.",
        photo: "images/bride.jpeg",
        parents: "Mrs. Savitri - Mr. Nandram Ahirwar (Ex-Sarpanch)",
        residence: "Gram Post Sijai, District Chhatarpur (M.P.)"
    },
    events: [
        { title: "Matra-Pujan, Mandap/Haldi", date: "23", time: "10:00 AM", venue: "Home (Nij-Niwas)", note: "Traditional rituals with family." },
        { title: "Tilak & Sangeet", date: "24", time: "05:00 PM", venue: "Hotel / Community Hall", note: "An evening of dance & music." },
        { title: "Baraat Prasthana", date: "25", time: "04:00 PM", venue: "To Chhatarpur", note: "The groom's departure ceremony." },
        { title: "Wedding Ceremony", date: "26", time: "07:00 PM", venue: "Chhatarpur", note: "The auspicious main ceremony." }
    ],
    wishes: []
};

// ----------------------------------------------------
// 1. DATA INITIALIZATION
// ----------------------------------------------------
async function initData() {
    // 1. Load Local fallback
    const local = localStorage.getItem(WEDDING_DATA_KEY);
    if (local) appData = JSON.parse(local);

    // 2. Load from Supabase (Persistent Source)
    if (supabase) {
        try {
            // A. Fetch App Config (if exists in a 'config' table)
            const { data: config, error: configErr } = await supabase.from('wedding_config').select('*').single();
            if (!configErr && config) {
                appData.wedding = { ...appData.wedding, ...config.wedding };
                appData.groom = { ...appData.groom, ...config.groom };
                appData.bride = { ...appData.bride, ...config.bride };
                appData.events = config.events || appData.events;
            }

            // B. Fetch Published Wishes
            const { data: wishesData, error: wishErr } = await supabase
                .from('wishes')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: false });

            if (!wishErr) appData.wishes = wishesData || [];
            
        } catch (err) { console.error("Supabase load error:", err); }
    }

    renderApp();
    startAutoSliders();
    attemptAutoplay();
    initPublicForms();
    initCalendarMain();
}

// ----------------------------------------------------
// 2. RENDERING LOGIC
// ----------------------------------------------------
function renderApp() {
    // Wedding Details
    document.getElementById('wedding-title').textContent = appData.wedding.title;
    document.getElementById('wedding-date-main').textContent = appData.wedding.date;
    renderVideo('video-container-1', appData.wedding.videoUrl1);

    // Dynamic Banner
    const heroSection = document.querySelector('.header');
    if (heroSection) heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${appData.wedding.heroUrl}')`;

    // Groom & Bride
    document.getElementById('groom-name').textContent = appData.groom.name;
    document.getElementById('groom-degree').textContent = appData.groom.degree;
    document.getElementById('groom-parents').textContent = appData.groom.parents;
    document.getElementById('groom-residence').textContent = appData.groom.residence;
    document.getElementById('groom-photo-img').src = appData.groom.photo;

    document.getElementById('bride-name').textContent = appData.bride.name;
    document.getElementById('bride-degree').textContent = appData.bride.degree;
    document.getElementById('bride-parents').textContent = appData.bride.parents;
    document.getElementById('bride-residence').textContent = appData.bride.residence;
    document.getElementById('bride-photo-img').src = appData.bride.photo;

    // Events
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = appData.events.map((ev, idx) => `
        <div class="event-card animate-up" onclick="addToCalendarSpecific(${idx})">
            <div class="event-date-badge"><span>${ev.date}</span>APR</div>
            <div class="event-details">
                <h3>${ev.title}</h3>
                <p><strong><i class="fa-solid fa-clock"></i> ${ev.time}</strong></p>
                <p><i class="fa-solid fa-location-dot"></i> ${ev.venue}</p>
                <p style="margin-top:10px; font-style:italic;">"${ev.note}"</p>
                <div style="margin-top:15px; color:var(--primary); font-size:0.8rem; font-weight:700;">
                    <i class="fa-solid fa-plus-circle"></i> REMIND ME
                </div>
            </div>
        </div>
    `).join('');

    renderWishes();
}

function renderVideo(id, url) {
    const container = document.getElementById(id);
    if (!container || !url) return;
    
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
        const vidId = url.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else if (url.includes('watch?v=')) {
        const vidId = url.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${vidId}`;
    }

    const separator = embedUrl.includes('?') ? '&' : '?';
    const finalUrl = `${embedUrl}${separator}autoplay=1&mute=1&rel=0&showinfo=0&loop=1`;

    container.innerHTML = `
        <div class="video-frame" style="width: 100%; max-width: 1100px; background: linear-gradient(135deg, var(--secondary), #f9e394); padding: 4px; border-radius: 16px; box-shadow: 0 15px 45px rgba(0,0,0,0.4); margin: 0 auto; overflow: hidden;">
            <div style="position: relative; width: 100%; padding-bottom: 42%; overflow: hidden; border-radius: 14px; background: #000;">
                <iframe 
                    style="position: absolute; top: 50%; left: 50%; width: 100%; height: 145%; border: none; transform: translate(-50%, -50%);" 
                    src="${finalUrl}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>`;
}

function renderWishes() {
    const wishesCarousel = document.getElementById('wishes-carousel');
    if (!wishesCarousel) return;

    if (appData.wishes.length === 0) {
        wishesCarousel.innerHTML = `<div style="text-align:center; width:100%; padding:20px; color:var(--primary); font-style:italic;">Waiting for your blessings...</div>`;
        return;
    }

    wishesCarousel.innerHTML = appData.wishes.map(w => `
        <div class="wish-card glass-card">
            <img src="${w.photo_url || 'https://i.pravatar.cc/150?u=' + w.id}" class="wish-photo-circle">
            <div style="flex: 1;">
                <p class="wish-msg">"${w.msg}"</p>
                <p style="margin-top: 15px; font-weight: 700; color: var(--secondary);">— ${w.name}</p>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------
// 3. FORM & WISH SUBMISSION
// ----------------------------------------------------
function initPublicForms() {
    const msgArea = document.getElementById('guest-msg');
    const charCount = document.getElementById('char-count');
    if (msgArea) {
        msgArea.oninput = (e) => charCount.textContent = `${e.target.value.length} / 150`;
    }

    const wishForm = document.getElementById('public-wish-form');
    if (wishForm) {
        wishForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const name = document.getElementById('guest-name').value;
            const msg = document.getElementById('guest-msg').value;
            const photoFile = document.getElementById('guest-photo').files[0];

            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;

            try {
                let photo_url = null;

                // 1. Upload Photo to Supabase Storage if present
                if (photoFile && supabase) {
                    const fileName = `${Date.now()}-${photoFile.name}`;
                    const { data: uploadData, error: uploadErr } = await supabase.storage
                        .from('wedding-portfolio')
                        .upload(fileName, photoFile);
                    
                    if (!uploadErr) {
                        const { data: publicUrlData } = supabase.storage
                            .from('wedding-portfolio')
                            .getPublicUrl(fileName);
                        photo_url = publicUrlData.publicUrl;
                    }
                }

                // 2. Insert Wish into Database (Pending Approval)
                if (supabase) {
                    const { error } = await supabase.from('wishes').insert([
                        { name: name || "Guest", msg: msg, photo_url: photo_url, approved: false }
                    ]);
                    if (error) throw error;
                    
                    alert("Blessing sent for approval! Thank you.");
                    wishForm.reset();
                    charCount.textContent = "0 / 150";
                } else {
                    throw new Error("Supabase is not connected.");
                }
            } catch (err) {
                console.error(err);
                alert("Fail to send wish. Please ensure Supabase is configured.");
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Wish`;
            }
        };
    }
}

// ----------------------------------------------------
// 4. CALENDAR & UTILS
// ----------------------------------------------------
function initCalendarMain() {
    const calendarBtn = document.getElementById('add-to-calendar');
    if (!calendarBtn) return;
    calendarBtn.onclick = () => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Deepak & Reshmi Wedding')}&dates=20260423/20260427&details=Joining the celebration!&location=Chhatarpur,MP`, '_blank');
}

function addToCalendarSpecific(idx) {
    const ev = appData.events[idx];
    if (!ev) return;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title + ' - Deepak & Reshmi')}&dates=202604${ev.date}/202604${parseInt(ev.date)+1}&details=${encodeURIComponent(ev.note)}&location=${encodeURIComponent(ev.venue)}`;
    window.open(url, '_blank');
}

// Sliders
let isPlaying = false;
function startAutoSliders() {
    const scrollers = document.querySelectorAll('.carousel, .carousel-wishes');
    scrollers.forEach(el => {
        let sc = 0;
        setInterval(() => {
            sc += 1.5;
            if (sc >= el.scrollWidth - el.clientWidth) sc = 0;
            el.scrollTo({ left: sc, behavior: 'auto' });
        }, 50);
    });
}

function toggleMusic() {
    const bgMusic = document.getElementById('bg-music');
    const musicControl = document.getElementById('music-control');
    if (isPlaying) {
        bgMusic.pause(); document.getElementById('music-icon').className = 'fa-solid fa-play'; musicControl.classList.remove('pulse');
    } else {
        bgMusic.play().catch(() => {}); document.getElementById('music-icon').className = 'fa-solid fa-pause'; musicControl.classList.add('pulse');
    }
    isPlaying = !isPlaying;
}

function attemptAutoplay() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return; 
    bgMusic.play().then(() => {
        isPlaying = true; document.getElementById('music-icon').className = 'fa-solid fa-pause';
        document.getElementById('music-control').classList.add('pulse');
    }).catch(() => {});
}

document.addEventListener('DOMContentLoaded', initData);
window.toggleMusic = toggleMusic;
window.addToCalendarSpecific = addToCalendarSpecific;
