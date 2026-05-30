"""Ejecuta las migraciones SQL para crear las tablas en Turso."""
from app.db.connection import get_client

MIGRATIONS = [
    """
    CREATE TABLE IF NOT EXISTS objectives (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     TEXT    NOT NULL,
        title       TEXT    NOT NULL,
        description TEXT,
        deadline    TEXT    NOT NULL,
        status      TEXT    NOT NULL DEFAULT 'active',
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS acceptance_criteria (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        objective_id INTEGER NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
        description  TEXT    NOT NULL,
        is_met       INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS projects (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        objective_id        INTEGER NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
        title               TEXT    NOT NULL DEFAULT '',
        description         TEXT    DEFAULT '',
        status              TEXT    NOT NULL DEFAULT 'backlog',
        start_date          TEXT,
        estimated_end_date  TEXT,
        actual_end_date     TEXT,
        stop_reason         TEXT,
        resolution          TEXT,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS tasks (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title          TEXT    NOT NULL,
        description    TEXT,
        duration_hours REAL,
        deadline       TEXT,
        difficulty     TEXT,
        status         TEXT    NOT NULL DEFAULT 'backlog',
        created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    TEXT    NOT NULL,
        title      TEXT    NOT NULL,
        content    TEXT    NOT NULL DEFAULT '',
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
    """,
]


def run_migrations() -> None:
    client = get_client()
    for sql in MIGRATIONS:
        client.execute(sql.strip())
    print("✅ Migraciones ejecutadas correctamente.")


if __name__ == "__main__":
    run_migrations()
