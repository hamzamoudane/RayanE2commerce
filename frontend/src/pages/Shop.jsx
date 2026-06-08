import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CaretDown, X } from "@phosphor-icons/react";
import { CATEGORIES, PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";

const SORTS = [
  { id: "feat", label: "Curation" },
  { id: "new", label: "Nouveautés" },
  { id: "asc", label: "Prix croissant" },
  { id: "desc", label: "Prix décroissant" },
];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "all";
  const [sort, setSort] = useState("feat");
  const [maxPrice, setMaxPrice] = useState(600);
  const [openSort, setOpenSort] = useState(false);

  const setCat = (id) => {
    if (id === "all") params.delete("cat");
    else params.set("cat", id);
    setParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.price <= maxPrice);
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "new") list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [cat, sort, maxPrice]);

  const currentCat = CATEGORIES.find((c) => c.id === cat);

  return (
    <div data-testid="shop-page" className="bg-background">
      {/* HEAD */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-20">
          <p className="overline">Catalogue — Vol.04</p>
          <motion.h1
            key={cat}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
            style={{ fontSize: "clamp(56px, 10vw, 168px)" }}
          >
            {currentCat ? currentCat.label : "Tout."}
          </motion.h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            {filtered.length} {filtered.length > 1 ? "pièces" : "pièce"} sélectionnées avec
            obsession. Toutes nos commandes sont préparées sous 24h depuis Paris.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* FILTERS */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start space-y-10">
          <div>
            <p className="overline mb-4">Catégorie</p>
            <ul className="space-y-2 border-t border-border">
              <FilterRow
                label="Tout"
                count={PRODUCTS.length}
                active={cat === "all"}
                onClick={() => setCat("all")}
                testId="filter-cat-all"
              />
              {CATEGORIES.map((c) => (
                <FilterRow
                  key={c.id}
                  label={c.label}
                  count={PRODUCTS.filter((p) => p.category === c.id).length}
                  active={cat === c.id}
                  onClick={() => setCat(c.id)}
                  testId={`filter-cat-${c.id}`}
                />
              ))}
            </ul>
          </div>

          <div>
            <div className="flex justify-between items-baseline">
              <p className="overline">Prix max</p>
              <p className="font-mono text-sm" data-testid="filter-price-value">
                {maxPrice}€
              </p>
            </div>
            <input
              type="range"
              min={20}
              max={600}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              data-testid="filter-price-range"
              className="w-full mt-3 accent-foreground"
            />
            <div className="flex justify-between font-mono text-[10px] mt-1 text-muted-foreground">
              <span>20€</span>
              <span>600€</span>
            </div>
          </div>

          {(cat !== "all" || maxPrice < 600 || sort !== "feat") && (
            <button
              onClick={() => {
                setCat("all");
                setMaxPrice(600);
                setSort("feat");
              }}
              data-testid="filter-reset"
              className="overline inline-flex items-center gap-2 hover:opacity-60"
            >
              <X size={14} /> Réinitialiser
            </button>
          )}
        </aside>

        {/* GRID */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <p className="overline">{filtered.length} produits</p>
            <div className="relative">
              <button
                onClick={() => setOpenSort((v) => !v)}
                data-testid="sort-button"
                className="overline inline-flex items-center gap-2 border border-border px-4 py-2 hover:bg-secondary"
              >
                Trier : {SORTS.find((s) => s.id === sort)?.label}
                <CaretDown size={12} />
              </button>
              {openSort && (
                <div
                  className="absolute right-0 mt-1 w-56 border border-border bg-background z-30"
                  data-testid="sort-menu"
                >
                  {SORTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSort(s.id);
                        setOpenSort(false);
                      }}
                      data-testid={`sort-${s.id}`}
                      className={`w-full text-left overline px-4 py-3 hover:bg-secondary ${
                        sort === s.id ? "bg-secondary" : ""
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-32" data-testid="empty-state">
              <p className="font-display text-3xl">Aucun produit trouvé.</p>
              <p className="text-sm text-muted-foreground mt-3">
                Essayez d’élargir vos filtres.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((p, i) => (
                <ProductCard product={p} index={i} key={p.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterRow = ({ label, count, active, onClick, testId }) => (
  <li className="border-b border-border">
    <button
      onClick={onClick}
      data-testid={testId}
      className={`w-full flex items-center justify-between py-3 text-sm transition-colors hover:opacity-100 ${
        active ? "opacity-100" : "opacity-70"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className={`block h-1.5 w-1.5 ${active ? "bg-foreground" : "bg-transparent border border-foreground"}`}
        />
        {label}
      </span>
      <span className="font-mono text-xs text-muted-foreground">{count}</span>
    </button>
  </li>
);

export default Shop;
