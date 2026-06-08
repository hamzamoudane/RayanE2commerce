import React from "react";
import { Asterisk } from "@phosphor-icons/react";

const items = [
  "Édition limitée",
  "Livraison mondiale",
  "Curation sans compromis",
  "Objets utiles. Forme parfaite.",
  "Vol.04 / 2026",
  "Made for the curious",
];

export const Marquee = () => {
  const loop = [...items, ...items];
  return (
    <div
      className="border-y border-border bg-background overflow-hidden"
      data-testid="marquee"
    >
      <div className="marquee-track flex gap-10 py-4 whitespace-nowrap will-change-transform">
        {loop.map((t, i) => (
          <span key={i} className="overline inline-flex items-center gap-10">
            {t} <Asterisk size={14} weight="light" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
