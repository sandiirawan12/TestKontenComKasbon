// Dev lokal: bypass SSL verify ke Supabase (jaringan kantor Windows).
// Production/Vercel tidak terpengaruh — blok ini tidak jalan saat NODE_ENV=production.
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
