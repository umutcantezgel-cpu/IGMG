# ADR 0047 – KI-Regel 3: gekennzeichnete Entwürfe religiöser Erklärtexte auf der Website (Fortschreibung von ADR 0030 Nr. 4)

- Status: angenommen (umgesetzt 28.10.2026) (Lauf Marktstart IGMG, Paket P5) · Bezug: Nutzerentscheidung vom 27./28.10.2026
  (`_lauf/ENTSCHEIDUNGEN.md` E-044 Nr. 5), Plan „Marktstart IGMG“ P5 · **schreibt ADR 0030 Nr. 2 und Nr. 4 für die
  Wissensthemen der Website fort**; ADR 0030 Nr. 1, 3 und 5–8 gelten unverändert · ergänzt ADR 0035 Nr. 2 (neuer Schalter)
  · Vorbild: ADR 0040, Fortschreibung „Vorschau des Wissenskurses“ (L3-E22) · Schnittstellen: ADR 0046 (Inhalte vom
  Dachverband), ADR 0049 (Indexierungs-Schranke)

## Kontext

- ADR 0030 Nr. 4: Kein Agent schreibt Verse, Hadithe, Bittgebete, religiöse arabische Texte, Übersetzungen,
  Wortbedeutungen oder Tajwid- und Fiqh-Erklärungen. Nr. 2: Öffentlich ist nur der Status „geprüft“.
- Für den Marktstart braucht die Website Erklärtexte, die Menschen in Wetzlar tatsächlich suchen: Hadsch und Umra, der
  islamische Kalender mit dem Monatsbeginn nach der IGMG, Zakat, Fitra, Fidya und Kurban, das Freitagsgebet. Sie sollen
  auch auf `/hadsch-umra`, `/kalender`, `/ramadan` und `/spenden` erscheinen (Pakete P4 und P7).
- Ohne Imam-Konto stauen sich Freigaben (MN-20); bis dahin zeigte die Website nur Platzhalter.
- Die IGMG hat der Nutzung ihrer Inhalte zugestimmt (E-044 Nr. 1); die Texte werden eigenständig formuliert.
- **Nutzerentscheidung E-044 Nr. 5 (27./28.10.2026):** Der Agent schreibt die Erklärtexte. Sie gehen sofort live, deutlich
  gekennzeichnet als „Entwurf zur Prüfung – noch nicht vom Imam geprüft“. Der Imam gibt sie über das bestehende
  Freigabeverfahren frei. Koranverse, Hadithe und Bittgebete schreibt der Agent weiterhin nie (G-06).

## Entscheidung

1. **Geltung:** Wissensthemen der Website (Tabelle `wissen_thema`, `/islamisches-wissen` und `/islamisches-wissen/[thema]`)
   und die Bausteine, die sie einbetten (`WissenErklaerung`). Nicht für Verse, Hadith-Übersetzungen, Wortbedeutungen,
   Tajwid, besondere Tage, Anzeige-Folien und freie Seiten; die Lern-App folgt ADR 0040.
2. **Erlaubt (KI-Entwurf):** Erklärtexte in eigenen Worten auf Deutsch, Türkisch und Englisch, ausschließlich gestützt auf
   benannte und verlinkte Quellen des Dachverbands (igmg.org, igmgreisen.com, hasene.org). Aufbau: Antwort zuerst, Fragen
   als Zwischenüberschriften, Ortsbezug Wetzlar, am Ende eine Quellenliste mit Stand. Keine Folge von 8 oder mehr Wörtern
   wörtlich aus den Quellen (außer Titeln und Eigennamen).
3. **Verboten bleibt** (ADR 0030 Nr. 4, G-06): Verse, Hadithe, Bittgebete (auch die Talbiya), Übersetzungen religiöser
   Texte, arabische Schrift, Rechtsgutachten über das in der Quelle Gesagte hinaus, Einzelfallauskünfte und Beträge
   (Fitra, Fidya und Zakat gibt die IGMG bekannt). Eine Surenangabe steht nur dort, wo die verlinkte Quelle sie nennt.
   Ein Wächter prüft das bei jedem Lauf (`tests/unit/wissen-entwuerfe.test.ts`, `tests/unit/inhalte-waechter.test.ts`).
4. **Anlage:** Seed `drizzle/seeds/bereiche/wissen-entwuerfe.ts` (nach `wissen`, nicht über dessen Liste `THEMEN`, die
   alles als geprüften Bestand markiert): `status = veroeffentlicht`, `freigabe = zur_pruefung`,
   `verfasstVon = 'KI-Entwurf (ADR 0047)'`, `istBeispiel = true`, `quelle` mit allen verlinkten Adressen und Stand, ein
   Antrag „zur Prüfung“ im Freigabe-Verlauf und die erste Fassung als Revision. Slugs: `hajj-umrah`, `islamic-calendar`,
   `zakat-fitra-qurban`, `friday-prayer`.
5. **Schalter `website_wissen_vorschau`** (ADR 0035 Nr. 2): ohne Personendaten, ohne Voraussetzung, Standard an in allen
   Betriebsarten (`IN_PRODUKTION_AN`, Nutzerentscheidung). An: Themen „zur Prüfung“ sind öffentlich. Aus: allein ADR 0030
   Nr. 2 – öffentlich ist nur „geprüft“. Er gilt für jedes eingereichte Thema, auch für Texte der Redaktion; diese tragen
   denselben Hinweis, nur ohne die Angabe „KI“.
6. **Nur „zur Prüfung“, nie „entwurf“:** Ein nie eingereichtes oder von der religiösen Prüfung zurückgewiesenes Thema
   (Stand „entwurf“) bleibt immer verborgen. So nimmt der Imam einen einzelnen Text mit „Zurückweisen“ sofort von der
   Website. (Der Paketauftrag nannte „entwurf oder zur_pruefung“; bewusst enger, sonst bliebe ein zurückgewiesener Text
   öffentlich.)
7. **Kennzeichnung überall, wo der Text erscheint:**
   - Themenseite: Marke „Entwurf“ im Kopf vor dem Kurztext, oben im Inhalt der Hinweis „Entwurf zur Prüfung – noch nicht vom
     Imam geprüft“ mit Erklärung; solange der Stand unverändert aus dem KI-Entwurf stammt, sagt der Hinweis offen, dass eine
     KI ihn aus den verlinkten Quellen der IGMG entworfen hat (Transparenz gegenüber Lesenden).
   - Übersicht und Themenleiste: Marke „Entwurf“ am Thema. Suchtreffer der Volltextsuche: Marke „Entwurf“.
   - Eingebettete Erklärung (`WissenErklaerung`): kompakter Hinweis vor dem Kurztext.
   - Texte in `messages/bereiche/wissen.json` (`wissen.entwurf.*`), dreisprachig.
8. **Suchmaschinen und Antwortmaschinen:** Entwurfs-Themenseiten tragen `noindex, follow` (`robots` in `generateMetadata`,
   nur bei Entwürfen – sonst würde die Seite die Indexierungs-Schranke des Layouts überschreiben, ADR 0049) und stehen
   nicht in der Sitemap. Die interne Suche und der Titel-Index ohne Datenbank finden sie mit dem Schalter.
9. **Freigabe** unverändert nach ADR 0030: Warteschlange Verwaltung › Freigaben, Rolle `religioese_pruefung`, eine
   Freigabe im Vier-Augen-Prinzip. Der Verfasser-Vermerk der KI ist kein Konto; jede prüfende Person darf freigeben. Danach
   ist das Thema „geprüft“: Kennzeichnung und `noindex` entfallen, es steht in der Sitemap. Jede inhaltliche Änderung setzt
   auf „zur Prüfung“ zurück – der Text erscheint dann wieder gekennzeichnet.
10. **Cache:** Die Abfragen (`src/server/queries/wissen.ts`, `suche.ts`) lesen den Schalter in der gecachten Funktion und
    tragen zusätzlich den Tag `einstellungen` (wie die Lern-App, ADR 0035 Fortschreibung Lern-App 3): Ein Wechsel in der
    Einstellung wirkt, sobald dieser Tag verfällt (beim Start, ADR 0017, oder mit `POST /api/wartung/cache-erneuern`), ein
    Wechsel der Umgebung mit der nächsten Bereitstellung. Die Verwaltung erneuert den Tag
    `wissen` auch bei Änderungen an Themen „zur Prüfung“ (`wissenCacheBetroffen`, `src/lib/wissen/entwurf.ts`).
11. **Cockpit:** Startklar-Prüfung `gemeinde.wissen-vorschau` (Hinweis mit der Zahl sichtbarer Entwürfe); der Schalter hat
    dort seinen Namen.
12. **Abschaltweg:** für alle Texte `FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus` in der Umgebung (danach neu bereitstellen) oder
    die Einstellung `funktionen` mit `website_wissen_vorschau: false` (danach Cache erneuern, Nr. 10); je Text „Zurückweisen“ in der Warteschlange oder
    „nicht sichtbar“ in Verwaltung › Islamisches Wissen.

## Alternativen

- ADR 0030 unverändert, also Platzhalter bis zur Freigabe: verworfen durch die Nutzerentscheidung.
- Entwürfe nur in der Warteschlange, nicht öffentlich: verworfen; der Nutzer will sie sofort live.
- Kennzeichnung ohne `noindex`: verworfen. Such- und Antwortmaschinen würden ungeprüfte Texte ohne Hinweis als Auskunft
  der Moschee übernehmen.
- Auch den Stand „entwurf“ zeigen: verworfen, weil „Zurückweisen“ dann nicht wirken würde.
- Zwei Freigaben wie in der Lern-App: nicht gewählt. Für Wissensthemen der Website gilt ADR 0030 mit einer Freigabe.
- Nur Texte mit dem KI-Vermerk zeigen: nicht gewählt. Nach einer Korrektur der Redaktion wäre der Text sonst verschwunden;
  alle eingereichten Themen werden gleich behandelt und gleich gekennzeichnet.

## Folgen

- ADR 0030 trägt im Kopf den Vermerk „Nr. 2 und 4 für die Wissensthemen der Website fortgeschrieben durch ADR 0047“.
- Z-15 („0 ungeprüfte religiöse Inhalte öffentlich“) gilt für die Website nur bei ausgeschaltetem Schalter; die Abweichung
  beruht auf der Nutzerentscheidung E-044 Nr. 5.
- Tests: Unit `funktionen`, `wissen-entwuerfe` (Regeln, Auszeichnung, Seed-Wächter), `wissen-erklaerung`; Integration
  `wissen-entwuerfe` (Schalter aus 12 / an 16 Themen, davon 4 gekennzeichnet; Einstellung und Umgebung; Freigabe entfernt
  die Kennzeichnung; Zurückweisen nimmt den Text herunter; Warteschlange; Cache; Cockpit; Titel-Index); E2E
  `wissen-entwuerfe.spec.ts` (Kennzeichnung, `noindex`, Sitemap, Fremdanfragen, axe). `verwaltung-wissen.test.ts` bleibt
  unverändert grün, weil die Integrationstests mit ausgeschaltetem Schalter laufen.
- Menschen: Der Imam prüft die vier Entwürfe (MENSCHEN M-101); die türkischen und englischen Texte prüfen Muttersprachler
  (M-102); der Vorstand entscheidet, ob die Vorschau beim öffentlichen Start an bleibt.
- Offen: Der Stand-Kasten auf `/quellen` sagt noch, religiöse Inhalte erschienen erst nach der Prüfung; er braucht einen
  Ausnahme-Satz wie für die Lern-App (Paket P7 bzw. Welle 3).
- Risiko: ungeprüfter religiöser Text ist öffentlich. Abfederung: Quellenbindung, Wächter, deutliche Kennzeichnung,
  `noindex`, „Zurückweisen“ je Text und Abschalten für alle.
