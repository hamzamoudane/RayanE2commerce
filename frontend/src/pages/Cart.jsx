import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash, ArrowRight, ShoppingBag } from "@phosphor-icons/react";
import { useCart } from "../context/CartContext";
import { eur } from "../lib/format";

const Cart = () => {
  const { items, subtotal, count, setQty, remove, clear } = useCart();
  const shipping = items.length === 0 ? 0 : subtotal >= 200 ? 0 : 9;
  const total = subtotal + shipping;

  return (
    <div data-testid="cart-page" className="bg-background">
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-20">
          <p className="overline">Étape 01 / 02 — Panier</p>
          <h1
            className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
            style={{ fontSize: "clamp(56px, 10vw, 168px)" }}
          >
            Votre Sélection.
          </h1>
          <p className="mt-6 text-muted-foreground">
            {count > 0
              ? `${count} ${count > 1 ? "articles" : "article"} en attente.`
              : "Aucun article pour le moment."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {items.length === 0 ? (
            <div className="border border-border p-12 text-center flex flex-col items-center gap-4" data-testid="cart-empty">
              <ShoppingBag size={36} weight="light" />
              <h3 className="font-display text-3xl">Le panier attend.</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Allez piocher quelques objets dans notre catalogue.
              </p>
              <Link
                to="/shop"
                className="mt-4 overline border border-foreground px-5 py-3 inline-flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
                data-testid="cart-empty-shop-cta"
              >
                Découvrir <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border" data-testid="cart-items-list">
              <AnimatePresence initial={false}>
                {items.map((it) => (
                  <motion.li
                    key={it.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4 sm:gap-6 py-6"
                    data-testid={`cart-row-${it.id}`}
                  >
                    <Link to={`/product/${it.id}`} className="h-32 w-24 sm:h-40 sm:w-32 shrink-0 bg-muted overflow-hidden block">
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/product/${it.id}`} className="font-display text-xl sm:text-2xl leading-tight">
                            {it.name}
                          </Link>
                          <p className="overline mt-1 text-muted-foreground">Réf. {it.id.toUpperCase()}</p>
                        </div>
                        <p className="font-mono text-sm shrink-0">{eur(it.price * it.qty)}</p>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                        <div className="inline-flex items-center border border-border">
                          <button
                            onClick={() => setQty(it.id, it.qty - 1)}
                            data-testid={`cart-page-dec-${it.id}`}
                            className="grid h-10 w-10 place-items-center hover:bg-secondary"
                            aria-label="Diminuer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-mono text-sm w-10 text-center">{it.qty}</span>
                          <button
                            onClick={() => setQty(it.id, it.qty + 1)}
                            data-testid={`cart-page-inc-${it.id}`}
                            className="grid h-10 w-10 place-items-center hover:bg-secondary"
                            aria-label="Augmenter"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(it.id)}
                          data-testid={`cart-page-remove-${it.id}`}
                          className="overline inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Trash size={14} /> Retirer
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {items.length > 0 && (
            <div className="flex justify-between items-center mt-6 text-xs">
              <Link to="/shop" className="overline inline-flex items-center gap-2 hover:opacity-60" data-testid="cart-continue">
                ← Continuer
              </Link>
              <button
                onClick={clear}
                data-testid="cart-clear"
                className="overline text-muted-foreground hover:text-foreground"
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start border border-border p-6 sm:p-8 bg-card" data-testid="cart-summary">
          <p className="overline mb-6">Récapitulatif</p>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Sous-total</dt>
              <dd className="font-mono" data-testid="summary-subtotal">{eur(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Livraison</dt>
              <dd className="font-mono" data-testid="summary-shipping">
                {shipping === 0 ? "Offerte" : eur(shipping)}
              </dd>
            </div>
            {subtotal > 0 && subtotal < 200 && (
              <p className="text-xs text-muted-foreground">
                Plus que {eur(200 - subtotal)} pour la livraison offerte.
              </p>
            )}
          </dl>
          <div className="border-t border-border mt-6 pt-4 flex justify-between items-baseline">
            <p className="overline">Total</p>
            <p className="font-mono text-xl" data-testid="summary-total">{eur(total)}</p>
          </div>

          <Link
            to="/checkout"
            data-testid="cart-page-checkout"
            className={`mt-6 block text-center overline bg-foreground text-background py-4 transition-opacity ${
              items.length === 0 ? "pointer-events-none opacity-40" : "hover:opacity-90"
            }`}
          >
            Passer au paiement →
          </Link>
          <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
            Paiement sécurisé. Stripe sera intégré à l’étape backend. CB, Apple Pay, PayPal.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
