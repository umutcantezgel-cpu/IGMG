// Koran-Arabisch-Pfad erzeugen (L6-05, PLAN §5.3, ADR 0040 Nr. 5, KERN 4.0 §2.2 Nr. 4 und 6):
//   pnpm lernapp:koran-pfad            schreibt web/inhalte/lernapp/koran/pfad.json und _lernapp/berichte/koran-arbeitsliste.md
//   pnpm lernapp:koran-pfad --pruefen  vergleicht nur (Ausgang 1, wenn eine Datei veraltet ist)
//
// Nur Verweise: Wortformen stehen als Stelle `Sure:Vers:Wort` (Wortzählung wie `quran_wort`, `src/lib/quran/woerter.ts`) aus
// dem gepinnten Tanzil-Text (`web/daten/tanzil`); keine arabische Schrift, keine Bedeutungen. Bedeutungen verfassen Menschen
// (Hoca, MN-05) in `quran_wortbedeutung`; sichtbar werden sie erst mit zwei religiösen Freigaben zum aktuellen Stand
// (`paket/koran.ts`). Die Arbeitsliste nennt je Wortform Stelle, maschinelle Umschrift und Vorkommen – ohne arabische Schrift.
//
// Reihenfolge (deterministisch, ≈ 40 Einheiten):
//   grund       e01 Sure 1 (Wortformen in Lesereihenfolge), e02–e14 die häufigsten Wortformen (je 20, Lektionen zu 5)
//   aufbau      e01–e13 die nächsthäufigen Wortformen (je 25, Lektionen zu 5)
//   vertiefung  e01–e13 Wortschatz von Teil 30 (Cüz 30), Suren von 114 rückwärts, neue Formen in Lesereihenfolge (je 25)
// Je Wortform eine Aufgabe `koran_wort` (Bedeutung wählen) mit drei Ablenkern aus derselben Lektion.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { format, resolveConfig } from 'prettier';
import { KORAN_FORMAT, type KoranPfadDatei, KoranPfadDateiSchema } from '../../src/lib/lernapp/inhalt/schema';
import { umschrift } from '../../src/lib/lernapp/koran/umschrift';
import { leseMetadaten } from '../../src/lib/quran/metadaten';
import { leseTanzil } from '../../src/lib/quran/tanzil';
import { woerter } from '../../src/lib/quran/woerter';

const WEB = join(import.meta.dirname, '..', '..');
const ZIEL_PFAD = join(WEB, 'inhalte', 'lernapp', 'koran', 'pfad.json');
const ZIEL_LISTE = join(WEB, '..', '_lernapp', 'berichte', 'koran-arbeitsliste.md');

const GRUND_EINHEITEN = 13;
const GRUND_JE = 20;
const AUFBAU_EINHEITEN = 13;
const AUFBAU_JE = 25;
const TEIL30_EINHEITEN = 13;
const TEIL30_JE = 25;
const JE_LEKTION = 5;
const ABLENKER = 3;

type Form = { text: string; stelle: string; vorkommen: number; erste: number };
type Einheit = { stufe: 'grund' | 'aufbau' | 'vertiefung'; thema: { de: string; tr: string }; formen: Form[] };

const { values } = parseArgs({ options: { pruefen: { type: 'boolean', default: false } } });

const tanzil = leseTanzil(readFileSync(join(WEB, 'daten', 'tanzil', 'quran-uthmani.xml'), 'utf8'));
const { einteilungen } = leseMetadaten(readFileSync(join(WEB, 'daten', 'tanzil', 'quran-data.xml'), 'utf8'));
const teil30 = einteilungen.find((e) => e.art === 'cuz' && e.nr === 30);
if (!teil30) throw new Error('Teil 30 fehlt in den Metadaten');

// Alle Wörter in Lesereihenfolge (Stelle wie quran_wort)
const alle = tanzil.flatMap((s) => s.verse.flatMap((v) => woerter(v.textAr).map((w) => ({ sure: s.nr, vers: v.nr, ...w }))));
const formen = new Map<string, Form>();
alle.forEach((w, i) => {
  const f = formen.get(w.text);
  if (f) f.vorkommen++;
  else formen.set(w.text, { text: w.text, stelle: `${w.sure}:${w.vers}:${w.pos}`, vorkommen: 1, erste: i });
});
const vergeben = new Set<string>();
const nimm = (f: Form) => (vergeben.has(f.text) ? false : (vergeben.add(f.text), true));
const stelleIn = (w: { sure: number; vers: number; pos: number }) => `${w.sure}:${w.vers}:${w.pos}`;

const einheiten: Einheit[] = [];

// grund e01: Sure 1 in Lesereihenfolge
const sure1 = alle
  .filter((w) => w.sure === 1)
  .flatMap((w) => (nimm(formen.get(w.text)!) ? [{ ...formen.get(w.text)!, stelle: stelleIn(w) }] : []));
einheiten.push({ stufe: 'grund', thema: { de: 'Sure 1', tr: '1. sure' }, formen: sure1 });

// Häufigste Wortformen (Vorkommen absteigend, dann erstes Vorkommen)
const nachHaeufigkeit = [...formen.values()].sort((a, b) => b.vorkommen - a.vorkommen || a.erste - b.erste);
function haeufige(anzahl: number, je: number, stufe: Einheit['stufe'], start: number) {
  for (let n = 0; n < anzahl; n++) {
    const auswahl: Form[] = [];
    for (const f of nachHaeufigkeit) {
      if (auswahl.length >= je) break;
      if (nimm(f)) auswahl.push(f);
    }
    const nr = start + n;
    einheiten.push({ stufe, thema: { de: `Häufige Wortformen ${nr}`, tr: `Sık geçen kelime biçimleri ${nr}` }, formen: auswahl });
  }
}
haeufige(GRUND_EINHEITEN, GRUND_JE, 'grund', 1);
haeufige(AUFBAU_EINHEITEN, AUFBAU_JE, 'aufbau', GRUND_EINHEITEN + 1);

// Teil 30: Suren von 114 rückwärts, neue Formen in Lesereihenfolge (Stelle im Teil 30)
const imTeil30 = (w: { sure: number; vers: number }) => w.sure > teil30.sure || (w.sure === teil30.sure && w.vers >= teil30.vers);
const suren = [...new Set(alle.filter(imTeil30).map((w) => w.sure))].sort((a, b) => b - a);
let block: { form: Form; sure: number }[] = [];
const teil30Einheiten: { formen: Form[]; von: number; bis: number }[] = [];
for (const s of suren) {
  if (teil30Einheiten.length >= TEIL30_EINHEITEN) break;
  for (const w of alle.filter((x) => x.sure === s && imTeil30(x))) {
    if (teil30Einheiten.length >= TEIL30_EINHEITEN) break;
    const f = formen.get(w.text)!;
    if (!nimm(f)) continue;
    block.push({ form: { ...f, stelle: stelleIn(w) }, sure: s });
    if (block.length === TEIL30_JE) {
      teil30Einheiten.push({ formen: block.map((b) => b.form), von: block[0]!.sure, bis: block.at(-1)!.sure });
      block = [];
    }
  }
}
for (const e of teil30Einheiten) {
  const bereich = e.von === e.bis ? `${e.von}` : `${e.von}–${e.bis}`;
  const suren = e.von === e.bis ? `Sure ${bereich}` : `Suren ${bereich}`;
  einheiten.push({
    stufe: 'vertiefung',
    thema: { de: `Teil 30: ${suren}`, tr: `30. cüz: ${e.von === e.bis ? `${bereich}. sure` : `${bereich}. sureler`}` },
    formen: e.formen,
  });
}

// Datei bauen
const nummer = new Map<string, number>();
const datei: KoranPfadDatei = {
  format: KORAN_FORMAT,
  version: 1,
  kurs: 'koran',
  einheiten: einheiten.map((e) => {
    const nr = (nummer.get(e.stufe) ?? 0) + 1;
    nummer.set(e.stufe, nr);
    const schluessel = `koran.${e.stufe}.e${String(nr).padStart(2, '0')}`;
    const lektionen = [];
    for (let i = 0; i < e.formen.length; i += JE_LEKTION) {
      const teil = e.formen.slice(i, i + JE_LEKTION);
      // die letzte Lektion bekommt mindestens zwei Wortformen (Ablenker aus derselben Lektion)
      if (teil.length < 2 && lektionen.length) {
        lektionen.at(-1)!.wortformen.push(...teil.map((f) => f.stelle));
        continue;
      }
      const lschluessel = `${schluessel}.l${String(lektionen.length + 1).padStart(2, '0')}`;
      lektionen.push({
        schluessel: lschluessel,
        wortformen: teil.map((f) => f.stelle),
        aufgaben: [] as KoranPfadDatei['einheiten'][number]['lektionen'][number]['aufgaben'],
      });
    }
    for (const l of lektionen)
      l.aufgaben = l.wortformen.map((stelle, k) => ({
        schluessel: `${l.schluessel}.a${String(k + 1).padStart(2, '0')}`,
        typ: 'koran_wort' as const,
        art: 'bedeutung' as const,
        wortform: stelle,
        ablenker: Array.from(
          { length: Math.min(ABLENKER, l.wortformen.length - 1) },
          (_, j) => l.wortformen[(k + j + 1) % l.wortformen.length]!,
        ),
      }));
    return { schluessel, stufe: e.stufe, reihenfolge: nr, thema: e.thema, lektionen };
  }),
};
const geprueft = KoranPfadDateiSchema.safeParse(datei);
if (!geprueft.success) throw new Error(`pfad.json ungültig: ${geprueft.error.message}`);
async function schreibe() {
  // in der Form, die prettier --check erwartet (Datei wird erzeugt, nicht von Hand geschrieben)
  const json = await format(JSON.stringify(datei, null, 2), { ...(await resolveConfig(ZIEL_PFAD)), parser: 'json' });

  // Arbeitsliste für die Hoca (ohne arabische Schrift)
  const zeilen: string[] = [
    '# Koran-Arabisch: Arbeitsliste der Wortbedeutungen (L6-05)',
    '',
    'Erzeugt von `pnpm lernapp:koran-pfad` aus `web/inhalte/lernapp/koran/pfad.json` und dem gepinnten Tanzil-Text. Nicht von',
    'Hand ändern; neu erzeugen. Bedeutungen schreibt **kein** Agent (KERN 4.0 §2.2 Nr. 2 und 6, ADR 0040 Nr. 5, MN-05).',
    '',
    '- **Wer:** die Hoca (MN-05) schreibt je Wortform die Bedeutung auf Deutsch und Türkisch in der Verwaltung unter',
    '  „Koran → Wörter“ (`/verwaltung/koran/woerter/<sure>/<form>`, Tabelle `quran_wortbedeutung`). Die Stelle führt zur Form.',
    '- **Sichtbar** im Lern-App-Pfad erst mit **zwei** religiösen Freigaben zum aktuellen Stand (Rolle `religioese_pruefung`,',
    '  zwei verschiedene Personen, keine davon Verfasserin; `/verwaltung/lernapp/religioes`, LM-13). Bis dahin zeigt der Pfad',
    '  „Bedeutung folgt“, und die Übungen der Lektion bleiben verborgen.',
    '- **Umschrift:** maschinell (DMG-Art, `src/lib/lernapp/koran/umschrift.ts`), nur zur Orientierung; maßgeblich ist die Stelle',
    '  `Sure:Vers:Wort` (Wortzählung des Tanzil-Texts wie im Koran-Leser).',
    '- **Vorkommen:** Anzahl gleicher Schreibungen im ganzen Text (`quran_wortform.vorkommen`).',
    '',
    `Umfang: ${datei.einheiten.length} Einheiten, ${datei.einheiten.reduce((n, e) => n + e.lektionen.length, 0)} Lektionen, ${datei.einheiten.reduce((n, e) => n + e.lektionen.reduce((m, l) => m + l.wortformen.length, 0), 0)} Wortformen. Abdeckung der Wörter im Text: ${(
      (100 * [...vergeben].reduce((n, t) => n + formen.get(t)!.vorkommen, 0)) /
      alle.length
    ).toFixed(1)} % von ${alle.length}.`,
    '',
  ];
  const textVon = new Map([...formen.values()].map((f) => [f.text, f]));
  const stelleZuText = new Map(alle.map((w) => [stelleIn(w), w.text]));
  for (const e of datei.einheiten) {
    zeilen.push(
      `## ${e.schluessel} – ${e.thema.de}`,
      '',
      '| Nr. | Lektion | Stelle | Umschrift | Vorkommen | Bedeutung (de) | Bedeutung (tr) |',
      '|---|---|---|---|---|---|---|',
    );
    let n = 0;
    for (const l of e.lektionen)
      for (const stelle of l.wortformen) {
        const text = stelleZuText.get(stelle)!;
        zeilen.push(
          `| ${++n} | ${l.schluessel.slice(e.schluessel.length + 1)} | ${stelle} | ${umschrift(text)} | ${textVon.get(text)!.vorkommen} | | |`,
        );
      }
    zeilen.push('');
  }
  const liste = zeilen.join('\n');
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(liste + json))
    throw new Error('arabische Schrift in der Ausgabe');

  if (values.pruefen) {
    const alt = (p: string) => {
      try {
        return readFileSync(p, 'utf8');
      } catch {
        return '';
      }
    };
    const veraltet = [alt(ZIEL_PFAD) !== json ? ZIEL_PFAD : null, alt(ZIEL_LISTE) !== liste ? ZIEL_LISTE : null].filter(Boolean);
    if (veraltet.length) {
      console.error(`[koran-pfad] veraltet: ${veraltet.join(', ')} – pnpm lernapp:koran-pfad`);
      process.exit(1);
    }
    console.log('[koran-pfad] aktuell');
  } else {
    writeFileSync(ZIEL_PFAD, json);
    writeFileSync(ZIEL_LISTE, liste);
    console.log(`[koran-pfad] ${datei.einheiten.length} Einheiten, ${vergeben.size} Wortformen → ${ZIEL_PFAD}, ${ZIEL_LISTE}`);
  }
}

schreibe().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
