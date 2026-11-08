# Emplacements pour les photos et vidéos qu'ils enverront

Déposer chaque fichier dans le bon dossier, l'ajouter dans `scripts/media.mjs` (liste PICKS), lancer `npm run media`,
puis l'utiliser dans `data/*.json` (carte, plateaux, galerie) avec son texte alternatif dans `locales/*.json` → `alt`.

- `hero/` : vitrine de pâtisseries ou comptoir, en vertical (4:5), lumineux.
- `cafe/` : la salle sans clients reconnaissables, la terrasse, le comptoir, le petit-déjeuner.
- `patisserie/` : gâteaux, quiches, biscuits, coffrets.
- `plateaux/` : chaque plateau et panier, vu du dessus, fond clair.
- `evenements/` : buffets installés, tables d'événement.
- `galerie/` : ambiance.
- Vidéos : déposer les .mp4 dans `raw/`, couper des boucles muettes de 2–3 s avec ffmpeg (voir la fin de `scripts/media.mjs`).

`raw/` garde les fichiers d'origine (Instagram) ; `picks/` les images extraites des reels.
