"use client";

import { useEffect, useRef, useState } from "react";
import site from "@/data/site.json";
import { CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { LangSwitch } from "@/components/LangSwitch";
import { Logo } from "@/components/Logo";
import { useLocale } from "@/components/providers";
import { telMain, waMain } from "@/lib/wa";

export function Header() {
  const { lang, d } = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const home = `/${lang}`;

  const links = [
    { href: "#menu", label: d.nav.menu },
    { href: "#trays", label: d.nav.trays },
    { href: "#events", label: d.nav.catering },
    { href: "#about", label: d.nav.about },
    { href: "#directions", label: d.nav.directions },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Le panneau commence sous le header, quelle que soit la hauteur du bandeau au-dessus
    setPanelTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    // Pas de backdrop-blur quand le menu est ouvert : il ferait du header le bloc conteneur du panneau `fixed` (hauteur 0)
    <header ref={headerRef} className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 ${open ? "bg-cream shadow-[0_1px_0_var(--color-line)]" : scrolled ? "bg-cream/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur" : "bg-cream"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-paper focus:px-3 focus:py-2">
        {d.a11y.skip}
      </a>
      <div className="wrap flex h-[4.5rem] items-center gap-4">
        <a href={home} className="shrink-0 text-ink" aria-label={`${site.name} – ${site.nameLatin}`}>
          <Logo compact />
        </a>

        <nav aria-label={d.nav.menu} className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-6 text-[0.95rem] text-earth">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-11 items-center underline-offset-[6px] hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <LangSwitch lang={lang} label={d.a11y.lang} className="hidden text-earth xl:flex" />
          <a href={site.instagram} target="_blank" rel="noopener" className="hidden h-11 w-11 items-center justify-center text-earth xl:flex" aria-label={`${d.nav.instagram} ${d.a11y.newTab}`}>
            <InstagramIcon />
          </a>
          <a href={waMain(d.whatsapp.hello)} target="_blank" rel="noopener" className="btn btn-ember btn-sm hidden md:inline-flex">
            <WhatsAppIcon className="h-4 w-4" />
            {d.nav.order}
          </a>
          <a href={telMain} className="flex h-11 w-11 items-center justify-center text-earth md:hidden" aria-label={`${d.nav.call} ${site.phone.display}`}>
            <PhoneIcon />
          </a>
          <button type="button" className="flex h-11 w-11 items-center justify-center text-earth lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? d.a11y.closeMenu : d.a11y.openMenu} onClick={() => setOpen((v) => !v)}>
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" style={{ top: panelTop }} className="fade-in fixed inset-x-0 bottom-0 overflow-y-auto overscroll-contain bg-cream lg:hidden">
          <nav aria-label={d.nav.menu} className="wrap flex flex-col gap-8 py-8">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center font-[family-name:var(--font-display)] text-[1.7rem] text-earth">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href={waMain(d.whatsapp.hello)} target="_blank" rel="noopener" className="btn btn-ember">
                <WhatsAppIcon className="h-4 w-4" />
                {d.nav.order}
              </a>
              <a href={site.wolt} target="_blank" rel="noopener" className="btn btn-line">
                {d.nav.wolt}
              </a>
            </div>
            <div className="flex items-center justify-between text-earth">
              <LangSwitch lang={lang} label={d.a11y.lang} />
              <a href={site.instagram} target="_blank" rel="noopener" className="flex h-11 items-center gap-2" aria-label={`${d.nav.instagram} ${d.a11y.newTab}`}>
                <InstagramIcon />
                <span dir="ltr">{site.instagramHandle}</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
