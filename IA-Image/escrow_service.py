# escrow_service.py
import secrets
import hashlib
import random
from datetime import datetime, timezone

from xrpl.models.transactions import EscrowCreate, EscrowFinish, EscrowCancel
from xrpl.transaction import submit_and_wait  # <- OK pour xrpl-py v2
from xrpl.utils import xrp_to_drops

from xrpl_client import client
from settings import settings


def generate_secret_and_condition() -> tuple[str, str]:
    """
    Retourne (fulfillment_hex, condition_hex)
    """
    preimage = secrets.token_bytes(32)
    fulfillment_hex = preimage.hex()
    condition = hashlib.sha256(preimage).hexdigest()
    return fulfillment_hex, condition


def create_donation_escrow(
    donor_wallet,
    ong_address: str,
    amount_xrp: float,
    cancel_after: datetime,
    condition_hex: str,
) -> dict:
    # Mode mock : on ne parle pas au vrai XRPL
    if settings.XRPL_MOCK:
        return {
            "mock": True,
            "tx_json": {
                "Account": donor_wallet.address,
                "Destination": ong_address,
                "Amount": xrp_to_drops(amount_xrp),
                "Sequence": random.randint(1_000_000, 9_999_999),
            },
            "status": "success",
        }

    # XRPL time = Unix time + 946684800
    cancel_after_ripple = int(
        cancel_after.replace(tzinfo=timezone.utc).timestamp()
    ) + 946684800

    tx = EscrowCreate(
        account=donor_wallet.address,
        destination=ong_address,
        amount=xrp_to_drops(amount_xrp),
        cancel_after=cancel_after_ripple,
        condition=condition_hex.upper(),
    )

    # submit_and_wait s’occupe de signer + autofill + submit
    response = submit_and_wait(
        tx,
        client,
        wallet=donor_wallet,
        check_fee=True,
        autofill=True,
    )
    return response.result


def finish_donation_escrow(
    donor_wallet,
    owner: str,
    offer_sequence: int,
    condition_hex: str,
    fulfillment_hex: str,
) -> dict:
    if settings.XRPL_MOCK:
        return {
            "mock": True,
            "finished": True,
            "owner": owner,
            "sequence": offer_sequence,
        }

    tx = EscrowFinish(
        account=donor_wallet.address,
        owner=owner,
        offer_sequence=offer_sequence,
        condition=condition_hex.upper(),
        fulfillment=fulfillment_hex,
    )

    response = submit_and_wait(
        tx,
        client,
        wallet=donor_wallet,
        check_fee=True,
        autofill=True,
    )
    return response.result


def cancel_donation_escrow(
    donor_wallet,
    owner: str,
    offer_sequence: int,
) -> dict:
    if settings.XRPL_MOCK:
        return {
            "mock": True,
            "canceled": True,
            "owner": owner,
            "sequence": offer_sequence,
        }

    tx = EscrowCancel(
        account=donor_wallet.address,
        owner=owner,
        offer_sequence=offer_sequence,
    )

    response = submit_and_wait(
        tx,
        client,
        wallet=donor_wallet,
        check_fee=True,
        autofill=True,
    )
    return response.result