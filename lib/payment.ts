import site from "@/data/site.json";

/**
 * Paiement en ligne : prévu mais désactivé (data/site.json → payments.enabled = false).
 * Pour l'activer : choisir un prestataire (Stripe, Meshulam, Cardcom…), créer une route app/api/checkout
 * qui renvoie l'URL de paiement, mettre enabled à true et provider au nom du prestataire.
 * Tant que c'est désactivé, les formulaires n'envoient que le récapitulatif WhatsApp.
 */
export const paymentsEnabled = site.payments.enabled === true;

export type CheckoutLine = { id: string; label: string; qty: number; unitPrice: number | null };

export async function startCheckout(lines: CheckoutLine[], customer: { name: string; phone: string }): Promise<string | null> {
  if (!paymentsEnabled) return null;
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lines, customer }),
  });
  if (!res.ok) return null;
  const { url } = (await res.json()) as { url?: string };
  return url ?? null;
}
