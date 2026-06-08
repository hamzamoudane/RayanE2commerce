import React from "react";
import { Link } from "react-router-dom";
import { InstagramLogo, TiktokLogo, YoutubeLogo, ArrowUpRight } from "@phosphor-icons/react";

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="relative border-t border-border bg-background text-foreground"
    >
      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 border-b border-border pb-12">
          <div className="md:col-span-5">
            <p className="overline opacity-60">Newsletter — Vol.04</p>
            <h3 className="font-display text-3xl sm:text-4xl mt-3 leading-[1.05]">
              Recevez les drops avant tout le monde.
            </h3>
            <form
              data-testid="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                e.currentTarget.reset();
              }}
              className="mt-6 flex items-center border-b border-foreground/60"
            >
              <input
                data-testid="newsletter-email"
                type="email"
                required
                placeholder="votre@email.com"
                className="w-full bg-transparent py-3 outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                data-testid="newsletter-submit"
                className="overline px-4 py-3 hover:bg-foreground hover:text-background transition-colors"
              >
                S’inscrire
              </button>
            </form>
          </div>

          <div className="md:col-span-2">
            <p className="overline opacity-60">Boutique</p>
            <ul className="mt-4 space-y-2">
              <li><Link to="/shop" className="hover:opacity-60">Tout</Link></li>
              <li><Link to="/shop?cat=smart-home" className="hover:opacity-60">Maison</Link></li>
              <li><Link to="/shop?cat=tech-gaming" className="hover:opacity-60">Tech</Link></li>
              <li><Link to="/shop?cat=cuisine" className="hover:opacity-60">Cuisine</Link></li>
              <li><Link to="/shop?cat=habillement" className="hover:opacity-60">Habillement</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="overline opacity-60">Maison</p>
            <ul className="mt-4 space-y-2">
              <li><a className="hover:opacity-60" href="#story">Notre Histoire</a></li>
              <li><a className="hover:opacity-60" href="#">Journal</a></li>
              <li><a className="hover:opacity-60" href="#">Boutiques</a></li>
              <li><a className="hover:opacity-60" href="#">Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="overline opacity-60">Suivez</p>
            <div className="mt-4 flex gap-3">
              <a aria-label="Instagram" href="#" className="grid h-10 w-10 place-items-center border border-border hover:bg-foreground hover:text-background">
                <InstagramLogo size={18} weight="light" />
              </a>
              <a aria-label="TikTok" href="#" className="grid h-10 w-10 place-items-center border border-border hover:bg-foreground hover:text-background">
                <TiktokLogo size={18} weight="light" />
              </a>
              <a aria-label="YouTube" href="#" className="grid h-10 w-10 place-items-center border border-border hover:bg-foreground hover:text-background">
                <YoutubeLogo size={18} weight="light" />
              </a>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground max-w-xs">
              Une curation de gadgets et d’objets utiles, présentés comme des pièces de
              collection. Sélection limitée, expédition mondiale.
            </p>
          </div>
        </div>

        {/* Massive logotype */}
        <div className="select-none overflow-hidden mt-10 -mb-4">
          <p
            data-testid="massive-logotype"
            className="font-display font-semibold tracking-[-0.06em] leading-[0.78]"
            style={{ fontSize: "clamp(96px, 22vw, 380px)" }}
          >
            MALIN®
          </p>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MALIN Studio. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-60 inline-flex items-center gap-1">CGV <ArrowUpRight size={12} /></a>
            <a href="#" className="hover:opacity-60 inline-flex items-center gap-1">Confidentialité <ArrowUpRight size={12} /></a>
            <a href="#" className="hover:opacity-60 inline-flex items-center gap-1">Livraison <ArrowUpRight size={12} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
