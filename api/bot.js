const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. Mengambil Token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; 

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// FUNGSI MEMORI BOT (STATE MACHINE)
// ==========================================
async function getSession(chatId) {
    const { data, error } = await supabase.from('bot_sessions').select('*').eq('chat_id', chatId).single();
    if (error || !data) {
        return { chat_id: chatId, step: 'IDLE', data: {} };
    }
    return data;
}

async function saveSession(chatId, step, sessionData) {
    await supabase.from('bot_sessions').upsert({ chat_id: chatId, step: step, data: sessionData });
}

// ==========================================
// FUNGSI UNGGAH FOTO KE SUPABASE STORAGE
// ==========================================
async function uploadPhotoToSupabase(ctx, fileId, fileName) {
    try {
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await fetch(fileLink.href);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const { data, error } = await supabase.storage
            .from('invitation_assets')
            .upload(fileName, buffer, {
                contentType: 'image/jpeg',
                upsert: true
            });
            
        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage
            .from('invitation_assets')
            .getPublicUrl(fileName);
            
        return publicUrlData.publicUrl;
    } catch (err) {
        console.error("Upload error:", err);
        return null;
    }
}

// ==========================================
// ALUR PERCAKAPAN AI AGENT (INPUT CEPAT)
// ==========================================

bot.start(async (ctx) => {
    await saveSession(ctx.chat.id, 'AWAITING_TEXT_DETAILS', {});
    
    const template = 
`Nama Pria: 
Nama Wanita: 
Tanggal Akad: 
Waktu Akad: 
Lokasi Akad: 
Tanggal Resepsi: 
Waktu Resepsi: 
Lokasi Resepsi: 
Link Maps: `;

    await ctx.reply(
        'Halo! 🤖\n\n' +
        'Untuk mempercepat pembuatan undangan, silakan **Salin (Copy) teks di bawah ini**, isi dengan data klien Anda sesudah tanda titik dua (:), lalu kirimkan kembali ke saya:\n\n' +
        '👇 *Tahan/Klik teks di bawah untuk meng-copy:*', 
        { parse_mode: 'Markdown' }
    );
    await ctx.reply(`<pre>${template}</pre>`, { parse_mode: 'HTML' });
});

bot.help((ctx) => {
    const helpMessage = 
`🤖 *Daftar Perintah (Commands) Bot Undangan* 🤖

/start - Membuat web undangan baru
/list - Melihat daftar undangan yang aktif & menghapusnya (Interaktif)
/hapus <ID> - Menghapus undangan secara manual menggunakan ID
/help - Menampilkan pesan panduan ini

_Pilih salah satu perintah di atas untuk mulai berinteraksi dengan bot._`;

    ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});

bot.command('hapus', async (ctx) => {
    const id = ctx.message.text.replace('/hapus', '').trim();
    if (!id) return await ctx.reply('Mohon sertakan ID. Contoh: /hapus 123456');

    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) return await ctx.reply(`❌ Gagal menghapus undangan: ${error.message}`);
    
    await ctx.reply(`✅ Undangan dengan ID ${id} berhasil dihapus dari database.`);
});

bot.command('list', async (ctx) => {
    await ctx.reply('⏳ Sedang mengambil daftar undangan aktif...');
    
    const { data, error } = await supabase.from('invitations').select('id, cover_groom_bride_name, theme_id');
    
    if (error) {
        return await ctx.reply(`❌ Gagal mengambil data: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
        return await ctx.reply('📭 Saat ini tidak ada undangan yang aktif.');
    }
    
    const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL 
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://[DOMAIN-VERCEL-ANDA].vercel.app');
    
    // Create messages with inline buttons for each invitation
    for (const inv of data) {
        const inviteUrl = `${domain}/?id=${inv.id}`;
        await ctx.reply(
            `💑 *${inv.cover_groom_bride_name}*\n` +
            `🔗 Link: ${inviteUrl}\n` +
            `🎨 Tema: ${inv.theme_id}\n` +
            `🆔 ID: ${inv.id}`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🌐 Buka Web', url: inviteUrl },
                            { text: '🗑️ Hapus', callback_data: `hapus_${inv.id}` }
                        ]
                    ]
                }
            }
        );
    }
});

bot.action(/hapus_(.+)/, async (ctx) => {
    const id = ctx.match[1];
    
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    
    if (error) {
        return await ctx.answerCbQuery(`❌ Gagal menghapus: ${error.message}`, { show_alert: true });
    }
    
    await ctx.answerCbQuery('✅ Undangan berhasil dihapus!', { show_alert: true });
    await ctx.editMessageText(`✅ Undangan dari ID ${id} telah dihapus.`);
});

bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    // Abaikan jika command
    if (text.startsWith('/')) return;

    const session = await getSession(chatId);
    
    if (session.step === 'AWAITING_TEXT_DETAILS') {
        try {
            const lines = text.split('\n');
            const extract = (key) => {
                const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
                // Pisahkan string berdasarkan ':' yang pertama
                if (line) {
                    const separatorIndex = line.indexOf(':');
                    if (separatorIndex !== -1) {
                        return line.substring(separatorIndex + 1).trim() || '-';
                    }
                }
                return '-';
            };

            const data = {
                groom_name: extract('Nama Pria'),
                bride_name: extract('Nama Wanita'),
                akad_date: extract('Tanggal Akad'),
                akad_time: extract('Waktu Akad'),
                akad_location: extract('Lokasi Akad'),
                resepsi_date: extract('Tanggal Resepsi'),
                resepsi_time: extract('Waktu Resepsi'),
                resepsi_location: extract('Lokasi Resepsi'),
                map_url: extract('Link Maps')
            };

            // Validasi sederhana
            if (data.groom_name === '-' || data.bride_name === '-') {
                return await ctx.reply('❌ Format tidak dikenali. Pastikan Anda menyalin template dengan benar beserta tanda titik duanya (:)');
            }

            await saveSession(chatId, 'AWAITING_GROOM_PHOTO', data);
            await ctx.reply(
                `Data Teks Tersimpan! ✅\n\n` +
                `Sekarang, tolong unggah 1 **Foto Pengantin Pria** 📸\n` +
                `*(Kirim sebagai Foto, bukan Dokumen/File)*`, 
                { parse_mode: 'Markdown' }
            );
        } catch (e) {
            await ctx.reply('❌ Terjadi kesalahan saat membaca data. Pastikan formatnya sama seperti template.');
        }
    }
    else if (['AWAITING_GROOM_PHOTO', 'AWAITING_BRIDE_PHOTO'].includes(session.step)) {
        await ctx.reply('❌ Saya membutuhkan file Foto. Tolong kirim foto, bukan teks.');
    }
});

bot.on(['photo', 'document'], async (ctx) => {
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    
    const fileId = ctx.message.photo 
        ? ctx.message.photo[ctx.message.photo.length - 1].file_id 
        : ctx.message.document?.file_id;

    if (!fileId) return;

    if (session.step === 'AWAITING_GROOM_PHOTO') {
        await ctx.reply('⏳ Mengunduh dan menyimpan foto pria ke Cloud...');
        const fileName = `groom_${chatId}_${Date.now()}.jpg`;
        const photoUrl = await uploadPhotoToSupabase(ctx, fileId, fileName);
        
        if (!photoUrl) return await ctx.reply('❌ Gagal menyimpan foto ke server. Tolong kirim ulang fotonya.');
        
        session.data.groom_photo = photoUrl;
        await saveSession(chatId, 'AWAITING_BRIDE_PHOTO', session.data);
        await ctx.reply('Sukses! ✅\n\nTerakhir, tolong kirimkan 1 **Foto Pengantin Wanita** 📸', { parse_mode: 'Markdown' });
    }
    else if (session.step === 'AWAITING_BRIDE_PHOTO') {
        await ctx.reply('⏳ Menyimpan foto wanita dan merakit Website Undangan...');
        const fileName = `bride_${chatId}_${Date.now()}.jpg`;
        const photoUrl = await uploadPhotoToSupabase(ctx, fileId, fileName);
        
        if (!photoUrl) return await ctx.reply('❌ Gagal menyimpan foto ke server. Tolong kirim ulang fotonya.');
        
        session.data.bride_photo = photoUrl;
        
        // --- PROSES MERAKIT UNDANGAN (MENYIMPAN KE SUPABASE) ---
        const d = session.data;
        const id = Date.now().toString(); 
        
        // Tema Acak Gacha
        const themes = ['sage_earth', 'ocean_blue', 'blush_rose', 'monochrome'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        const { error } = await supabase.from('invitations').insert([{
            id: id,
            theme_id: randomTheme,
            cover_title: 'The Wedding Of',
            cover_groom_bride_name: `${d.groom_name} & ${d.bride_name}`,
            cover_date_text: d.akad_date.split(',')[0] || d.akad_date,
            cover_bg_image: 'assets/cover_bg.png', 
            opening_quote: '"Cinta tidak berupa tatapan satu sama lain, tetapi memandang keluar bersama ke arah yang sama."',
            groom_name: d.groom_name,
            groom_parent: 'Putra dari Keluarga Pria',
            groom_photo: d.groom_photo,
            bride_name: d.bride_name,
            bride_parent: 'Putri dari Keluarga Wanita',
            bride_photo: d.bride_photo,
            akad_title: 'Akad Nikah',
            akad_date: d.akad_date,
            akad_time: d.akad_time,
            akad_location: d.akad_location,
            resepsi_title: 'Resepsi',
            resepsi_date: d.resepsi_date,
            resepsi_time: d.resepsi_time,
            resepsi_location: d.resepsi_location,
            map_url: d.map_url !== '-' ? d.map_url : 'https://maps.google.com'
        }]);

        if (error) {
            console.error('Database Error:', error);
            return await ctx.reply(`❌ Terjadi kesalahan saat menyimpan data akhir ke database: ${error.message}`);
        }

        const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL 
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
            : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://[DOMAIN-VERCEL-ANDA].vercel.app');
        
        const inviteUrl = `${domain}/?id=${id}`;

        await saveSession(chatId, 'IDLE', {});

        await ctx.reply(
            `🎉 *Sistem Selesai Bekerja!*\n\n` +
            `Web Undangan interaktif Anda sudah terbit secara dinamis:\n` +
            `🔗 ${inviteUrl}\n\n` +
            `🎨 *Tema Warna:* ${randomTheme}\n\n` +
            `Ketik /start lagi jika ingin membuat undangan baru, atau /hapus ${id} untuk menghapusnya.`,
            { parse_mode: 'Markdown' }
        );
    }
});

module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('Bot Webhook AI Agent is running!');
        }
    } catch (e) {
        console.error('Webhook Error:', e);
        res.status(500).send('Something went wrong!');
    }
};
