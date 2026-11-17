# Walmart shopping backend

The Walmart integration is intentionally server-side only. Table never puts a
Walmart client secret, access token, or affiliate configuration in compiled
frontend code.

## Broker configuration

Configure the self-hosted Table server with:

```dotenv
TABLE_SHOPPING_BROKER_URL=https://shopping.example.com
TABLE_SHOPPING_BROKER_TOKEN=replace-with-a-per-installation-token
TABLE_SHOPPING_BROKER_PATH=/v1/table/shopping
TABLE_SHOPPING_BROKER_CAPABILITIES=search,cart,handoff
```

The broker owns the Walmart credentials and provider-specific API logic. Table
exposes only an authenticated internal endpoint at
`/api/shopping-provider/`:

- `GET` returns non-secret configuration status;
- `POST {"action":"search","data":{...}}` forwards a product search;
- `POST {"action":"cart","data":{...}}` forwards a cart request;
- `POST {"action":"handoff","data":{...}}` forwards an affiliate/handoff request; and
- `POST {"action":"health","data":{}}` checks the broker connection.

The broker receives JSON shaped like:

```json
{
  "provider": "walmart",
  "action": "cart",
  "space_id": 123,
  "data": {"items": []}
}
```

The Walmart UI is not enabled yet. This backend contract is ready for the
shopping-list review experience after the exact Walmart API and affiliate
permissions have been confirmed.
