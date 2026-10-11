# Extrahiert Beispielinhalte (Veranstaltungen, Nachrichten) maschinell aus dem Bestand (ADR 0015):
# Ternaries language === 'de' ? … → {de,tr,en}; jede Zeile mit Quellenvermerk (Datei:Zeilen). Personennamen nicht übernommen.
import json, re, sys
B = sys.argv[1]
AUS = sys.argv[2]

def eintraege(datei, start_muster):
    zeilen = open(f"{B}/{datei}", encoding="utf-8").read().split("\n")
    s = next(i for i, z in enumerate(zeilen) if start_muster in z)
    tiefe = 0; e = []; aktuell = None; begin = None
    for i in range(s, len(zeilen)):
        z = zeilen[i]
        if re.match(r"^\s*\{\s*$", z) and tiefe == 1:
            aktuell = []; begin = i + 1
        if aktuell is not None: aktuell.append(z)
        tiefe += z.count("[") - z.count("]") if i == s else 0
        if i == s: tiefe = 1
        if re.match(r"^\s*\},?\s*$", z) and aktuell is not None:
            e.append((begin, i + 1, "\n".join(aktuell))); aktuell = None
        if re.match(r"^\s*\];\s*$", z): break
    return e

STR = r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\""
def feld(block, name):
    m = re.search(rf"^\s*{name}:\s*(.*?),?\s*(//.*)?$", block, re.M)
    if not m: return None
    roh = m.group(1).strip()
    t = re.match(rf"language === 'de' \? ({STR}) : language === 'tr' \? ({STR}) : ({STR})", roh)
    w = lambda g1, g2: (g1 if g1 is not None else g2).replace("\\'", "'")
    if t:
        g = t.groups()
        return {"de": w(g[1], g[2]), "tr": w(g[4], g[5]), "en": w(g[7], g[8])}
    s = re.match(STR, roh)
    if s: return w(s.group(1), s.group(2))
    if roh in ("true", "false"): return roh == "true"
    if re.match(r"^\d+$", roh): return int(roh)
    return roh

erg = {"veranstaltungen_start": [], "veranstaltungen": [], "nachrichten_start": [], "nachrichten": []}
for von, bis, b in eintraege("EventsSection.tsx", "const events = ["):
    erg["veranstaltungen_start"].append({k: feld(b, k) for k in ["title", "description", "date", "time", "location", "participants", "category", "featured", "organization"]} | {"quelle": f"bestand/src/app/components/EventsSection.tsx:{von}-{bis}"})
for von, bis, b in eintraege("Events.tsx", "const events = ["):
    erg["veranstaltungen"].append({k: feld(b, k) for k in ["title", "description", "date", "time", "location", "category", "participants", "featured", "free"]} | {"quelle": f"bestand/src/app/components/Events.tsx:{von}-{bis}"})
for von, bis, b in eintraege("NewsSection.tsx", "const news = ["):
    erg["nachrichten_start"].append({k: feld(b, k) for k in ["title", "excerpt", "category", "date", "readTime", "featured"]} | {"quelle": f"bestand/src/app/components/NewsSection.tsx:{von}-{bis}"})
for von, bis, b in eintraege("News.tsx", "const newsArticles = ["):
    erg["nachrichten"].append({k: feld(b, k) for k in ["title", "excerpt", "content", "publishedAt", "category", "featured", "readTime"]} | {"quelle": f"bestand/src/app/components/News.tsx:{von}-{bis}"})
json.dump(erg, open(AUS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, v in erg.items(): print(k, len(v))
