// Classe les visuels d'Uzi & Galit dans assets/<catégorie>/ avec des noms lisibles, puis les prépare pour le web
// dans public/media/<catégorie>/ (next/image sert ensuite des variantes AVIF/WebP à la bonne taille).
//   npm run media
//
// Sources :
//   assets/raw/    profil Instagram public @uzingalit (10 photos + 2 reels visibles sans connexion, sur 57 publications)
//   assets/picks/  images extraites du reel DQ3tP9xDcjk avec ffmpeg (720 × 1280)
// Écartées : affiche « אפטר קלפי » (pleine de texte, offre d'un jour d'élection), plans où l'on voit des visages
// de clients ou de l'équipe (reel, 4–6 s et 25 s), couverture du reel en 240 px.
// `crop` = bande verticale gardée, en fractions de la hauteur.
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const P = (n) => `picks/${n}.jpg`;
const R = (n) => `raw/uzi-galit_${n}.jpg`;

const PICKS = [
  [P("espresso"), "hero", "espresso"],

  [P("latte-art"), "cafe", "latte-art"],
  [P("cafe-glace"), "cafe", "cafe-glace", { top: 0.12, bottom: 1 }],
  [P("chien"), "cafe", "chien-bienvenu"],
  [R("11_CelRx-cI9Fy"), "cafe", "vitrine-cafe"],
  [P("confitures"), "cafe", "confitures-maison"],
  [P("tartine-saumon"), "cafe", "tartine-saumon-oeufs", { top: 0.18, bottom: 0.9 }],
  [P("salade-shon-portal"), "cafe", "salade-shon-portal", { top: 0.3, bottom: 1 }],
  [R("09_CllGGy9INrL"), "cafe", "sandwich-pretzel"],
  [R("12_CeLYESdIgDy"), "cafe", "sandwichs-bar-salades"],
  [R("03_DQEPVIuDVYD"), "cafe", "couscous-enfants"],

  [P("croissants-plateau"), "patisserie", "croissants-amandes"],
  [R("08_CmTXerzou3J"), "patisserie", "sufganiyot"],
  [R("10_CijzaVXIPOJ"), "patisserie", "babka-rugelach"],

  [R("05_Cx0iWmNIog3"), "plateaux", "plateau-fruits"],
  [R("06_CqYGgcbIxyK"), "plateaux", "panier-pique-nique"],

  [R("04_DFDGKrsoi3x"), "evenements", "buffet-traiteur"],

  [P("salle"), "galerie", "salle-du-cafe", { top: 0.25, bottom: 1 }],
];

const sizes = {};
for (const [src, cat, name, crop] of PICKS) {
  const file = path.join(ROOT, "assets", src);
  await mkdir(path.join(ROOT, "assets", cat), { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  let pipe = sharp(file).rotate();
  if (crop) {
    const { width, height } = await sharp(file).metadata();
    const top = Math.round(height * crop.top);
    pipe = pipe.extract({ left: 0, top, width, height: Math.round(height * crop.bottom) - top });
  }
  const buf = await pipe.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  await writeFile(path.join(ROOT, "assets", cat, `${name}.jpg`), buf);
  const info = await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
  sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
}

// Image de partage (Open Graph) 1200 × 630 : le buffet traiteur vu de haut
await sharp(path.join(ROOT, "assets", R("04_DFDGKrsoi3x")))
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

await copyFile(path.join(ROOT, "assets/raw/uzi-galit_logo.jpg"), path.join(ROOT, "assets/logo-instagram.jpg"));
await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");
console.log(`${PICKS.length} images prêtes`);

// Boucles vidéo silencieuses (public/media/video/), coupées dans le reel DQ3tP9xDcjk avec ffmpeg, sans le son :
//   hero.mp4        1,9 → 3,9 s (double expresso) + 26,0 → 28,6 s (latte art)
//   chien.mp4       35,8 → 38,0 s (un chien entre au café)
//   croissants.mp4  6,0 → 7,9 s (plateau de croissants aux amandes)
