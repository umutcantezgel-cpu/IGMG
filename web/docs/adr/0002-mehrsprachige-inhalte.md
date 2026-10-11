# ADR 0002 – Mehrsprachige Inhalte im Datenmodell

- Status: angenommen · 2026-10-11 · P1 · Kern 1.0 · Bezug: K-02, K-05, K-16, Z-03, Z-04

## Ziel
Datenbankinhalte (Veranstaltungen, Neuigkeiten, Ankündigungen, Seiteninhalte, Kurse, Organisationen, Medien-Alt-Texte) sind auf Deutsch Pflicht, auf Türkisch und Englisch optional; fehlt eine Sprache, zeigt die Seite sichtbar den deutschen Text. Ehrenamtliche pflegen alle drei Sprachen in **einem** Formular. Volltextsuche je Sprache (ADR 0013).

## Wege
1. **JSONB je übersetzbarem Feld:** `titel jsonb not null` mit `{ de: string, tr?: string, en?: string }`, Prüfbedingung `titel ? 'de'`.
2. **Übersetzungstabelle je Entität:** `veranstaltung` + `veranstaltung_uebersetzung(veranstaltung_id, sprache, titel, beschreibung, …)`.
3. **Spalte je Sprache:** `titel_de`, `titel_tr`, `titel_en`.

## Bewertung
| Kriterium | 1 JSONB | 2 Tabelle | 3 Spalten |
|---|---|---|---|
| Einfach für Formulare/Server Actions | ++ (ein Objekt) | – (Upsert je Sprache) | + |
| Typsicherheit mit Drizzle/Zod | ++ (`$type<Mehrsprachig>()`, ein Zod-Schema) | + | + |
| Rückfall auf Deutsch | ++ (eine Hilfsfunktion) | + (Join + coalesce) | + |
| Volltext je Sprache | + (generierte Spalten aus `feld->>'de'`) | ++ | ++ |
| Weitere Sprache später | ++ (keine Migration) | ++ | – (Migration je Feld) |
| Abfragen/Joins | ++ | – | ++ |
Gewählt: **Weg 1**.

## Festlegungen
- Typ `Mehrsprachig = { de: string; tr?: string; en?: string }` in `src/lib/i18n/inhalt.ts`; Zod-Schema `mehrsprachig({ pflicht: 'de', max })`.
- Lesen nur über `waehle(feld, locale): { text: string; sprache: Locale; rueckfall: boolean }`; Komponenten zeigen bei `rueckfall` ein `lang="de"`-Attribut am Element und einen kleinen Hinweis „Nur auf Deutsch verfügbar“ (Text aus messages).
- Rich-Text-Felder (ADR 0006) speichern je Sprache ein Tiptap-Dokument: `{ de: Doc, tr?: Doc, en?: Doc }`.
- **Slugs:** ein Slug je Entität, aus dem deutschen Titel erzeugt, eindeutig, unveränderlich nach Veröffentlichung (Weiterleitungstabelle bei Änderung). Der Pfadteil davor ist lokalisiert (`/veranstaltungen/x`, `/tr/etkinlikler/x`, `/en/events/x`).
- Leere Strings gelten als „nicht vorhanden“ (beim Speichern entfernt).

## Umkehrprobe
Falsch, wenn je Sprache eigene Status (z. B. „türkisch veröffentlicht, englisch Entwurf“) nötig werden oder Inhalte sehr groß werden. Dann Übersetzungstabelle nur für diese Entität ergänzen; die Lesefunktion `waehle` kapselt das.

## Folgen zweiter Ordnung
- Suche: generierte `tsvector`-Spalten je Sprache aus dem JSONB (ADR 0013).
- Export/Seeds: JSON-nah, einfach prüfbar.
- Die Verwaltung zeigt je Feld drei Eingaben (Tabs DE/TR/EN) mit Kennzeichnung „Pflicht“ nur bei DE.
