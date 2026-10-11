# Erzeugt web/drizzle/seeds/daten/{veranstaltungen,nachrichten}.ts aus _lauf/eingang/beispielinhalte.json (ADR 0015).
import json, re, unicodedata
d = json.load(open("_lauf/eingang/beispielinhalte.json", encoding="utf-8"))
def slug(t):
    t = t.lower().replace("ä","ae").replace("ö","oe").replace("ü","ue").replace("ß","ss").replace("ı","i").replace("ş","s").replace("ğ","g").replace("ç","c")
    t = unicodedata.normalize("NFKD", t).encode("ascii","ignore").decode()
    return re.sub(r"[^a-z0-9]+","-",t).strip("-")[:80]
ms = lambda v: v if isinstance(v, dict) else {"de": v}
TAG = {"Montag":"MO","Dienstag":"TU","Mittwoch":"WE","Donnerstag":"TH","Freitag":"FR","Samstag":"SA","Sonntag":"SU"}
# Erstes Vorkommen ab Montag, 05.10.2026 (fester Anker, damit Seeds reproduzierbar sind)
ANKER = {"MO":"2026-10-05","TU":"2026-10-06","WE":"2026-10-07","TH":"2026-10-08","FR":"2026-10-09","SA":"2026-10-10","SU":"2026-10-11"}
MONATE = {"Januar":1,"Februar":2,"März":3,"April":4,"Mai":5,"Juni":6,"Juli":7,"August":8,"September":9,"Oktober":10,"November":11,"Dezember":12}
KAT_V = {"Bildung":"bildung","Jugend":"jugend","Event":"gemeinde","prayer":"gebet","education":"bildung","community":"gemeinde","cultural":"kultur","youth":"jugend","women":"frauen"}
KAT_N = {"religious":"religioes","education":"bildung","social":"soziales","events":"veranstaltung","announcements":"ankuendigung","community":"gemeinde","Ankündigung":"ankuendigung","Neuigkeiten":"neuigkeiten","Gemeinde":"gemeinde","Wichtig":"neuigkeiten"}
TEILN = {"de":"{} Teilnehmer","tr":"{} katılımcı","en":"{} participants"}
v = []
for e in d["veranstaltungen_start"]:
    zeiten = [z.strip() for z in e["time"].split("-")]
    m = re.match(r"Jeden (\w+)", e["date"])
    if m:
        byday = TAG[m.group(1)]; datum = ANKER[byday]; regel = f"FREQ=WEEKLY;BYDAY={byday}"
    else:
        t = re.match(r"\w+\., (\d+)\. (\w+) (\d{4})", e["date"]) or re.match(r"(\d+)\. (\w+) (\d{4})", e["date"])
        datum = f"{t.group(3)}-{MONATE[t.group(2)]:02d}-{int(t.group(1)):02d}"; regel = None
    v.append({"slug": slug(e["title"]), "titel": {"de": e["title"]}, "kurztext": {"de": e["description"]}, "kategorie": KAT_V[e["category"]],
              "organisation": e["organization"], "zielgruppe": {"de": e["participants"]}, "ort": {"de": e["location"]},
              "beginn": f"{datum}T{zeiten[0]}", "ende": f"{datum}T{zeiten[1]}" if len(zeiten) > 1 else None, "wiederholung": regel,
              "empfohlen": bool(e["featured"]), "kosten": "kostenlos", "quelle": e["quelle"]})
for e in d["veranstaltungen"]:
    v.append({"slug": slug(e["title"]["de"]), "titel": e["title"], "kurztext": e["description"], "kategorie": KAT_V[e["category"]], "organisation": None,
              "teilnehmerHinweis": {k: f.format(e["participants"]) for k, f in TEILN.items()}, "ort": {"de": e["location"]},
              "beginn": f"{e['date']}T{e['time']}", "ende": None, "wiederholung": None, "empfohlen": bool(e["featured"]),
              "kosten": "kostenlos" if e["free"] else "kostenpflichtig", "quelle": e["quelle"]})
n = []
for e in d["nachrichten_start"]:
    t = re.match(r"(\d+)\. (\w+) (\d{4})", e["date"])
    datum = f"{t.group(3)}-{MONATE[t.group(2)]:02d}-{int(t.group(1)):02d}"
    kurz = e["excerpt"].replace("Imam Hassan Ali", "[Name – Imam]")
    n.append({"slug": slug(e["title"]), "titel": {"de": e["title"]}, "kurztext": {"de": kurz}, "absaetze": {"de": [kurz]}, "kategorie": KAT_N[e["category"]],
              "wichtig": e["category"] == "Wichtig", "veroeffentlicht": f"{datum}T10:00", "empfohlen": bool(e["featured"]),
              "lesezeit": int(re.match(r"\d+", e["readTime"]).group()), "quelle": e["quelle"]})
for e in d["nachrichten"]:
    n.append({"slug": slug(e["title"]["de"]), "titel": e["title"], "kurztext": e["excerpt"], "absaetze": {k: [x] for k, x in e["content"].items()},
              "kategorie": KAT_N[e["category"]], "wichtig": False, "veroeffentlicht": f"{e['publishedAt']}T10:00", "empfohlen": bool(e["featured"]),
              "lesezeit": e["readTime"], "quelle": e["quelle"]})
assert len({x["slug"] for x in v}) == len(v) and len({x["slug"] for x in n}) == len(n)
alle = json.dumps([v, n], ensure_ascii=False)
for name in ["Hassan", "Ahmed", "Yılmaz", "Hafız", "Hafiza"]:
    assert name not in alle, name
kopf = "// Beispielinhalte aus dem Bestand (ADR 0015), maschinell erzeugt mit _lauf/werkzeuge/erzeuge-seed-daten.py.\n// Jeder Eintrag trägt seine Fundstelle; Personennamen sind durch Platzhalter ersetzt. Nicht von Hand ändern.\n"
open("web/drizzle/seeds/daten/veranstaltungen.ts","w",encoding="utf-8").write(kopf + "import type { SeedVeranstaltung } from '../typen';\n\nexport const BEISPIEL_VERANSTALTUNGEN: SeedVeranstaltung[] = " + json.dumps(v, ensure_ascii=False, indent=2) + ";\n")
open("web/drizzle/seeds/daten/nachrichten.ts","w",encoding="utf-8").write(kopf + "import type { SeedNachricht } from '../typen';\n\nexport const BEISPIEL_NACHRICHTEN: SeedNachricht[] = " + json.dumps(n, ensure_ascii=False, indent=2) + ";\n")
print(len(v), len(n))
