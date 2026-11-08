"use client";

import { useEffect, useState } from "react";

const KEY = "uzi-intro";

/**
 * Ouverture (1,5 s max, une fois par session) : fond crème, une tasse se dessine au trait,
 * la vapeur monte en volute, « עוזי וגלית » puis « UZI & GALIT » apparaissent, fondu sur le hero.
 * Masquée d'office (script dans <head>) si déjà vue ou si l'utilisateur réduit les animations ; tout est en CSS.
 */
export function Intro({ skipLabel }: { skipLabel: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("intro-seen")) {
      setGone(true);
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const t = setTimeout(() => {
      html.classList.add("intro-seen");
      setGone(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  const skip = () => {
    document.documentElement.classList.add("intro-seen");
    setGone(true);
  };

  return (
    <div className="intro">
      <div className="intro-stage" aria-hidden="true">
        <svg viewBox="0 0 120 100" className="intro-svg" fill="none" stroke="var(--color-earth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path className="intro-steam" d="M50 34c-6-6 6-10 0-17s4-11 2-14" />
          <path className="intro-steam intro-steam-2" d="M64 34c-5-6 6-9 1-16s3-10 1-13" />
          <path className="intro-cup" d="M30 42h56v14c0 14-11 24-25 24h-6C41 80 30 70 30 56V42Z" />
          <path className="intro-cup" d="M86 48h5a8 8 0 0 1 0 16h-6" />
          <path className="intro-cup intro-saucer" d="M18 88h84" />
        </svg>
        <p className="intro-word" lang="he">
          עוזי וגלית
        </p>
        <p className="intro-latin" lang="en">
          UZI &amp; GALIT
        </p>
      </div>
      <button type="button" onClick={skip} className="intro-skip">
        {skipLabel}
      </button>
    </div>
  );
}
