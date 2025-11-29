# xrpl_client.py
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from settings import settings

# En mode mock, on n'utilise PAS de vrai wallet XRPL
if settings.XRPL_MOCK:
    class DummyWallet:
        def __init__(self, address: str):
            self.address = address

    # pas besoin de vrai client XRPL dans le mock
    client = None
    # adresse factice juste pour identifier la plateforme / donateur
    platform_wallet = DummyWallet("rMOCKPLATFORMADDRESS123456789")
else:
    # vrai mode XRPL
    client = JsonRpcClient(settings.XRPL_RPC_URL)
    platform_wallet = Wallet.from_seed(settings.PLATFORM_SEED)