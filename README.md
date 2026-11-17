# Table

Table is a self-hosted recipe manager and meal-planning app for keeping a
shared collection of recipes organized, searchable, and useful in the kitchen.

**Version:** 1.0  
**Contact:** [highlandn@gmail.com](mailto:highlandn@gmail.com)

## What Table does

- Store, import, scale, search, and organize recipes.
- Plan meals on a desktop or mobile-friendly calendar.
- Build shopping lists from recipes and meal plans.
- Prepare for pre-populated shopping carts so planned groceries can eventually
  be sent to a supported retailer or shopping service.
- Share recipes, meal plans, and shopping lists with household members.
- Use Docker with PostgreSQL, including a single-container setup for personal
  installations.

## Getting started

The quickest local setup is:

```sh
cp .env.template .env
# Set SECRET_KEY, POSTGRES_PASSWORD, and ALLOWED_HOSTS in .env
docker compose -f docker-compose.all-in-one.yml up -d --build
```

Then open <http://localhost:8080>. The first startup initializes PostgreSQL,
creates the Table database, runs migrations, and collects static files.

For larger installations, use the standard split-container Docker Compose
configuration in [the Docker guide](docs/install/docker.md). The bundled setup
is documented in [the single-container guide](docs/install/docker/single-container.md).

## Documentation

Read the [Table documentation](docs/) for installation, configuration,
backups, integrations, and development notes.

## Project direction

Table is being shaped around the way households actually cook: a dependable
recipe library, a flexible meal calendar, useful shopping workflows, and future
connections to pre-populated shopping carts.

## License

Table is distributed under the GNU AGPL v3 with the project’s selling
exception. See [LICENSE.md](LICENSE.md) for the license text.
