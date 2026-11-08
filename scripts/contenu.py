"""Génère CONTENU.md (textes du site en 4 langues + carte + plateaux) depuis locales/*.json et data/*.json.
   python scripts/contenu.py"""
import json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
L = {l: json.loads((R / f"locales/{l}.json").read_text(encoding="utf-8")) for l in ["he", "en", "fr", "es"]}
carte = json.loads((R / "data/carte.json").read_text(encoding="utf-8"))
plat = json.loads((R / "data/plateaux.json").read_text(encoding="utf-8"))
NAMES = {"he": "עברית", "en": "English", "fr": "Français", "es": "Español"}
out = ["# Uzi & Galit – עוזי וגלית : contenu du site", "",
       "Tous les textes du site, à valider avec Galit. Généré par `python scripts/contenu.py` depuis `locales/*.json` et `data/*.json` : on corrige dans ces fichiers, puis on relance le script.", "",
       "## Titre du hero : 3 propositions", "",
       "1. **בואו לקפה. תישארו לעוגה.** · Come for coffee. Stay for cake. · Venez pour le café. Restez pour le gâteau. · Venid por el café. Quedaos por la tarta. *(en ligne)*",
       "2. **הקפה של השכונה, העוגה של גלית.** · The neighbourhood's coffee, Galit's cake. · Le café du quartier, le gâteau de Galit. · El café del barrio, la tarta de Galit.",
       "3. **מהתנור שלנו לשולחן שלכם.** · From our oven to your table. · De notre four à votre table. · De nuestro horno a vuestra mesa.", ""]

def flat(o, p=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from flat(v, f"{p}.{k}" if p else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from flat(v, f"{p}[{i}]")
    else:
        yield p, o

out += ["## Textes du site", "", "| Clé | עברית | English | Français | Español |", "|---|---|---|---|---|"]
rows = {l: dict(flat(L[l])) for l in L}
for k in rows["he"]:
    cells = [str(rows[l].get(k, "")).replace("|", "\\|").replace("\n", " ") for l in L]
    out.append(f"| `{k}` | " + " | ".join(cells) + " |")

out += ["", "## La carte", "", f"Relevée le {carte['updated']} sur leur page de livraison Mishloha + Instagram. Prix de la livraison, à confirmer pour la salle. « à remplir » = prix inconnu.", ""]
for c in carte["categories"]:
    out += [f"### {L['he']['menu']['tabs'][c['id']]} · {L['fr']['menu']['tabs'][c['id']]}", "", "| Plat (he) | en | fr | es | Prix | Note |", "|---|---|---|---|---|---|"]
    for i in c["items"]:
        price = "à remplir" if i["price"] is None else (f"{i['price']}–{i['priceTo']} ₪" if i.get("priceTo") else f"{i['price']} ₪")
        note = "vu sur Instagram, à confirmer" if i.get("sample") else ("emplacement à remplir" if i.get("placeholder") else "")
        out.append(f"| {i['name']['he']} | {i['name']['en']} | {i['name']['fr']} | {i['name']['es']} | {price} | {note} |")
    out.append("")

out += ["## Plateaux, paniers et coffrets", "", "| Produit | À partir de | Personnes / pièces | Délai | Retrait | Livraison |", "|---|---|---|---|---|---|"]
for p in plat["products"]:
    n = L["fr"]["trays"]["items"][p["id"]]["name"]
    out.append(f"| {n} ({L['he']['trays']['items'][p['id']]['name']}) | {str(p['priceFrom']) + ' ₪' if p['priceFrom'] else 'à remplir'} | {p.get('units') or p.get('persons') or 'à remplir'} | {p['leadHours']} h (à confirmer) | {'oui' if p['pickup'] else 'non'} | {'oui' if p['delivery'] else 'non'} |")
(R / "CONTENU.md").write_text("\n".join(out) + "\n", encoding="utf-8")
print("CONTENU.md écrit")
