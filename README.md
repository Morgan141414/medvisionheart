# Smart Anatomy Assistant (SAA) + Patient Gift MVP

This repo contains two related demos:

1) **Smart Anatomy Assistant (SAA)** — an interactive patient education demo (MIS-style UI + 3D heart viewer in the browser).
2) **Patient Gift MVP** — a small FastAPI app that issues a printable QR card and a parameterized OpenSCAD tag for a 3D-printed patient gift.

## SAA demo (React + Three.js)

### Run

Backend (mock MIS API):

```powershell
cd backend
npm run dev
```

Frontend:

```powershell
cd frontend
npm run dev
```

Open Vite URL (usually `http://127.0.0.1:5173/`) and click **Launch Interactive Demo**.

### What’s inside
- MIS-style UI (sidebar + patient card)
- 3D heart viewer with:
	- orbit controls
	- cross-section slider (clipping plane)
	- layer toggles
	- beat animation
	- annotations panel (click parts)
	- “visualize pathology” mode highlighting coronary arteries

## Server requirements (small vs large)

See: [docs/SERVER_REQUIREMENTS.md](docs/SERVER_REQUIREMENTS.md)

## Deploy (Vercel)

This project is intended to be deployed as a **frontend-only** app on Vercel.

- Import the GitHub repo into Vercel
- Set **Root Directory** to `frontend`
- Framework preset: **Vite** (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`

SPA routing for `/demo` is handled by [frontend/vercel.json](frontend/vercel.json).

---

# Patient Gift MVP (QR + Print Card + OpenSCAD)

Small FastAPI MVP to:
- create a “gift record” for a patient (name, note, clinician)
- generate a unique slug
- serve a patient landing page by QR
- serve a print-friendly card with QR
- serve a parameterized OpenSCAD `.scad` template for a breathing keychain

## Run (Windows / PowerShell)

1) Create venv and install deps:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2) Start the server:

```powershell
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
```

Open:
- http://127.0.0.1:8000/admin

### Optional: protect /admin with a token

Set an env var and pass `?token=...` in the admin URL:

```powershell
$env:ADMIN_TOKEN = "change-me"
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
```

Then open:
- `http://127.0.0.1:8000/admin?token=change-me`

### Export STL (OpenSCAD)

- Open `/g/{slug}/tag.scad` in OpenSCAD
- Press **F6** (Render)
- File → Export → Export as STL

If Cyrillic text is missing, adjust `font_name` inside the `.scad`.

## Notes
- Data is stored in `data/app.db` (SQLite).
- This is an MVP. It intentionally avoids storing sensitive medical data.

## Product concept

See: [docs/3D_PRINT_PRODUCT.md](docs/3D_PRINT_PRODUCT.md)

## 3D model note

The 3D heart viewer expects a GLB at `frontend/public/models/heart.glb`.
- On load, the app prints a capped scene-graph dump to the browser console (`[Heart GLB] Scene graph...`) to help map real mesh/group names to layer toggles.
- Cross-section can be controlled by dragging a plane gizmo (TransformControls); the slider remains as a fallback.
