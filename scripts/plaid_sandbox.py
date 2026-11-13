import json
import os
import time
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path


BASE = "https://sandbox.plaid.com"
ROOT = Path(__file__).resolve().parent
TOKEN_FILE = ROOT / ".plaid_access_token.json"


def load_env():
    values = {}
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("\"'")
    return values


def api(path, payload):
    request = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as error:
        try:
            detail = json.loads(error.read())
        except Exception:
            detail = {}
        raise RuntimeError(detail.get("error_code", "HTTP_ERROR")) from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise ConnectionError("NETWORK_ERROR") from None


def main():
    env = load_env()
    client_id = env.get("PLAID_CLIENT_ID") or os.environ.get("PLAID_CLIENT_ID")
    secret = env.get("PLAID_SECRET") or os.environ.get("PLAID_SECRET")
    if not client_id or not secret:
        raise RuntimeError("MISSING_CREDENTIALS")

    common = {"client_id": client_id, "secret": secret}
    public = api("/sandbox/public_token/create", {
        **common, "institution_id": "ins_109508", "initial_products": ["transactions"]
    })
    exchanged = api("/item/public_token/exchange", {
        **common, "public_token": public["public_token"]
    })
    access_token = exchanged["access_token"]
    TOKEN_FILE.write_text(json.dumps({"access_token": access_token}), encoding="utf-8")

    accounts = api("/accounts/get", {**common, "access_token": access_token})
    end = date.today()
    start = end - timedelta(days=89)
    transactions = []
    offset = 0
    total = None
    attempts = 0
    while total is None or offset < total:
        try:
            page = api("/transactions/get", {
                **common, "access_token": access_token,
                "start_date": start.isoformat(), "end_date": end.isoformat(),
                "options": {"count": 100, "offset": offset},
            })
        except RuntimeError as error:
            if str(error) == "PRODUCT_NOT_READY" and attempts < 3:
                attempts += 1
                time.sleep(2)
                continue
            raise
        batch = page.get("transactions", [])
        transactions.extend(batch)
        total = page.get("total_transactions", len(transactions))
        offset += len(batch)
        if not batch:
            break

    print(json.dumps({
        "institution_id": "ins_109508",
        "accounts": accounts.get("accounts", []),
        "transactions": transactions,
        "transaction_count": len(transactions),
        "total_transactions": total,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
    }, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Only a fixed error category is printed; credential and token data are never emitted.
        print("ERROR " + (str(exc) if str(exc) in {
            "NETWORK_ERROR", "MISSING_CREDENTIALS", "PRODUCT_NOT_READY",
            "INVALID_API_KEYS", "INSTITUTION_NOT_FOUND", "HTTP_ERROR",
        } else "REQUEST_FAILED"))
        raise SystemExit(1)
