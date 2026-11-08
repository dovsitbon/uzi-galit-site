import Image from "next/image";
import { notFound } from "next/navigation";
import annonces from "@/data/annonces.json";
import carte from "@/data/carte.json";
import site from "@/data/site.json";
import { EventForm } from "@/components/EventForm";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { ArrowIcon, BagIcon, CupIcon, MapIcon, NavIcon, PhoneIcon, PlusIcon, ScooterIcon, TableIcon, WhatsAppIcon } from "@/components/icons";
import { InfoBanner } from "@/components/InfoBanner";
import { LoopVideo } from "@/components/LoopVideo";
import { MapLoader } from "@/components/MapLoader";
import { MenuTabs } from "@/components/MenuTabs";
import { OpenStatus } from "@/components/OpenStatus";
import { Reveal } from "@/components/Reveal";
import { Trays } from "@/components/Trays";
import { nowInIsrael, week } from "@/lib/hours";
import { altOf, fill, getDict, intlLocale, isLocale, type Dict } from "@/lib/i18n";
import { homeJsonLd } from "@/lib/jsonld";
import { img } from "@/lib/media";
import { telLandline, telMain, waMain } from "@/lib/wa";

// Régénérée toutes les heures : l'annonce du bandeau suit ses dates (data/annonces.json)
export const revalidate = 3600;

function Media({ src, d, sizes, className = "", priority = false }: { src: string; d: Dict; sizes: string; className?: string; priority?: boolean }) {
  const m = img(src);
  return <Image src={m.src} alt={altOf(d, src)} width={m.width} height={m.height} sizes={sizes} quality={70} priority={priority} className={className} />;
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);
  const today = nowInIsrael().iso;
  const note = annonces.items.find((a) => a.active && a.from <= today && today <= a.to)?.text[lang] ?? null;
  const updated = new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${carte.updated}T12:00:00`));
  const hello = waMain(d.whatsapp.hello);

  const tiles = [
    { id: "cafe", href: "#menu-breakfast", photo: "/media/cafe/latte-art.jpg" },
    { id: "pastry", href: "#menu-pastry", photo: "/media/patisserie/babka-rugelach.jpg" },
    { id: "trays", href: "#trays", photo: "/media/plateaux/plateau-fruits.jpg" },
    { id: "picnic", href: "#trays", photo: "/media/plateaux/panier-pique-nique.jpg" },
    { id: "catering", href: "#events", photo: "/media/evenements/buffet-traiteur.jpg" },
  ] as const;

  const serviceIcon = { whatsapp: WhatsAppIcon, wolt: ScooterIcon, pickup: BagIcon, events: TableIcon };
  const serviceHref = { whatsapp: hello, wolt: site.wolt, pickup: "#trays", events: "#events" };
  const external = (id: string) => id === "whatsapp" || id === "wolt";

  const blockMedia = {
    cafe: { video: "/media/video/chien.mp4", poster: "/media/cafe/chien-bienvenu.jpg", href: "#directions" },
    pastry: { video: "/media/video/croissants.mp4", poster: "/media/patisserie/croissants-amandes.jpg", href: "#menu-pastry" },
    catering: { video: null, poster: "/media/evenements/buffet-traiteur.jpg", href: "#events" },
  } as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(lang)) }} />
      <InfoBanner initialNote={note} />
      <Header />

      <main id="main">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden">
          <div className="wrap grid gap-8 pt-4 pb-14 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-14 md:pt-10 md:pb-20">
            <div className="order-2 md:order-1">
              <p className="kicker">{d.hero.kicker}</p>
              <h1 className="h-display mt-5 max-w-[13ch]">{d.hero.title}</h1>
              <p className="mt-6 max-w-md text-[1.1rem] leading-relaxed text-muted">{d.hero.lead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={hello} target="_blank" rel="noopener" className="btn btn-ember">
                  <WhatsAppIcon className="h-4 w-4" />
                  {d.nav.order}
                </a>
                <a href="#menu" className="btn btn-line">
                  {d.hero.ctaMenu}
                </a>
              </div>
              <div className="mt-8 flex flex-col gap-3 border-t border-line pt-5 text-earth sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
                <OpenStatus />
                <a href={site.wolt} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[0.95rem] text-muted underline decoration-line underline-offset-4 hover:text-earth">
                  <ScooterIcon className="h-4 w-4" />
                  {d.hero.wolt}
                </a>
                <a href="#press" className="text-[0.95rem] text-muted underline decoration-line underline-offset-4 hover:text-earth">
                  {d.hero.press}
                </a>
              </div>
            </div>
            <div className="relative order-1 -mx-5 md:order-2 md:mx-0">
              <div className="relative aspect-[4/5] overflow-hidden md:aspect-[9/14] md:max-h-[80svh] md:rounded-2xl">
                <Media src="/media/hero/espresso.jpg" d={d} sizes="(min-width:768px) 40vw, 100vw" priority className="absolute inset-0 h-full w-full object-cover" />
                <LoopVideo src="/media/video/hero.mp4" label={d.hero.videoLabel} fade className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== Tuiles ===== */}
        <section aria-labelledby="tiles-title" className="wrap pb-14 md:pb-20">
          <h2 id="tiles-title" className="sr-only">
            {d.tiles.title}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {tiles.map((t, i) => (
              <Reveal as="li" key={t.id} delay={i * 0.05} className={i === 4 ? "col-span-2 sm:col-span-1" : ""}>
                <a href={t.href} className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-cream-deep sm:aspect-[3/4]">
                  <Media src={t.photo} d={d} sizes="(min-width:1024px) 19vw, (min-width:640px) 31vw, 46vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/75 to-transparent px-4 pt-10 pb-4">
                    <span className="flex items-center justify-between gap-2 font-[family-name:var(--font-display)] text-[1.25rem] text-cream">
                      {d.tiles.items[t.id]}
                      <ArrowIcon className="h-4 w-4 shrink-0 opacity-80 rtl:-scale-x-100" />
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ===== Services ===== */}
        <section aria-label={d.services.label} className="border-y border-line bg-paper/60">
          <ul className="wrap grid grid-cols-2 lg:grid-cols-4">
            {d.services.items.map((s, i) => {
              const Icon = serviceIcon[s.id as keyof typeof serviceIcon];
              const ext = external(s.id);
              return (
                <li key={s.id} className={`border-line py-6 sm:py-8 ${i % 2 === 0 ? "border-e pe-4" : "ps-4 lg:border-e"} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 3 ? "lg:border-e-0" : ""} lg:px-6 lg:first:ps-0`}>
                  <a href={serviceHref[s.id as keyof typeof serviceHref]} {...(ext ? { target: "_blank", rel: "noopener" } : {})} className="group flex flex-col gap-2">
                    <Icon className="h-6 w-6 text-olive" />
                    <span className="font-[family-name:var(--font-display)] text-[1.2rem] text-earth group-hover:underline group-hover:underline-offset-4">{s.title}</span>
                    <span className="text-[0.93rem] leading-snug text-muted">{s.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ===== La carte ===== */}
        <section id="menu" aria-labelledby="menu-title" className="wrap scroll-mt-28 py-20 md:py-28">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="kicker">{d.menu.kicker}</p>
              <h2 id="menu-title" className="h-section mt-4">
                {d.menu.title}
              </h2>
              <p className="mt-4 max-w-lg text-[1.05rem] text-muted">{d.menu.lead}</p>
            </div>
            <p className="flex items-center gap-3 text-[0.9rem] text-muted">
              <span lang="he" className="rounded-full border border-olive/40 px-3 py-0.5 font-medium text-olive">
                {site.kosher.label}
              </span>
              {fill(d.menu.updated, { date: updated })}
            </p>
          </div>
          <MenuTabs />
        </section>

        {/* ===== Plateaux et paniers ===== */}
        <section id="trays" aria-labelledby="trays-title" className="scroll-mt-24 bg-cream-deep py-20 md:py-28">
          <div className="wrap">
            <div className="mb-12 max-w-2xl">
              <p className="kicker">{d.trays.kicker}</p>
              <h2 id="trays-title" className="h-section mt-4">
                {d.trays.title}
              </h2>
              <p className="mt-5 text-[1.08rem] leading-relaxed text-muted">{d.trays.lead}</p>
            </div>
            <Trays />
          </div>
        </section>

        {/* ===== Trois blocs alternés ===== */}
        <section aria-label={d.about.kicker}>
          {d.blocks.map((b, i) => {
            const m = blockMedia[b.id as keyof typeof blockMedia];
            const dark = b.id === "pastry";
            return (
              <div key={b.id} className={dark ? "on-dark bg-night text-cream" : ""}>
                <div className="wrap grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24">
                  <Reveal className={`relative ${i % 2 ? "md:order-2" : ""}`}>
                    <div className="relative mx-auto aspect-[4/5] max-h-[78svh] overflow-hidden rounded-2xl md:aspect-[3/4]">
                      <Media src={m.poster} d={d} sizes="(min-width:768px) 44vw, 92vw" className="absolute inset-0 h-full w-full object-cover" />
                      {m.video && <LoopVideo src={m.video} label={("videoLabel" in b && b.videoLabel) || ""} fade className="absolute inset-0 h-full w-full object-cover" />}
                    </div>
                  </Reveal>
                  <Reveal delay={0.08} className={i % 2 ? "md:order-1" : ""}>
                    <p className="kicker">{b.kicker}</p>
                    <h2 className={`h-section mt-4 ${dark ? "!text-cream" : ""}`}>{b.title}</h2>
                    <p className={`mt-5 max-w-md text-[1.08rem] leading-relaxed ${dark ? "text-cream/80" : "text-muted"}`}>{b.text}</p>
                    <a href={m.href} className={`btn mt-8 ${b.id === "catering" ? "btn-ember" : "btn-line"}`}>
                      {b.id === "cafe" && <NavIcon className="h-4 w-4" />}
                      {b.cta}
                    </a>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </section>

        {/* ===== Événements ===== */}
        <section id="events" aria-labelledby="events-title" className="scroll-mt-24 border-t border-line py-20 md:py-28">
          <div className="wrap">
            <div className="max-w-2xl">
              <p className="kicker">{d.events.kicker}</p>
              <h2 id="events-title" className="h-section mt-4">
                {d.events.title}
              </h2>
              <p className="mt-5 text-[1.08rem] leading-relaxed text-muted">{d.events.lead}</p>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.97rem] text-earth">
                {Object.values(d.events.types).map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sage" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <EventForm />
              <p className="mt-4 flex flex-wrap items-center gap-x-2 text-[0.95rem] text-muted">
                <PhoneIcon className="h-4 w-4" />
                {d.info.questions}
                <a href={telMain} dir="ltr" className="num font-medium text-earth underline underline-offset-4">
                  {site.phone.display}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ===== Qui sommes-nous ===== */}
        <section id="about" aria-labelledby="about-title" className="scroll-mt-24 bg-cream-deep py-20 md:py-28">
          <div className="wrap grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Media src="/media/cafe/vitrine-cafe.jpg" d={d} sizes="(min-width:768px) 40vw, 92vw" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="kicker">{d.about.kicker}</p>
              <h2 id="about-title" className="h-section mt-4">
                {d.about.title}
              </h2>
              <p className="mt-5 max-w-lg text-[1.08rem] leading-relaxed text-muted">{d.about.text}</p>
              {/* À REMPLIR avec l'histoire d'Uzi et Galit (qui ils sont, depuis quand le café existe) */}
              <p className="mt-5 max-w-lg rounded-xl border border-dashed border-earth/30 p-4 text-[0.92rem] text-muted">{d.about.slot}</p>
            </Reveal>
          </div>
        </section>

        {/* ===== Galerie ===== */}
        <section id="vibe" aria-labelledby="vibe-title" className="on-dark scroll-mt-24 bg-night py-20 text-cream md:py-28">
          <div className="wrap">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="kicker">{d.gallery.kicker}</p>
                <h2 id="vibe-title" className="h-section mt-4 !text-cream">
                  {d.gallery.title}
                </h2>
              </div>
              <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-line btn-sm self-start md:self-auto">
                {d.gallery.more}
                <span dir="ltr">{site.instagramHandle}</span>
              </a>
            </div>
            <Gallery />
          </div>
        </section>

        {/* ===== On parle de nous ===== */}
        <section id="press" aria-labelledby="press-title" className="wrap scroll-mt-24 py-20 md:py-24">
          <p className="kicker">{d.press.kicker}</p>
          <h2 id="press-title" className="h-section mt-4">
            {d.press.title}
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {site.press.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noopener" className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-line bg-paper/60 p-6 transition-colors hover:border-earth md:p-8">
                  <div>
                    <p lang="he" className="font-[family-name:var(--font-frank)] text-[1.45rem] font-medium text-earth">
                      {p.name}
                    </p>
                    <p className="mt-3 text-[1rem] leading-relaxed text-muted">{d.press.items[p.id as keyof typeof d.press.items]}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-earth">
                    {d.press.open}
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <h3 className="mt-14 text-[1.5rem]">{d.press.reviewsTitle}</h3>
          {/* À REMPLIR avec de vrais avis clients */}
          <p className="mt-4 max-w-lg rounded-xl border border-dashed border-earth/30 p-4 text-[0.92rem] text-muted">{d.press.reviewsSlot}</p>
        </section>

        {/* ===== Infos pratiques ===== */}
        <section id="directions" aria-labelledby="info-title" className="scroll-mt-24 bg-cream-deep py-20 md:py-28">
          <div className="wrap grid gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <p className="kicker">{d.info.kicker}</p>
              <h2 id="info-title" className="h-section mt-4">
                {d.info.title}
              </h2>
              <p className="mt-3 text-[1.02rem] text-muted">{d.info.addressNote}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={site.waze} target="_blank" rel="noopener" className="btn btn-ember">
                  <NavIcon className="h-4 w-4" />
                  {d.info.waze}
                </a>
                <a href={site.gmaps} target="_blank" rel="noopener" className="btn btn-line">
                  <MapIcon className="h-4 w-4" />
                  {d.info.gmaps}
                </a>
              </div>

              <h3 className="mt-12 text-[1.4rem]">{d.info.hoursTitle}</h3>
              <OpenStatus className="mt-2 text-earth" />
              <table className="mt-4 w-full max-w-sm text-[0.97rem]">
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const s = week[day];
                    return (
                      <tr key={day} className="border-b border-line">
                        <th scope="row" className="py-2.5 text-start font-normal text-earth">
                          {d.days[day]}
                        </th>
                        <td className={`num py-2.5 text-end ${s.open ? "font-medium text-earth" : "text-muted"}`}>
                          {s.open ? <span dir="ltr">{`${s.open}–${s.close}`}</span> : d.info.closed}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-3 max-w-sm text-[0.88rem] text-muted">{d.info.hoursNote}</p>

              <dl className="mt-10 grid gap-6 sm:grid-cols-2">
                {[
                  { t: d.info.kosherTitle, x: d.info.kosher },
                  { t: d.info.dogsTitle, x: d.info.dogs },
                  { t: d.info.accessTitle, x: d.info.access },
                ].map((r) => (
                  <div key={r.t}>
                    <dt className="font-medium text-earth">{r.t}</dt>
                    <dd className="mt-1 text-[0.95rem] leading-relaxed text-muted">{r.x}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-8">
              <MapLoader label={d.info.map} note={d.info.mapNote} title={d.info.title} lang={lang} />
              <div id="contact" className="scroll-mt-28 rounded-xl bg-paper p-6 md:p-8">
                <h3 className="text-[1.4rem]">{d.info.contactTitle}</h3>
                <ul className="mt-5 grid gap-4">
                  <li className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.9rem] text-muted">{d.info.questions}</p>
                      <p dir="ltr" className="num text-start text-[1.15rem] font-medium text-earth">
                        {site.phone.display}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a href={telMain} className="btn btn-line btn-sm">
                        <PhoneIcon className="h-4 w-4" />
                        {d.nav.call}
                      </a>
                      <a href={hello} target="_blank" rel="noopener" className="btn btn-ember btn-sm">
                        <WhatsAppIcon className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="text-[0.9rem] text-muted">{d.info.landline}</p>
                      <p dir="ltr" className="num text-start text-[1.15rem] font-medium text-earth">
                        {site.landline.display}
                      </p>
                    </div>
                    <a href={telLandline} className="btn btn-line btn-sm">
                      <PhoneIcon className="h-4 w-4" />
                      {d.nav.call}
                    </a>
                  </li>
                  <li className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="inline-flex items-center gap-2 text-[0.95rem] text-earth">
                      <CupIcon className="h-5 w-5 text-olive" />
                      {d.services.items[1].title}
                    </p>
                    <a href={site.wolt} target="_blank" rel="noopener" className="btn btn-line btn-sm">
                      <ScooterIcon className="h-4 w-4" />
                      {d.nav.wolt}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section aria-labelledby="faq-title" className="wrap py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <h2 id="faq-title" className="h-section">
              {d.faq.title}
            </h2>
            <ul className="border-t border-line">
              {d.faq.items.map((f) => (
                <li key={f.q} className="border-b border-line">
                  <details>
                    <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-[1.08rem] font-medium text-earth">
                      {f.q}
                      <PlusIcon className="faq-plus h-5 w-5 shrink-0 text-olive" />
                    </summary>
                    <p className="max-w-xl pb-6 text-[1rem] leading-relaxed text-muted">{f.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
