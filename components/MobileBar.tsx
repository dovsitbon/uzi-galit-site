import site from "@/data/site.json";
import { PhoneIcon, ScooterIcon, WhatsAppIcon } from "@/components/icons";
import type { Dict } from "@/lib/i18n";
import { telMain, waMain } from "@/lib/wa";

/** Barre fixée en bas de l'écran sur mobile : appeler, commander sur WhatsApp (bouton principal), Wolt. */
export function MobileBar({ d }: { d: Dict }) {
  const item = "flex flex-col items-center justify-center gap-1 text-[0.78rem] font-medium";
  return (
    <nav aria-label={d.services.label} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/97 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="flex h-[4.25rem] items-stretch">
        <a href={telMain} className={`${item} w-[4.5rem] text-earth`}>
          <PhoneIcon className="h-5 w-5" />
          {d.mobileBar.call}
        </a>
        <a href={waMain(d.whatsapp.hello)} target="_blank" rel="noopener" className={`${item} flex-1 flex-row gap-2 bg-ember text-[0.98rem] text-paper`}>
          <WhatsAppIcon className="h-5 w-5" />
          {d.mobileBar.order}
        </a>
        <a href={site.wolt} target="_blank" rel="noopener" className={`${item} w-[4.5rem] text-earth`}>
          <ScooterIcon className="h-5 w-5" />
          {d.mobileBar.wolt}
        </a>
      </div>
    </nav>
  );
}
