const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. Mengambil Token dari Environment Variables (disetting di dashboard Vercel nanti)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Logika Utama Bot: Command /start
bot.start((ctx) => {
    ctx.reply(
        'Halo! Saya adalah Bot Otomasi Undangan Web 🤖\n\n' +
        'Untuk membuat web undangan baru, cukup kirimkan pesan dengan format berikut:\n\n' +
        '/buat NamaPria | NamaWanita | Tanggal (Misal: 15 Okt 2026) | Lokasi Acara\n\n' +
        'Contoh:\n' +
        '/buat Galih | Ratna | Sabtu, 15 Agustus 2026 | Masjid Bintaro'
    );
});

// 3. Logika Pembuatan Undangan: Command /buat
bot.command('buat', async (ctx) => {
    // Menghapus kata '/buat ' dan memecah pesan berdasarkan tanda '|'
    const text = ctx.message.text.replace('/buat', '').trim();
    const parts = text.split('|').map(s => s.trim());
    
    // Validasi format
    if (parts.length < 4 || parts.some(p => p === '')) {
        return ctx.reply('❌ Format salah!\n\nPastikan menggunakan format:\n/buat NamaPria | NamaWanita | Tanggal | Lokasi');
    }

    const [groom, bride, date, location] = parts;
    const id = Date.now().toString(); // Generate ID unik berdasarkan timestamp

    ctx.reply('⏳ Sedang memproses dan membangun web undangan Anda...');

    // Menyimpan ke Supabase "Gudang Data"
    const { error } = await supabase.from('invitations').insert([{
        id: id,
        theme_id: 'sage_earth',
        cover_title: 'The Wedding Of',
        cover_groom_bride_name: `${groom} & ${bride}`,
        cover_date_text: date,
        cover_bg_image: 'assets/cover_bg.png',
        opening_quote: '"Cinta tidak berupa tatapan satu sama lain, tetapi memandang keluar bersama ke arah yang sama."',
        groom_name: groom,
        groom_parent: 'Putra dari Bapak/Ibu Pria',
        groom_photo: 'assets/groom_avatar.png',
        bride_name: bride,
        bride_parent: 'Putri dari Bapak/Ibu Wanita',
        bride_photo: 'assets/bride_avatar.png',
        akad_title: 'Akad Nikah',
        akad_date: date,
        akad_time: '08:00 - 10:00 WIB',
        akad_location: location,
        resepsi_title: 'Resepsi',
        resepsi_date: date,
        resepsi_time: '11:00 - 14:00 WIB',
        resepsi_location: location,
        map_url: 'https://maps.google.com'
    }]);

    if (error) {
        console.error('Supabase Error:', error);
        return ctx.reply('❌ Maaf, terjadi kesalahan saat menyimpan data ke database.');
    }

    // Mendapatkan URL website saat ini dari request headers (akan mengarah ke Vercel App URL)
    const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL 
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://[DOMAIN-VERCEL-ANDA].vercel.app');
        
    const inviteUrl = `${domain}/?id=${id}`;

    // Mengirim URL yang sudah jadi
    ctx.reply(
        `✅ Pesanan Selesai Dirakit!\n\n` +
        `Web Undangan Anda sudah hidup dan siap disebar:\n` +
        `🔗 ${inviteUrl}\n\n` +
        `ID Pesanan: ${id}\n` +
        `Data ini sudah masuk ke Supabase secara otomatis.`
    );
});

// 4. Vercel Serverless Function Handler
module.exports = async (req, res) => {
    try {
        // Menerima update Webhook dari Telegram (metode POST)
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('Bot webhook is active and waiting for Telegram requests.');
        }
    } catch (e) {
        console.error('Webhook Error:', e);
        res.status(500).send('Something went wrong!');
    }
};
