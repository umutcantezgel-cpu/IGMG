# ADR 0050 – Ein Rahmen für Website und Lernbereich, öffentliche Seiten ohne Platzhalter

- Status: angenommen · 22.11.2026 · Auftrag des Nutzers vor der Vorstellung am 23.11.2026 („Verschmelze, fusioniere bitte
  alles. Mach die Navigation so einfach wie nur möglich … so weit wie möglich ohne Platzhalter“) · Bezug: ADR 0037
  (Lern-App: Bereich und Oberflächensprachen), ADR 0032 (Menüs aus der Verwaltung), ADR 0035 (Funktionsschalter),
  ADR 0044 (Schrift der arabischen Oberfläche), K-01, K-02, K-12, G-05, KERN 4.0 §7/§9 · Grundlage: Next-Doku
  `04-functions/next-root-params.md` · schreibt ADR 0037 Nr. 2, 8 und 9 fort, ändert die Sichtabnahme-Regel PR-3

## Kontext

- Die Lern-App (`/lern-app/<ui>`, eigenes Wurzel-Layout) hatte einen eigenen Kopf und Fuß. Zur Website führte nur ein
  Link ganz unten („Website der Gemeinde“); Logo, Hauptmenü und Fuß der Website fehlten. Wer aus dem Menü „Bildung“ in
  die Lern-App ging, stand in einer anderen Website und fand nicht zurück.
- Das Menü „Bildung“ hatte sechs Punkte, einer davon („Islamunterricht“) mit demselben Ziel wie „Islam › Wissen“; die
  Lern-App hieß dort „Sprachen lernen“, im Kopf der Lern-App „[IGMG Lernen]“ (Platzhalter, ADR 0037 OFFENE FRAGE).
- Öffentliche Seiten zeigten Fakten, die nur die Gemeinde liefern kann, als Text in eckigen Klammern („[Adresse]“,
  „[Telefonnummer]“ im Fuß jeder Seite, „[Name – Vorsitzender]“, „[Datum – von der Gemeinde]“ …) und Fotos als
  beschriftete Streifenflächen („Foto: Beitragsbild“). Für die Vorstellung soll die Seite wie ein fertiges Produkt wirken.

## Entscheidung

1. **Ein Rahmen.** `components/lernapp/Rahmen.tsx` rendert Kopf (`Header`) und Fuß (`Footer`) der Website; dazwischen
   stehen die Leiste „Lern-App“ (Start, Fortschritt, Wortschatz, Einstellungen – auf Tiefgrün, an der Stelle der
   Gebetszeitenleiste), der Inhalt und ein schmales Hinweisband des Lernbereichs (Gerätehinweis, Oberflächensprachen,
   Quellen, mit Schaltern Gruppe und Anmelden). Im Kopf ist „Bildung“ markiert, der Menüpunkt „Lern-App“ trägt den Haken.
   Die Links des Lernbereichs bleiben einfache `<a>` (ADR 0037 Nr. 9); Kopf und Fuß nutzen `next/link` wie auf der
   Website – zwischen den beiden Wurzel-Layouts lädt Next die Seite ganz.
2. **Sprache der Website-Bausteine im Lernbereich** (`src/i18n/request.ts`): ohne Root-Parameter `[locale]` bestimmt der
   Root-Parameter `[ui]` die Website-Sprache – tr bleibt tr, de und ar bekommen Deutsch (die Website gibt es nicht auf
   Arabisch; so führten die Links schon bisher). Unter anderen Adressen bleibt es bei `notFound()`. Statisch wie zuvor
   (nur Root-Parameter, keine Cookies, keine Kopfzeilen). Im Browser weiterhin kein next-intl (KERN 4.0 §9).
   In der arabischen Oberfläche stehen Kopf und Fuß als `lang="de" dir="ltr"` mit den Schriften der Website
   (`[data-website-rahmen]` in `globals.css`); der Lernbereich dazwischen bleibt arabisch und `rtl` (ADR 0044).
3. **Sprachwahl und Anmelden im Kopf.** Der Kopf bekommt im Lernbereich die Oberflächensprachen (de, tr, ar) mit den
   Adressen derselben Lernseite (`lernbereich` an `Header`); `SprachEintrag.code` ist dafür eine Zeichenkette. „Anmelden“
   führt mit Konten auf die Anmeldung im Lernbereich (zurück an dieselbe Stelle, ADR 0037 Nr. 4), sonst wie auf der Website.
4. **Menü „Bildung“: fünf Punkte ohne Dopplung** – Lernen (Übersicht), Lern-App, Elifbe, Korankurse, Schüler-Voranmeldung.
   „Islamunterricht“ entfällt, bis es ein eigenes Angebot gibt (M-022). Ein Menü aus der Verwaltung (ADR 0032) hat
   weiterhin Vorrang vor dem Bestand.
5. **Name der Lern-App.** „IGMG Wetzlar – Lernen“, kurz „IGMG Lernen“ (tr „IGMG Wetzlar – Öğren“, „IGMG Öğren“). Für ar
   setzt weiterhin kein Agent einen arabischen Namen: dort steht nur die Marke („IGMG Wetzlar“, „IGMG“). Die Leiste im
   Lernbereich heißt „Lern-App“ / „Öğrenme uygulaması“ / „تطبيق التعلّم“ (wie bisher in `rahmen.navigation`).
   Der Vorstand kann den Namen jederzeit ändern (`messages/lernapp/*.json`, `meta.name`, `meta.kurzname`).
6. **Ohne Netz.** Der Service Worker des Lernbereichs hält die Logos des gemeinsamen Rahmens vor (`/bilder/logos/…`,
   auch über `/_next/image`), Vorrat zuerst, in der Hülle. Die Programmteile des Kopfs liegen wie alle unter
   `/_next/static/` schon im Vorrat. Links auf die Website brauchen Netz (dort gilt der Root-Worker mit `/offline`).
7. **Öffentliche Seiten ohne Platzhalter** (`src/lib/inhalt/platzhalter.ts`): Platzhalter der Gemeinde „[…]“ bleiben in
   der Datenbank und in der Verwaltung sichtbar (dort zeigen sie, was fehlt; Cockpit „Startklar“). Öffentlich gilt:
   eine Angabe, die nur ein Platzhalter ist, entfällt samt Zeile (`angabe`); in Fließtext entfällt jeder Satz mit
   Platzhalter (`ohnePlatzhalter`, `Text platzhalter`). **Nichts wird erfunden.** Ausnahmen, in denen die Klammern
   bleiben: die Rechtstexte (Impressum, Datenschutz, Barrierefreiheit – weiterhin gekennzeichnet mit `MitPlatzhaltern`,
   dort darf nichts stillschweigend fehlen), Lizenztexte und Übersetzungen (Einschübe). Die Regel PR-3 der Sichtabnahme
   („Platzhalter nur gekennzeichnet“) gilt damit nur noch für die Rechtstexte.
8. **Bildflächen ohne Foto** (`Bildplatzhalter.tsx`, `achtstern-flaeche`): Achtstern-Gitter auf hellem Grün mit einem
   Achtstern in der Mitte statt beschrifteter Streifen; rein dekorativ. Weiterhin keine generierten Moscheebilder, keine
   Kuppel- oder Halbmondgrafik (M-018).
9. **Startseite: „Was Sie hier finden“** (`start/Ueberblick.tsx`): sechs Einstiege mit je einem Satz Nutzen
   (Gebetszeiten, Koran, Lern-App, Elifbe, Veranstaltungen, Mitglied werden) fest unter dem Kopf – kein Abschnitt der
   sortierbaren Liste (F-40). Ohne Schalter `lernapp` rückt „Kontakt“ nach.

## Prüfung (22./23.11.2026)

- Typen, Lint, Unit (234 Dateien, 4196 Tests) und Sprachprüfung grün; Produktionsbau mit 2146 Seiten.
- E2E am Produktionsbau, Projekte „telefon“ und „desktop“: neuer Spec `tests/e2e/ein-rahmen.spec.ts` (Navigation
  Website ↔ Lernbereich, Sprachwahl, arabische Oberfläche, Fuß ohne Platzhalter) und alle Specs der Lern-App grün
  (Rahmen, Lernpfad, Lektion, ohne Netz, Netzprotokoll, Tastatur, axe).
- Platzhalter-Suche im Browser über 301 Adressen (de, tr, en, ohne Rechtstexte): keine eckigen Klammern im Inhalt, in
  Titeln, Meta-Beschreibungen, `alt` und `aria-label`.
- JS-Budgets (`scripts/lernapp-budget.mjs`): Hülle 156,2 KB gesamt, eigener Anteil 14,6 KB (≤ 20); Start 160,4 KB
  (≤ 180); Lernpfad 171,5 KB (≤ 180); Spieler mit der Testlektion 202,6 KB (≤ 210), ungünstigste echte Lektion 206,9 KB
  (≤ 210). Verfehlt bleibt allein „zusätzlich zur Hülle“ der ungünstigsten echten Lektion (Sprechen, 63,8 KB statt
  ≤ 60) – eine Differenz zwischen zwei Seiten mit demselben Rahmen, vom Kopf der Website unabhängig.
- Ohne Netz: Der Service Worker legt das Logo des Kopfs in die Hülle (`/_next/image?url=/bilder/logos/…`).

## Folgen

- Von jeder Seite des Lernbereichs führt ein Klick auf Logo oder Menü zurück auf die Website und umgekehrt; es gibt einen
  Kopf, eine Sprachwahl, einen Fuß.
- Die Seiten des Lernbereichs laden die Programmteile des Website-Kopfs mit (Menüs, Telefonmenü, Sprachwahl,
  „Jetzt geöffnet“). Sie zählen zum Grundstock, den auch die Website lädt; die Budgets (KERN 4.0 §9) misst
  `scripts/lernapp-budget.mjs` am Bau.
- Arabische Oberfläche: Kopf und Fuß sind deutsch. Eine arabische Fassung der Website ist nicht geplant.
- Was der Gemeinde noch fehlt, sieht man nicht mehr auf der öffentlichen Seite, sondern in der Verwaltung
  (Seiteninhalte, Cockpit „Startklar“) und in `_lauf/MENSCHEN.md`. Die Rechtstexte bleiben sichtbar unvollständig, bis
  die Gemeinde und die Rechtsberatung liefern (M-111 ff.).
