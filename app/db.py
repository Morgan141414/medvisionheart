from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable, Optional


@dataclass(frozen=True)
class Gift:
    id: int
    slug: str
    patient_name: str
    note: str
    clinician: str
    created_at: str


def _db_path() -> str:
    os.makedirs("data", exist_ok=True)
    return os.path.join("data", "app.db")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS gifts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                patient_name TEXT NOT NULL,
                note TEXT NOT NULL DEFAULT '',
                clinician TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def create_gift(*, slug: str, patient_name: str, note: str, clinician: str) -> Gift:
    created_at = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO gifts (slug, patient_name, note, clinician, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (slug, patient_name.strip(), (note or "").strip(), (clinician or "").strip(), created_at),
        )
        conn.commit()
        gift_id = int(cur.lastrowid)

    return Gift(
        id=gift_id,
        slug=slug,
        patient_name=patient_name.strip(),
        note=(note or "").strip(),
        clinician=(clinician or "").strip(),
        created_at=created_at,
    )


def get_gift_by_slug(slug: str) -> Optional[Gift]:
    with connect() as conn:
        row = conn.execute("SELECT * FROM gifts WHERE slug = ?", (slug,)).fetchone()

    if row is None:
        return None

    return Gift(
        id=int(row["id"]),
        slug=str(row["slug"]),
        patient_name=str(row["patient_name"]),
        note=str(row["note"]),
        clinician=str(row["clinician"]),
        created_at=str(row["created_at"]),
    )


def list_gifts(limit: int = 25) -> Iterable[Gift]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM gifts ORDER BY id DESC LIMIT ?",
            (int(limit),),
        ).fetchall()

    for row in rows:
        yield Gift(
            id=int(row["id"]),
            slug=str(row["slug"]),
            patient_name=str(row["patient_name"]),
            note=str(row["note"]),
            clinician=str(row["clinician"]),
            created_at=str(row["created_at"]),
        )
