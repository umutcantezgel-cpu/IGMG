// Kopiert die benötigten WOFF2-Dateien und Lizenztexte aus den @fontsource-Paketen nach src/fonts/ (ADR 0014).
// Reproduzierbar, ohne Netzzugriff zur Buildzeit. Aufruf: pnpm schriften:kopieren
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ziel = join(import.meta.dirname, '..', 'src', 'fonts');
mkdirSync(ziel, { recursive: true });
const quellen = {
  'atkinson-hyperlegible-next': ['latin-400-normal', 'latin-700-normal', 'latin-ext-400-normal', 'latin-ext-700-normal'],
  // Source Serif 4: nur die Lizenz – die Titelschrift erzeugt scripts/schrift-titel.py (opsz, OFL-Namensregel)
  'source-serif-4': [],
  amiri: ['arabic-400-normal', 'arabic-700-normal'],
  // Lern-App (ADR 0044): Oberflächenschrift der arabischen Oberfläche, nur Teilmenge „arabic“ (Latein: Atkinson)
  'noto-sans-arabic': ['arabic-400-normal', 'arabic-700-normal'],
};
const liste = [];
for (const [paket, dateien] of Object.entries(quellen)) {
  const basis = join(import.meta.dirname, '..', 'node_modules', '@fontsource', paket);
  for (const d of dateien) {
    const name = `${paket}-${d}.woff2`;
    copyFileSync(join(basis, 'files', name), join(ziel, name));
    liste.push(name);
  }
  copyFileSync(join(basis, 'LICENSE'), join(ziel, `${paket}-OFL.txt`));
}
const titel =
  '- igmg-wetzlar-titel-latin-600-opsz.woff2, igmg-wetzlar-titel-latin-ext-600-opsz.woff2 – abgeleitet aus @fontsource-variable/source-serif-4 5.3.0 (`source-serif-4-{latin,latin-ext}-opsz-normal.woff2`): Gewicht 600 festgesetzt, Achse opsz erhalten, interner Name „IGMG Wetzlar Titel“ (OFL 1.1 Bedingung 3, reservierter Name „Source“). Erzeugt mit `python3 scripts/schrift-titel.py`. Lizenz: source-serif-4-OFL.txt.';
writeFileSync(
  join(ziel, 'QUELLE.md'),
  `# Schriften\n\nKopiert aus den npm-Paketen @fontsource/atkinson-hyperlegible-next, @fontsource/source-serif-4, @fontsource/amiri, @fontsource/noto-sans-arabic (Version 5.3.0) mit \`pnpm schriften:kopieren\`. Lizenz: SIL Open Font License 1.1 (siehe *-OFL.txt). ADR 0014; Noto Sans Arabic nur für die Oberfläche der Lern-App (ADR 0044).\n\n${[...liste.map((n) => `- ${n}`), titel].join('\n')}\n`,
);
console.log(`${liste.length} Schriftdateien kopiert`);
