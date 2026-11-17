import json
from unittest.mock import Mock, patch

from django.urls import reverse


URL = reverse('api_shopping_provider')


def test_provider_status_is_safe_when_disabled(u1_s1, settings):
    settings.TABLE_SHOPPING_BROKER_URL = ''
    settings.TABLE_SHOPPING_BROKER_TOKEN = ''

    response = u1_s1.get(URL)

    assert response.status_code == 200
    payload = response.json()
    assert payload['provider'] == 'walmart'
    assert payload['configured'] is False
    assert 'token' not in json.dumps(payload).lower()


def test_provider_request_fails_closed_when_disabled(u1_s1, settings):
    settings.TABLE_SHOPPING_BROKER_URL = ''
    settings.TABLE_SHOPPING_BROKER_TOKEN = ''

    response = u1_s1.post(URL, {'action': 'cart', 'data': {'items': []}}, content_type='application/json')

    assert response.status_code == 503


def test_provider_request_is_server_side_and_scoped(u1_s1, space_1, settings):
    settings.TABLE_SHOPPING_BROKER_URL = 'https://shopping.example.test'
    settings.TABLE_SHOPPING_BROKER_TOKEN = 'server-only-token'
    settings.TABLE_SHOPPING_BROKER_PATH = '/v1/table/shopping'

    broker_response = Mock()
    broker_response.ok = True
    broker_response.status_code = 200
    broker_response.json.return_value = {'handoff_url': 'https://www.walmart.com/'}

    with patch('cookbook.provider.shopping_broker.requests.post', return_value=broker_response) as broker_call:
        response = u1_s1.post(
            URL,
            {'action': 'cart', 'data': {'items': [{'food': 'rice', 'amount': 1}]}},
            content_type='application/json',
        )

    assert response.status_code == 200
    assert response.json()['handoff_url'].startswith('https://')
    assert broker_call.call_args.args[0] == 'https://shopping.example.test/v1/table/shopping'
    assert broker_call.call_args.kwargs['headers']['Authorization'] == 'Bearer server-only-token'
    assert broker_call.call_args.kwargs['json']['provider'] == 'walmart'
    assert broker_call.call_args.kwargs['json']['action'] == 'cart'
    assert broker_call.call_args.kwargs['json']['space_id'] == space_1.id
