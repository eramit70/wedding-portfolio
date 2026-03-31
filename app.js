// Deepak & Reshmi Wedding Portfolio: Shared Schema & App Logic

const WEDDING_DATA_KEY = 'deep_resh_wedding_v1';
const API_BASE = "http://localhost:3000/api";

const defaultData = {
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
        parents: "Mrs. Ramia - Mr. Gorelal Ahir",
        residence: "Chandpura, Alipura, District Chhatarpur (M.P.)"
    },
    events: [
        { id: 1, title: "Mandap", date: "23", month: "April", time: "10:00 AM onwards", venue: "Groom's Residence, Chhatarpur" },
        { id: 2, title: "Haldi/Mahandi", date: "24", month: "April", time: "11:00 AM onwards", venue: "Community Hall, Chhatarpur" },
        { id: 3, title: "Tilak", date: "25", month: "April", time: "07:00 PM onwards", venue: "Hotel Chhatarpur Inn" },
        { id: 4, title: "Vidai", date: "26", month: "April", time: "04:00 AM onwards", venue: "Bride's Residence, Alipura" }
    ],
    gallery: [
        { url: "images/gallery1.jpeg", caption: "Sweet Moments" },
        { url: "images/gallery2.jpeg", caption: "Our Journey" },
        { url: "images/gallery3.jpeg", caption: "Hand in Hand" },
        { url: "images/gallery4.jpeg", caption: "Love Always" },
        { url: "images/gallery5.jpeg", caption: "Memory Lane" },
        { url: "images/gallery6.jpeg", caption: "Together Forever" }
    ],
    wishes: [
        { id: 1, name: "Rahul Sharma", msg: "Wishing you both a lifetime of happiness!", photos: ["https://i.pravatar.cc/150?u=12"] }
    ]
};

let appData = {};

async function initData() {
    try {
        const response = await fetch(`${API_BASE}/loadData`);
        if (response.ok) { appData = await response.json(); } else { loadLocal(); }
    } catch (e) { loadLocal(); }
    try {
        const wishRes = await fetch(`${API_BASE}/wishes`);
        if (wishRes.ok) {
            const serverWishes = await wishRes.json();
            appData.wishes = [...serverWishes, ...appData.wishes.filter(w => !serverWishes.some(sw => sw.id === w.id))];
        }
    } catch (e) {}
    renderApp();
    startAutoSliders();
    attemptAutoplay();
}

function loadLocal() {
    const stored = localStorage.getItem(WEDDING_DATA_KEY);
    if (!stored) { appData = JSON.parse(JSON.stringify(defaultData)); } else { appData = JSON.parse(stored); }
}

function renderVideo(id, url) {
    const container = document.getElementById(id);
    if (!container || !url) return;
    
    // Clean URL for YouTube embeds (handle youtu.be, youtube.com, etc.)
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('watch?v=')) {
        const id = url.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    
    const isEmbed = embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com') || embedUrl.includes('embed');
    
    if (isEmbed) {
        // Add autoplay, mute, and loop parameters for better first impression
        const separator = embedUrl.includes('?') ? '&' : '?';
        const finalUrl = `${embedUrl}${separator}autoplay=1&mute=1&rel=0&showinfo=0&loop=1`;
        
        container.innerHTML = `
            <div class="video-frame" style="padding: 10px; background: linear-gradient(135deg, var(--secondary), #f9e394, var(--secondary)); border-radius: 22px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.4);">
                <div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 15px;">
                    <iframe 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                        src="${finalUrl}" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen title="Wedding Video">
                    </iframe>
                </div>
            </div>`;
    } else {
        container.innerHTML = `
            <video width="100%" height="auto" autoplay muted loop playsinline 
                style="border-radius:18px; box-shadow: 0 15px 45px rgba(0,0,0,0.2); background:#000;">
                <source src="${url}" type="video/mp4">
            </video>`;
    }
}

function renderApp() {
    if (!document.querySelector('.public-view')) return;
    document.getElementById('wedding-title').textContent = appData.wedding.title;
    document.getElementById('wedding-date-main').textContent = appData.wedding.date;
    renderVideo('video-container-1', appData.wedding.videoUrl1);

    const audio = document.getElementById('bg-music');
    if (audio) { document.getElementById('music-source').src = appData.wedding.musicUrl; audio.load(); }

    document.getElementById('groom-name').innerHTML = `${appData.groom.name} <small class="degree">(${appData.groom.degree})</small>`;
    document.getElementById('groom-photo').src = appData.groom.photo;
    document.getElementById('groom-parents').textContent = appData.groom.parents;
    document.getElementById('groom-res').textContent = appData.groom.residence;

    document.getElementById('bride-name').innerHTML = `${appData.bride.name} <small class="degree">(${appData.bride.degree})</small>`;
    document.getElementById('bride-photo').src = appData.bride.photo;
    document.getElementById('bride-parents').textContent = appData.bride.parents;
    document.getElementById('bride-res').textContent = appData.bride.residence;

    const eventList = document.getElementById('event-list');
    eventList.innerHTML = (appData.events || []).map((ev, idx) => `
        <div class="event-card" style="cursor: pointer;" onclick="addToCalendarSpecific(${idx})">
            <div class="event-date-badge"><span>${ev.date}</span>${ev.month}</div>
            <div class="event-details">
                <h3>${ev.title}</h3>
                <div class="event-meta">
                    <p><i class="fa-solid fa-clock"></i> ${ev.time}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${ev.venue}</p>
                </div>
            </div>
        </div>
    `).join('');

    const galleryCarousel = document.getElementById('gallery-carousel');
    galleryCarousel.innerHTML = (appData.gallery || []).map(img => `
        <div class="gallery-item">
            <img src="${img.url}" class="gallery-img">
            <div class="gallery-overlay"><div class="overlay-text">${img.caption}</div></div>
        </div>
    `).join('');

    renderWishes();
    initCalendarMain();
    initPublicForms();
}

function renderWishes() {
    const wishesCarousel = document.getElementById('wishes-carousel');
    if (!wishesCarousel) return;
    
    // Only display approved wishes in the slider
    const approvedWishes = (appData.wishes || []).filter(w => w.approved === true);
    
    if (approvedWishes.length === 0) {
        wishesCarousel.innerHTML = `<div style="text-align:center; width:100%; padding:20px; color:var(--primary); font-style:italic;">No blessings yet. Be the first to wish!</div>`;
        return;
    }

    wishesCarousel.innerHTML = approvedWishes.map(w => `
        <div class="wish-card glass-card">
            <div class="wish-profile">
                <img src="${w.photos[0].startsWith('/public') ? 'http://localhost:3000' + w.photos[0] : w.photos[0]}" class="wish-photo-circle">
            </div>
            <div class="wish-content">
                <p class="wish-msg">"${w.msg}"</p>
                <p class="wish-name">- ${w.name}</p>
            </div>
        </div>
    `).join('');
}

function startAutoSliders() {
    const sliders = [
        document.getElementById('gallery-carousel'),
        document.getElementById('wishes-carousel')
    ];
    sliders.forEach(slider => {
        if (!slider) return;
        setInterval(() => {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            if (slider.scrollLeft >= maxScroll - 50) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                const firstChild = slider.querySelector(':first-child');
                if (firstChild) {
                    const cardWidth = firstChild.offsetWidth + 20;
                    slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }
        }, 3000);
    });
}

function initPublicForms() {
    const wishForm = document.getElementById('public-wish-form');
    const msgArea = document.getElementById('guest-msg');
    const charCount = document.getElementById('char-count');

    if (msgArea && charCount) {
        msgArea.oninput = () => {
            charCount.textContent = `${msgArea.value.length} / 150`;
        };
    }

    if (wishForm) {
        wishForm.onsubmit = async (e) => {
            e.preventDefault();
            const nameEl = document.getElementById('guest-name');
            if (!nameEl || !msgArea) return;

            const formData = new FormData();
            formData.append('name', nameEl.value || "Guest");
            formData.append('msg', msgArea.value);
            
            const photoInput = document.getElementById('guest-photo');
            if (photoInput && photoInput.files[0]) {
                formData.append('photo', photoInput.files[0]);
            }

            try {
                const response = await fetch(`${API_BASE}/wishes`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    // Don't unshift to slider immediately as it needs approval
                    // But we can show a confirmation
                    wishForm.reset();
                    if (charCount) charCount.textContent = "0 / 150";
                    alert("Thank you! Your blessing has been sent to the couple for approval.");
                }
            } catch (err) {
                console.error("Submission error:", err);
                alert("Failed to send wish. Please try again.");
            }
        };
    }
}

// MAIN CALENDAR (Total Wedding)
function initCalendarMain() {
    const calendarBtn = document.getElementById('add-to-calendar');
    if (!calendarBtn) return;
    const dates = "20260423/20260427"; 
    calendarBtn.onclick = () => {
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Wedding of Deepak & Reshmi')}&dates=${dates}&details=${encodeURIComponent('Join us for the multi-day celebration of Deepak & Reshmi.')}&location=${encodeURIComponent('Chhatarpur, M.P.')}`;
        window.open(url, '_blank');
    };
}

// SPECIFIC CALENDAR (Individual Event)
function addToCalendarSpecific(idx) {
    const ev = appData.events[idx];
    if (!ev) return;
    const dates = `202604${ev.date}/202604${parseInt(ev.date)+1}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title + ' - Deepak & Reshmi Wedding')}&dates=${dates}&details=${encodeURIComponent(' Ceremony: ' + ev.title + ' | Time: ' + ev.time)}&location=${encodeURIComponent(ev.venue)}`;
    window.open(url, '_blank');
}

let isPlaying = false;
const musicControl = document.getElementById('music-control');
function toggleMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;
    if (isPlaying) {
        bgMusic.pause(); document.getElementById('music-icon').className = 'fa-solid fa-play'; musicControl.classList.remove('pulse');
    } else {
        bgMusic.play().catch(() => {}); document.getElementById('music-icon').className = 'fa-solid fa-pause'; musicControl.classList.add('pulse');
    }
    isPlaying = !isPlaying;
}

function attemptAutoplay() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return; // Exit if music element doesn't exist (e.g., admin page)
    
    bgMusic.play().then(() => {
        isPlaying = true; 
        const icon = document.getElementById('music-icon');
        if (icon) icon.className = 'fa-solid fa-pause'; 
        if (musicControl) musicControl.classList.add('pulse');
    }).catch(() => {
        const firstInteraction = () => {
            if (!bgMusic) return;
            bgMusic.play().then(() => {
                isPlaying = true; 
                const icon = document.getElementById('music-icon');
                if (icon) icon.className = 'fa-solid fa-pause'; 
                if (musicControl) musicControl.classList.add('pulse');
            });
            ['click', 'scroll', 'touchstart'].forEach(ev => window.removeEventListener(ev, firstInteraction));
        };
        ['click', 'scroll', 'touchstart'].forEach(ev => window.addEventListener(ev, firstInteraction));
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    initData();
    document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
    if (musicControl) musicControl.onclick = toggleMusic;
});
