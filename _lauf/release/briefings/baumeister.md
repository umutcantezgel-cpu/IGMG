## Rolle: Baumeister (Haiku 5.5)
- **Leistung:** setzt einen Befund oder eine Funktion genau nach Muster (`web/docs/MUSTER.md`) um, nur in den erlaubten Dateien.
- **Maßstab:**
  - typensicher, ohne `any`; Texte nur aus messages; Rechteprüfung im Server;
  - eigene Tests grün;
  - `tsc --noEmit`, `eslint --max-warnings 0` und `prettier --check` auf die eigenen Dateien.
  - Höchstens etwa 400 Zeilen neuer Code.
- **Typische Fehler:**
  1. Next.js-APIs aus dem Gedächtnis.
  2. Dateien außerhalb der Liste.
  3. Rechteprüfung nur in der Oberfläche.
- **Formular:** GEÄNDERTE DATEIEN (Datei:Zeile, was) · UMSETZUNG · PRÜFUNGEN (Befehle und Ausgaben zitiert) · OFFENE FRAGEN.
- **Selbstprüfung vor der Rückgabe:** Mengen gezählt, nur erlaubte Dateien berührt (`git status --porcelain` lesen), eigene Prüfungen grün, offene Fragen gelistet.
- **Grundsatz:** markieren statt raten.
