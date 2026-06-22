const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. Mengambil Token dari Environment Variables (disetting di dashboard Vercel nanti)
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
// ALUR PERCAKAPAN AI AGENT
// ==========================================

bot.start(async (ctx) => {
    await saveSession(ctx.chat.id, 'IDLE', {});
    ctx.reply(
        'Halo! Saya adalah Bot AI Pembuat Undangan Web 🤖\n\n' +
        'Mari kita buat undangan Anda secara interaktif langkah demi langkah. Apakah Anda siap?',
        {
            reply_markup: {
                inline_keyboard: [[{ text: "🚀 Tentu, Mulai Sekarang!", callback_data: 'start_wizard' }]]
            }
        }
    );
});

bot.action('start_wizard', async (ctx) => {
    await ctx.answerCbQuery();
    await saveSession(ctx.chat.id, 'AWAITING_GROOM_NAME', {});
    ctx.reply('Baiklah! Mari kita mulai.\n\nPertama, siapa nama lengkap **Pengantin Pria**?\n*(Ketik dan kirim namanya di bawah, misal: Romeo Montague)*', { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    
    // Abaikan pesan jika tidak sedang dalam alur pembuatan
    if (session.step === 'IDLE') return;

    if (session.step === 'AWAITING_GROOM_NAME') {
        session.data.groom_name = ctx.message.text;
        await saveSession(chatId, 'AWAITING_BRIDE_NAME', session.data);
        ctx.reply('Siapa nama lengkap **Pengantin Wanita**?\n*(Misal: Juliet Capulet)*', { parse_mode: 'Markdown' });
    } 
    else if (session.step === 'AWAITING_BRIDE_NAME') {
        session.data.bride_name = ctx.message.text;
        await saveSession(chatId, 'AWAITING_DATE', session.data);
        ctx.reply('Kapan **Tanggal dan Jam** acara dilangsungkan?\n\n*(Misal: Sabtu, 24 Oktober 2026, Pukul 08:00 WIB)*', { parse_mode: 'Markdown' });
    }
    else if (session.step === 'AWAITING_DATE') {
        session.data.date = ctx.message.text;
        await saveSession(chatId, 'AWAITING_LOCATION', session.data);
        ctx.reply('Dimana **Lokasi** acaranya?\n\n*(Misal: Gedung Serbaguna, Jakarta)*', { parse_mode: 'Markdown' });
    }
    else if (session.step === 'AWAITING_LOCATION') {
        session.data.location = ctx.message.text;
        await saveSession(chatId, 'AWAITING_GROOM_PHOTO', session.data);
        ctx.reply('Sip! Sekarang, tolong unggah / kirimkan 1 **Foto Pengantin Pria** 📸', { parse_mode: 'Markdown' });
    }
    else if (['AWAITING_GROOM_PHOTO', 'AWAITING_BRIDE_PHOTO'].includes(session.step)) {
        ctx.reply('❌ Saya membutuhkan file gambar/foto, bukan teks. Tolong kirim ulang fotonya ya.');
    }
});

bot.on('photo', async (ctx) => {
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    
    if (session.step === 'AWAITING_GROOM_PHOTO') {
        ctx.reply('⏳ Mengunduh dan menyimpan foto pria ke Cloud...');
        // Ambil resolusi gambar tertinggi
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const fileName = `groom_${chatId}_${Date.now()}.jpg`;
        const photoUrl = await uploadPhotoToSupabase(ctx, fileId, fileName);
        
        if (!photoUrl) return ctx.reply('❌ Gagal menyimpan foto ke server. Tolong kirim ulang fotonya.');
        
        session.data.groom_photo = photoUrl;
        await saveSession(chatId, 'AWAITING_BRIDE_PHOTO', session.data);
        ctx.reply('Sukses! ✅\n\nTerakhir, tolong kirimkan 1 **Foto Pengantin Wanita** 📸', { parse_mode: 'Markdown' });
    }
    else if (session.step === 'AWAITING_BRIDE_PHOTO') {
        ctx.reply('⏳ Menyimpan foto wanita dan merakit Website Undangan...');
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const fileName = `bride_${chatId}_${Date.now()}.jpg`;
        const photoUrl = await uploadPhotoToSupabase(ctx, fileId, fileName);
        
        if (!photoUrl) return ctx.reply('❌ Gagal menyimpan foto ke server. Tolong kirim ulang fotonya.');
        
        session.data.bride_photo = photoUrl;
        
        // --- PROSES MERAKIT UNDANGAN (MENYIMPAN KE SUPABASE) ---
        const d = session.data;
        const id = Date.now().toString(); 
        
        const { error } = await supabase.from('invitations').insert([{
            id: id,
            theme_id: 'sage_earth',
            cover_title: 'The Wedding Of',
            cover_groom_bride_name: `${d.groom_name} & ${d.bride_name}`,
            cover_date_text: d.date.split(',')[0] || d.date, // Ambil kata pertama sebelum koma
            cover_bg_image: 'assets/cover_bg.png', // Background cover tetap dari template
            opening_quote: '"Cinta tidak berupa tatapan satu sama lain, tetapi memandang keluar bersama ke arah yang sama."',
            groom_name: d.groom_name,
            groom_parent: 'Putra dari Keluarga Pria',
            groom_photo: d.groom_photo,
            bride_name: d.bride_name,
            bride_parent: 'Putri dari Keluarga Wanita',
            bride_photo: d.bride_photo,
            akad_title: 'Akad Nikah',
            akad_date: d.date,
            akad_time: 'Lihat Undangan Lengkap',
            akad_location: d.location,
            resepsi_title: 'Resepsi',
            resepsi_date: d.date,
            resepsi_time: 'Lihat Undangan Lengkap',
            resepsi_location: d.location,
            map_url: 'https://maps.google.com'
        }]);

        if (error) {
            console.error('Database Error:', error);
            return ctx.reply('❌ Terjadi kesalahan saat menyimpan data akhir ke database.');
        }

        // Generate Vercel Domain
        const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL 
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
            : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://[DOMAIN-VERCEL-ANDA].vercel.app');
        
        const inviteUrl = `${domain}/?id=${id}`;

        // Hapus sesi agar kembali idle
        await saveSession(chatId, 'IDLE', {});

        ctx.reply(
            `🎉 *Sistem Selesai Bekerja!*\n\n` +
            `Web Undangan interaktif Anda sudah terbit dengan foto asli Anda di dalamnya:\n` +
            `🔗 ${inviteUrl}\n\n` +
            `Silakan di-klik! (Ketik /start lagi jika ingin membuat undangan baru).`,
            { parse_mode: 'Markdown' }
        );
    }
});

// ==========================================
// HANDLER WEBHOOK VERCEL SERVERLESS
// ==========================================
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
