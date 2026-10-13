Die zehn ADR-Entwürfe liegen in `/home/user/IGMG/web/docs/adr/`. Status jeweils „vorgeschlagen (Lauf Gemeinde-Plattform)“. Nichts committet, nichts gepusht.

| Thema | Datei |
|---|---|
| 0025 Offene Datensätze im Repository mit SHA-256-Pin (ersetzt Download aus ADR 0009) | `/home/user/IGMG/web/docs/adr/0025-offene-datensaetze-im-repository.md` |
| 0026 Kontoarten, Gemeinde-Rollen, Gruppenrechte, Admin-Ausschluss für Chat | `/home/user/IGMG/web/docs/adr/0026-kontoarten-rollen-und-gruppenrechte.md` |
| 0027 Echtzeit: adaptiver Abruf und Centrifugo-Signal | `/home/user/IGMG/web/docs/adr/0027-echtzeit-abruf-und-signal.md` |
| 0028 Gebetszeiten „Mein Ort“ im Browser, Methode IGMG-Gemeinschaftskalender | `/home/user/IGMG/web/docs/adr/0028-gebetszeiten-mein-ort.md` |
| 0029 Audio-Speicher, Direkt-Upload, Rezitations-Werkstatt | `/home/user/IGMG/web/docs/adr/0029-audio-speicher-und-rezitationswerkstatt.md` |
| 0030 Religiöse Freigabe und KI-Regel | `/home/user/IGMG/web/docs/adr/0030-religioese-freigabe-und-ki-regel.md` |
| 0032 CMS: Blöcke, Seiten, Revisionen, Freigaben, Menüs, Weiterleitungen | `/home/user/IGMG/web/docs/adr/0032-cms-bloecke-seiten-revisionen.md` |
| 0034 Web Push ohne Bibliothek (RFC 8291/8292) | `/home/user/IGMG/web/docs/adr/0034-web-push-ohne-bibliothek.md` |
| 0035 Funktionsschalter | `/home/user/IGMG/web/docs/adr/0035-funktionsschalter.md` |
| 0036 Lokaler-Server-Kit | `/home/user/IGMG/web/docs/adr/0036-lokaler-server-kit.md` |

**Nummern:** Höchste vorhandene ADR war 0024. Der Plan reserviert 0025 bis 0037 (E1) und nennt im Text die Nummern 0026, 0027, 0029, 0032, 0034, 0035 und 0036. Deshalb habe ich diese Nummern übernommen. Die übrigen Themen belegen 0025, 0028 und 0030. Frei bleiben 0031, 0033 und 0037.

**Index:** In `web/docs/adr/` gibt es kein README und keinen Index. Ich habe nichts ergänzt.

**Offene Fragen (im Text als OFFENE FRAGE markiert):**
- ADR 0025: Die Tanzil-Variante (Uthmani oder Simple) wird erst in E0 bestimmt.
- ADR 0025: Ob eine Ausschlussregel für `web/daten/quran/` in `.gitignore` steht, habe ich nicht geprüft.
- ADR 0028: Ob die Methode IGMG-Gemeinschaftskalender der Gemeinde entspricht, entscheidet der Imam (MN-09).
- ADR 0036: Verwahrung des `age`-Schlüssels und Zugang der Neon-Leserolle sind im Plan nicht festgelegt.

**Alternativen:** Wo der Plan keine eigene Alternative nennt, habe ich die Ablehnungen aus dem Plan (Abschnitt „Bewusst abgelehnt“, Kinderschutz, Ziele) bzw. ADR 0009 verwendet.

**Versehen:** Beim Schreiben habe ich kurz eine Hilfsdatei `0029-…md.tmp-unused` angelegt und sofort wieder gelöscht. Im Ergebnis gibt es sie nicht mehr.