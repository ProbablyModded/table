#!/bin/sh
set -eu

# This mode is intended for a small, self-contained installation. The regular
# container still supports an external PostgreSQL service through boot.sh.
PGDATA="${TABLE_POSTGRES_DATA_DIR:-/var/lib/postgresql/data}"
POSTGRES_USER="${POSTGRES_USER:-table}"
POSTGRES_DB="${POSTGRES_DB:-table}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "POSTGRES_PASSWORD must be set when using bundled PostgreSQL." >&2
    exit 1
fi

mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing bundled PostgreSQL data directory"
    password_file=$(mktemp)
    chmod 600 "$password_file"
    printf '%s\n' "$POSTGRES_PASSWORD" > "$password_file"
    chown postgres:postgres "$password_file"
    su-exec postgres initdb \
        --username="$POSTGRES_USER" \
        --pwfile="$password_file" \
        --auth-host=scram-sha-256 \
        --auth-local=trust \
        --pgdata="$PGDATA"
    rm -f "$password_file"
fi

export PGPASSWORD="$POSTGRES_PASSWORD"
echo "Starting bundled PostgreSQL"
su-exec postgres postgres \
    -D "$PGDATA" \
    -c "listen_addresses=127.0.0.1" \
    -c "port=$POSTGRES_PORT" &
POSTGRES_PID=$!

cleanup() {
    status="$1"
    trap - EXIT INT TERM

    if [ -n "${APP_PID:-}" ] && kill -0 "$APP_PID" 2>/dev/null; then
        kill -TERM "$APP_PID" 2>/dev/null || true
    fi

    # boot.sh starts nginx as a daemon, so stop it explicitly as part of the
    # single-container shutdown path.
    nginx -s quit 2>/dev/null || true

    if [ -n "${POSTGRES_PID:-}" ] && kill -0 "$POSTGRES_PID" 2>/dev/null; then
        kill -TERM "$POSTGRES_PID" 2>/dev/null || true
    fi

    if [ -n "${APP_PID:-}" ]; then
        wait "$APP_PID" 2>/dev/null || true
    fi
    if [ -n "${POSTGRES_PID:-}" ]; then
        wait "$POSTGRES_PID" 2>/dev/null || true
    fi

    exit "$status"
}

trap 'cleanup $?' EXIT
trap 'cleanup 143' INT TERM

echo "Waiting for bundled PostgreSQL"
attempt=0
until pg_isready --host=127.0.0.1 --port="$POSTGRES_PORT" --username="$POSTGRES_USER" -q; do
    if ! kill -0 "$POSTGRES_PID" 2>/dev/null; then
        echo "Bundled PostgreSQL stopped before becoming ready." >&2
        exit 1
    fi
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 60 ]; then
        echo "Bundled PostgreSQL did not become ready within 60 seconds." >&2
        exit 1
    fi
    sleep 1
done

if ! psql --host=127.0.0.1 --port="$POSTGRES_PORT" --username="$POSTGRES_USER" --dbname=postgres \
    --tuples-only --no-align \
    --command="SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q '^1$'; then
    echo "Creating database $POSTGRES_DB"
    createdb --host=127.0.0.1 --port="$POSTGRES_PORT" --username="$POSTGRES_USER" "$POSTGRES_DB"
fi

export TABLE_POSTGRES_STARTED=1
export DB_ENGINE=django.db.backends.postgresql
export POSTGRES_HOST=127.0.0.1
export POSTGRES_PORT
export POSTGRES_USER
export POSTGRES_PASSWORD
export POSTGRES_DB
unset DATABASE_URL

echo "Starting Table"
/opt/recipes/boot.sh &
APP_PID=$!
wait "$APP_PID"
