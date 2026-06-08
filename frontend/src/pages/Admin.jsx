import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, PencilSimple, Trash, X, Package, Receipt, SignOut } from "@phosphor-icons/react";
import { toast, Toaster } from "sonner";
import { api, formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { eur } from "../lib/format";

const CATEGORIES = [
  { id: "smart-home", label: "Maison Intelligente" },
  { id: "tech-gaming", label: "Tech & Gaming" },
  { id: "cuisine", label: "Cuisine" },
  { id: "habillement", label: "Habillement" },
  { id: "curios", label: "Curiosités" },
  { id: "numerique", label: "Numérique" },
  { id: "occasion", label: "Seconde Main" },
];

const empty = {
  name: "",
  tagline: "",
  category: "curios",
  price: 0,
  compare_at: null,
  is_new: false,
  best_seller: false,
  description: "",
  images: "",
  specs: "",
};

const Admin = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | productId
  const [form, setForm] = useState(empty);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([
        api.get("/products"),
        api.get("/admin/orders"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
    } catch (e) {
      toast.error(formatApiError(e, "Erreur chargement"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, o] = await Promise.all([
          api.get("/products"),
          api.get("/admin/orders"),
        ]);
        if (!cancelled) {
          setProducts(p.data);
          setOrders(o.data);
        }
      } catch (e) {
        if (!cancelled) toast.error(formatApiError(e, "Erreur chargement"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNew = () => {
    setForm(empty);
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      tagline: p.tagline || "",
      category: p.category,
      price: p.price,
      compare_at: p.compare_at,
      is_new: !!p.is_new,
      best_seller: !!p.best_seller,
      description: p.description || "",
      images: (p.images || []).join("\n"),
      specs: (p.specs || []).join("\n"),
    });
    setEditing(p.id);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(empty);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      category: form.category,
      price: Number(form.price) || 0,
      compare_at: form.compare_at ? Number(form.compare_at) : null,
      is_new: !!form.is_new,
      best_seller: !!form.best_seller,
      description: form.description.trim(),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      specs: form.specs.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing === "new") {
        const { data } = await api.post("/admin/products", payload);
        setProducts((arr) => [data, ...arr]);
        toast.success("Produit créé");
      } else {
        const { data } = await api.put(`/admin/products/${editing}`, payload);
        setProducts((arr) => arr.map((p) => (p.id === editing ? data : p)));
        toast.success("Produit modifié");
      }
      closeForm();
    } catch (err) {
      toast.error(formatApiError(err, "Erreur"));
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((arr) => arr.filter((p) => p.id !== id));
      toast.success("Produit supprimé");
    } catch (err) {
      toast.error(formatApiError(err, "Erreur suppression"));
    }
  };

  return (
    <div data-testid="admin-page" className="bg-background min-h-[80vh]">
      <Toaster position="top-center" />

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="overline">Console — Vol.04</p>
              <h1
                className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
                style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
              >
                Admin.
              </h1>
              <p className="mt-4 text-muted-foreground text-sm">
                Connecté en tant que <span className="font-mono">{user?.email}</span>
              </p>
            </div>
            <button
              onClick={logout}
              data-testid="admin-logout"
              className="overline border border-border px-4 py-2 inline-flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
            >
              <SignOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-8">
          <TabBtn active={tab === "products"} onClick={() => setTab("products")} testId="tab-products">
            <Package size={14} /> Produits ({products.length})
          </TabBtn>
          <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} testId="tab-orders">
            <Receipt size={14} /> Commandes ({orders.length})
          </TabBtn>
        </div>

        {tab === "products" && (
          <div data-testid="admin-products-tab">
            <div className="flex justify-between items-center mb-4">
              <p className="overline">Gestion du catalogue</p>
              <button
                onClick={openNew}
                data-testid="admin-new-product"
                className="overline bg-foreground text-background px-4 py-2 inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus size={14} weight="bold" /> Nouveau produit
              </button>
            </div>

            {loading ? (
              <p className="overline animate-pulse">Chargement…</p>
            ) : (
              <div className="border border-border overflow-x-auto">
                <table className="w-full text-sm" data-testid="admin-products-table">
                  <thead className="bg-secondary">
                    <tr className="text-left">
                      <Th>Produit</Th>
                      <Th>Catégorie</Th>
                      <Th>Prix</Th>
                      <Th>Flags</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-border" data-testid={`admin-row-${p.id}`}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-10 bg-muted shrink-0 overflow-hidden">
                              {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-display text-sm truncate">{p.name}</p>
                              <p className="overline text-muted-foreground">{p.id}</p>
                            </div>
                          </div>
                        </Td>
                        <Td className="font-mono text-xs">{p.category}</Td>
                        <Td className="font-mono">{eur(p.price)}</Td>
                        <Td>
                          <div className="flex gap-1 flex-wrap">
                            {p.is_new && <Pill>Nouveau</Pill>}
                            {p.best_seller && <Pill>Best</Pill>}
                            {p.compare_at && <Pill>Promo</Pill>}
                          </div>
                        </Td>
                        <Td className="text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              data-testid={`admin-edit-${p.id}`}
                              aria-label="Modifier"
                              className="grid h-9 w-9 place-items-center border border-border hover:bg-foreground hover:text-background"
                            >
                              <PencilSimple size={14} />
                            </button>
                            <button
                              onClick={() => removeProduct(p.id)}
                              data-testid={`admin-delete-${p.id}`}
                              aria-label="Supprimer"
                              className="grid h-9 w-9 place-items-center border border-border hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><Td className="text-center text-muted-foreground" colSpan={5}>Aucun produit.</Td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div data-testid="admin-orders-tab">
            <p className="overline mb-4">Toutes les commandes</p>
            {loading ? (
              <p className="overline animate-pulse">Chargement…</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground border border-border p-12 text-center">
                Aucune commande pour le moment.
              </p>
            ) : (
              <div className="space-y-3" data-testid="admin-orders-list">
                {orders.map((o) => (
                  <div key={o.id} className="border border-border p-4 sm:p-6" data-testid={`admin-order-${o.id}`}>
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <p className="font-mono text-xs">{o.id}</p>
                        <p className="font-display text-lg mt-1">{o.user_email}</p>
                        <p className="overline text-muted-foreground mt-1">
                          {new Date(o.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xl">{eur(o.total)}</p>
                        <p className="overline text-muted-foreground">{o.status}</p>
                      </div>
                    </div>
                    <ul className="mt-4 divide-y divide-border border-t border-border pt-3">
                      {o.items.map((it, i) => (
                        <li key={i} className="py-2 flex justify-between text-sm">
                          <span className="truncate">
                            <span className="font-mono text-xs mr-2">×{it.qty}</span>
                            {it.name}
                          </span>
                          <span className="font-mono text-xs">{eur(it.price * it.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-over form */}
      {editing && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={closeForm}
            data-testid="admin-form-overlay"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-background border-l border-border flex flex-col"
            data-testid="admin-form-drawer"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <p className="overline">
                {editing === "new" ? "Nouveau produit" : `Modifier — ${editing}`}
              </p>
              <button
                onClick={closeForm}
                data-testid="admin-form-close"
                aria-label="Fermer"
                className="grid h-10 w-10 place-items-center hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-5" data-testid="admin-product-form">
              <FormField label="Nom" testId="admin-form-name" required>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2"
                  data-testid="admin-form-name-input"
                />
              </FormField>
              <FormField label="Slogan" testId="admin-form-tagline">
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2"
                  data-testid="admin-form-tagline-input"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Catégorie" required>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2"
                    data-testid="admin-form-category"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Prix (€)" required>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2"
                    data-testid="admin-form-price"
                  />
                </FormField>
              </div>
              <FormField label="Prix barré (optionnel)">
                <input
                  type="number"
                  min="0"
                  value={form.compare_at ?? ""}
                  onChange={(e) => setForm({ ...form, compare_at: e.target.value || null })}
                  className="w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2"
                  data-testid="admin-form-compare-at"
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-transparent border border-border focus:border-foreground outline-none py-2 px-3"
                  data-testid="admin-form-description"
                />
              </FormField>
              <FormField label="Images (une URL par ligne)">
                <textarea
                  rows={3}
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full bg-transparent border border-border focus:border-foreground outline-none py-2 px-3 font-mono text-xs"
                  data-testid="admin-form-images"
                />
              </FormField>
              <FormField label="Specs (une par ligne)">
                <textarea
                  rows={3}
                  value={form.specs}
                  onChange={(e) => setForm({ ...form, specs: e.target.value })}
                  className="w-full bg-transparent border border-border focus:border-foreground outline-none py-2 px-3 font-mono text-xs"
                  data-testid="admin-form-specs"
                />
              </FormField>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                    data-testid="admin-form-is-new"
                    className="accent-foreground"
                  />
                  Nouveauté
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.best_seller}
                    onChange={(e) => setForm({ ...form, best_seller: e.target.checked })}
                    data-testid="admin-form-best-seller"
                    className="accent-foreground"
                  />
                  Best Seller
                </label>
              </div>
            </form>

            <div className="border-t border-border p-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeForm}
                data-testid="admin-form-cancel"
                className="overline border border-border px-5 py-3 hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                onClick={submit}
                data-testid="admin-form-submit"
                className="overline bg-foreground text-background px-5 py-3 hover:opacity-90"
              >
                {editing === "new" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, children, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`overline px-4 py-3 inline-flex items-center gap-2 border-b-2 transition-colors ${
      active ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const Th = ({ children, className = "" }) => (
  <th className={`overline text-xs px-4 py-3 ${className}`}>{children}</th>
);
const Td = ({ children, className = "", ...rest }) => (
  <td className={`px-4 py-3 align-middle ${className}`} {...rest}>{children}</td>
);
const Pill = ({ children }) => (
  <span className="overline border border-border px-2 py-0.5 text-[10px]">{children}</span>
);
const FormField = ({ label, required, children }) => (
  <label className="block">
    <span className="overline text-muted-foreground">{label}{required ? " *" : ""}</span>
    <div className="mt-1">{children}</div>
  </label>
);

export default Admin;
