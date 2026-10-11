# Lichtung (c) – Bildreferenzen aus design/ erzeugen · ERGEBNIS: GELUNGEN (2026-10-11)

**Werkzeug:** `_lauf/werkzeuge/referenz/render.mjs` (Playwright 1.64.0, Chromium headless shell 1248). Aufruf: `cd _lauf/werkzeuge/referenz && node render.mjs [Filter]`.

**Verfahren:**
- Eigener Node-Server nur auf 127.0.0.1 liefert die Workspace-Wurzel (design/) lesend aus; `_lauf/` und `uploads/` sind gesperrt.
- Die Artboards sind 1280 px breit gebaut. Eine Hülle (`/__ref.html`) bindet jedes Artboard wie `08`/`09` per `<dc-import>` in einen Rahmen fester Breite (390 bzw. 1440 px) ein; Eigenschaften werden als kebab-case-Attribute gesetzt. So schalten Header, PrayerTimesBar und Inhalte über ihre eigene Breite auf das Telefon-Layout (Laufbuch D-05).
- React/ReactDOM 18.3.1 von unpkg werden einmal geladen und lokal zwischengespeichert (gleiche Bytes, SRI gültig). Google Fonts werden beim Rendern geladen.
- Bereit-Signal: `#dc-root` vorhanden, keine `.sc-placeholder`, kein `html.sc-dc-streaming`, `document.fonts.ready`, zwei Frames. Übergänge abgeschaltet.
- Varianten: jede Option jeder Eigenschaft (enum, boolean, int mit max) einzeln, übrige auf Standardwert.
- Dialoge mit fester Überlagerung (DisclaimerDialog, TicketDialog) als Ansichtsfenster-Bild.

**Ergebnis:** 238 Bilder, 0 Abbrüche, 0 Konsolen- oder Laufzeitfehler. Verzeichnis `_lauf/belege/referenz/` (Bilder lokal, E-010), Liste in `_lauf/belege/referenz/index.json`.

| Artboard | Bilder |
|---|---|
| 01 Grundlagen | 1 |
| 02 Komponenten | 1 |
| AboutUs | 2 |
| AnatolianOrganization | 2 |
| BaseComponents | 2 |
| BoardMembers | 2 |
| Breadcrumbs | 2 |
| Contact | 2 |
| CourseCard | 2 |
| Dashboard | 20 |
| DisclaimerDialog | 2 |
| EventCard | 2 |
| EventDetails | 2 |
| Events | 4 |
| Footer | 6 |
| FormWizard | 14 |
| FullscreenPrayerTimes | 6 |
| Header | 38 |
| Home | 8 |
| IGMGInfo | 10 |
| Icon | 2 |
| IslamicKnowledge | 6 |
| JoinUs | 10 |
| LoginDialog | 8 |
| MosqueRequest | 10 |
| News | 4 |
| NewsCard | 2 |
| NewsDetails | 2 |
| OrgCard | 2 |
| OrganizationPage | 2 |
| PageHeader | 2 |
| PersonCard | 2 |
| PrayerTimes | 10 |
| PrayerTimesBar | 6 |
| Projects | 2 |
| Quran | 12 |
| QuranCourses | 2 |
| Rechtliches | 2 |
| StudentRegistration | 12 |
| Styleguide | 2 |
| TicketDialog | 4 |
| WomensOrganization | 2 |
| WomensYouthOrganization | 2 |
| YouthOrganization | 2 |

**Grenzen:** Rendern braucht Netz (unpkg beim ersten Lauf, Google Fonts immer). Die Zustände aus `08` sind hier als Eigenschafts-Varianten der Original-Artboards erzeugt (nicht die 50-%-Verkleinerungen aus 08).
