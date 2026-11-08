"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import carte from "@/data/carte.json";
import plateaux from "@/data/plateaux.json";
import sizes from "@/data/media-sizes.json";
import { BagIcon, ClockIcon, MinusIcon, PlusIcon, ScooterIcon, WhatsAppIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { altOf, fill } from "@/lib/i18n";
import { paymentsEnabled, startCheckout } from "@/lib/payment";
import { recap, waMain } from "@/lib/wa";

type Product = (typeof plateaux.products)[number] & { units?: number };
type Line = { id: string; label: string; price: number | null };

/**
 * Plateaux, paniers et coffrets (cartes style Lenôtre) + formulaire de commande.
 * Le bouton « להזמין » d'une carte ajoute le produit au formulaire et y fait défiler.
 * Envoi d'un récapitulatif formaté sur WhatsApp, dans la langue du visiteur.
 */
export function Trays() {
  const { lang, d } = useLocale();
  const t = d.trays;
  const o = d.order;
  const formRef = useRef<HTMLFormElement>(null);

  // Produits commandables : les plateaux, puis les pâtisseries de la carte qui ont un prix
  const lines: Line[] = useMemo(() => {
    const trays = (plateaux.products as Product[]).map((p) => ({ id: p.id, label: t.items[p.id as keyof typeof t.items].name, price: p.priceFrom }));
    const pastry = carte.categories
      .find((c) => c.id === "pastry")!
      .items.filter((i) => i.price !== null)
      .map((i) => ({ id: i.id, label: lang === "he" ? i.name.he : `${i.name.he} (${i.name[lang]})`, price: i.price }));
    return [...trays, ...pastry];
  }, [lang, t]);

  const [qty, setQty] = useState<Record<string, number>>({});
  const [persons, setPersons] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const set = (id: string, v: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, v)) }));

  const pick = (id: string) => {
    setQty((q) => ({ ...q, [id]: Math.max(1, q[id] ?? 0) }));
    formRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-line="${id}"] button:last-of-type`)?.focus({ preventScroll: true }));
  };

  const send = async () => {
    const chosen = lines.filter((l) => (qty[l.id] ?? 0) > 0);
    const missing = [!chosen.length && o.empty, !date && o.date, mode === "delivery" && !address.trim() && o.address, !name.trim() && o.name, !phone.trim() && o.phone].filter(Boolean);
    if (missing.length) {
      setError(fill(o.required, { fields: missing.join(", ") }));
      return;
    }
    setError("");
    const when = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
    const text = [
      recap(o.waTitle, chosen.map((l) => [`${qty[l.id]} × ${l.label}`, ""] as [string, string]), true),
      "",
      recap("", [
        [o.waPersons, persons],
        [o.waWhen, time ? `${when} · ${time}` : when],
        [o.waMode, mode === "pickup" ? o.pickup : o.delivery],
        [o.waAddress, mode === "delivery" ? address : ""],
        [o.waNotes, notes],
        [o.waName, name],
        [o.waPhone, phone],
      ]),
    ].join("\n");
    // Paiement en ligne désactivé par défaut (lib/payment.ts) : seul le récapitulatif WhatsApp part.
    if (paymentsEnabled) {
      const url = await startCheckout(
        chosen.map((l) => ({ id: l.id, label: l.label, qty: qty[l.id], unitPrice: l.price })),
        { name, phone },
      );
      if (url) window.open(url, "_blank", "noopener");
    }
    window.open(waMain(text), "_blank", "noopener");
  };

  return (
    <>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {(plateaux.products as Product[]).map((p) => {
          const item = t.items[p.id as keyof typeof t.items];
          const size = p.photo ? (sizes as Record<string, number[]>)[p.photo] : null;
          return (
            <li key={p.id} className="flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-deep">
                {p.photo && size ? (
                  <Image src={p.photo} alt={altOf(d, p.photo)} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" quality={70} className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">{t.photoSlot}</div>
                )}
              </div>
              <h3 className="mt-4 text-[1.45rem] leading-tight">{item.name}</h3>
              <p className="mt-2 flex-1 text-[0.97rem] leading-relaxed text-muted">{item.text}</p>
              <dl className="mt-4 grid gap-1.5 text-[0.9rem] text-earth">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">{o.persons}</dt>
                  <dd>{p.units ? fill(t.units, { n: p.units }) : p.persons ? fill(t.persons, { n: p.persons }) : t.personsTbd}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-olive" />
                  <dt className="sr-only">{o.date}</dt>
                  <dd>{fill(t.lead24, { h: p.leadHours })}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <dt className="sr-only">{o.mode}</dt>
                  {p.pickup && (
                    <dd className="inline-flex items-center gap-1.5">
                      <BagIcon className="h-4 w-4 text-olive" />
                      {t.pickup}
                    </dd>
                  )}
                  {p.delivery && (
                    <dd className="inline-flex items-center gap-1.5">
                      <ScooterIcon className="h-4 w-4 text-olive" />
                      {t.delivery}
                    </dd>
                  )}
                </div>
              </dl>
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
                <p className="num text-[1.05rem] text-earth">
                  {p.priceFrom === null ? (
                    <span className="text-[0.92rem] text-muted">{t.priceOnRequest}</span>
                  ) : (
                    <>
                      <span className="text-[0.85rem] text-muted">{t.from}</span>
                      <span className="font-medium">{p.priceFrom} ₪</span>
                    </>
                  )}
                </p>
                <button type="button" onClick={() => pick(p.id)} className="btn btn-line btn-sm">
                  {t.order}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <form
        ref={formRef}
        id="order"
        className="mt-16 scroll-mt-28 rounded-2xl bg-paper p-5 shadow-[0_1px_0_var(--color-line),0_18px_50px_-30px_rgb(75_52_40/0.35)] sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        noValidate
      >
        <h3 className="text-[1.8rem] leading-tight">{o.title}</h3>
        <p className="mt-2 text-[0.97rem] text-muted">{o.lead}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <fieldset>
            <legend className="mb-2 text-[0.9rem] font-medium text-earth">{o.products}</legend>
            <ul className="divide-y divide-line border-y border-line">
              {lines.map((l) => {
                const n = qty[l.id] ?? 0;
                return (
                  <li key={l.id} data-line={l.id} className="flex items-center justify-between gap-4 py-2.5">
                    <p className={`text-[0.97rem] ${n ? "font-medium text-earth" : "text-ink"}`}>
                      {l.label}
                      {l.price !== null && <span className="num ms-2 text-[0.85rem] text-muted">{l.price} ₪</span>}
                    </p>
                    <div className="flex items-center gap-1" role="group" aria-label={`${o.qty}: ${l.label}`}>
                      <button type="button" onClick={() => set(l.id, n - 1)} disabled={!n} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-earth disabled:opacity-35" aria-label={o.less}>
                        <MinusIcon />
                      </button>
                      <span className="num w-7 text-center font-medium" aria-live="polite">
                        {n}
                      </span>
                      <button type="button" onClick={() => set(l.id, n + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-earth" aria-label={o.more}>
                        <PlusIcon />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="grid content-start gap-4 sm:grid-cols-2">
            <label className="field">
              {o.persons}
              <input className="input num" type="number" inputMode="numeric" min={1} value={persons} onChange={(e) => setPersons(e.target.value)} />
            </label>
            <label className="field">
              {o.date}
              <input className="input" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label className="field">
              {o.time}
              <input className="input num" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-[0.9rem] font-medium text-earth">{o.mode}</legend>
              <div className="flex flex-wrap gap-2">
                {(["pickup", "delivery"] as const).map((m) => (
                  <label key={m}>
                    <input type="radio" name="order-mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="peer sr-only" />
                    <span className="chip">{o[m]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {mode === "delivery" && (
              <label className="field fade-in sm:col-span-2">
                {o.address}
                <input className="input" name="address" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </label>
            )}
            <label className="field sm:col-span-2">
              {o.notes}
              <textarea className="input" rows={2} placeholder={o.notesPh} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <label className="field">
              {o.name}
              <input className="input" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              {o.phone}
              <input className="input" name="tel" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-6 text-[0.95rem] font-medium text-ember">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.9rem] text-muted">{o.note}</p>
          <button type="submit" className="btn btn-ember">
            <WhatsAppIcon className="h-5 w-5" />
            {o.send}
          </button>
        </div>
      </form>
    </>
  );
}
