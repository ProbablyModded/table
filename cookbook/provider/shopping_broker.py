"""Secure server-side handoff to an operator-controlled shopping broker.

The browser only talks to Table.  If configured, Table makes the outbound
request from the server to a broker that owns the Walmart credentials,
affiliate settings, and any provider-specific API logic.
"""

import requests
from requests import RequestException

from recipes import settings


class ShoppingBrokerError(Exception):
    """Raised when the configured shopping broker cannot complete a request."""

    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.status_code = status_code


class ShoppingBroker:
    provider = 'walmart'

    @property
    def configured(self):
        return bool(settings.TABLE_SHOPPING_BROKER_URL and settings.TABLE_SHOPPING_BROKER_TOKEN)

    def status(self):
        return {
            'provider': self.provider,
            'configured': self.configured,
            'mode': 'hosted-broker' if self.configured else 'disabled',
            'capabilities': settings.TABLE_SHOPPING_BROKER_CAPABILITIES if self.configured else [],
            'message': (
                'Shopping actions are routed through the configured server-side broker.'
                if self.configured else
                'Shopping integration is not configured on this server.'
            ),
        }

    def call(self, request, action, data):
        if not self.configured:
            raise ShoppingBrokerError('The server-side shopping broker is not configured.', status_code=503)

        broker_url = f"{settings.TABLE_SHOPPING_BROKER_URL}{settings.TABLE_SHOPPING_BROKER_PATH}"
        payload = {
            'provider': self.provider,
            'action': action,
            'space_id': request.space.id,
            'data': data if isinstance(data, dict) else {},
        }
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {settings.TABLE_SHOPPING_BROKER_TOKEN}',
        }

        try:
            response = requests.post(
                broker_url,
                json=payload,
                headers=headers,
                timeout=settings.TABLE_SHOPPING_BROKER_TIMEOUT,
            )
        except RequestException as exc:
            raise ShoppingBrokerError(f'Shopping broker request failed: {exc.__class__.__name__}.') from exc

        try:
            response_payload = response.json()
        except ValueError:
            response_payload = {'message': response.text[:500]}

        if not response.ok:
            message = response_payload.get('message', 'The shopping broker returned an error.') if isinstance(response_payload, dict) else 'The shopping broker returned an error.'
            raise ShoppingBrokerError(message, status_code=response.status_code if response.status_code >= 400 else 502)

        return response_payload if isinstance(response_payload, dict) else {'data': response_payload}
