import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, ShoppingBag, List, X, MagnifyingGlass } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=smart-home", label: "Maison" },
  { to: "/shop?cat=tech-gaming", label: "Tech" },
  { to: "/shop?cat=cuisine", label: "Cuisine" },
  { to: "/shop?cat=habillement", label: "Habillement" },
  { to: "/shop?cat=curios", label: "Curiosités" },
];

export const Header = () => {
  const { theme, toggle } = useTheme();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`sticky top-0 z-40 backdrop-blur-xl transition-colors ${
        scrolled
          ? "bg-background/85 border-b border-border"
          : "bg-background/60 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          data-testid="logo-link"
          className="font-display text-2xl tracking-tight leading-none"
        >
          <span className="font-semibold">MALIN</span>
          <sup className="overline ml-1 align-super text-[8px] opacity-60">®</sup>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `overline transition-opacity hover:opacity-60 ${
                  isActive ? "opacity-100" : "opacity-80"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Recherche"
            data-testid="search-button"
            className="hidden sm:grid h-10 w-10 place-items-center hover:bg-secondary"
          >
            <MagnifyingGlass size={18} weight="light" />
          </button>
          <button
            aria-label="Basculer thème"
            data-testid="theme-toggle"
            onClick={toggle}
            className="grid h-10 w-10 place-items-center hover:bg-secondary"
          >
            {theme === "dark" ? <Sun size={18} weight="light" /> : <Moon size={18} weight="light" />}
          </button>
          <button
            data-testid="cart-button"
            onClick={() => setOpen(true)}
            className="relative grid h-10 w-10 place-items-center hover:bg-secondary"
            aria-label="Panier"
          >
            <ShoppingBag size={18} weight="light" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center bg-foreground text-background text-[10px] font-mono px-1"
                data-testid="cart-count-badge"
              >
                {count}
              </motion.span>
            )}
          </button>
          <button
            aria-label="Menu"
            data-testid="mobile-menu-button"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 place-items-center lg:hidden hover:bg-secondary"
          >
            <List size={20} weight="light" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-background lg:hidden"
          data-testid="mobile-menu"
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <span className="font-display text-2xl font-semibold">MALIN</span>
            <button
              aria-label="Fermer"
              data-testid="mobile-menu-close"
              onClick={() => setMenuOpen(false)}
              className="grid h-10 w-10 place-items-center hover:bg-secondary"
            >
              <X size={20} weight="light" />
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="font-display text-3xl"
                data-testid={`mobile-nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
