# Single-container installation

Table can run with PostgreSQL bundled into the same container for a simple
personal or family installation. The database and application data are kept in
bind mounts so recreating the container does not remove them.

This mode is convenient, but a separate PostgreSQL container is preferable for
larger installations, independent database upgrades, and more involved backup
strategies.

## Start Table and PostgreSQL together

From the repository root:

```shell
cp .env.template .env
```

Edit `.env` and set at least `SECRET_KEY`, `POSTGRES_PASSWORD`, and
`ALLOWED_HOSTS`. Then build and start the single container:

```shell
docker compose -f docker-compose.all-in-one.yml up -d --build
```

The first startup initializes PostgreSQL, creates the configured database,
runs Table's migrations, and collects static files. Open
`http://localhost:8080` unless you changed `TABLE_HTTP_PORT`.

The PostgreSQL data directory is `./postgresql`, uploaded media is in
`./mediafiles`, and collected static files are in `./staticfiles`. Back up all
three directories before upgrading or moving the installation.

Do not change `POSTGRES_USER`, `POSTGRES_PASSWORD`, or `POSTGRES_DB` after the
database has been initialized unless you also update PostgreSQL manually.
