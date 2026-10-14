# Datenschutzerklärung: Baustein „Hosting“, Version 2

Stand: 11.10.2026. Zugehörig zu AUFTRAG V-11 und ML-11 in `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md`.

> **Entwurf zur fachlichen Prüfung. Nicht veröffentlicht.** Dieser Baustein ist nicht in die Seeds (`web/drizzle/seeds/bereiche/rechtliches.ts`) und nicht in die Seite (`web/src/app/[locale]/(website)/datenschutz/page.tsx`) eingebaut. Der Wortlaut der bestehenden Rechtstexte bleibt unverändert (AUFTRAG G8, Leitplanke „Recht“). Alles in eckigen Klammern `[ ]` ist offen. Alles mit `[prüfen]` ist nicht belegt. Dies ist keine Rechtsberatung.

**Wo er hingehört:** Die Version 1 hat im Seed „datenschutz“ den Platzhalter „[Hoster – Angaben von der Gemeinde]“ (Abschnitt „Daten“) und „[Frist – Hoster und Vorstand]“ (Abschnitt „Speicherung“). Dieser Baustein ersetzt diese beiden Platzhalter, sobald die Verwaltung ihn übernimmt.

---

## Vorschlag für den Text

### Hosting der Website

Diese Website wird bei [Anbieter: Vercel Inc., Anschrift und Sitz prüfen] betrieben. Der Anbieter stellt die Website bereit und führt die Programme aus, die Ihre Anfragen beantworten. Die Programme sollen in der Region Frankfurt am Main laufen [prüfen: Die Angabe gilt im Betrieb über `vercel.json` (Zeile 3, `regions: ["fra1"]`); ob sie im Services-Modus wirkt, ist laut `web/docs/deploy/VERCEL.md` nicht geklärt]. Die Datenbank wird ebenfalls in Frankfurt betrieben [prüfen: Neon, Region laut Anbieter-Konsole].

### Server-Protokolle

Beim Aufruf einer Seite verarbeitet der Anbieter technische Angaben, die für die Auslieferung und den sicheren Betrieb nötig sind. Dazu gehören [prüfen: Liste der Felder laut Anbieter, zum Beispiel Adresse der aufgerufenen Seite, Zeitpunkt, Antwortstatus, Browserkennung und IP-Adresse]. Die Protokolle werden nach [Frist – Anbieter und Vorstand] gelöscht [prüfen: Aufbewahrungsfrist laut Anbieter; die Vercel-Doku hat dazu keine Angabe gefunden].

### Zweck und Rechtsgrundlage

Die Verarbeitung dient dem sicheren, stabilen und zuverlässigen Betrieb der Website: der Auslieferung der Seiten, dem Schutz vor Angriffen und der Fehlersuche. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Gemeinde hat ein berechtigtes Interesse an einer sicheren und verfügbaren Website. [Interessenabwägung: durch die Rechtsberatung zu bestätigen.]

### Auftragsverarbeitung

Der Anbieter verarbeitet Ihre Daten im Auftrag der Gemeinde. Dafür besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO [prüfen: Abschluss, Datum und Akzeptanzweg]. Die Datenbank und die Medienspeicherung erbringt der Anbieter über eigene Partner [prüfen: Neon und Vercel Blob, Vertragsketten und Unterauftragnehmer].

### Übermittlung in ein Drittland

Der Anbieter hat seinen Sitz in [prüfen: Sitz laut Vertrag]. Eine Verarbeitung oder ein Zugriff aus einem Drittland, insbesondere den USA, ist [prüfen: möglich oder ausgeschlossen]. Grundlage dafür ist [prüfen: EU-US Data Privacy Framework bzw. Standardvertragsklauseln laut Vertrag des Anbieters; in der Vercel-Doku nicht gefunden].

### Keine weiteren Dienste auf den öffentlichen Seiten

Diese Angaben betreffen die Auslieferung der Website. Die öffentlichen Seiten setzen keine Analyse- oder Messdienste ein. Die Karte im Abschnitt „Anfahrt“ lädt Kartendaten erst nach einem Klick; das beschreibt der Abschnitt „Empfänger“. [Prüfen: Die Karte ist im Code eingebunden, der Seed sagt „noch nicht eingebaut“. Siehe `VERARBEITUNGSVERZEICHNIS.md`, Abschnitt 2.6.]

---

## Hinweise für die Prüfung

1. **Belege je Aussage.** Region `fra1`: `vercel.json` (Repository-Wurzel, Zeile 3). Standardregion `iad1` und statische Dateien in allen Regionen: https://vercel.com/docs/llms-full.txt. Betriebsart und Vorschau: `web/docs/adr/0022-umgebung-und-betriebsart.md`. Datenbank und Medien: `web/docs/adr/0018-datenbank-auf-vercel.md` und `0020-medienspeicher-vercel-blob.md`.
2. **Analyse- und Messdienste.** Die Aussage „keine Analyse- oder Messdienste“ ist im Code belegt. Die Pakete `@vercel/analytics` und `@vercel/speed-insights` stehen nicht in `web/package.json`, und `web/src` importiert sie nicht. Bei jeder neuen Abhängigkeit muss die Prüfung wiederholt werden (AUFTRAG §4, Leitplanke „Datenschutz“).
3. **Fassung.** Version 1 (Seed „datenschutz“, Stand E0) bleibt bis zur Freigabe gültig. Die Verwaltung übernimmt Version 2 erst nach der fachlichen Prüfung (ML-11).
4. **Keine echten Angaben.** Dieser Entwurf enthält keine Personendaten, keine echten Domains und keine Zugangsdaten.

## Platzhalter in diesem Baustein

| Platzhalter                                          | Wer liefert                              |
| ---------------------------------------------------- | ---------------------------------------- |
| `[Anbieter: Vercel Inc., Anschrift und Sitz prüfen]` | Technik, Vorstand                        |
| `[Frist – Anbieter und Vorstand]`                    | Vorstand                                 |
| `[Interessenabwägung …]`                             | Rechtsberatung                           |
| `[prüfen: …]`                                        | Technik und Rechtsberatung je nach Punkt |
