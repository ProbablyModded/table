from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from cookbook.helper.permission_helper import CustomIsUser, CustomTokenHasReadWriteScope
from cookbook.provider.shopping_broker import ShoppingBroker, ShoppingBrokerError


class ShoppingProviderView(APIView):
    """Expose a small, authenticated contract for the shopping UI.

    Provider-specific credentials and API details never leave the server.
    """

    permission_classes = [CustomIsUser & CustomTokenHasReadWriteScope]
    throttle_classes = [UserRateThrottle]

    def get(self, request):
        return Response(ShoppingBroker().status())

    def post(self, request):
        action = request.data.get('action')
        if action not in {'search', 'cart', 'handoff', 'health'}:
            return Response({'message': 'Unsupported shopping action.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = ShoppingBroker().call(request, action, request.data.get('data', {}))
        except ShoppingBrokerError as exc:
            return Response({'message': str(exc)}, status=exc.status_code)

        return Response(result)
