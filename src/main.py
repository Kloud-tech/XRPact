from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet

# URL du JSON-RPC du testnet XRPL
JSON_RPC_URL = "https://s.altnet.rippletest.net:51234"

def main():
    client = JsonRpcClient(JSON_RPC_URL)
    print("✅ Connecté au testnet XRPL")

    # Génère un wallet de test et le crédite via le faucet
    test_wallet = generate_faucet_wallet(client, debug=True)
    print("\n🎉 Wallet testnet généré :")
    print("Adresse :", test_wallet.classic_address)
    print("Seed    :", test_wallet.seed)

if __name__ == "__main__":
    main()
