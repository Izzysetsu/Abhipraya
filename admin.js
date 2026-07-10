// admin.js
const SUPABASE_URL = "https://sbbgliehirnjkfmhhjgi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYmdsaWVoaXJuamtmbWhoamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDk4MDEsImV4cCI6MjA5NzY4NTgwMX0.L8jx55kyLPuJQuDuK4dMpgsMJV-TRKvZM3VZrva-DSQ";

// Inisialisasi Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    
    // --- HALAMAN DASHBOARD (admin.html) ---
    const tableContainer = document.getElementById('table-container');
    const invitationList = document.getElementById('invitation-list');
    const emptyState = document.getElementById('empty-state');
    const loader = document.getElementById('loader');

    if (tableContainer) {
        fetchInvitations();
    }

    async function fetchInvitations() {
        try {
            const { data, error } = await supabaseClient
                .from('invitations')
                .select('id, cover_groom_bride_name, theme_id, akad_date')
                .order('id', { ascending: false });

            if (error) throw error;

            loader.style.display = 'none';

            if (data.length === 0) {
                emptyState.style.display = 'block';
            } else {
                tableContainer.style.display = 'block';
                invitationList.innerHTML = '';
                
                data.forEach(inv => {
                    const row = document.createElement('tr');
                    
                    const inviteUrl = `${window.location.origin}/?id=${inv.id}`;
                    
                    row.innerHTML = `
                        <td><strong>#${inv.id.substring(0,6)}...</strong></td>
                        <td>${inv.cover_groom_bride_name}</td>
                        <td><span class="badge">${inv.theme_id}</span></td>
                        <td>${inv.akad_date}</td>
                        <td class="action-links">
                            <a href="${inviteUrl}" target="_blank" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Buka</a>
                            <button onclick="deleteInvitation('${inv.id}')" class="btn btn-danger">Hapus</button>
                        </td>
                    `;
                    invitationList.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error fetching invitations:', error);
            alert('Gagal mengambil data undangan dari server.');
            loader.style.display = 'none';
        }
    }

    window.deleteInvitation = async function(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) return;
        
        try {
            const { error } = await supabaseClient
                .from('invitations')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            alert('Undangan berhasil dihapus!');
            tableContainer.style.display = 'none';
            loader.style.display = 'block';
            fetchInvitations();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Gagal menghapus undangan.');
        }
    };

    // --- HALAMAN BUILDER (builder.html) ---
    const builderForm = document.getElementById('builder-form');
    
    if (builderForm) {
        builderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = builderForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<span class="loader" style="width: 20px; height: 20px; border-width: 2px; margin:0; display:inline-block;"></span> Mengunggah & Memproses...';
            submitBtn.disabled = true;

            try {
                const id = Date.now().toString();
                
                // Helper untuk upload file
                async function uploadFile(fileInput, prefix) {
                    const file = fileInput.files[0];
                    if (!file) return null;
                    const fileName = `${prefix}_${id}_${file.name}`;
                    const { data, error } = await supabaseClient.storage.from('invitation_assets').upload(fileName, file);
                    if (error) throw error;
                    const { data: publicData } = supabaseClient.storage.from('invitation_assets').getPublicUrl(fileName);
                    return publicData.publicUrl;
                }

                // Upload Groom & Bride
                const groomPhotoUrl = await uploadFile(document.getElementById('groom_photo_file'), 'groom') || 'assets/groom_avatar.png';
                const bridePhotoUrl = await uploadFile(document.getElementById('bride_photo_file'), 'bride') || 'assets/bride_avatar.png';
                
                // Upload Gallery
                const galleryFiles = document.getElementById('gallery_files').files;
                let galleryUrls = [];
                for(let i = 0; i < galleryFiles.length; i++) {
                    const file = galleryFiles[i];
                    const fileName = `gallery_${id}_${i}_${file.name}`;
                    const { data, error } = await supabaseClient.storage.from('invitation_assets').upload(fileName, file);
                    if (error) throw error;
                    const { data: publicData } = supabaseClient.storage.from('invitation_assets').getPublicUrl(fileName);
                    galleryUrls.push(publicData.publicUrl);
                }

                const groomName = document.getElementById('groom_name').value;
                const brideName = document.getElementById('bride_name').value;
                const akadDate = document.getElementById('akad_date').value;

                const newInvitation = {
                    id: id,
                    theme_id: document.getElementById('theme_id').value,
                    cover_title: 'The Wedding Of',
                    cover_groom_bride_name: `${groomName} & ${brideName}`,
                    cover_date_text: akadDate.split(',')[0] || akadDate,
                    cover_bg_image: 'assets/cover_bg.png', 
                    opening_quote: '"Cinta tidak berupa tatapan satu sama lain, tetapi memandang keluar bersama ke arah yang sama."',
                    groom_name: groomName,
                    groom_parent: document.getElementById('groom_parent').value,
                    groom_photo: groomPhotoUrl,
                    bride_name: brideName,
                    bride_parent: document.getElementById('bride_parent').value,
                    bride_photo: bridePhotoUrl,
                    akad_title: 'Akad Nikah',
                    akad_date: akadDate,
                    akad_time: document.getElementById('akad_time').value,
                    akad_location: document.getElementById('akad_location').value,
                    resepsi_title: 'Resepsi',
                    resepsi_date: document.getElementById('resepsi_date').value,
                    resepsi_time: document.getElementById('resepsi_time').value,
                    resepsi_location: document.getElementById('resepsi_location').value,
                    map_url: document.getElementById('map_url').value,
                    gallery_images: galleryUrls.join(',') // comma separated urls
                };

                const { error } = await supabaseClient
                    .from('invitations')
                    .insert([newInvitation]);

                if (error) throw error;

                alert('Undangan berhasil dibuat dengan galeri!');
                window.location.href = 'admin.html'; // Kembali ke dashboard
            } catch (error) {
                console.error('Error saving invitation:', error);
                alert('Terjadi kesalahan saat menyimpan data: ' + error.message);
                submitBtn.innerHTML = '✨ Upload & Generate Undangan';
                submitBtn.disabled = false;
            }
        });
    }
});
