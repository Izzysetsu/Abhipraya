document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ambil Parameter ID dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id');
    const demoTheme = urlParams.get('demo');

    // ROUTER SEDERHANA:
    // Jika tidak ada parameter ?id= atau ?demo=, tampilkan LANDING PAGE
    if (!invitationId && !demoTheme) {
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('invitation-app').style.display = 'none';
        return; // Berhenti di sini, tidak perlu memuat data undangan
    }

    // Jika ada parameter, maka jalankan INVITATION APP
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('invitation-app').style.display = 'block';

    const appLoader = document.getElementById('app-loader');

    let responseData = null;

    if (demoTheme) {
        // --- MODE DEMO ---
        responseData = [{
            theme_id: demoTheme,
            cover_title: 'The Wedding Of (DEMO)',
            cover_groom_bride_name: 'Romeo & Juliet',
            cover_date_text: '24 Oktober 2026',
            cover_bg_image: 'assets/cover_bg.png',
            opening_quote: '"Cinta tidak berupa tatapan satu sama lain, tetapi memandang keluar bersama ke arah yang sama."',
            groom_name: 'Romeo Montague',
            groom_parent: 'Putra dari Bapak X & Ibu Y',
            groom_photo: 'assets/groom_avatar.png',
            bride_name: 'Juliet Capulet',
            bride_parent: 'Putri dari Bapak A & Ibu B',
            bride_photo: 'assets/bride_avatar.png',
            akad_title: 'Akad Nikah',
            akad_date: 'Sabtu, 24 Oktober 2026',
            akad_time: '08:00 - 10:00 WIB',
            akad_location: 'Masjid Agung Kota',
            resepsi_title: 'Resepsi',
            resepsi_date: 'Sabtu, 24 Oktober 2026',
            resepsi_time: '11:00 - 14:00 WIB',
            resepsi_location: 'Grand Ballroom Hotel X',
            map_url: '#',
            gallery_images: 'assets/cover_bg.png,assets/groom_avatar.png,assets/bride_avatar.png',
            love_story: '[{"title": "Pertama Bertemu", "text": "Kami bertemu di kafe kecil sudut kota."}, {"title": "Lamaran", "text": "Dia melamar di bawah taburan bintang."}]',
            bank_accounts: '[{"bank": "BCA", "name": "Romeo", "number": "123456789"}]'
        }];
    } else if (!invitationId) {
        // Fallback jika tidak ada parameter ?id=
        document.body.innerHTML = `
            <div style="display:flex; height:100vh; justify-content:center; align-items:center; background-color:#F4F1EA; font-family:'Outfit', sans-serif; flex-direction:column; text-align:center;">
                <h2 style="color:#5C5248; margin-bottom: 10px;">Akses Ditolak</h2>
                <p style="color:#859677;">Tolong sertakan parameter ID di URL.<br>Contoh: <b>?id=123</b></p>
            </div>
        `;
        return;
    } else {
        // Fetch dari DB
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
        const data = responseData[0]; // Ambil row pertama

        // --- SISTEM TEMA DINAMIS ---
        document.body.classList.add(`theme-${data.theme_id}`);
        const themes = {
            'sage_earth': { primary: '#859677', primaryDark: '#6C7A60', bg: '#F4F1EA', bgSec: '#E9E4DA', accent: '#D8CDB9', text: '#5C5248' },
            'ocean_blue': { primary: '#608B9B', primaryDark: '#4A6F7D', bg: '#F0F4F8', bgSec: '#E1E8ED', accent: '#BCCCDC', text: '#3E5C69' },
            'blush_rose': { primary: '#D4A3A3', primaryDark: '#B88282', bg: '#FDF7F7', bgSec: '#F7EDED', accent: '#EAD1D1', text: '#7A5C5C' },
            'monochrome': { primary: '#555555', primaryDark: '#333333', bg: '#F9F9F9', bgSec: '#EEEEEE', accent: '#DDDDDD', text: '#444444' }
        };
        const activeTheme = themes[data.theme_id] || themes['sage_earth'];
        document.documentElement.style.setProperty('--color-primary', activeTheme.primary);
        document.documentElement.style.setProperty('--color-primary-dark', activeTheme.primaryDark);
        document.documentElement.style.setProperty('--color-bg-primary', activeTheme.bg);
        document.documentElement.style.setProperty('--color-bg-secondary', activeTheme.bgSec);
        document.documentElement.style.setProperty('--color-accent', activeTheme.accent);
        document.documentElement.style.setProperty('--color-text-light', activeTheme.text);

        // APLIKASIKAN CLASS TEMA KE BODY UNTUK VARIASI LAYOUT
        document.body.className = ''; // Reset
        document.body.classList.add(`theme-${data.theme_id || 'sage_earth'}`);

        // 3. Suntik Data ke DOM (Plugging into the holes)
        document.getElementById('nama-pasangan-cover').innerText = data.cover_groom_bride_name;
        document.querySelector('.pre-title').innerText = data.cover_title;
        document.querySelector('.cover-date').innerText = data.cover_date_text;
        document.getElementById('bg-visual').src = data.cover_bg_image;

        document.getElementById('teks-kutipan').innerText = data.opening_quote;

        document.getElementById('foto-pria').src = data.groom_photo || 'assets/groom_avatar.png';
        document.querySelector('#couple .profile:nth-child(1) h3').innerText = data.groom_name;
        document.querySelector('#couple .profile:nth-child(1) p').innerText = data.groom_parent;

        document.getElementById('foto-wanita').src = data.bride_photo || 'assets/bride_avatar.png';
        document.querySelector('#couple .profile:nth-child(3) h3').innerText = data.bride_name;
        document.querySelector('#couple .profile:nth-child(3) p').innerText = data.bride_parent;

        // Event Akad
        const akadCard = document.querySelectorAll('.event-card')[0];
        akadCard.querySelector('h3').innerText = data.akad_title;
        akadCard.querySelector('.event-date').innerText = data.akad_date;
        akadCard.querySelector('.event-time').innerText = data.akad_time;
        akadCard.querySelector('.event-location').innerHTML = (data.akad_location || '').replace(/\n/g, '<br>');

        // Event Resepsi
        const resepsiCard = document.querySelectorAll('.event-card')[1];
        resepsiCard.querySelector('h3').innerText = data.resepsi_title;
        resepsiCard.querySelector('.event-date').innerText = data.resepsi_date;
        resepsiCard.querySelector('.event-time').innerText = data.resepsi_time;
        resepsiCard.querySelector('.event-location').innerHTML = (data.resepsi_location || '').replace(/\n/g, '<br>');

        document.getElementById('btn-maps').href = data.map_url;

        // --- RENDER GALERI PRE-WEDDING ---
        if (data.gallery_images) {
            const gallerySection = document.getElementById('gallery');
            const galleryContainer = document.getElementById('gallery-container');
            const imageUrls = data.gallery_images.split(',');

            if (imageUrls.length > 0 && imageUrls[0].trim() !== '') {
                gallerySection.style.display = 'flex'; // Tampilkan section
                imageUrls.forEach(url => {
                    if (url.trim() !== '') {
                        const img = document.createElement('img');
                        img.src = url.trim();
                        img.className = 'gallery-item';
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
                const stories = JSON.parse(data.love_story);
                if (stories.length > 0) {
                    storySection.style.display = 'block';
                    storyContainer.innerHTML = '';
                    stories.forEach((st, idx) => {
                        const delay = (idx + 1) * 100;
                        storyContainer.innerHTML += `
                            <div class="story-item fade-up delay-${delay > 300 ? 300 : delay}">
                                <h3>${st.year || ''} - ${st.title}</h3>
                                <p>${st.description}</p>
                            </div>
                        `;
                    });
                }
            } catch(e) { console.error("Format Love Story salah"); }
        } else {
            storySection.style.display = 'none';
        }

        // --- RENDER BANK ACCOUNTS (AMPLOP DIGITAL) ---
        const giftSection = document.getElementById('wedding-gift');
        const bankContainer = document.getElementById('bank-container');
        if (data.bank_accounts) {
            try {
                const banks = JSON.parse(data.bank_accounts);
                if (banks.length > 0) {
                    giftSection.style.display = 'block';
                    bankContainer.innerHTML = '';
                    banks.forEach((b, idx) => {
                        const delay = (idx + 1) * 100;
                        bankContainer.innerHTML += `
                            <div class="bank-card fade-up delay-${delay > 300 ? 300 : delay}">
                                <h3>${b.bank}</h3>
                                <p style="font-size: 1.2rem; font-weight: 600; letter-spacing: 2px; margin: 10px 0;">${b.account_number}</p>
                                <p style="color: var(--color-text-light); margin-bottom: 15px;">A/N: ${b.account_name}</p>
                                <button onclick="copyRekening('${b.account_number}')" class="btn btn-outline" style="width: 100%; display:flex; justify-content:center; align-items:center; gap: 8px;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    Salin Rekening
                                </button>
                            </div>
                        `;
                    });
                }
            } catch(e) { console.error("Format Bank salah"); }
        } else {
            giftSection.style.display = 'none';
        }

        // --- RENDER WISHES ---
        const wishesContainer = document.getElementById('wishes-container');
        if (data.wishes && data.wishes.length > 0) {
            wishesContainer.innerHTML = '';
            data.wishes.forEach(wish => {
                const badgeClass = wish.attendance === 'Hadir' ? 'hadir' : 'tidak-hadir';
                wishesContainer.innerHTML += `
                    <div class="wish-item fade-up">
                        <h4>${wish.name}</h4>
                        <span class="badge ${badgeClass}">${wish.attendance}</span>
                        <p>${wish.message}</p>
                    </div>
                `;
            });
        }

        // 4. Sembunyikan Loader secara halus
        if (urlParams.get('preview') === '1') {
            appLoader.style.display = 'none';
            document.getElementById('cover-page').style.display = 'none';
        } else {
            setTimeout(() => {
                appLoader.style.opacity = '0';
                setTimeout(() => {
                    appLoader.style.display = 'none';
                }, 500);
            }, 500);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        document.body.innerHTML = `
            <div style="display:flex; height:100vh; justify-content:center; align-items:center; background-color:#F4F1EA; font-family:'Outfit', sans-serif; flex-direction:column; text-align:center;">
                <h2 style="color:#5C5248; margin-bottom: 10px;">Undangan Tidak Ditemukan</h2>
                <p style="color:#859677;">Terjadi kesalahan saat memuat data undangan.</p>
            </div>
        `;
        return;
    }

    // --- ANIMATE ON SCROLL (AOS) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    // Tambahkan class fade-up ke semua section secara dinamis jika belum ada
    document.querySelectorAll('.section').forEach(sec => {
        if (!sec.classList.contains('fade-up')) sec.classList.add('fade-up');
    });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- MUSIC PLAYER & BUKA UNDANGAN ---
    const btnOpen = document.getElementById('btn-open') || document.getElementById('btn-buka');
    const coverPage = document.getElementById('cover-page');
    const bgMusic = document.getElementById('bg-music');
    const fabMusic = document.getElementById('fab-music');
    let isMusicPlaying = false;

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            if (bgMusic && bgMusic.paused) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    if (fabMusic) {
                        fabMusic.style.display = 'flex';
                        fabMusic.classList.add('spin');
                    }
                }).catch(e => console.log("Autoplay prevented"));
            }

            coverPage.style.transform = 'translateY(-100vh)';
            setTimeout(() => {
                coverPage.style.display = 'none';
                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 1200);
        });
    }

    // --- RSVP SUBMISSION ---
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnSubmit = document.querySelector('.btn-submit');
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = 'Terkirim!';
            btnSubmit.style.backgroundColor = '#6C7A60';
            setTimeout(() => {
                btnSubmit.innerText = originalText;
                btnSubmit.style.backgroundColor = '';
                rsvpForm.reset();
            }, 3000);
        });
    }
});

// Global Function untuk Toggle Music dari HTML onClick
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

// Global Function untuk Copy Rekening dari HTML onClick
window.copyRekening = function(rek) {
    navigator.clipboard.writeText(rek).then(() => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = 'Rekening ' + rek + ' disalin!';
            toast.className = 'show';
            setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
        }
    });
};
