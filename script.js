document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ambil Parameter ID dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id');
    const demoTheme = urlParams.get('demo');

    // ROUTER SEDERHANA:
    if (!invitationId && !demoTheme) {
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('invitation-app').style.display = 'none';
        return;
    }

    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('invitation-app').style.display = 'block';

    const appLoader = document.getElementById('app-loader');
    let responseData = null;

    if (demoTheme) {
        const themeCoverImages = {
            'sage_earth': 'assets/bg_sage.png',
            'ocean_blue': 'assets/bg_ocean.png',
            'blush_rose': 'assets/bg_blush.png',
            'monochrome': 'assets/bg_mono.png'
        };

        // --- MODE DEMO DENGAN DATA LENGKAP & ESTETIK ---
        responseData = [{
            theme_id: demoTheme,
            cover_title: 'The Wedding Of',
            cover_groom_bride_name: 'Romeo & Juliet',
            cover_date_text: '24 . 10 . 2026',
            cover_bg_image: themeCoverImages[demoTheme] || 'assets/bg_sage.png',
            opening_quote: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."',
            groom_name: 'Romeo Montague',
            groom_parent: 'Putra dari Bapak X & Ibu Y',
            groom_photo: 'assets/groom_avatar.png',
            bride_name: 'Juliet Capulet',
            bride_parent: 'Putri dari Bapak A & Ibu B',
            bride_photo: 'assets/bride_avatar.png',
            akad_title: 'Akad Nikah',
            akad_date: 'Sabtu, 24 Oktober 2026',
            akad_time: '08:00 - 10:00 WIB',
            akad_location: 'Gedung Sudirman, Jakarta',
            resepsi_title: 'Resepsi Pernikahan',
            resepsi_date: 'Sabtu, 24 Oktober 2026',
            resepsi_time: '11:00 - 14:00 WIB',
            resepsi_location: 'Grand Ballroom Hotel Sudirman, Jakarta',
            map_url: 'https://maps.google.com',
            gallery_images: 'assets/groom_avatar.png,assets/bride_avatar.png,assets/bg_sage.png,assets/bg_ocean.png,assets/bg_blush.png,assets/bg_mono.png',
            love_story: JSON.stringify([
                { year: '2020', title: 'Awal Pertemuan', description: 'Pertama kali bertemu di perpustakaan kampus dan saling bertukar sapa.' },
                { year: '2023', title: 'Momen Lamaran', description: 'Romeo melamar Juliet di puncak bukit saat matahari terbenam.' },
                { year: '2026', title: 'Menuju Pernikahan', description: 'Memutuskan untuk mengikat janji suci dan mengarungi hidup bersama.' }
            ]),
            bank_accounts: JSON.stringify([
                { bank: 'Bank BCA', account_number: '8830192841', account_name: 'Romeo Montague' },
                { bank: 'Bank Mandiri', account_number: '13700098212', account_name: 'Juliet Capulet' }
            ]),
            wishes: [
                { name: 'Andi & Partner', attendance: 'Hadir', message: 'Selamat ya Romeo & Juliet! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.' },
                { name: 'Siti Nurhaliza', attendance: 'Hadir', message: 'Happy wedding! Lancar terus sampai hari H yaa 💖' },
                { name: 'Budi Santoso', attendance: 'Tidak Hadir', message: 'Selamat menempuh hidup baru sahabatku. Maaf belum bisa hadir langsung, doa terbaik untuk kalian!' }
            ]
        }];
    } else {
        try {
            const SUPABASE_URL = "https://sbbgliehirnjkfmhhjgi.supabase.co";
            const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYmdsaWVoaXJuamtmbWhoamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDk4MDEsImV4cCI6MjA5NzY4NTgwMX0.L8jx55kyLPuJQuDuK4dMpgsMJV-TRKvZM3VZrva-DSQ";

            const response = await fetch(`${SUPABASE_URL}/rest/v1/invitations?id=eq.${invitationId}&select=*`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Gagal mengambil data dari server");
            responseData = await response.json();

            if (responseData.length === 0) {
                throw new Error("ID tidak ditemukan di database");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            document.body.innerHTML = `
                <div style="display:flex; height:100vh; justify-content:center; align-items:center; background-color:#F4F1EA; font-family:'Outfit', sans-serif; flex-direction:column; text-align:center;">
                    <h2 style="color:#5C5248; margin-bottom: 10px;">Undangan Tidak Ditemukan</h2>
                    <p style="color:#859677;">ID: <b>${invitationId}</b> tidak terdaftar di sistem kami.</p>
                </div>
            `;
            return;
        }
    }

    try {
        const data = responseData[0];

        // --- SISTEM TEMA DINAMIS ---
        document.body.className = '';
        const themeId = data.theme_id || 'sage_earth';
        document.body.classList.add(`theme-${themeId}`);

        const themes = {
            'sage_earth': { primary: '#859677', primaryDark: '#6C7A60', bg: '#F4F1EA', bgSec: '#E9E4DA', accent: '#D8CDB9', text: '#38342E' },
            'ocean_blue': { primary: '#0284C7', primaryDark: '#0369A1', bg: '#F0F7FF', bgSec: '#E0F2FE', accent: '#BAE6FD', text: '#0F172A' },
            'blush_rose': { primary: '#F43F5E', primaryDark: '#E11D48', bg: '#FFF5F7', bgSec: '#FCE7F3', accent: '#FBCFE8', text: '#4C1D24' },
            'monochrome': { primary: '#000000', primaryDark: '#18181B', bg: '#FFFFFF', bgSec: '#F4F4F5', accent: '#D4D4D8', text: '#000000' }
        };
        const activeTheme = themes[themeId] || themes['sage_earth'];
        document.documentElement.style.setProperty('--color-primary', activeTheme.primary);
        document.documentElement.style.setProperty('--color-primary-dark', activeTheme.primaryDark);
        document.documentElement.style.setProperty('--color-bg-primary', activeTheme.bg);
        document.documentElement.style.setProperty('--color-bg-secondary', activeTheme.bgSec);
        document.documentElement.style.setProperty('--color-accent', activeTheme.accent);
        document.documentElement.style.setProperty('--color-text-main', activeTheme.text);

        // Ticker banner khusus tema Monochrome
        const ticker = document.getElementById('theme-ticker');
        if (ticker) {
            if (themeId === 'monochrome') {
                ticker.style.display = 'block';
                document.querySelectorAll('.couple-ticker').forEach(el => el.innerText = data.cover_groom_bride_name || 'ROMEO & JULIET');
            } else {
                ticker.style.display = 'none';
            }
        }

        // 3. Suntik Data ke DOM
        document.getElementById('nama-pasangan-cover').innerText = data.cover_groom_bride_name || 'Romeo & Juliet';
        document.querySelector('.pre-title').innerText = data.cover_title || 'The Wedding Of';
        document.querySelector('.cover-date').innerText = data.cover_date_text || '24 . 10 . 2026';
        document.getElementById('bg-visual').src = data.cover_bg_image || 'assets/bg_sage.png';

        document.getElementById('teks-kutipan').innerText = data.opening_quote || '';

        document.getElementById('foto-pria').src = data.groom_photo || 'assets/groom_avatar.png';
        document.querySelector('#couple .profile:nth-child(1) h3').innerText = data.groom_name || 'Romeo Montague';
        document.querySelector('#couple .profile:nth-child(1) .parent-text').innerText = data.groom_parent || '';

        document.getElementById('foto-wanita').src = data.bride_photo || 'assets/bride_avatar.png';
        document.querySelector('#couple .profile:nth-child(3) h3').innerText = data.bride_name || 'Juliet Capulet';
        document.querySelector('#couple .profile:nth-child(3) .parent-text').innerText = data.bride_parent || '';

        // Event Akad
        const akadCard = document.querySelectorAll('.event-card')[0];
        if (akadCard) {
            akadCard.querySelector('h3').innerText = data.akad_title || 'Akad Nikah';
            akadCard.querySelector('.event-date').innerText = data.akad_date || 'Sabtu, 24 Oktober 2026';
            akadCard.querySelector('.event-time').innerText = data.akad_time || '08:00 - 10:00 WIB';
            akadCard.querySelector('.event-location').innerHTML = (data.akad_location || '').replace(/\n/g, '<br>');
        }

        // Event Resepsi
        const resepsiCard = document.querySelectorAll('.event-card')[1];
        if (resepsiCard) {
            resepsiCard.querySelector('h3').innerText = data.resepsi_title || 'Resepsi Pernikahan';
            resepsiCard.querySelector('.event-date').innerText = data.resepsi_date || 'Sabtu, 24 Oktober 2026';
            resepsiCard.querySelector('.event-time').innerText = data.resepsi_time || '11:00 - 14:00 WIB';
            resepsiCard.querySelector('.event-location').innerHTML = (data.resepsi_location || '').replace(/\n/g, '<br>');
        }

        const btnMaps = document.getElementById('btn-maps');
        if (btnMaps && data.map_url) btnMaps.href = data.map_url;

        // --- RENDER GALERI PRE-WEDDING DENGAN LIGHTBOX ---
        if (data.gallery_images) {
            const gallerySection = document.getElementById('gallery');
            const galleryContainer = document.getElementById('gallery-container');
            const imageUrls = data.gallery_images.split(',');

            if (imageUrls.length > 0 && imageUrls[0].trim() !== '') {
                gallerySection.style.display = 'flex';
                galleryContainer.innerHTML = '';
                imageUrls.forEach(url => {
                    const cleanUrl = url.trim();
                    if (cleanUrl) {
                        const img = document.createElement('img');
                        img.src = cleanUrl;
                        img.className = 'gallery-item';
                        img.alt = 'Pre-wedding Photo';
                        img.onclick = () => openLightbox(cleanUrl);
                        galleryContainer.appendChild(img);
                    }
                });
            }
        }

        // --- RENDER LOVE STORY ---
        const storySection = document.getElementById('love-story');
        const storyContainer = document.getElementById('story-container');
        if (data.love_story) {
            try {
                const stories = typeof data.love_story === 'string' ? JSON.parse(data.love_story) : data.love_story;
                if (stories && stories.length > 0) {
                    storySection.style.display = 'flex';
                    storyContainer.innerHTML = '';
                    stories.forEach((st, idx) => {
                        const delay = (idx + 1) * 100;
                        storyContainer.innerHTML += `
                            <div class="story-item fade-up delay-${delay > 300 ? 300 : delay}">
                                <h3>${st.year ? st.year + ' - ' : ''}${st.title}</h3>
                                <p>${st.description || st.text || ''}</p>
                            </div>
                        `;
                    });
                }
            } catch(e) { console.error("Format Love Story salah", e); }
        }

        // --- RENDER BANK ACCOUNTS (AMPLOP DIGITAL) ---
        const giftSection = document.getElementById('wedding-gift');
        const bankContainer = document.getElementById('bank-container');
        if (data.bank_accounts) {
            try {
                const banks = typeof data.bank_accounts === 'string' ? JSON.parse(data.bank_accounts) : data.bank_accounts;
                if (banks && banks.length > 0) {
                    giftSection.style.display = 'flex';
                    bankContainer.innerHTML = '';
                    banks.forEach((b, idx) => {
                        const delay = (idx + 1) * 100;
                        const accNum = b.account_number || b.number || '';
                        const accName = b.account_name || b.name || '';
                        bankContainer.innerHTML += `
                            <div class="bank-card fade-up delay-${delay > 300 ? 300 : delay}">
                                <h3>${b.bank}</h3>
                                <p class="bank-acc-num">${accNum}</p>
                                <p class="bank-acc-name">A/N: ${accName}</p>
                                <button onclick="copyRekening('${accNum}')" class="btn btn-outline" style="width: 100%; display:flex; justify-content:center; align-items:center; gap: 8px;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    Salin Rekening
                                </button>
                            </div>
                        `;
                    });
                }
            } catch(e) { console.error("Format Bank salah", e); }
        }

        // --- RENDER WISHES / UCAPAN ---
        const wishesContainer = document.getElementById('wishes-container');
        if (data.wishes && data.wishes.length > 0) {
            wishesContainer.innerHTML = '';
            data.wishes.forEach(wish => {
                const isHadir = (wish.attendance || '').toLowerCase().includes('hadir') && !(wish.attendance || '').toLowerCase().includes('tidak');
                const badgeClass = isHadir ? 'hadir' : 'tidak-hadir';
                wishesContainer.innerHTML += `
                    <div class="wish-item fade-up">
                        <div class="wish-header">
                            <h4>${wish.name}</h4>
                            <span class="badge ${badgeClass}">${wish.attendance}</span>
                        </div>
                        <p>${wish.message}</p>
                    </div>
                `;
            });
        }

        // 4. Sembunyikan Loader
        if (urlParams.get('preview') === '1') {
            appLoader.style.display = 'none';
        } else {
            setTimeout(() => {
                appLoader.style.opacity = '0';
                setTimeout(() => {
                    appLoader.style.display = 'none';
                }, 500);
            }, 500);
        }

    } catch (error) {
        console.error("Error initialising invitation:", error);
    }

    // --- COUNTDOWN TIMER REAL TIME ---
    startCountdownTimer(new Date('2026-10-24T08:00:00'));

    // --- ANIMATE ON SCROLL (AOS) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section').forEach(sec => {
        if (!sec.classList.contains('fade-up')) sec.classList.add('fade-up');
    });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- BUKA UNDANGAN & MUSIC ---
    const btnOpen = document.getElementById('btn-open');
    const coverPage = document.getElementById('cover-page');
    const bgMusic = document.getElementById('bg-music');
    const fabMusic = document.getElementById('fab-music');

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            if (document.body.classList.contains('theme-blush_rose')) {
                coverPage.classList.add('unseal-envelope');
            }

            if (bgMusic && bgMusic.paused) {
                bgMusic.play().then(() => {
                    if (fabMusic) {
                        fabMusic.style.display = 'flex';
                        fabMusic.classList.add('spin');
                    }
                }).catch(e => console.log("Autoplay prevented:", e));
            }

            coverPage.style.transform = 'translateY(-100vh)';
            setTimeout(() => {
                coverPage.style.display = 'none';
                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 1000);
        });
    }

    // --- SUBMIT RSVP DYNAMICALLY ---
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('guest-name').value;
            const attendance = document.getElementById('guest-attendance').value;
            const wish = document.getElementById('guest-wish').value;

            if (name && attendance && wish) {
                const wishesContainer = document.getElementById('wishes-container');
                const isHadir = attendance === 'Hadir';
                const badgeClass = isHadir ? 'hadir' : 'tidak-hadir';

                const newWishHtml = `
                    <div class="wish-item fade-up visible" style="animation: slideUp 0.5s ease;">
                        <div class="wish-header">
                            <h4>${name}</h4>
                            <span class="badge ${badgeClass}">${attendance}</span>
                        </div>
                        <p>${wish}</p>
                    </div>
                `;
                wishesContainer.insertAdjacentHTML('afterbegin', newWishHtml);

                const btnSubmit = document.querySelector('.btn-submit');
                const originalText = btnSubmit.innerText;
                btnSubmit.innerText = '✨ Terima Kasih! Ucapan Terkirim';
                btnSubmit.style.backgroundColor = '#6C7A60';
                
                setTimeout(() => {
                    btnSubmit.innerText = originalText;
                    btnSubmit.style.backgroundColor = '';
                    rsvpForm.reset();
                }, 3000);
            }
        });
    }
});

// --- COUNTDOWN TIMER FUNCTION ---
function startCountdownTimer(targetDate) {
    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate.getTime() - now;

        if (difference <= 0) {
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// --- LIGHTBOX GALLERY FUNCTIONS ---
window.openLightbox = function(url) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = url;
        modal.style.display = 'flex';
    }
};

window.closeLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.style.display = 'none';
};

// --- SIMPAN KE KALENDER (ICS GENERATOR) ---
window.saveToCalendar = function(title, dateStr, location) {
    const startDate = new Date(dateStr);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));

    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

    const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Abhipraya Digital Invitation//ID',
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        `DESCRIPTION:Pernikahan ${title}`,
        `LOCATION:${location}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Global Function untuk Toggle Music
window.toggleMusic = function() {
    const bgMusic = document.getElementById('bg-music');
    const fabMusic = document.getElementById('fab-music');
    if (!bgMusic) return;

    if (bgMusic.paused) {
        bgMusic.play();
        fabMusic.classList.add('spin');
    } else {
        bgMusic.pause();
        fabMusic.classList.remove('spin');
    }
};

// Global Function untuk Copy Rekening
window.copyRekening = function(rek) {
    navigator.clipboard.writeText(rek).then(() => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = 'Nomor Rekening ' + rek + ' Berhasil Disalin!';
            toast.className = 'show';
            setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
        }
    });
};

// Global Function untuk Toggle Menu Switcher Tema
window.toggleThemeMenu = function() {
    const menu = document.getElementById('theme-menu');
    if (menu) menu.classList.toggle('active');
};

// Global Function untuk Ganti Warna Tema secara Instant (Harmonis & Match 100%)
window.switchColorPalette = function(paletteKey) {
    const palettes = {
        'sage': {
            primary: '#5C7052',
            primaryDark: '#42523A',
            bg: '#F4F1EA',
            bgSec: '#E8E3D7',
            accent: '#C5BCA8',
            text: '#2C3328',
            cardBg: '#FFFFFF',
            name: 'Hijau Sage 🌿'
        },
        'ocean': {
            primary: '#0284C7',
            primaryDark: '#0369A1',
            bg: '#F0F7FF',
            bgSec: '#E0F2FE',
            accent: '#BAE6FD',
            text: '#0F172A',
            cardBg: '#FFFFFF',
            name: 'Biru Laut 🌊'
        },
        'blush': {
            primary: '#E11D48',
            primaryDark: '#BE123C',
            bg: '#FFF5F7',
            bgSec: '#FCE7F3',
            accent: '#FBCFE8',
            text: '#4C0519',
            cardBg: '#FFFFFF',
            name: 'Merah Mawar 🌹'
        },
        'dark': {
            primary: '#D4AF37',
            primaryDark: '#B38F24',
            bg: '#121212',
            bgSec: '#1E1E22',
            accent: '#333338',
            text: '#F4F4F5',
            cardBg: '#1E1E22',
            name: 'Hitam Emas 🖤'
        }
    };

    const chosen = palettes[paletteKey] || palettes['sage'];
    document.documentElement.style.setProperty('--color-primary', chosen.primary);
    document.documentElement.style.setProperty('--color-primary-dark', chosen.primaryDark);
    document.documentElement.style.setProperty('--color-bg-primary', chosen.bg);
    document.documentElement.style.setProperty('--color-bg-secondary', chosen.bgSec);
    document.documentElement.style.setProperty('--color-accent', chosen.accent);
    document.documentElement.style.setProperty('--color-text-main', chosen.text);
    document.documentElement.style.setProperty('--color-card-bg', chosen.cardBg);

    // Hide theme menu popup
    const menu = document.getElementById('theme-menu');
    if (menu) menu.classList.remove('active');

    // Toast feedback
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = 'Kombinasi Warna Diubah: ' + chosen.name;
        toast.className = 'show';
        setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 2500);
    }
};




