import React, { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Minus, ShieldCheck, Truck, ArrowsClockwise } from "@phosphor-icons/react";
import { findProduct, similarProducts } from "../data/products";
import { useCart } from "../context/CartContext";
import { eur } from "../lib/format";
import ProductCard from "../components/ProductCard";
import { toast, Toaster } from "sonner";

const Product = () => {
  const { id } = useParams();
  const product = findProduct(id);
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return <Navigate to="/shop" replace />;

  const similar = similarProducts(product);

  const handleAdd = () => {
    add(product, qty);
    toast.success(`${product.name} — ajouté au panier`, { duration: 2200 });
  };

  return (
    <div data-testid="product-page" className="bg-background">
      <Toaster position="top-center" />

      {/* breadcrumb */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-4 flex items-center gap-3 text-xs">
          <Link to="/shop" className="overline inline-flex items-center gap-2 hover:opacity-60" data-testid="back-to-shop">
            <ArrowLeft size={14} /> Boutique
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="overline text-muted-foreground truncate">{product.name}</span>
        </div>
      </div>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery — asymmetric */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-3">
            <motion.div
              key={`hero-${activeImg}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-12 aspect-[4/5] bg-muted relative overflow-hidden border border-border"
            >
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
                data-testid="product-image-hero"
              />
            </motion.div>
            <div className="col-span-12 grid grid-cols-4 gap-3">
              {product.images.concat(product.images).slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i % product.images.length)}
                  data-testid={`product-thumb-${i}`}
                  className={`relative aspect-square bg-muted overflow-hidden border ${
                    activeImg === i % product.images.length ? "border-foreground" : "border-border"
                  }`}
                >
                  <img src={src} alt={`thumb ${i}`} className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info — sticky */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <p className="overline">Réf. {product.id.toUpperCase()}</p>
            <h1
              data-testid="product-name"
              className="font-display font-light tracking-tight mt-4 leading-[0.95]"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              {product.name}
            </h1>
            <p className="mt-3 italic text-muted-foreground">{product.tagline}</p>

            <div className="mt-8 flex items-baseline gap-4">
              <p className="font-mono text-2xl" data-testid="product-price">{eur(product.price)}</p>
              {product.compareAt && (
                <p className="font-mono text-base text-muted-foreground line-through">
                  {eur(product.compareAt)}
                </p>
              )}
            </div>

            <p className="mt-8 text-sm leading-relaxed text-foreground/80" data-testid="product-description">
              {product.description}
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-4">
              {product.specs.map((s, i) => (
                <li key={i} className="font-mono text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-foreground">·</span>{s}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-stretch gap-3">
              <div className="inline-flex items-center border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  data-testid="qty-decrement"
                  className="grid h-12 w-12 place-items-center hover:bg-secondary"
                  aria-label="Diminuer"
                >
                  <Minus size={14} />
                </button>
                <span data-testid="qty-value" className="font-mono w-10 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  data-testid="qty-increment"
                  className="grid h-12 w-12 place-items-center hover:bg-secondary"
                  aria-label="Augmenter"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                data-testid="add-to-cart-button"
                className="flex-1 overline bg-foreground text-background h-12 px-6 inline-flex items-center justify-between gap-4 hover:opacity-90 transition-opacity"
              >
                Ajouter au panier <span>{eur(product.price * qty)}</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-xs">
              <div className="flex flex-col items-start gap-1">
                <Truck size={20} weight="light" />
                <p className="overline">Livraison 48h</p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <ShieldCheck size={20} weight="light" />
                <p className="overline">Garantie 2 ans</p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <ArrowsClockwise size={20} weight="light" />
                <p className="overline">Retour 30 jours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="border-b border-border" data-testid="similar-section">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-16 sm:py-24">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-display text-3xl sm:text-5xl font-light tracking-tight">
                Dans la même veine.
              </h2>
              <Link to="/shop" className="overline hover:opacity-60">Tout voir</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {similar.map((p, i) => (
                <ProductCard product={p} index={i} key={p.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
