import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "@phosphor-icons/react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api, formatApiError } from "../lib/api";
import { eur } from "../lib/format";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0 && !done) return <Navigate to="/cart" replace />;

  const shipping = subtotal >= 200 ? 0 : 9;
  const total = subtotal + shipping;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: fd.get("email"),
      first_name: fd.get("first"),
      last_name: fd.get("last"),
      address: fd.get("address"),
      city: fd.get("city"),
      zip: fd.get("zip"),
      country: fd.get("country") || "France",
      phone: fd.get("phone") || "",
      items: items.map((it) => ({
        product_id: it.id,
        name: it.name,
        price: it.price,
        qty: it.qty,
        image: it.image || "",
      })),
    };
    try {
      const { data } = await api.post("/orders", payload);
      setOrderId(data.id);
      setDone(true);
      setTimeout(() => clear(), 400);
    } catch (err) {
      setError(formatApiError(err, "Erreur paiement"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-6 py-20" data-testid="checkout-confirmation">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl text-center border border-border p-10"
        >
          <CheckCircle size={48} weight="light" className="mx-auto" />
          <p className="overline mt-6">Commande confirmée</p>
          <h1 className="font-display text-5xl sm:text-6xl mt-3 leading-tight">Merci.</h1>
          {orderId && (
            <p className="mt-3 font-mono text-xs text-muted-foreground" data-testid="order-id">
              Réf. {orderId}
            </p>
          )}
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Votre commande a été enregistrée. Le paiement Stripe sera activé prochainement — pour
            l’instant, le statut est marqué comme <span className="font-mono">paid</span> en mode démo.
            Vous la retrouvez dans <Link to="/account" className="underline">votre compte</Link>.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              data-testid="checkout-back-home"
              className="overline border border-foreground px-6 py-4 hover:bg-foreground hover:text-background transition-colors"
            >
              Retour à l’accueil
            </button>
            <Link
              to="/account"
              data-testid="checkout-see-orders"
              className="overline bg-foreground text-background px-6 py-4 hover:opacity-90 transition-opacity"
            >
              Mes commandes
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="bg-background">
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-16">
          <p className="overline">Étape 02 / 02 — Paiement</p>
          <h1
            className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
            style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
          >
            Finalisation.
          </h1>
        </div>
      </section>

      <form
        onSubmit={submit}
        data-testid="checkout-form"
        className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        <div className="lg:col-span-7 space-y-12">
          <Section title="Coordonnées" n="01">
            <Field label="Email" name="email" type="email" testId="checkout-email" defaultValue={user?.email || ""} required />
          </Section>

          <Section title="Livraison" n="02">
            <div className="grid grid-cols-2 gap-x-6">
              <Field label="Prénom" name="first" testId="checkout-first" required />
              <Field label="Nom" name="last" testId="checkout-last" required />
              <Field label="Adresse" name="address" testId="checkout-address" required full />
              <Field label="Ville" name="city" testId="checkout-city" required />
              <Field label="Code postal" name="zip" testId="checkout-zip" required />
              <Field label="Pays" name="country" defaultValue="France" testId="checkout-country" required />
              <Field label="Téléphone" name="phone" type="tel" testId="checkout-phone" />
            </div>
          </Section>

          <Section title="Paiement" n="03">
            <div className="border border-dashed border-border p-6 text-sm text-muted-foreground flex items-start gap-3" data-testid="stripe-placeholder">
              <Lock size={18} weight="light" className="mt-0.5" />
              <div>
                <p className="text-foreground font-medium">Stripe — branchement à venir</p>
                <p className="mt-1 leading-relaxed">
                  La commande sera enregistrée dans la base. L’encaissement Stripe réel sera
                  activé dans une prochaine itération.
                </p>
              </div>
            </div>
            {error && (
              <p data-testid="checkout-error" className="mt-3 text-sm text-destructive border border-destructive/50 p-3">
                {error}
              </p>
            )}
          </Section>
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start border border-border p-6 sm:p-8 bg-card">
          <p className="overline mb-6">Récapitulatif</p>
          <ul className="divide-y divide-border max-h-72 overflow-y-auto">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3" data-testid={`checkout-line-${it.id}`}>
                <div className="h-16 w-14 bg-muted shrink-0 overflow-hidden">
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm truncate">{it.name}</p>
                  <p className="overline text-muted-foreground mt-1">Qté {it.qty}</p>
                </div>
                <p className="font-mono text-xs">{eur(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-border pt-4">
            <Row label="Sous-total" value={eur(subtotal)} />
            <Row label="Livraison" value={shipping === 0 ? "Offerte" : eur(shipping)} />
            <div className="flex justify-between border-t border-border pt-3 mt-1">
              <p className="overline">Total</p>
              <p className="font-mono text-lg" data-testid="checkout-total">{eur(total)}</p>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            data-testid="checkout-submit"
            className="mt-6 w-full overline bg-foreground text-background py-4 inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            <Lock size={14} /> {submitting ? "Traitement…" : `Payer ${eur(total)}`}
          </button>

          <Link to="/cart" className="mt-4 block text-center overline opacity-70 hover:opacity-100" data-testid="checkout-back-cart">
            ← Modifier le panier
          </Link>
        </aside>
      </form>
    </div>
  );
};

const Section = ({ title, n, children }) => (
  <div>
    <div className="flex items-baseline gap-4 mb-6">
      <p className="font-mono text-xs text-muted-foreground">N°{n}</p>
      <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, name, type = "text", testId, required, full, defaultValue }) => (
  <label className={`block py-2 ${full ? "col-span-2" : ""}`}>
    <span className="overline text-muted-foreground">{label}{required ? " *" : ""}</span>
    <input
      type={type}
      name={name}
      defaultValue={defaultValue}
      required={required}
      data-testid={testId}
      className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2 text-sm transition-colors"
    />
  </label>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-mono">{value}</dd>
  </div>
);

export default Checkout;
