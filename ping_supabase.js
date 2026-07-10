const SUPABASE_URL = "https://sbbgliehirnjkfmhhjgi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYmdsaWVoaXJuamtmbWhoamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDk4MDEsImV4cCI6MjA5NzY4NTgwMX0.L8jx55kyLPuJQuDuK4dMpgsMJV-TRKvZM3VZrva-DSQ";

async function ping() {
    try {
        console.log("Pinging Supabase...");
        const response = await fetch(`${SUPABASE_URL}/rest/v1/invitations?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (response.ok) {
            console.log("Supabase is active and responding!");
        } else {
            console.log("Response status:", response.status);
        }
    } catch (e) {
        console.error("Error pinging Supabase:", e);
    }
}
ping();
