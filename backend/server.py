"""MALIN backend — FastAPI + MongoDB + JWT auth."""

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, List, Literal, Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response, status
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from seed_data import INITIAL_PRODUCTS

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger("malin")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
ACCESS_TTL = timedelta(minutes=60 * 12)  # 12h to keep DX nice during demo
REFRESH_TTL = timedelta(days=7)

LOCKOUT_THRESHOLD = 5
LOCKOUT_WINDOW = timedelta(minutes=15)

app = FastAPI(title="MALIN API")
api = APIRouter(prefix="/api")

origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def make_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": now_utc() + ACCESS_TTL,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def make_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh", "exp": now_utc() + REFRESH_TTL}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        "access_token", access, httponly=True, secure=True, samesite="none",
        max_age=int(ACCESS_TTL.total_seconds()), path="/",
    )
    response.set_cookie(
        "refresh_token", refresh, httponly=True, secure=True, samesite="none",
        max_age=int(REFRESH_TTL.total_seconds()), path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def serialize_user(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "email": doc["email"],
        "name": doc.get("name", ""),
        "role": doc.get("role", "client"),
        "created_at": doc.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Type de token invalide")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        user.pop("_id", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")


async def require_admin(user: Annotated[dict, Depends(get_current_user)]) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return user


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: Optional[str] = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    name: str
    tagline: Optional[str] = ""
    category: str
    price: float = Field(ge=0)
    compare_at: Optional[float] = None
    is_new: bool = False
    best_seller: bool = False
    description: str = ""
    images: List[str] = []
    specs: List[str] = []


class ProductOut(ProductIn):
    id: str
    created_at: datetime


class OrderItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    qty: int = Field(ge=1)
    image: Optional[str] = ""


class OrderIn(BaseModel):
    items: List[OrderItemIn]
    email: EmailStr
    first_name: str
    last_name: str
    address: str
    city: str
    zip: str
    country: str = "France"
    phone: Optional[str] = ""


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": body.name or email.split("@")[0],
        "password_hash": hash_password(body.password),
        "role": "client",
        "created_at": now_utc().isoformat(),
    }
    await db.users.insert_one(user_doc)
    access = make_access_token(user_doc["id"], email, "client")
    refresh = make_refresh_token(user_doc["id"])
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(user_doc), "access_token": access}


@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower().strip()
    ip = request.client.host if request.client else "anon"
    ident = f"{ip}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= LOCKOUT_THRESHOLD:
        locked_at = attempt.get("last_failure")
        if locked_at and isinstance(locked_at, str):
            locked_at = datetime.fromisoformat(locked_at)
        if locked_at and now_utc() - locked_at < LOCKOUT_WINDOW:
            raise HTTPException(status_code=429, detail="Trop de tentatives. Réessayez dans 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$inc": {"count": 1}, "$set": {"last_failure": now_utc().isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    await db.login_attempts.delete_one({"identifier": ident})
    access = make_access_token(user["id"], user["email"], user.get("role", "client"))
    refresh = make_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(user), "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: Annotated[dict, Depends(get_current_user)]):
    return serialize_user(user)


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Pas de refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Type de token invalide")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        access = make_access_token(user["id"], user["email"], user.get("role", "client"))
        response.set_cookie(
            "access_token", access, httponly=True, secure=True, samesite="none",
            max_age=int(ACCESS_TTL.total_seconds()), path="/",
        )
        return {"access_token": access}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

def _product_doc_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "name": doc["name"],
        "tagline": doc.get("tagline", ""),
        "category": doc["category"],
        "price": doc["price"],
        "compare_at": doc.get("compare_at"),
        "is_new": doc.get("is_new", False),
        "best_seller": doc.get("best_seller", False),
        "description": doc.get("description", ""),
        "images": doc.get("images", []),
        "specs": doc.get("specs", []),
        "created_at": doc.get("created_at"),
    }


@api.get("/products")
async def list_products(category: Optional[str] = None, max_price: Optional[float] = None,
                        sort: Optional[str] = None):
    query: dict = {}
    if category and category != "all":
        query["category"] = category
    if max_price is not None:
        query["price"] = {"$lte": max_price}
    cursor = db.products.find(query)
    if sort == "asc":
        cursor = cursor.sort("price", 1)
    elif sort == "desc":
        cursor = cursor.sort("price", -1)
    elif sort == "new":
        cursor = cursor.sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [_product_doc_to_out(d) for d in docs]


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return _product_doc_to_out(doc)


@api.post("/admin/products")
async def create_product(body: ProductIn, _: Annotated[dict, Depends(require_admin)]):
    doc = body.model_dump()
    doc["id"] = "mln-" + uuid.uuid4().hex[:8]
    doc["created_at"] = now_utc().isoformat()
    await db.products.insert_one(doc)
    return _product_doc_to_out(doc)


@api.put("/admin/products/{product_id}")
async def update_product(product_id: str, body: ProductIn, _: Annotated[dict, Depends(require_admin)]):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    update = body.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update})
    doc.update(update)
    return _product_doc_to_out(doc)


@api.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, _: Annotated[dict, Depends(require_admin)]):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return {"ok": True, "id": product_id}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

def _order_doc_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "user_id": doc.get("user_id"),
        "user_email": doc.get("user_email"),
        "items": doc.get("items", []),
        "subtotal": doc.get("subtotal", 0),
        "shipping": doc.get("shipping", 0),
        "total": doc.get("total", 0),
        "status": doc.get("status", "paid"),
        "shipping_address": doc.get("shipping_address", {}),
        "created_at": doc.get("created_at"),
    }


@api.post("/orders")
async def create_order(body: OrderIn, user: Annotated[dict, Depends(get_current_user)]):
    if not body.items:
        raise HTTPException(status_code=400, detail="Panier vide")
    subtotal = sum(it.price * it.qty for it in body.items)
    shipping = 0 if subtotal >= 200 else 9
    total = subtotal + shipping
    doc = {
        "id": "ord-" + uuid.uuid4().hex[:10],
        "user_id": user["id"],
        "user_email": user["email"],
        "items": [it.model_dump() for it in body.items],
        "subtotal": subtotal,
        "shipping": shipping,
        "total": total,
        "status": "paid",  # mock payment
        "shipping_address": {
            "first_name": body.first_name,
            "last_name": body.last_name,
            "address": body.address,
            "city": body.city,
            "zip": body.zip,
            "country": body.country,
            "phone": body.phone or "",
            "email": body.email,
        },
        "created_at": now_utc().isoformat(),
    }
    await db.orders.insert_one(doc)
    return _order_doc_to_out(doc)


@api.get("/orders/me")
async def my_orders(user: Annotated[dict, Depends(get_current_user)]):
    docs = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [_order_doc_to_out(d) for d in docs]


@api.get("/admin/orders")
async def all_orders(_: Annotated[dict, Depends(require_admin)]):
    docs = await db.orders.find({}).sort("created_at", -1).to_list(500)
    return [_order_doc_to_out(d) for d in docs]


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@api.get("/")
async def root():
    return {"app": "MALIN", "version": "1.0"}


app.include_router(api)


# ---------------------------------------------------------------------------
# Seed + startup
# ---------------------------------------------------------------------------

async def ensure_user(email_env: str, password_env: str, role: str, name: str) -> None:
    email = os.environ[email_env].lower().strip()
    password = os.environ[password_env]
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name,
            "password_hash": hash_password(password),
            "role": role,
            "created_at": now_utc().isoformat(),
        })
        logger.info("Seeded user %s (%s)", email, role)
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password), "role": role}},
        )
        logger.info("Updated password for %s", email)


async def seed_products() -> None:
    count = await db.products.count_documents({})
    if count > 0:
        return
    docs = []
    for p in INITIAL_PRODUCTS:
        doc = dict(p)
        doc["created_at"] = now_utc().isoformat()
        docs.append(doc)
    if docs:
        await db.products.insert_many(docs)
        logger.info("Seeded %d products", len(docs))


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.orders.create_index("user_id")
    await db.login_attempts.create_index("identifier")

    await ensure_user("ADMIN_EMAIL", "ADMIN_PASSWORD", "admin", "Admin MALIN")
    await ensure_user("CLIENT1_EMAIL", "CLIENT1_PASSWORD", "client", "Client Un")
    await ensure_user("CLIENT2_EMAIL", "CLIENT2_PASSWORD", "client", "Client Deux")
    await seed_products()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
