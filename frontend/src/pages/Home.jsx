import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Asterisk } from "@phosphor-icons/react";
import ProductCard from "../components/ProductCard";
import Marquee from "../components/Marquee";
import { useProducts } from "../hooks/useProducts";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const Home = () => {
  const { products } = useProducts();
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);
  const newDrops = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <div data-testid="home-page" className="bg-background">
      {/* HERO */}
      <section className="relative border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[88vh]">
          <div className="lg:col-span-7 relative grain overflow-hidden border-r border-border bg-muted">
            <motion.img
              initial={{ scale: 1.06, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              src="https://images.pexels.com/photos/11317811/pexels-photo-11317811.jpeg"
              alt="MALIN Vol.04"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/10" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-background mix-blend-difference">
              <p className="overline">Vol.04 — Drop 02 / 2026</p>
              <p className="font-mono text-xs hidden sm:block">FR · EUR</p>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12">
            <motion.div initial="hidden" animate="show" variants={fade}>
              <p className="overline">Maison MALIN — Édition Limitée</p>
              <h1
                data-testid="hero-heading"
                className="font-display font-medium leading-[0.88] tracking-[-0.04em] mt-6 text-balance"
                style={{ fontSize: "clamp(56px, 9vw, 168px)" }}
              >
                Smart<br />Everyday.
              </h1>
              <p className="mt-8 max-w-md text-base text-muted-foreground">
                Une curation d’objets malins — gadgets, accessoires tech, pièces de cuisine et
                vêtements — présentés comme des pièces de collection. Sélection limitée,
                expédition mondiale.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/shop"
                data-testid="hero-shop-cta"
                className="inline-flex items-center justify-between gap-6 bg-foreground text-background overline px-6 py-4 hover:opacity-90 transition-opacity"
              >
                Shop the Drop <ArrowRight size={16} weight="bold" />
              </Link>
              <a
                href="#story"
                data-testid="hero-story-cta"
                className="inline-flex items-center justify-between gap-6 border border-foreground overline px-6 py-4 hover:bg-foreground hover:text-background transition-colors"
              >
                Notre Histoire <ArrowUpRight size={16} weight="light" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* COLLECTIONS — Tetris grid */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6 mb-10 sm:mb-16">
            <div>
              <p className="overline">N°01 — Collections</p>
              <h2 className="font-display text-4xl sm:text-6xl font-light tracking-tight mt-3">
                Sept territoires.<br />Une seule règle : être malin.
              </h2>
            </div>
            <Link
              to="/shop"
              data-testid="collections-all"
              className="hidden md:inline-flex overline items-center gap-2 hover:opacity-60"
            >
              Tout voir <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-12 grid-rows-[200px_200px_200px] sm:grid-rows-[220px_220px_220px] gap-3">
            <CollectionTile
              to="/shop?cat=smart-home"
              className="col-span-7 row-span-2"
              label="Maison Intelligente"
              n="01"
              img="https://images.pexels.com/photos/5208869/pexels-photo-5208869.jpeg"
            />
            <CollectionTile
              to="/shop?cat=tech-gaming"
              className="col-span-5 row-span-1"
              label="Tech & Gaming"
              n="02"
              img="https://images.unsplash.com/photo-1615655406736-b37c4fabf923"
            />
            <CollectionTile
              to="/shop?cat=cuisine"
              className="col-span-5 row-span-2"
              label="Cuisine"
              n="03"
              img="https://images.unsplash.com/photo-1769326541255-c6612ab334a0"
            />
            <CollectionTile
              to="/shop?cat=habillement"
              className="col-span-5 row-span-1"
              label="Habillement"
              n="04"
              img="https://images.pexels.com/photos/11317811/pexels-photo-11317811.jpeg"
            />
            <CollectionTile
              to="/shop?cat=curios"
              className="col-span-4 row-span-1"
              label="Curiosités"
              n="05"
              img="https://images.unsplash.com/photo-1595303526913-c7037797ebe7"
            />
            <CollectionTile
              to="/shop?cat=numerique"
              className="col-span-4 row-span-1"
              label="Numérique"
              n="06"
              img="https://images.unsplash.com/photo-1468495244123-6c6c332eeece"
            />
            <CollectionTile
              to="/shop?cat=occasion"
              className="col-span-4 row-span-1"
              label="Seconde Main"
              n="07"
              img="https://images.unsplash.com/photo-1778049692415-736a34626d9a"
            />
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="border-b border-border" data-testid="best-sellers-section">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6 mb-10 sm:mb-16">
            <div>
              <p className="overline">N°02 — Best Sellers</p>
              <h2 className="font-display text-4xl sm:text-6xl font-light tracking-tight mt-3">
                Ce que vous prenez.
              </h2>
            </div>
            <Link to="/shop" className="overline inline-flex items-center gap-2 hover:opacity-60">
              Tout voir <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {bestSellers.map((p, i) => (
              <ProductCard product={p} index={i} key={p.id} />
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section id="story" className="border-b border-border" data-testid="brand-story-section">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-20 sm:py-32 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/4] grain bg-muted overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1559697242-a465f2578a95"
                alt="MALIN studio"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 lg:pl-12 flex flex-col justify-between">
            <p className="overline">N°03 — Manifesto</p>
            <h3 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.02] mt-6">
              “On vend des objets ordinaires.<br />
              <span className="italic">Avec l’attention qu’on réserve au luxe.</span>”
            </h3>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Un détecteur de caméra, une ampoule, un couteau. Des objets utiles, choisis
                un par un, photographiés comme des bijoux. La marque MALIN est née d’une idée
                simple : la qualité ne doit pas être réservée aux pièces rares.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Chaque drop est limité. Chaque produit est testé en interne pendant 30 jours
                avant d’entrer dans le catalogue. Nous refusons plus que nous n’acceptons.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-3">
              <Asterisk size={20} weight="light" />
              <span className="overline">Studio Paris — Vol.04 / 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW DROPS */}
      <section className="border-b border-border" data-testid="new-drops-section">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6 mb-10 sm:mb-16">
            <div>
              <p className="overline">N°04 — Nouveautés</p>
              <h2 className="font-display text-4xl sm:text-6xl font-light tracking-tight mt-3">
                Ce mois-ci.
              </h2>
            </div>
            <Link to="/shop" className="overline inline-flex items-center gap-2 hover:opacity-60">
              Tout voir <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {newDrops.map((p, i) => (
              <ProductCard product={p} index={i} key={p.id} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const CollectionTile = ({ to, className = "", label, n, img }) => (
  <Link
    to={to}
    className={`relative group overflow-hidden border border-border bg-muted ${className}`}
    data-testid={`collection-tile-${label.toLowerCase().replace(/\s+/g, "-")}`}
  >
    <img
      src={img}
      alt={label}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/30 transition-colors" />
    <div className="absolute inset-0 p-5 flex flex-col justify-between text-background mix-blend-difference">
      <p className="font-mono text-xs">N°{n}</p>
      <div className="flex items-end justify-between">
        <p className="font-display text-2xl sm:text-3xl leading-none">{label}</p>
        <ArrowUpRight size={22} weight="light" className="opacity-90" />
      </div>
    </div>
  </Link>
);

export default Home;
