// ==========================================================
// 💖 OUR LOVE JOURNEY - INTERACTIVE ENGINE
// ==========================================================

// Clean up any old default placeholder memories from previous runs
(function cleanOldCache() {
    try {
        const cached = localStorage.getItem('photoAlbumMemories');
        if (cached && (cached.includes('images.unsplash.com') || cached.includes('Sunset Beach Walk'))) {
            localStorage.removeItem('photoAlbumMemories');
        }
    } catch (e) {
        // Storage disabled or unavailable
    }
})();

// Load Memories (Prioritizes memories.js, falls back to clean user additions)
function getInitialMemories() {
    // 1. Check if user configured memories.js
    if (typeof albumMemories !== 'undefined' && Array.isArray(albumMemories) && albumMemories.length > 0) {
        return albumMemories;
    }
    // 2. Check localStorage for user-added memories
    try {
        const local = localStorage.getItem('photoAlbumMemories');
        if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}

    // 3. Clean slate (zero memories by default)
    return [];
}

let memories = getInitialMemories();
let currentPage = 0;
let isFlipping = false; // Prevents animation jamming on rapid clicks

// DOM Elements
const book = document.getElementById('album-book');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-indicator');

// Modals
const addMemoryBtn = document.getElementById('add-memory-btn');
const memoryModal = document.getElementById('memory-modal');
const closeForm = document.getElementById('close-form');
const memoryForm = document.getElementById('memory-form');

const manageDataBtn = document.getElementById('manage-data-btn');
const exportModal = document.getElementById('export-modal');
const closeExport = document.getElementById('close-export');
const exportCodeBox = document.getElementById('export-code-box');
const copyExportBtn = document.getElementById('copy-export-btn');
const clearLocalBtn = document.getElementById('clear-local-btn');

const lightboxModal = document.getElementById('lightbox-modal');
const closeLightbox = document.getElementById('close-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDate = document.getElementById('lightbox-date');
const lightboxText = document.getElementById('lightbox-text');

// Music Elements
const musicToggleBtn = document.getElementById('music-toggle-btn');
const vinylDisc = document.getElementById('vinyl-disc');
const musicStatus = document.getElementById('music-status');
const bgAudio = document.getElementById('bg-audio');
const musicFileInput = document.getElementById('music-file-input');

// ==========================================================
// 🔊 AUDIO ENGINE (Zero-delay Shared AudioContext)
// ==========================================================
let sharedAudioCtx = null;

function getAudioContext() {
    if (!sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            sharedAudioCtx = new AudioCtx();
        }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
}

// Instant, gentle paper rustle sound when turning pages
function playFlipSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'pink' in ctx ? 'pink' : 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    } catch (e) {
        // Audio unsupported or restricted
    }
}

// Built-in Romantic Synthesizer Lullaby (Fallback if no audio/music.mp3 is loaded)
let synthMusicInterval = null;
let isSynthPlaying = false;

function playRomanticSynth() {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Sweet romantic melody notes (frequencies in Hz)
    const melody = [
        261.63, 329.63, 392.00, 523.25, // C E G C
        293.66, 349.23, 440.00, 587.33, // D F A D
        329.63, 392.00, 493.88, 659.25, // E G B E
        349.23, 440.00, 523.25, 698.46  // F A C F
    ];
    let noteIdx = 0;

    isSynthPlaying = true;
    vinylDisc.classList.add('playing');
    musicStatus.textContent = 'Melody ♪';

    synthMusicInterval = setInterval(() => {
        if (!isSynthPlaying) return;
        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(melody[noteIdx % melody.length], now);

            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.65);

            noteIdx++;
        } catch (err) {}
    }, 450);
}

function stopRomanticSynth() {
    isSynthPlaying = false;
    if (synthMusicInterval) {
        clearInterval(synthMusicInterval);
        synthMusicInterval = null;
    }
    vinylDisc.classList.remove('playing');
    musicStatus.textContent = 'Paused';
}

// Background Music Toggle Handler
musicToggleBtn.addEventListener('click', () => {
    getAudioContext();

    if (bgAudio.paused && !isSynthPlaying) {
        // Attempt to play audio/music.mp3
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                vinylDisc.classList.add('playing');
                musicStatus.textContent = 'Playing ♪';
            }).catch(() => {
                // If music.mp3 is missing, play romantic synth chime
                playRomanticSynth();
            });
        }
    } else {
        if (!bgAudio.paused) {
            bgAudio.pause();
            vinylDisc.classList.remove('playing');
            musicStatus.textContent = 'Paused';
        }
        if (isSynthPlaying) {
            stopRomanticSynth();
        }
    }
});

// ==========================================================
// 📖 RENDER 3D BOOK & SMOOTH Z-INDEX LAYERING
// ==========================================================
function renderBook() {
    book.innerHTML = '';
    currentPage = 0;

    // --- 1. COVER PAGE (Front Cover + Dedication inside) ---
    const coverPage = document.createElement('div');
    coverPage.className = 'page';
    coverPage.innerHTML = `
        <div class="page-face cover-page">
            <div class="cover-inner-border">
                <div class="cover-heart-icon">♥</div>
                <h2 class="cover-title">Our Story</h2>
                <p class="cover-subtitle">A Love Journey</p>
                <p class="cover-hint">Click or press Next to open &rarr;</p>
            </div>
        </div>
        <div class="page-face page-back inside-cover-page">
            <div class="dedication-box">
                <h3 class="dedication-title">For My Love</h3>
                <p class="dedication-text">
                    "Every moment with you is a sweet memory I want to keep forever in my heart."
                </p>
                <span class="dedication-signature">Forever & Always ♥</span>
            </div>
        </div>
    `;
    book.appendChild(coverPage);

    // --- 2. MEMORY PAGES OR EMPTY WELCOME STATE ---
    if (memories.length === 0) {
        // Empty State: Beautiful prompt to add their first memory
        const emptyPage = document.createElement('div');
        emptyPage.className = 'page';
        emptyPage.innerHTML = `
            <div class="page-face">
                <div class="empty-state-box">
                    <div class="empty-state-heart">📷</div>
                    <h3 class="empty-state-title">Ready for Our Photos</h3>
                    <p class="empty-state-p">
                        Walang nakalagay na picture sa ngayon. I-click ang <strong>+ Add New Memory</strong> sa itaas o ilagay ang inyong pictures sa <code>images/</code> folder!
                    </p>
                    <button class="btn-primary" onclick="openAddMemoryModal()">+ Add First Memory</button>
                </div>
            </div>
            <div class="page-face page-back">
                <div class="dedication-box">
                    <h3 class="dedication-title">A Blank Canvas</h3>
                    <p class="dedication-text">Our love story is waiting to be written...</p>
                </div>
            </div>
        `;
        book.appendChild(emptyPage);
    } else {
        // Render each memory in polaroid aesthetic
        memories.forEach((mem, index) => {
            const page = document.createElement('div');
            page.className = 'page';

            page.innerHTML = `
                <div class="page-face">
                    <div class="polaroid" onclick="openLightbox(${index})">
                        <div class="polaroid-img-wrap">
                            <img src="${mem.image}" alt="${escapeHtml(mem.title)}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x300/2b2520/f4a261?text=Photo+Here';">
                        </div>
                        <div class="polaroid-caption">${escapeHtml(mem.title)}</div>
                        <div class="memory-date">${escapeHtml(mem.date)}</div>
                    </div>
                    <p class="memory-desc">"${escapeHtml(mem.caption)}"</p>
                    <span class="page-stamp">♥ #${index + 1}</span>
                </div>
                <div class="page-face page-back">
                    <div class="dedication-box">
                        <h3 class="dedication-title">Chapter ${index + 1}</h3>
                        <p class="dedication-text">"${escapeHtml(mem.caption)}"</p>
                        <span class="dedication-signature">${escapeHtml(mem.date)}</span>
                    </div>
                </div>
            `;
            book.appendChild(page);
        });

        // Closing back cover
        const backCover = document.createElement('div');
        backCover.className = 'page';
        backCover.innerHTML = `
            <div class="page-face">
                <div class="dedication-box">
                    <h3 class="dedication-title">To Be Continued...</h3>
                    <p class="dedication-text">
                        "I LOVE YOU, ALWAYS."
                    </p>
                    <span class="dedication-signature"> ♥</span>
                </div>
            </div>
            <div class="page-face page-back cover-page">
                <div class="cover-inner-border">
                    <h2 class="cover-title">Our Story</h2>
                    <p class="cover-subtitle">Forever Yours</p>
                </div>
            </div>
        `;
        book.appendChild(backCover);
    }

    updateNavigation(false);
}

// Update Page Stacking (Z-Index) and 3D Rotation
function updateNavigation(animate = true) {
    const pages = document.querySelectorAll('.page');
    const totalPages = pages.length;

    pages.forEach((page, index) => {
        if (index < currentPage) {
            // Already turned to left stack
            page.style.transform = 'rotateY(-180deg)';
            page.style.zIndex = index + 1; // Earlier pages sit lower on left
        } else {
            // Unflipped on right stack
            page.style.transform = 'rotateY(0deg)';
            page.style.zIndex = (totalPages - index) * 2; // Top page sits highest
        }
    });

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages;

    pageIndicator.textContent = `Page ${currentPage + 1} of ${totalPages + 1}`;
}

// Page Turn Forward
function goToNextPage() {
    const pages = document.querySelectorAll('.page');
    if (currentPage < pages.length && !isFlipping) {
        isFlipping = true;
        const turningPage = pages[currentPage];
        
        // Elevate z-index during flip so it glides smoothly on top
        turningPage.style.zIndex = 100;
        currentPage++;
        playFlipSound();
        updateNavigation();

        setTimeout(() => {
            isFlipping = false;
        }, 320);
    }
}

// Page Turn Backward
function goToPrevPage() {
    const pages = document.querySelectorAll('.page');
    if (currentPage > 0 && !isFlipping) {
        isFlipping = true;
        currentPage--;
        const turningPage = pages[currentPage];

        turningPage.style.zIndex = 100;
        playFlipSound();
        updateNavigation();

        setTimeout(() => {
            isFlipping = false;
        }, 320);
    }
}

// Navigation Event Listeners
nextBtn.addEventListener('click', goToNextPage);
prevBtn.addEventListener('click', goToPrevPage);

// Keyboard Arrows Navigation (Left / Right)
window.addEventListener('keydown', (e) => {
    // Ignore if user is currently typing in an input or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        goToNextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
    }
});

// Mobile Touch Swipe Gesture
let touchStartX = 0;
let touchEndX = 0;

book.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

book.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance < -45) {
        // Swiped Left -> Go Next
        goToNextPage();
    } else if (swipeDistance > 45) {
        // Swiped Right -> Go Prev
        goToPrevPage();
    }
}

// Click on Book edges to flip
book.addEventListener('click', (e) => {
    // Only flip if not clicking a polaroid image or button
    if (e.target.closest('.polaroid') || e.target.closest('button')) return;

    const rect = book.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width * 0.55) {
        goToNextPage();
    } else if (clickX < rect.width * 0.45) {
        goToPrevPage();
    }
});

// ==========================================================
// 🔍 LIGHTBOX MODAL
// ==========================================================
window.openLightbox = function(index) {
    if (!memories[index]) return;
    const mem = memories[index];
    lightboxImg.src = mem.image;
    lightboxTitle.textContent = mem.title;
    lightboxDate.textContent = mem.date;
    lightboxText.textContent = mem.caption;
    lightboxModal.style.display = 'flex';
};

closeLightbox.addEventListener('click', () => {
    lightboxModal.style.display = 'none';
});

// ==========================================================
// ➕ ADD MEMORY MODAL & FORM HANDLING
// ==========================================================
window.openAddMemoryModal = function() {
    memoryModal.style.display = 'flex';
};

addMemoryBtn.addEventListener('click', openAddMemoryModal);

closeForm.addEventListener('click', () => {
    memoryModal.style.display = 'none';
});

memoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('memory-title').value.trim();
    const date = document.getElementById('memory-date').value;
    let imageInput = document.getElementById('memory-image').value.trim();
    const fileInput = document.getElementById('memory-file');
    const caption = document.getElementById('memory-caption').value.trim();

    const saveAndRefresh = (imgSource) => {
        memories.push({ title, date, image: imgSource, caption });
        try {
            localStorage.setItem('photoAlbumMemories', JSON.stringify(memories));
        } catch (err) {
            console.warn('Storage limit reached for base64 images.');
        }
        memoryForm.reset();
        memoryModal.style.display = 'none';
        renderBook();
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            saveAndRefresh(event.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else if (imageInput) {
        saveAndRefresh(imageInput);
    } else {
        alert("Pumili ng picture file o maglagay ng image path tulad ng images/photo1.jpg!");
    }
});

// ==========================================================
// 📋 EXPORT & SYNC FOR GITHUB / VERCEL
// ==========================================================
manageDataBtn.addEventListener('click', () => {
    exportCodeBox.value = generateExportCode();
    exportModal.style.display = 'flex';
});

closeExport.addEventListener('click', () => {
    exportModal.style.display = 'none';
});

function generateExportCode() {
    return `// Kopyahin ito at i-paste sa loob ng js/memories.js:\nconst albumMemories = ${JSON.stringify(memories, null, 4)};`;
}

copyExportBtn.addEventListener('click', () => {
    exportCodeBox.select();
    navigator.clipboard.writeText(exportCodeBox.value).then(() => {
        copyExportBtn.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => {
            copyExportBtn.textContent = '📋 Copy Code';
        }, 2000);
    });
});

clearLocalBtn.addEventListener('click', () => {
    if (confirm("Gusto mo bang i-reset pabalik sa zero ang lahat ng locally added pictures?")) {
        localStorage.removeItem('photoAlbumMemories');
        memories = (typeof albumMemories !== 'undefined') ? albumMemories : [];
        renderBook();
        exportModal.style.display = 'none';
    }
});

// Close modals when clicking outside card
window.addEventListener('click', (e) => {
    if (e.target === memoryModal) memoryModal.style.display = 'none';
    if (e.target === lightboxModal) lightboxModal.style.display = 'none';
    if (e.target === exportModal) exportModal.style.display = 'none';
});

// ==========================================================
// ✨ FLOATING AMBIENT PARTICLES
// ==========================================================
function initFloatingParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const hearts = ['♥', '♡', '✦', '✧', '♥'];
    const particleCount = 18;

    for (let i = 0; i < particleCount; i++) {
        const span = document.createElement('span');
        span.className = 'floating-heart';
        span.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        span.style.left = `${Math.random() * 100}%`;
        span.style.animationDuration = `${8 + Math.random() * 12}s`;
        span.style.animationDelay = `${Math.random() * 8}s`;
        span.style.fontSize = `${10 + Math.random() * 14}px`;
        container.appendChild(span);
    }
}

// Utility: HTML escape for safety
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Initialize on page load
initFloatingParticles();
renderBook();
