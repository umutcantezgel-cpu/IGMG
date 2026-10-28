# ADR 0049 – Sichtbarkeit in Suche und Antwortmaschinen

- Status: angenommen · 28.10.2026 · Lauf „Marktstart IGMG“, Paket P8 · Bezug: Plan „IGMG-Daten für den Marktstart“ (P8,
  Welle 3), E-044 (Nutzerentscheidungen Nr. 1, 6, 7), E-045 (KERN 1.2: K-16 um Organization, WebSite, FAQPage), K-01,
  K-02, K-12, K-14, K-16, G-04, G-05, G-06 · Grundlage: Next-Doku `02-guides/json-ld.md`, `04-functions/generate-metadata.md`
  (robots, Zusammenführen), `01-metadata/sitemap.md`, `01-getting-started/15-route-handlers.md` (Cache Components) ·
  ergänzt ADR 0012 (CSP), ADR 0019 (Beispielmodus), ADR 0022 (Vorschauen noindex)

## Kontext

- Die Website soll bei Suchanfragen mit Ortsbezug gefunden werden („Gebetszeiten Wetzlar“, „Wetzlar namaz vakitleri“,
  „prayer times Wetzlar“, „Moschee Wetzlar“, „Wetzlar cami“, „Korankurs Wetzlar“, „Umra ab Frankfurt“) und Antwortmaschinen
  (KI-Suche) sollen die Gemeinde als eigene Entität richtig einordnen: Name, Ort, Gründung, Zugehörigkeit zur IGMG.
- Bisher: JSON-LD nur als `Mosque` mit dem Markennamen und ohne Organisation; `meta.beschreibung` war ein Platzhalter;
  Seitentitel und H1 kamen aus demselben Schlüssel; die Sitemap kannte keine CMS-Seiten und kein Änderungsdatum.
- Live läuft der Beispielmodus mit dem Konzept-Hinweis „Alle angezeigten Daten sind fiktiv“. Ohne Schranke lernen Suche
  und Sprachmodelle fiktive Inhalte (Nutzerentscheidung E-044 Nr. 6: `noindex`, solange der Hinweis aktiv ist).
- Im Projekt standen mehrere Namen nebeneinander. Im Crawl gibt es weitere „Fatih-Moscheen“ der IGMG (andere Städte).

## Entscheidung

1. **Entität und Namen** (`src/lib/seo/entitaet.ts`, eine Quelle für JSON-LD, Metadaten und `/llms.txt`):
   - Marke und Organisation „IGMG Wetzlar“; die Moschee heißt de „Fatih-Moschee Wetzlar“, tr „Wetzlar Fatih Camii“,
     en „Fatih Mosque Wetzlar“ (`meta.moscheeName`) – immer mit „Wetzlar“.
   - Gründung 1978 (E-044 Nr. 4), Dachverband laut Impressum von igmg.org, Regionalverband Hessen nur mit Namen und dem
     Stand des Belegs (07.04.2008). Sitz Wetzlar, Lahn-Dill-Kreis, Hessen. Keine Personennamen (G-04).
2. **Graph statt Einzelobjekt** (`gemeindeGraph` in `src/lib/seo/jsonld.ts`): ein `@graph` aus
   - `Organization` (`{Basis}/#organisation`): Name, `alternateName`, `foundingDate`, `location` → Moschee,
     `parentOrganization` (IGMG e.V. mit Anschrift), `memberOf` (Regionalverband, nur Name), `areaServed` Wetzlar;
   - `Mosque` (`{Basis}/#moschee`): Name in der Seitensprache, die anderen Sprachfassungen als `alternateName`, Anschrift
     immer mit Ort, Bundesland und Land, Straße und Postleitzahl nur gepflegt;
   - `WebSite` (`{Basis}/#website`): drei Sprachen, Beschreibung aus `meta.beschreibung`, Herausgeber → Organisation.
   - Ausgabe auf Startseite, Kontakt, Über uns und IGMG (`GemeindeJsonLd` bzw. direkt). `JsonLd.tsx` nimmt Objekt oder
     Graph; `<` wird auch im Graphen maskiert.
3. **Nur Gepflegtes, nur Eigenes (G-05):** Platzhalter in eckigen Klammern fallen weg; die E-Mail-Adresse des
   Schema-Standards ist ein Beispielwert (M-012) und erscheint nie; Öffnungszeiten nur aus in der Verwaltung gespeicherten
   Kontaktdaten (Seed-Werte widersprechen sich, M-019); Koordinaten erst nach Bestätigung (M-010); `sameAs` nur die eigenen
   https-Profile – nie igmg.org oder Wikipedia. Kein `logo` (Logo nur 40 px, M-016), kein `aggregateRating`, kein `Event`
   für Freitagsgebet oder Reisen, Dachverbands-Einträge nie als `NewsArticle` (der Herausgeber wäre falsch).
4. **FAQ nur sichtbar** (`faqSeite`): `FAQPage` nur aus Einträgen, die die Seite zeigt, ohne Platzhalter, höchstens zehn,
   Text in der Seitensprache mit gekennzeichnetem Rückfall auf Deutsch; sonst `null`. Rich Results gibt es dafür kaum noch –
   der Nutzen liegt bei Antwortmaschinen. Keine Antworten zum religiösen Recht ohne Freigabe (ADR 0030 Nr. 4, ADR 0047).
   Die Seiten /igmg, /gebetszeiten und /hadsch-umra binden ihre FAQ in eigenen Paketen ein.
5. **Metadaten je Seite** (Namensraum `seo`, `messages/bereiche/seo.json`, Liste `SEO_SEITEN`): eigener Metatitel und
   eigene Beschreibung je fester Seite, getrennt von der H1 (eine Titeländerung verändert das Design nicht).
   Titel höchstens 45 Zeichen, mit der Vorlage „%s · IGMG Wetzlar“ höchstens 60; die Startseite setzt ihren Titel ohne
   Vorlage (höchstens 60). Beschreibung 120–155 Zeichen mit Ortsbezug, je Sprache eigenständig auf die Suchabsicht
   geschrieben (nicht wörtlich übersetzt). `meta.beschreibung` (Standard des Layouts) ist gepflegt. Geprüft in
   `tests/unit/seo-metadaten.test.ts`.
6. **Indexierungs-Schranke** (`src/lib/seo/indexierung.ts`): Konzept-Hinweis eingeschaltet (Einstellung „allgemein“) **und**
   `VERCEL=1` → `robots: noindex, follow` im Wurzel-Layout; Seiten ohne eigene robots-Angabe erben sie. Lokal, in E2E und
   bei Lighthouse fehlt `VERCEL`, dort bleibt alles indexierbar. Schaltet die Verwaltung den Hinweis aus, wird die Website
   ohne weiteren Eingriff indexierbar (Tag „einstellungen“). `robots.txt` sperrt dafür nichts – ein Disallow verhinderte,
   dass Suchmaschinen das `noindex` überhaupt sehen. `/gebetszeiten/anzeige` (Vollbild für den Bildschirm der Moschee) ist
   immer `noindex, follow`. Startklar nennt die Schranke beim Konzept-Hinweis.
7. **Sitemap** (`baueSitemap` in `src/lib/seo/sitemap.ts`, `app/sitemap.ts` lädt nur Daten): jede Sprachfassung als eigener
   Eintrag mit allen hreflang-Alternativen und `x-default` = Deutsch; freie CMS-Seiten über `ladeSeitenAdressen()`.
   `lastModified` nur für Nachrichten, Veranstaltungen und Wissensthemen aus `aktualisiertAm` und nie im Beispielmodus
   (`ohneLaufzeitDatenbank()`: die Seeds tragen dort den Zeitpunkt des Baus, Suchmaschinen lernten, das Datum zu
   ignorieren). Keine `changeFrequency`/`priority`. Neue feste Routen kommen in `FESTE_ZIELE` (z. B. `/hadsch-umra`).
8. **`/llms.txt`** (`app/llms.txt/route.ts`, Text aus `src/lib/seo/llms.ts`): statisch vorgerendert; Name,
   Kurzbeschreibung, Fakten mit Quelle und Stand, je Sprache die Seiten aus `SEO_SEITEN` mit Titel und Beschreibung, Verweis
   auf die Sitemap. Keine Datenbankinhalte, keine Platzhalter. Unter derselben Schranke wie Nr. 6: solange sie greift, 404.
   Der Nutzen ist unbelegt (keine große Suchmaschine bestätigt eine Auswertung); der Aufwand ist gering und die Datei
   verrät nichts, was nicht ohnehin auf der Seite steht.
9. **Externe Links und Einbettungen:** Verweise auf den Dachverband sind reine Links mit `hreflang` der Zielsprache, sichtbarem
   Sprachhinweis und `rel="noopener noreferrer"` (Fundament, `Verweisliste`). Beim Seitenaufruf gehen keine Anfragen an
   Dritte (K-14): Videos und Karte laden erst nach Klick (`NachKlick`, youtube-nocookie, ohne Vorschaubild); dafür erlaubt
   die CSP global `frame-src 'self' https://www.openstreetmap.org https://www.youtube-nocookie.com` (Fundament, ADR 0012),
   `frame-ancestors` bleibt `'none'`. Fremde Bilder gibt es nicht (`img-src 'self'`, `remotePatterns: []`).
10. **Prüfung:** Unit `jsonld.test.ts` (Graph, `@id`-Verweise, Platzhalter, Beispiel-E-Mail, FAQ, Maskierung),
    `sitemap.test.ts`, `seo-metadaten.test.ts` (Längen, Schranke, `/llms.txt`); E2E `tests/e2e/seo.spec.ts` ruft jede
    Sitemap-Adresse ohne Browser ab (Titel, Beschreibung, canonical, hreflang, eine h1, JSON-LD, keine fremden
    img/script/iframe, `noindex` passend zur an `/llms.txt` erkannten Schranke) – auch gegen live über `E2E_BASIS`. Eine
    Linkprüfung der externen Ziele (`pnpm links:pruefen`) folgt in Welle 3.

## Folgen

- Schreibregeln für alle Inhalte (Redaktionshandbuch): Antwort zuerst, Fragen als Zwischenüberschriften, Entität beim ersten
  Nennen voll („Islamische Gemeinschaft Millî Görüş (IGMG)“), Ortsbezug Wetzlar, IGMG-Zahlen nur auf /igmg, sichtbare Quelle
  und Stand, keine Folge von acht oder mehr Wörtern aus fremden Texten.
- Bestätigt die Gemeinde E-Mail oder Öffnungszeiten (M-012, M-019), erscheinen sie erst, wenn sie in der Verwaltung
  gespeichert sind bzw. von der Beispieladresse abweichen; die bestätigte Beispieladresse bliebe sonst draußen.
- Neue tr/en-Texte (Namensraum `seo`, `meta.beschreibung`) brauchen die muttersprachliche Prüfung (M-102).
- Offen für Menschen: Google Business Profile, Bing Places und OpenStreetMap mit gleichem Namen, gleicher Anschrift und
  Telefonnummer; Search Console und Bing Webmaster nach der Domain (M-109); Politik gegenüber KI-Crawlern (M-110, bis dahin
  wie alle Crawler zugelassen).
