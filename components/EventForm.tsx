"use client";

import { useState } from "react";
import ev from "@/data/evenements.json";
import { MinusIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { recap, waMain } from "@/lib/wa";

/** Devis traiteur : type, date, heure, lieu, invités, budget par personne ; récapitulatif envoyé sur WhatsApp. */
export function EventForm() {
  const { lang, d } = useLocale();
  const t = d.eventForm;
  const g = ev.guests;
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [guests, setGuests] = useState(g.default);
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const clamp = (v: number) => Math.max(g.min, Math.min(g.max, Number.isFinite(v) ? v : g.default));

  const send = () => {
    const missing = [!type && t.type, !date && t.date, !name.trim() && t.name, !phone.trim() && t.phone].filter(Boolean);
    if (missing.length) {
      setError(fill(d.order.required, { fields: missing.join(", ") }));
      return;
    }
    setError("");
    const dateLabel = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
    const text = recap(t.waTitle, [
      [t.waType, d.events.types[type as keyof typeof d.events.types]],
      [t.waDate, dateLabel],
      [t.waTime, time],
      [t.waPlace, place],
      [t.waGuests, guests],
      [t.waBudget, budget && `${budget} ₪`],
      [t.waName, name],
      [t.waPhone, phone],
      [t.waMessage, message],
    ]);
    window.open(waMain(text), "_blank", "noopener");
  };

  return (
    <form
      className="rounded-2xl bg-paper p-5 shadow-[0_1px_0_var(--color-line),0_18px_50px_-30px_rgb(75_52_40/0.35)] sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      noValidate
    >
      <h3 className="text-[1.8rem] leading-tight">{t.title}</h3>
      <fieldset className="mt-6">
        <legend className="mb-2 text-[0.9rem] font-medium text-earth">{t.type}</legend>
        <div className="flex flex-wrap gap-2">
          {ev.types.map((k) => (
            <label key={k}>
              <input type="radio" name="ev-type" value={k} checked={type === k} onChange={() => setType(k)} className="peer sr-only" />
              <span className="chip">{d.events.types[k as keyof typeof d.events.types]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="field">
          {t.date}
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
        </label>
        <label className="field">
          {t.time}
          <input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} className="input num" />
        </label>
        <label className="field sm:col-span-2">
          {t.place}
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t.placePh} className="input" />
        </label>
        <div className="field">
          <label htmlFor="ev-guests">{t.guests}</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setGuests((v) => clamp(v - g.step))} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-earth" aria-label={d.order.less}>
              <MinusIcon />
            </button>
            <input id="ev-guests" type="number" inputMode="numeric" min={g.min} max={g.max} step={g.step} value={guests} onChange={(e) => setGuests(Number(e.target.value))} onBlur={() => setGuests(clamp(guests))} className="input num text-center" />
            <button type="button" onClick={() => setGuests((v) => clamp(v + g.step))} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-earth" aria-label={d.order.more}>
              <PlusIcon />
            </button>
          </div>
        </div>
        <label className="field">
          {t.budget}
          <input type="number" inputMode="numeric" min={0} placeholder={t.budgetPh} value={budget} onChange={(e) => setBudget(e.target.value)} className="input num" />
        </label>
        <label className="field">
          {t.name}
          <input value={name} onChange={(e) => setName(e.target.value)} name="name" autoComplete="name" className="input" required />
        </label>
        <label className="field">
          {t.phone}
          <input type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} name="tel" autoComplete="tel" className="input" required />
        </label>
        <label className="field sm:col-span-2 lg:col-span-4">
          {t.message}
          <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="input" />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-[0.95rem] font-medium text-ember">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9rem] text-muted">{t.note}</p>
        <button type="submit" className="btn btn-ember">
          <WhatsAppIcon className="h-5 w-5" />
          {t.send}
        </button>
      </div>
    </form>
  );
}
