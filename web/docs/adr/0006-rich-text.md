# ADR 0006 – Rich-Text-Format

- Status: angenommen · 2026-10-11 · P1 · Kern 1.0 · Bezug: K-12, K-13, K-17, G-09, Z-04, Z-09

## Ziel
Ehrenamtliche formatieren Texte (Absätze, Überschriften, Listen, Fett/Kursiv, Links, Bilder aus der Mediathek) ohne HTML-Kenntnisse; öffentliche Seiten liefern **kein** Editor-JavaScript aus und sind sicher gegen eingeschleustes HTML.

## Wege
1. **Tiptap 3 (nur MIT-Teile)**, Speicherung als Tiptap-JSON, öffentliche Ausgabe serverseitig mit `@tiptap/static-renderer` als React-Elemente.
2. **Markdown** in einer Textarea, Ausgabe mit einem Markdown-Renderer.
3. **HTML** aus einem WYSIWYG-Editor, Ausgabe nach Bereinigung (sanitize-html).

## Bewertung
Markdown überfordert die Zielgruppe (Probeläufer-Profil: 60 Jahre, wenig Technik). HTML-Speicherung braucht dauerhaft korrektes Bereinigen (XSS-Risiko). **Weg 1 gewählt:** strukturiertes JSON mit festem Schema; das Rendern erzeugt nur erlaubte Knoten – es gibt keinen Weg, rohes HTML auszugeben.

## Festlegungen
- Pakete (exakt gleiche Version, ADR 0001): `@tiptap/core`, `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit` (ohne CodeBlock, ohne HorizontalRule-Varianten außer Standard), `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/static-renderer`. Keine Pro-Erweiterungen.
- Erlaubte Knoten/Marken: paragraph, heading (Ebene 2–3), bulletList, orderedList, listItem, blockquote, hardBreak, text; bold, italic, link. Bild nur mit `medium_id` aus der Mediathek (Alt-Text kommt aus dem Medium, K-10).
- Links: nur `https:`, `mailto:`, `tel:` und relative Pfade; `rel="noopener noreferrer"` bei extern; Prüfung in Zod beim Speichern **und** beim Rendern.
- Speicherung: JSONB `{ de: Doc, tr?: Doc, en?: Doc }` (ADR 0002); Zod-Schema validiert die Baumstruktur (Tiefe, Knotentypen, Länge).
- Öffentliche Ausgabe: Server-Komponente `RichText` mit `renderToReactElement` und eigenen Komponenten-Zuordnungen (Tokens, Typografie aus dem Design).
- Editor nur in der Verwaltung (Client-Komponente, dynamisch importiert).

## Umkehrprobe
Falsch, wenn Inhalte aus Word mit komplexen Tabellen übernommen werden müssen. Dann Tabellen-Erweiterung (MIT) ergänzen; das Schema wächst kontrolliert.

## Folgen zweiter Ordnung
- Seeds aus dem Bestand werden in Tiptap-JSON umgewandelt (Absätze).
- Volltextsuche nutzt den aus dem JSON extrahierten Klartext (generierte Spalte über Hilfsspalte `klartext`, ADR 0013).
