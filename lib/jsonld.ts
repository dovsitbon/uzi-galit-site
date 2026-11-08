import site from "@/data/site.json";
import carte from "@/data/carte.json";
import { week } from "@/lib/hours";
import { getDict, type Locale } from "@/lib/i18n";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Données structurées : CafeOrCoffeeShop + Bakery (adresse, GPS, horaires, carte), Service traiteur et FAQ. */
export function homeJsonLd(lang: Locale) {
  const d = getDict(lang);
  const he = lang === "he";
  const id = `${site.url}/#cafe`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CafeOrCoffeeShop", "Bakery"],
        "@id": id,
        name: he ? site.name : site.nameLatin,
        alternateName: ["עוזי וגלית", "Uzi & Galit", "Uzi and Galit", "עוזי וגלית מיקדו", "Uzi & Galit Mikado"],
        description: d.meta.description,
        url: `${site.url}/${lang}`,
        image: [`${site.url}/og.jpg`, `${site.url}/media/cafe/vitrine-cafe.jpg`],
        logo: `${site.url}/icon.svg`,
        telephone: site.phone.intl.replace(/[\s-]/g, ""),
        servesCuisine: ["Café", "Bakery", "Pâtisserie", "Israeli", "Dairy", "Kosher"],
        priceRange: "₪₪",
        hasMenu: `${site.url}/${lang}#menu`,
        address: {
          "@type": "PostalAddress",
          streetAddress: he ? "אהרון בקר 8" : "8 Aharon Becker St",
          addressLocality: he ? "תל אביב-יפו" : "Tel Aviv-Yafo",
          addressCountry: "IL",
        },
        geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
        hasMap: site.gmaps,
        openingHoursSpecification: week
          .filter((s) => s.open && s.close)
          .map((s) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAYS[s.day]}`, opens: s.open, closes: s.close })),
        sameAs: [site.instagram, site.wolt, site.facebook],
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Kosher dairy", value: true },
          { "@type": "LocationFeatureSpecification", name: "Dogs welcome", value: site.dogsWelcome },
        ],
        potentialAction: { "@type": "OrderAction", target: `https://wa.me/${site.phone.wa}` },
        hasMenuSection: carte.categories.map((c) => ({
          "@type": "MenuSection",
          name: d.menu.tabs[c.id as keyof typeof d.menu.tabs],
          hasMenuItem: c.items
            .filter((i) => !("placeholder" in i && i.placeholder))
            .map((i) => ({
              "@type": "MenuItem",
              name: i.name.he,
              alternateName: i.name[lang],
              ...(i.desc[lang] ? { description: i.desc[lang] } : {}),
              ...(i.price !== null ? { offers: { "@type": "Offer", price: i.price, priceCurrency: "ILS" } } : {}),
            })),
        })),
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#catering`,
        serviceType: he ? "קייטרינג לאירועים ומגשי אירוח" : "Event catering and party platters",
        name: d.events.kicker,
        description: d.events.lead,
        provider: { "@id": id },
        areaServed: { "@type": "City", name: he ? "תל אביב-יפו" : "Tel Aviv-Yafo" },
        url: `${site.url}/${lang}#events`,
      },
      {
        "@type": "FAQPage",
        mainEntity: d.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}
