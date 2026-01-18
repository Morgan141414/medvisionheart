from __future__ import annotations

import io
import os
import secrets
import sqlite3
from typing import Optional

import segno
from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .db import Gift, create_gift, get_gift_by_slug, init_db, list_gifts


app = FastAPI(title="Patient Gift MVP")

templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse(url="/admin", status_code=302)


@app.get("/healthz", include_in_schema=False)
def healthz() -> Response:
    return Response(content="ok", media_type="text/plain; charset=utf-8")


def _new_slug() -> str:
    # Short, URL-safe token. Collision risk is tiny; DB unique constraint handles it.
    return secrets.token_urlsafe(6).rstrip("=")


def _absolute_url(request: Request, path: str) -> str:
    # Request.base_url ends with '/', so strip to avoid '//' in URLs.
    base = str(request.base_url).rstrip("/")
    if not path.startswith("/"):
        path = "/" + path
    return base + path


def _qr_svg(url: str) -> str:
    qr = segno.make(url, micro=False)
    buf = io.BytesIO()
    qr.save(buf, kind="svg", scale=4, border=2)
    return buf.getvalue().decode("utf-8")


def _admin_token_required() -> bool:
    return bool(os.getenv("ADMIN_TOKEN"))


def _require_admin(request: Request) -> str:
    """If ADMIN_TOKEN is set, require it via ?token= or X-Admin-Token header.

    Returns the token value (so templates can preserve it in links).
    """
    configured = (os.getenv("ADMIN_TOKEN") or "").strip()
    if not configured:
        return ""

    provided = (
        (request.query_params.get("token") or "").strip()
        or (request.headers.get("X-Admin-Token") or "").strip()
    )
    if provided != configured:
        raise HTTPException(status_code=403, detail="Admin token required")
    return provided


@app.get("/admin", response_class=HTMLResponse)
def admin(request: Request) -> HTMLResponse:
    token = _require_admin(request)
    gifts = list(list_gifts(50))
    return templates.TemplateResponse(
        "admin.html",
        {
            "request": request,
            "gifts": gifts,
            "admin_token": token,
            "admin_token_required": _admin_token_required(),
        },
    )


@app.post("/admin/create", include_in_schema=False)
def admin_create(
    request: Request,
    patient_name: str = Form(...),
    note: str = Form(""),
    clinician: str = Form(""),
    token: str = Form(""),
) -> RedirectResponse:
    # Ensure the same token gates both GET /admin and POST /admin/create.
    # (If token is supplied via form field, accept it too.)
    if _admin_token_required() and token:
        request = Request(
            request.scope,
            receive=request.receive,
        )
        request.scope["query_string"] = f"token={token}".encode("utf-8")
    admin_token = _require_admin(request)

    patient_name = (patient_name or "").strip()
    if len(patient_name) < 2:
        raise HTTPException(status_code=400, detail="patient_name is too short")

    # Try a couple times in the very unlikely event of a slug collision.
    last_error: Optional[Exception] = None
    for _ in range(5):
        slug = _new_slug()
        try:
            create_gift(slug=slug, patient_name=patient_name, note=note, clinician=clinician)
            suffix = f"?token={admin_token}" if admin_token else ""
            return RedirectResponse(url=f"/g/{slug}/print{suffix}", status_code=303)
        except sqlite3.IntegrityError as exc:  # unique slug collision
            last_error = exc

    raise HTTPException(status_code=500, detail=f"Failed to create gift: {last_error}")


@app.get("/g/{slug}", response_class=HTMLResponse)
def landing(request: Request, slug: str) -> HTMLResponse:
    gift = get_gift_by_slug(slug)
    if gift is None:
        raise HTTPException(status_code=404, detail="Not found")

    qr_url = _absolute_url(request, f"/g/{gift.slug}")
    return templates.TemplateResponse(
        "landing.html",
        {
            "request": request,
            "gift": gift,
            "qr_url": qr_url,
        },
    )


@app.get("/g/{slug}/print", response_class=HTMLResponse)
def print_card(request: Request, slug: str) -> HTMLResponse:
    gift = get_gift_by_slug(slug)
    if gift is None:
        raise HTTPException(status_code=404, detail="Not found")

    landing_url = _absolute_url(request, f"/g/{gift.slug}")
    qr_svg_inline = _qr_svg(landing_url)

    # If admin token is used, preserve it in links on the print screen.
    admin_token = (request.query_params.get("token") or "").strip()

    return templates.TemplateResponse(
        "print.html",
        {
            "request": request,
            "gift": gift,
            "landing_url": landing_url,
            "qr_svg": qr_svg_inline,
            "admin_token": admin_token,
        },
    )


@app.get("/g/{slug}/qr.svg")
def qr_svg(request: Request, slug: str) -> Response:
    gift = get_gift_by_slug(slug)
    if gift is None:
        raise HTTPException(status_code=404, detail="Not found")

    url = _absolute_url(request, f"/g/{gift.slug}")
    svg = _qr_svg(url)
    headers = {
        # Contains a user-specific URL; avoid caching in shared/proxy caches.
        "Cache-Control": "no-store",
    }
    return Response(content=svg, media_type="image/svg+xml", headers=headers)


@app.get("/g/{slug}/tag.scad")
def tag_scad(slug: str) -> Response:
    gift = get_gift_by_slug(slug)
    if gift is None:
        raise HTTPException(status_code=404, detail="Not found")

    # Keep name safe for embedding into a SCAD string.
    safe_name = gift.patient_name.replace("\\", " ").replace('"', "'")

    scad = f"""
// Generated by Patient Gift MVP
// Open in OpenSCAD and render/export STL.
// Tip: Cyrillic text depends on installed fonts. If text is missing, set font_name.

name = \"{safe_name}\";
use_text = true;
font_name = \"DejaVu Sans\";

// Breath dots: count completed exhale cycles
breath_dots = 8;

// Basic size parameters (mm)
plate_w = 52;
plate_h = 28;
plate_t = 3.0;
text_t  = 0.8;
text_size = 8;
hole_r = 2.2;
hole_offset = 5.5;

dot_r = 1.0;
dot_h = 0.7;

$fn = 64;

module rounded_rect(w, h, r) {{
  hull() {{
    translate([r, r, 0]) circle(r=r);
    translate([w-r, r, 0]) circle(r=r);
    translate([r, h-r, 0]) circle(r=r);
    translate([w-r, h-r, 0]) circle(r=r);
  }}
}}

module tag(n) {{
    difference() {{
        union() {{
            // base
            linear_extrude(height=plate_t) rounded_rect(plate_w, plate_h, 4);

            // tactile breath dots (raised)
            for (i = [0 : breath_dots-1]) {{
                x = 16 + i * ((plate_w - 26) / max(1, breath_dots-1));
                y = 6;
                translate([x, y, plate_t]) cylinder(h=dot_h, r=dot_r);
            }}
        }}

        // keyring hole
        translate([hole_offset, plate_h-hole_offset, 0])
            cylinder(h=plate_t+1.0, r=hole_r);

        // debossed text (name)
        if (use_text) {{
            translate([plate_w/2, plate_h/2+2, plate_t-text_t])
                linear_extrude(height=text_t+0.2)
                    text(n, size=text_size, halign=\"center\", valign=\"center\", font=font_name);
        }}

        // small debossed instruction
        translate([plate_w/2, plate_h/2-7, plate_t-0.6])
            linear_extrude(height=0.8)
                text(\"4-6\", size=6, halign=\"center\", valign=\"center\", font=font_name);
    }}
}}

tag(name);
""".lstrip()

    headers = {"Content-Disposition": f"attachment; filename=gift-{gift.slug}.scad"}
    return Response(content=scad, media_type="text/plain; charset=utf-8", headers=headers)
