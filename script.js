document.addEventListener('DOMContentLoaded', async () => {
    const appLoader = document.getElementById('app-loader');
    
    // 1. Detect URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id');

    if (!invitationId) {
        // Fallback jika tidak ada parameter ?id=
        document.body.innerHTML = `
            <div style="display:flex; height:100vh; justify-content:center; align-items:center; background-color:#F4F1EA; font-family:'Outfit', sans-serif; flex-direction:column; text-align:center;">
                <h2 style="color:#5C5248; margin-bottom: 10px;">Akses Ditolak</h2>
                <p style="color:#859677;">Tolong sertakan parameter ID di URL.<br>Contoh: <b>?id=123</b></p>
            </div>
        `;
        return;
    }

    try {
        // 2. Fetch Data dari Supabase (Pabrik JSON Fase 2)
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
        
        const responseData = await response.json();
        
        // Supabase mengembalikan array, jadi kita cek apakah datanya ada
        if (responseData.length === 0) {
            throw new Error("ID tidak ditemukan di database");
        }
        
        const data = responseData[0]; // Ambil row pertama
        
        // 3. Suntik Data ke DOM (Plugging into the holes)
        document.getElementById('nama-pasangan-cover').innerText = data.cover_groom_bride_name;
        document.querySelector('.pre-title').innerText = data.cover_title;
        document.querySelector('.cover-date').innerText = data.cover_date_text;
        document.getElementById('bg-visual').src = data.cover_bg_image;
        
        document.getElementById('teks-kutipan').innerText = data.opening_quote;
        
        document.getElementById('foto-pria').src = data.groom_photo;
        document.querySelector('#couple .profile:nth-child(1) h3').innerText = data.groom_name;
        document.querySelector('#couple .profile:nth-child(1) p').innerText = data.groom_parent;
        
        document.getElementById('foto-wanita').src = data.bride_photo;
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

        // 4. Sembunyikan Loader secara halus
        setTimeout(() => {
            appLoader.style.opacity = '0';
            setTimeout(() => {
                appLoader.style.display = 'none';
            }, 500);
        }, 500); // Sedikit delay buatan agar spinner terlihat elegan

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
            
            if(name && attendance && wish) {
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
