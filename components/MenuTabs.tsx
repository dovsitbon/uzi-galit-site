"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import carte from "@/data/carte.json";
import sizes from "@/data/media-sizes.json";
import { useLocale } from "@/components/providers";
import site from "@/data/site.json";
import { ScooterIcon, WhatsAppIcon } from "@/components/icons";
import { altOf, fill } from "@/lib/i18n";
import { waMain } from "@/lib/wa";

type Item = (typeof carte.categories)[number]["items"][number] & { placeholder?: boolean; sample?: boolean; vegan?: boolean; priceTo?: number; photo?: string };

/** La carte : une seule page, un onglet par catégorie (data/carte.json). Noms en hébreu, traduction dessous. */
export function MenuTabs() {
  const { lang, d } = useLocale();
  const [active, setActive] = useState(carte.categories[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();

  // Ancre #menu-<catégorie> (tuiles après le hero) : ouvre directement le bon onglet
  useEffect(() => {
    const onHash = () => {
      const id = location.hash.replace("#menu-", "");
      if (location.hash.startsWith("#menu-") && carte.categories.some((c) => c.id === id)) {
        setActive(id);
        document.getElementById("menu")?.scrollIntoView();
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const onKey = (e: KeyboardEvent, i: number) => {
    const rtl = document.documentElement.dir === "rtl";
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let n = -1;
    if (e.key === fwd) n = (i + 1) % carte.categories.length;
    if (e.key === back) n = (i - 1 + carte.categories.length) % carte.categories.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = carte.categories.length - 1;
    if (n < 0) return;
    e.preventDefault();
    setActive(carte.categories[n].id);
    tabs.current[n]?.focus();
  };

  const cat = carte.categories.find((c) => c.id === active)!;
  const price = (it: Item) => (it.price === null ? d.menu.priceTbd : it.priceTo ? fill(d.menu.range, { from: it.price, to: it.priceTo }) : `${it.price} ${carte.currency}`);

  const items = cat.items as Item[];
  const withPhoto = items.filter((it) => it.photo);
  const list = items.filter((it) => !it.photo);

  const title = (it: Item) => (
    <div>
      <h3 lang="he" dir="rtl" className={`font-[family-name:var(--font-frank)] text-[1.35rem] font-medium leading-tight text-earth ${lang === "he" ? "" : "text-left"}`}>
        {it.name.he}
      </h3>
      {lang !== "he" && <p className="mt-0.5 text-[0.92rem] font-medium text-olive">{it.name[lang]}</p>}
    </div>
  );
  const priceTag = (it: Item) => (
    <p className={`num shrink-0 pt-1 text-[0.95rem] ${it.price === null ? "text-muted" : "font-medium text-earth"}`}>
      {it.placeholder ? <span className="rounded-full border border-line px-2.5 py-0.5 text-xs">{d.menu.toFill}</span> : price(it)}
    </p>
  );
  const extra = (it: Item) => (
    <>
      {it.desc[lang] && <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{it.desc[lang]}</p>}
      {it.vegan && <p className="mt-2 inline-block rounded-full border border-olive/40 px-2.5 py-0.5 text-xs font-medium text-olive">{d.menu.vegan}</p>}
    </>
  );
  const card = (it: Item) => (
    <li key={it.id} className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-deep">
        {(sizes as Record<string, number[]>)[it.photo!] && <Image src={it.photo!} alt={altOf(d, it.photo!)} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" quality={70} className="object-cover" />}
        {it.sample && <span className="absolute start-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-earth">{d.menu.sample}</span>}
      </div>
      <div>
        <div className="flex items-start justify-between gap-4">
          {title(it)}
          {priceTag(it)}
        </div>
        {extra(it)}
      </div>
    </li>
  );
  const row = (it: Item) => (
    <li key={it.id} className="border-b border-line py-4">
      <div className="flex items-start justify-between gap-4">
        {title(it)}
        <span aria-hidden="true" className="mt-4 hidden flex-1 border-b border-dotted border-earth/25 sm:block" />
        {priceTag(it)}
      </div>
      {extra(it)}
    </li>
  );

  return (
    <div>
      <div role="tablist" aria-label={d.menu.kicker} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {carte.categories.map((c, i) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={on}
              aria-controls={`panel-${c.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(c.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-[0.95rem] transition-colors ${on ? "border-earth bg-earth text-cream" : "border-line text-earth hover:border-earth"}`}
            >
              {d.menu.tabs[c.id as keyof typeof d.menu.tabs]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={cat.id}
          role="tabpanel"
          id={`panel-${cat.id}`}
          aria-labelledby={`tab-${cat.id}`}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          {/* Plats avec photo en cartes, puis le reste en liste de prix sur deux colonnes */}
          {withPhoto.length > 0 && <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{withPhoto.map(card)}</ul>}
          {list.length > 0 && <ul className={`grid gap-x-12 md:grid-cols-2 ${withPhoto.length ? "mt-10" : ""}`}>{list.map(row)}</ul>}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-[0.95rem] text-muted">{d.menu.allergens}</p>
        <div className="flex flex-wrap gap-3">
          <a href={waMain(d.whatsapp.hello)} target="_blank" rel="noopener" className="btn btn-ember">
            <WhatsAppIcon className="h-4 w-4" />
            {d.menu.orderCta}
          </a>
          <a href={site.wolt} target="_blank" rel="noopener" className="btn btn-line">
            <ScooterIcon className="h-4 w-4" />
            {d.menu.wolt}
          </a>
        </div>
      </div>
    </div>
  );
}
