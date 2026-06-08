import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash, ArrowRight } from "@phosphor-icons/react";
import { useCart } from "../context/CartContext";
import { eur } from "../lib/format";

export const CartDrawer = () => {
  const { items, open, setOpen, subtotal, setQty, remove, count } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            data-testid="cart-overlay"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md flex flex-col bg-background border-l border-border"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <p className="overline">Votre Sélection — {count}</p>
              <button
                aria-label="Fermer le panier"
                data-testid="cart-close"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center hover:bg-secondary"
              >
                <X size={18} weight="light" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
                <h3 className="font-display text-3xl">Panier vide.</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des objets malins à votre sélection.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="overline border border-foreground px-5 py-3 inline-flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
                  data-testid="cart-empty-cta"
                >
                  Découvrir <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto divide-y divide-border">
                  {items.map((it) => (
                    <li key={it.id} className="flex gap-4 p-4" data-testid={`cart-item-${it.id}`}>
                      <div className="h-24 w-20 shrink-0 bg-muted overflow-hidden">
                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex justify-between gap-3">
                          <p className="font-display text-base leading-tight truncate pr-2">{it.name}</p>
                          <button
                            onClick={() => remove(it.id)}
                            aria-label="Supprimer"
                            data-testid={`cart-remove-${it.id}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash size={16} weight="light" />
                          </button>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="inline-flex items-center border border-border">
                            <button
                              onClick={() => setQty(it.id, it.qty - 1)}
                              data-testid={`cart-decrement-${it.id}`}
                              className="grid h-8 w-8 place-items-center hover:bg-secondary"
                              aria-label="Diminuer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-mono text-sm w-8 text-center" data-testid={`cart-qty-${it.id}`}>
                              {it.qty}
                            </span>
                            <button
                              onClick={() => setQty(it.id, it.qty + 1)}
                              data-testid={`cart-increment-${it.id}`}
                              className="grid h-8 w-8 place-items-center hover:bg-secondary"
                              aria-label="Augmenter"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="font-mono text-sm">{eur(it.price * it.qty)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border p-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="overline">Sous-total</p>
                    <p className="font-mono text-sm" data-testid="cart-subtotal">{eur(subtotal)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Livraison et taxes calculées au paiement.
                  </p>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    data-testid="cart-view-full"
                    className="block text-center overline border border-foreground py-3 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Voir le panier
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    data-testid="cart-checkout"
                    className="block text-center overline bg-foreground text-background py-3 hover:opacity-90 transition-opacity"
                  >
                    Passer au paiement →
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
