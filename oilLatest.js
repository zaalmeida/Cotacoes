
:root { --bg:#0f172a; --card:#111827; --text:#e5e7eb; --muted:#9ca3af; --up:#16a34a; --down:#ef4444; --chip:#1f2937; }
* { box-sizing: border-box }
body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:var(--bg); color:var(--text); }
header { padding:24px 16px; text-align:center; }
.muted { color:var(--muted); font-size:12px }
.grid { display:grid; gap:16px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); padding:16px; max-width:1280px; margin:0 auto; }
.card { background:var(--card); border-radius:12px; padding:16px; box-shadow: 0 1px 2px rgba(0,0,0,.25); }
.card h2 { font-size:14px; color:var(--muted); margin:0 0 12px; text-transform:uppercase; letter-spacing:.08em; }
.row { display:flex; justify-content:space-between; align-items:center; margin:10px 0; gap:8px; }
.sym { font-weight:600; }
.price { font-variant-numeric: tabular-nums; font-size:18px; }
.chips { display:flex; gap:6px; flex-wrap:wrap; }
.chip { background:var(--chip); border-radius:999px; padding:4px 8px; font-size:12px; }
.up { color:var(--up); }
.down { color:var(--down); }
.note { font-size:12px; color:var(--muted); margin-top:8px }
footer { color:var(--muted); font-size:12px; text-align:center; padding:24px 8px; }
