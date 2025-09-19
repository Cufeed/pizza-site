#!/bin/sh
set -e

echo "[init.sh] Starting database initialization with pg_restore..."

DB_NAME=${POSTGRES_DB:-pizza}
DB_USER=${POSTGRES_USER:-postgres}
DUMP_FILE="/docker-entrypoint-initdb.d/pizza_dump.sql"

if [ -f "$DUMP_FILE" ]; then
  echo "[init.sh] Found dump file: $DUMP_FILE"
  echo "[init.sh] Creating database $DB_NAME if not exists..."
  createdb -U "$DB_USER" "$DB_NAME" || true

  echo "[init.sh] Restoring dump into $DB_NAME using pg_restore..."
  pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-privileges "$DUMP_FILE" || {
    echo "[init.sh] pg_restore failed. If this is a plain SQL file, falling back to psql..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$DUMP_FILE"
  }

  echo "[init.sh] Database initialization completed."
else
  echo "[init.sh] Dump file not found at $DUMP_FILE; skipping restore."
fi


