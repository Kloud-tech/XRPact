# simulate_flow.py
import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"


def pretty(title, data):
    print(f"\n=== {title} ===")
    print(data)


def main():
    # 1) Créer un projet
    deadline = datetime.utcnow() + timedelta(days=7)

    project_payload = {
        "title": "Puits à eau au Sénégal",
        "description": "Construction d'un puits dans un village rural.",
        "ong_address": "rONGONGONGONGONGONGONGONGONG",  # adresse XRPL fake pour le mock
        "latitude": 14.6937,
        "longitude": -17.4441,
        "deadline": deadline.isoformat(),
        "amount_target": 1000.0,
    }

    r = requests.post(f"{BASE_URL}/projects", json=project_payload)
    r.raise_for_status()
    project = r.json()
    pretty("Projet créé", project)
    project_id = project["id"]

    # 2) Faire un don
    donation_payload = {
        "donor_address": "rDONATORDONATORDONATOR123",  # fake
        "amount_xrp": 50.0,
    }

    r = requests.post(f"{BASE_URL}/projects/{project_id}/donate", json=donation_payload)
    r.raise_for_status()
    donation = r.json()
    pretty("Donation créée (escrow simulé)", donation)

    # 3) Envoyer une "photo" (URL simulée) comme preuve
    # Dans un vrai setup, ce serait l'URL S3 / IPFS de l'image
    evidence_payload = {
        "validator_address": "rVALIDATOR123456789",
        "image_url": "https://example.com/fake_well_photo.jpg",
        "latitude": 14.6940,   # proche du projet
        "longitude": -17.4440,
        "timestamp": datetime.utcnow().isoformat(),
        "wallet_signature": "FAKE_SIGNATURE_FOR_TEST",
    }

    r = requests.post(f"{BASE_URL}/projects/{project_id}/evidence", json=evidence_payload)
    r.raise_for_status()
    pretty("Evidence envoyée", r.json())

    # On en envoie une seconde pour augmenter la confiance
    evidence_payload_2 = {
        "validator_address": "rVALIDATOR987654321",
        "image_url": "https://example.com/fake_well_photo_2.jpg",
        "latitude": 14.6939,
        "longitude": -17.4439,
        "timestamp": datetime.utcnow().isoformat(),
        "wallet_signature": "FAKE_SIGNATURE_2",
    }

    r = requests.post(f"{BASE_URL}/projects/{project_id}/evidence", json=evidence_payload_2)
    r.raise_for_status()
    pretty("Deuxième evidence envoyée", r.json())

    # 4) Lancer le verdict (IA Trust Optimizer)
    r = requests.post(f"{BASE_URL}/projects/{project_id}/verdict")
    r.raise_for_status()
    verdict = r.json()
    pretty("Verdict du projet", verdict)

    # 5) Re-check des projets et donations
    r = requests.get(f"{BASE_URL}/projects")
    r.raise_for_status()
    pretty("Liste projets (après verdict)", r.json())

    # (optionnel) tu peux ajouter un endpoint /donations si tu le codes
    print("\nSimulation terminée ✅")


if __name__ == "__main__":
    main()