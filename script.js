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

        // 4. Sembunyikan Loader secara halus
        if (urlParams.get('preview') === '1') {
            appLoader.style.display = 'none';
            document.getElementById('cover-page').style.display = 'none';
            document.getElementById('main-content').style.visibility = 'visible';
            document.getElementById('main-content').style.opacity = '1';
        } else {
            setTimeout(() => {
                appLoader.style.opacity = '0';
                setTimeout(() => {
                    appLoader.style.display = 'none';
                }, 500);
            }, 500); // Sedikit delay buatan agar spinner terlihat elegan
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

    // ==========================================
    // KODE UI INTERAKSI LAMA
    // ==========================================
    const btnOpen = document.getElementById('btn-open');
    const coverPage = document.getElementById('cover-page');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');

    // Smooth scrolling & reveal invitation
    btnOpen.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(error => {
                console.log("Audio autoplay was prevented by browser.");
            });
        }

        coverPage.style.transform = 'translateY(-100vh)';

        setTimeout(() => {
            coverPage.style.display = 'none';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 1200);
    });

    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('guest-name').value;
            const attendance = document.getElementById('guest-attendance').value;
            const wish = document.getElementById('guest-wish').value;

            if (name && attendance && wish) {
                const btnSubmit = document.querySelector('.btn-submit');
                const originalText = btnSubmit.innerText;
                btnSubmit.innerText = 'Terkirim!';
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
