import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "@phosphor-icons/react";
import { eur } from "../lib/format";
import { useCart } from "../context/CartContext";

export const ProductCard = ({ product, index = 0 }) => {
  const { add } = useCart();
  const [hover, setHover] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex flex-col border border-border bg-card"
      data-testid={`product-card-${product.id}`}
    >
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden bg-muted aspect-[4/5]"
        data-testid={`product-link-${product.id}`}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
            hover ? "scale-105 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alt`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
              hover ? "scale-105 opacity-100" : "scale-110 opacity-0"
            }`}
          />
        )}
        {product.isNew && (
          <span className="absolute left-3 top-3 overline bg-background/90 px-2 py-1 text-foreground">
            Nouveau
          </span>
        )}
        {product.compareAt && (
          <span className="absolute right-3 top-3 overline bg-foreground text-background px-2 py-1">
            -{Math.round(((product.compareAt - product.price) / product.compareAt) * 100)}%
          </span>
        )}
      </Link>

      <div className="flex items-start justify-between gap-4 p-4 border-t border-border">
        <div className="min-w-0">
          <Link
            to={`/product/${product.id}`}
            className="font-display text-base sm:text-lg leading-tight tracking-tight truncate block"
          >
            {product.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-1 truncate">{product.tagline}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-sm">{eur(product.price)}</p>
          {product.compareAt && (
            <p className="font-mono text-[11px] text-muted-foreground line-through">
              {eur(product.compareAt)}
            </p>
          )}
        </div>
      </div>

      <div className="flex border-t border-border">
        <Link
          to={`/product/${product.id}`}
          className="flex-1 overline px-4 py-3 inline-flex items-center justify-between hover:bg-secondary transition-colors"
          data-testid={`view-product-${product.id}`}
        >
          Voir <ArrowUpRight size={14} weight="light" />
        </Link>
        <button
          onClick={() => add(product, 1)}
          data-testid={`add-to-cart-${product.id}`}
          className="overline px-4 py-3 border-l border-border inline-flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
        >
          <Plus size={14} weight="bold" /> Panier
        </button>
      </div>
    </motion.article>
  );
};

export default ProductCard;
