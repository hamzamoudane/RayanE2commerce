"""Backend tests for MALIN — auth, products, orders, brute force."""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://smart-marketplace-45.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@malin.shop", "password": "Admin123!"}
CLIENT1 = {"email": "client1@malin.shop", "password": "Client123!"}
CLIENT2 = {"email": "client2@malin.shop", "password": "Client123!"}


# -------- helpers --------
def login(creds):
    r = requests.post(f"{API}/auth/login", json=creds, timeout=15)
    return r


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def admin_token():
    r = login(ADMIN)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def client1_token():
    r = login(CLIENT1)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def client2_token():
    r = login(CLIENT2)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


# -------- auth --------
class TestAuth:
    def test_login_admin(self):
        r = login(ADMIN)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["email"] == ADMIN["email"]
        assert data["user"]["role"] == "admin"
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20
        # cookie set
        assert "access_token" in r.cookies or any(c.lower().startswith("access_token") for c in r.headers.get("set-cookie", "").split(","))

    def test_login_client1(self):
        r = login(CLIENT1)
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["role"] == "client"
        assert data["user"]["email"] == CLIENT1["email"]

    def test_login_bad_password(self):
        r = login({"email": ADMIN["email"], "password": "wrongpass"})
        assert r.status_code == 401
        assert "incorrect" in r.json()["detail"].lower()

    def test_register_new_user(self):
        unique = f"test_{uuid.uuid4().hex[:8]}@malin.shop"
        r = requests.post(f"{API}/auth/register", json={"email": unique, "password": "secret123", "name": "Tester"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["email"] == unique
        assert data["user"]["role"] == "client"
        assert data["access_token"]

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, client1_token):
        r = requests.get(f"{API}/auth/me", headers=bearer(client1_token))
        assert r.status_code == 200
        assert r.json()["email"] == CLIENT1["email"]

    def test_logout_clears_cookies(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json=CLIENT1)
        assert r.status_code == 200
        r2 = s.post(f"{API}/auth/logout")
        assert r2.status_code == 200
        sc = r2.headers.get("set-cookie", "")
        # cookies deleted (Max-Age=0 or expires past)
        assert "access_token" in sc.lower()


# -------- products --------
class TestProducts:
    def test_list_seeded(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 14, f"Expected >=14 products, got {len(items)}"

    def test_get_detector(self):
        r = requests.get(f"{API}/products/mln-001")
        assert r.status_code == 200
        assert "Détecteur" in r.json()["name"] or "etecteur" in r.json()["name"]

    def test_get_404(self):
        r = requests.get(f"{API}/products/inexistant")
        assert r.status_code == 404

    def test_create_as_client_forbidden(self, client1_token):
        r = requests.post(f"{API}/admin/products",
                          headers=bearer(client1_token),
                          json={"name": "X", "category": "curios", "price": 10})
        assert r.status_code == 403
        assert "admin" in r.json()["detail"].lower()

    def test_admin_full_crud(self, admin_token):
        # Create
        payload = {"name": "TEST_Gadget", "category": "curios", "price": 49.0,
                   "description": "Pytest product", "tagline": "test", "images": [], "specs": []}
        r = requests.post(f"{API}/admin/products", headers=bearer(admin_token), json=payload)
        assert r.status_code == 200, r.text
        prod = r.json()
        assert prod["id"].startswith("mln-")
        assert prod["name"] == "TEST_Gadget"
        pid = prod["id"]

        # Update
        upd = {**payload, "name": "TEST_Gadget2", "price": 79.0}
        r2 = requests.put(f"{API}/admin/products/{pid}", headers=bearer(admin_token), json=upd)
        assert r2.status_code == 200
        assert r2.json()["price"] == 79.0
        assert r2.json()["name"] == "TEST_Gadget2"

        # GET verify
        rg = requests.get(f"{API}/products/{pid}")
        assert rg.status_code == 200
        assert rg.json()["price"] == 79.0

        # Delete
        rd = requests.delete(f"{API}/admin/products/{pid}", headers=bearer(admin_token))
        assert rd.status_code == 200

        # Verify gone
        rgone = requests.get(f"{API}/products/{pid}")
        assert rgone.status_code == 404


# -------- orders --------
class TestOrders:
    def _make_order_payload(self):
        return {
            "items": [{"product_id": "mln-001", "name": "Detecteur", "price": 89, "qty": 1}],
            "email": "client1@malin.shop",
            "first_name": "Alice",
            "last_name": "Test",
            "address": "1 rue test",
            "city": "Paris",
            "zip": "75001",
            "country": "France",
            "phone": "0600000000",
        }

    def test_create_order_shipping_9(self, client1_token):
        r = requests.post(f"{API}/orders", headers=bearer(client1_token), json=self._make_order_payload())
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["subtotal"] == 89
        assert o["shipping"] == 9
        assert o["total"] == 98
        assert o["status"] == "paid"
        assert o["id"].startswith("ord-")

    def test_create_order_free_shipping(self, client1_token):
        payload = self._make_order_payload()
        payload["items"] = [{"product_id": "mln-001", "name": "Detecteur", "price": 89, "qty": 3}]
        r = requests.post(f"{API}/orders", headers=bearer(client1_token), json=payload)
        assert r.status_code == 200
        o = r.json()
        assert o["subtotal"] == 267
        assert o["shipping"] == 0
        assert o["total"] == 267

    def test_my_orders_isolation(self, client1_token, client2_token):
        r1 = requests.get(f"{API}/orders/me", headers=bearer(client1_token))
        r2 = requests.get(f"{API}/orders/me", headers=bearer(client2_token))
        assert r1.status_code == 200 and r2.status_code == 200
        c1_ids = {o["id"] for o in r1.json()}
        c2_ids = {o["id"] for o in r2.json()}
        # Sanity: client1 has at least the order we just created
        assert len(c1_ids) >= 1
        # Isolation: no overlap
        assert c1_ids.isdisjoint(c2_ids)
        # All belong to the right user
        for o in r1.json():
            assert o["user_email"] == CLIENT1["email"]

    def test_admin_orders_all(self, admin_token, client1_token):
        r = requests.get(f"{API}/admin/orders", headers=bearer(admin_token))
        assert r.status_code == 200
        all_orders = r.json()
        # admin should see at least the c1 orders
        c1_orders = requests.get(f"{API}/orders/me", headers=bearer(client1_token)).json()
        all_ids = {o["id"] for o in all_orders}
        for o in c1_orders:
            assert o["id"] in all_ids

    def test_admin_orders_client_forbidden(self, client1_token):
        r = requests.get(f"{API}/admin/orders", headers=bearer(client1_token))
        assert r.status_code == 403


# -------- brute force --------
class TestBruteForce:
    def test_lockout_triggers_429(self):
        """Brute force lockout fires after enough failed attempts.

        NOTE: Backend uses request.client.host as part of the identifier, which
        behind a k8s ingress may rotate between proxy IPs. We send extra attempts
        to ensure at least one proxy IP accumulates >=5 failures.
        """
        ident_email = f"brute-{uuid.uuid4().hex[:6]}@malin.shop"
        got_429 = False
        for _ in range(40):
            r = login({"email": ident_email, "password": "badpass"})
            if r.status_code == 429:
                got_429 = True
                assert "tentatives" in r.json()["detail"].lower()
                break
            time.sleep(0.05)
        assert got_429, "Brute-force lockout never triggered after 40 attempts"
