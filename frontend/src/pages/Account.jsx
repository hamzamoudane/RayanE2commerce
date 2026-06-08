import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Receipt, SignOut, ArrowRight } from "@phosphor-icons/react";
import { api, formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { eur } from "../lib/format";
import { toast, Toaster } from "sonner";

const Account = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/orders/me");
        setOrders(data);
      } catch (e) {
        toast.error(formatApiError(e, "Erreur"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div data-testid="account-page" className="bg-background min-h-[70vh]">
      <Toaster position="top-center" />
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-16">
          <p className="overline">Mon compte — Vol.04</p>
          <h1
            className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
            style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
          >
            Bonjour{user?.name ? `, ${user.name}.` : "."}
          </h1>
          <div className="flex flex-wrap gap-3 items-center mt-6">
            <span className="font-mono text-sm text-muted-foreground" data-testid="account-email">{user?.email}</span>
            <span className="overline border border-border px-2 py-0.5 text-[10px]">{user?.role}</span>
            <button
              onClick={logout}
              data-testid="account-logout"
              className="overline border border-border px-3 py-1.5 inline-flex items-center gap-2 hover:bg-foreground hover:text-background ml-auto"
            >
              <SignOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10">
        <div className="flex items-baseline gap-3 mb-6">
          <Receipt size={18} weight="light" />
          <h2 className="font-display text-3xl">Mes commandes</h2>
        </div>

        {loading ? (
          <p className="overline animate-pulse">Chargement…</p>
        ) : orders.length === 0 ? (
          <div className="border border-border p-12 text-center" data-testid="account-no-orders">
            <p className="font-display text-2xl">Aucune commande.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Vos achats apparaîtront ici une fois passés.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex overline border border-foreground px-5 py-3 items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
              data-testid="account-shop-cta"
            >
              Découvrir <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-testid="account-orders-list">
            {orders.map((o, idx) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-border p-4 sm:p-6"
                data-testid={`account-order-${o.id}`}
              >
                <div className="flex justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-mono text-xs">{o.id}</p>
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
