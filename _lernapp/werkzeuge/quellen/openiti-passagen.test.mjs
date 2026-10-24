/**
 * Unit-Probe für openiti-passagen.mjs (node --test).
 *
 * Synthetisches mARkdown mit Platzhaltern: Der Fließtext besteht aus lateinischen Platzhalterwörtern (mit Umlauten, damit
 * Byte- und Zeichenversätze auseinanderfallen). Die wenigen arabischen Gliederungs- und Themenwörter entstehen erst zur
 * Laufzeit über `ar()` aus Buckwalter-Umschrift. Die Datei selbst enthält keine arabische Schrift (KI-Regel 2, ADR 0040).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ar,
  bereinige,
  bw,
  ebeneAusTitel,
  erzeugeIndex,
  imRepository,
  passendeRegeln,
  THEMEN,
  umschrift,
  vereinheitliche,
  zaehleWoerter,
} from './openiti-passagen.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const WERKZEUG = join(HIER, 'openiti-passagen.mjs');
const ARABISCH = /[\u{600}-\u{6FF}\u{750}-\u{77F}\u{8A0}-\u{8FF}\u{FB50}-\u{FDFF}\u{FE70}-\u{FEFE}]/u;

/** n Platzhalterwörter. */
const worte = (n, praefix = 'wört') => Array.from({ length: n }, (_, i) => `${praefix}${i + 1}`).join(' ');

/** Synthetisches mARkdown: Kopf, Kolumnentitel-Rauschen, Shamela- und JK-Überschriften, Meilensteine, Seiten, Koranmarken. */
function probeText() {
  const z = [];
  z.push('\u{FEFF}######OpenITI#', '', '#META# platzhalter: probe', '', '#META#Header#End#', '');
  z.push(`# ${worte(5, 'vorwort')}`);
  z.push(`### | AUTO 1 - ${ar('ktAb AlThArp')}`);
  z.push(`# ${worte(20)} ms001 ${worte(3, 'über')}`);
  z.push(`~~${worte(4, 'fort')} PageV01P002 ${worte(2, 'seite')}`);
  z.push(`### || AUTO ${ar('bAb Altym~um')}`);
  z.push(`# ${worte(10, 'tayammum')} @QB@ ${worte(3, 'zitat')} @QE@ ms002`);
  z.push(`# |2 ${ar('bAb AlHayoD')} 2`);
  z.push(`# | ${worte(1, 'unterpunkt')}`);
  z.push(`# ${worte(12, 'hayd')} ms003`);
  for (let i = 0; i < 20; i++) z.push('### | [KOLUMNE]', `# ${worte(2, `k${i}x`)}`);
  z.push(`### | ${ar('ktAb AlHjr')}`);
  z.push(`# ${worte(8, 'hajr')} ms004`);
  z.push(`### | ${ar('ktAb AlSlAp')}`);
  z.push(`# |1 ${ar('ktAb Al>ymAn')} 1`);
  z.push(`# ${worte(6, 'schwur')}`);
  z.push(`### | ${ar('bAb SlAp AlEydyn')}`);
  z.push(`# ${worte(7, 'fest')}`);
  return z.join('\n') + '\n';
}

describe('Umschrift und Normalisierung', () => {
  test('Buckwalter hin und zurück', () => {
    const t = ar('ktAb AlThArp');
    assert.ok(ARABISCH.test(t));
    assert.equal(bw(t), 'ktAb AlThArp');
  });

  test('vereinheitliche: Alif-Formen, Ta marbuta, Alif maqsura, Harakat, Tatweel', () => {
    assert.equal(bw(vereinheitliche(ar('><|{A'))), 'AAAAA');
    assert.equal(bw(vereinheitliche(ar('AlSalAp'))), 'AlSlAh');
    assert.equal(bw(vereinheitliche(ar('ElY_'))), 'Ely');
    assert.equal(bw(vereinheitliche(ar('&}'))), 'wy');
  });

  test('lesbare Umschrift mit Artikel und Konjunktion', () => {
    assert.equal(umschrift(ar('ktAb AlThArp')), 'ktāb al-ṭhāra');
    assert.equal(umschrift(ar('AlzrwE wAlvmAr')), 'al-zrwʿ wa-l-thmār');
    assert.equal(umschrift(ar('ktAb AlSlAp')), 'ktāb al-ṣlāh', 'Ta marbuta nach Alif als -āh');
    assert.ok(!ARABISCH.test(umschrift(ar('bAb Altym~um'))));
  });
});

describe('Gliederung und Regeln', () => {
  test('Ebene aus dem ersten Wort', () => {
    assert.equal(ebeneAusTitel(ar('ktAb AlSlAp')), 1);
    assert.equal(ebeneAusTitel(ar('bAb Al>*An')), 2);
    assert.equal(ebeneAusTitel(ar('fSl fy AlwDw\'')), 3);
    assert.equal(ebeneAusTitel(ar('wfSl')), 3);
    assert.equal(ebeneAusTitel(ar('mTlb fy Alniyp')), 4);
    assert.equal(ebeneAusTitel('Platzhalter ohne Gliederungswort'), null);
  });

  test('Themenregeln mit Wortgrenzen und Hamza-Unterscheidung', () => {
    const themen = (bwTitel) => [...new Set(passendeRegeln(ar(bwTitel)).map((r) => r.thema))];
    assert.deepEqual(themen('ktAb AlSlAp'), ['salah']);
    assert.deepEqual(themen('ktAb AlHjr'), [], 'al-ḥajr (Entmündigung) ist nicht al-ḥajj');
    assert.deepEqual(themen('ktAb AlHj'), ['hajj']);
    assert.deepEqual(themen('ktAb Al>ymAn'), [], 'al-aymān (Eide) ist kein Glaubensthema');
    assert.deepEqual(themen('bAb Al<ymAn'), ['aqaid'], 'al-īmān (Glaube) mit Hamza unten');
    assert.deepEqual(themen('ktAb Alsyr'), [], 'as-siyar ist nicht Sīra');
    assert.deepEqual(themen('bAb Alqr|n'), [], 'al-qirān/al-qurʾān bewusst ohne Regel');
    assert.deepEqual(themen('bAb SlAp AlEydyn'), ['salah', 'taqwim']);
    assert.deepEqual(themen('ktAb AlSyd wAl*bA}H'), ['speisen-erwerb']);
    assert.deepEqual(themen('bAb Sdqp AlfTr'), ['zakah']);
  });

  test('14 Lehrplanmodule mit Umschrift ohne arabische Schrift', () => {
    assert.equal(THEMEN.length, 14);
    for (const t of THEMEN) assert.ok(!ARABISCH.test(`${t.umschrift} ${t.name}`));
  });
});

describe('Passagen-Index am synthetischen mARkdown', () => {
  const text = probeText();
  const index = erzeugeIndex(text, { werk: 'probe', uri: '0000Probe.Platzhalter.Test0000001-ara1' });
  const puffer = Buffer.from(text, 'utf8');

  test('Kennungen werk.msNNNN, lückenlos und mit Rest', () => {
    assert.deepEqual(
      index.passagen.map((p) => p.kennung),
      ['probe.ms0001', 'probe.ms0002', 'probe.ms0003', 'probe.ms0004', 'probe.ms0005'],
    );
    assert.equal(index.meilensteine, 4);
    assert.equal(index.passagen.at(-1).rest, true);
  });

  test('Passagen kacheln den Rumpf ohne Lücke', () => {
    assert.equal(index.passagen[0].von, index.rumpfAnfang);
    for (let i = 1; i < index.passagen.length; i++) assert.equal(index.passagen[i].von, index.passagen[i - 1].bis);
    assert.equal(index.passagen.at(-1).bis, text.length);
  });

  test('Zeichen- und Byte-Bereich treffen denselben Text; SHA-256 stimmt', () => {
    for (const p of index.passagen) {
      const scheibe = text.slice(p.von, p.bis);
      assert.equal(puffer.subarray(p.byteVon, p.byteBis).toString('utf8'), scheibe);
      assert.equal(p.sha256, createHash('sha256').update(Buffer.from(scheibe, 'utf8')).digest('hex'));
      assert.equal(p.sha256Text, createHash('sha256').update(bereinige(scheibe), 'utf8').digest('hex'));
    }
    assert.ok(index.passagen[0].byteBis > index.passagen[0].bis, 'Umlaute und Byte-Order-Mark verschieben die Bytes');
    assert.ok(text.slice(index.passagen[0].von, index.passagen[0].bis).endsWith('ms001'));
  });

  test('Ebenen: Schlüsselwort, Striche, JK-Nummer, Kontext; Kolumnentitel verworfen', () => {
    const k = index.kapitel.map((x) => [x.ebene, x.ebeneQuelle, bw(vereinheitliche(x.titel))]);
    assert.deepEqual(k.slice(0, 4), [
      [1, 'schluesselwort', 'ktAb AlThArh'],
      [2, 'striche', 'bAb Altymm'],
      [2, 'nummer', 'bAb AlHyD'],
      [3, 'kontext', 'unterpunkt1'],
    ]);
    assert.ok(!index.kapitel.some((x) => x.titel.includes('KOLUMNE')));
    assert.ok(index.warnungen.some((w) => w.includes('kolumnentitel') && w.includes('× 20')));
  });

  test('Themen: eigen, geerbt, ohne; Nebenthema; Eide nicht als Glaube', () => {
    const nachTitel = Object.fromEntries(index.kapitel.map((x) => [bw(vereinheitliche(x.titel)), x]));
    assert.equal(nachTitel['ktAb AlThArh'].thema, 'taharah');
    assert.equal(nachTitel['ktAb AlThArh'].herkunft, 'eigen');
    assert.equal(nachTitel['bAb Altymm'].thema, 'taharah');
    assert.equal(nachTitel['bAb Altymm'].herkunft, 'geerbt');
    assert.equal(nachTitel['unterpunkt1'].thema, 'taharah');
    assert.equal(nachTitel['ktAb AlHjr'].thema, null);
    assert.equal(nachTitel['ktAb AlAymAn'].thema, null);
    assert.equal(nachTitel['bAb SlAh AlEydyn'].thema, 'salah');
    assert.deepEqual(nachTitel['bAb SlAh AlEydyn'].nebenthemen, ['taqwim']);
  });

  test('Passage kennt Kapitelpfad (Umschrift), Thema, Koranmarken und Wortzahl', () => {
    const [p1, p2, p3, p4, p5] = index.passagen;
    assert.equal(p1.thema, null, 'Passage 1 beginnt mit dem Vorwort vor der ersten Überschrift');
    assert.deepEqual(p1.themen, ['taharah']);
    assert.deepEqual(p1.kapitelImText, ['k0001']);
    assert.equal(p2.kapitelpfadUmschrift, 'ktāb al-ṭhāra', 'Passage 2 beginnt vor der Überschrift des Bab');
    assert.deepEqual(p2.kapitelImText, ['k0002']);
    assert.equal(p3.kapitelpfadUmschrift, 'ktāb al-ṭhāra › bāb al-ḥyḍ', 'Markup am Anfang wird übersprungen');
    assert.equal(p2.koranMarken, 1);
    assert.equal(p3.themen.join(','), 'taharah');
    assert.equal(p4.thema, 'taharah', 'Kolumnentitel unterbrechen das Kapitel nicht');
    const hajr = index.kapitel.find((k) => k.id === p4.kapitelImText[0]);
    assert.equal(hajr.thema, null, 'Kapitel ohne Lehrplanthema beginnt in Passage 4');
    assert.deepEqual(p4.themen, ['taharah']);
    assert.equal(p5.thema, 'salah');
    assert.equal(p2.woerter, zaehleWoerter(bereinige(text.slice(p2.von, p2.bis))));
    for (const p of index.passagen) assert.ok(!ARABISCH.test(p.kapitelpfadUmschrift));
  });

  test('Band und Seite nach Seitenmarke (Marke am Seitenende)', () => {
    const [p1, p2, p3] = index.passagen;
    assert.equal(index.seitenmarken, 1);
    assert.deepEqual([p1.seiteVon, p1.seiteBis], ['V01P002', 'V01P002']);
    assert.deepEqual([p2.seiteVon, p2.seiteBis], ['V01P002', null], 'Text nach der letzten Marke hat keine Seite');
    assert.deepEqual([p3.seiteVon, p3.seiteBis], [null, null]);
    assert.equal(index.kapitel[0].seite, 'V01P002');
    assert.equal(index.kapitel[1].seite, null);
  });

  test('bereinige entfernt das OpenITI-Markup', () => {
    const sauber = bereinige(text.slice(index.passagen[0].von, index.passagen[1].bis));
    for (const muster of [/ms\d/, /PageV/, /~~/, /^#/m, /@Q[BE]@/, /AUTO/, /\|/]) assert.doesNotMatch(sauber, muster);
    assert.match(sauber, /fort1 fort2 fort3 fort4 seite1/);
  });

  test('Abdeckung zählt Kapitel und Passagen je Thema', () => {
    const a = Object.fromEntries(index.abdeckung.map((x) => [x.thema, x]));
    assert.equal(a.taharah.kapitel, 4);
    assert.equal(a.taharah.passagenHaupt, 3);
    assert.equal(a.salah.kapitel, 2);
    assert.equal(index.kapitelOhneThema, 2);
  });

  test('deterministisch', () => {
    const zweiter = erzeugeIndex(text, { werk: 'probe', uri: '0000Probe.Platzhalter.Test0000001-ara1' });
    assert.deepEqual(zweiter.passagen, index.passagen);
    assert.deepEqual(zweiter.kapitel, index.kapitel);
  });
});

describe('Sonderfälle', () => {
  test('ohne Überschriften: Gliederung nach Absatznummern und Standardthema', () => {
    const z = ['#META#Header#End#'];
    for (let i = 1; i <= 12; i++) z.push(`# ${i} ${worte(30, `satz${i}x`)}${i % 4 === 0 ? ` ms${i / 4}` : ''}`);
    const index = erzeugeIndex(z.join('\n'), { werk: 'matn', standardThema: 'aqaid' });
    assert.equal(index.gliederung, 'absatznummern');
    assert.equal(index.kapitel.length, 12);
    assert.equal(index.kapitel[0].titel, 'Nr. 1');
    assert.ok(index.kapitel.every((k) => k.thema === 'aqaid' && k.herkunft === 'standard'));
    assert.deepEqual(index.passagen.map((p) => p.kennung), ['matn.ms0001', 'matn.ms0002', 'matn.ms0003']);
    assert.equal(index.passagen[1].kapitel, 'k0005');
  });

  test('Korrektur überschreibt die Zuordnung', () => {
    const index = erzeugeIndex(probeText(), { werk: 'probe', korrektur: { k0005: { thema: 'halal-haram' } } });
    const k = index.kapitel.find((x) => x.id === 'k0005');
    assert.equal(k.thema, 'halal-haram');
    assert.equal(k.herkunft, 'korrektur');
    assert.throws(() => erzeugeIndex(probeText(), { werk: 'probe', korrektur: { k0001: { thema: 'unbekannt' } } }));
  });

  test('ungültige Werk-Kennung und unbekanntes Standardthema', () => {
    assert.throws(() => erzeugeIndex('x', { werk: 'Quduri' }));
    assert.throws(() => erzeugeIndex('x', { werk: 'q', standardThema: 'fatwa' }));
  });

  test('Werk-Kennung mit Unterstrich wie im Quellenregister (nur_al_idah)', () => {
    const i = erzeugeIndex(probeText(), { werk: 'nur_al_idah' });
    assert.equal(i.werk, 'nur_al_idah');
    assert.ok(i.passagen.every((p) => /^nur_al_idah\.ms\d{4,5}$/.test(p.kennung)));
    assert.throws(() => erzeugeIndex('x', { werk: '_quduri' }));
  });

  test('Seitenbereich: Marke direkt vor dem Meilenstein zählt nicht zur Folgeseite', () => {
    const index = erzeugeIndex('#META#Header#End#\n# a b PageV01P001 c ms1 d e PageV01P002 ms2 f PageV02P003\n', { werk: 's' });
    assert.deepEqual(index.passagen.map((p) => [p.kennung, p.seiteVon, p.seiteBis]), [
      ['s.ms0001', 'V01P001', 'V01P002'],
      ['s.ms0002', 'V01P002', 'V01P002'],
      ['s.ms0003', 'V02P003', 'V02P003'],
    ]);
  });

  test('Shamela-HTML (Seitenkopf-Matn) wird entfernt, auch wenn ein Meilenstein im Tag steht', () => {
    const t =
      '#META#Header#End#\n# PageV01P001\n# <span class="matn">\n# kopf1 kopf2\n' +
      '# </span><span class="matn-hr"> </span>text1 text2 <span ms1 class="matn"> kopf3\n# </span>text3 ms2\n';
    const index = erzeugeIndex(t, { werk: 'h' });
    assert.deepEqual(index.passagen.map((p) => p.kennung), ['h.ms0001', 'h.ms0002']);
    for (const p of index.passagen) assert.doesNotMatch(bereinige(t.slice(p.von, p.bis)), /span|class|matn|[<>="]/);
    assert.deepEqual(index.passagen.map((p) => p.woerter), [4, 2]);
  });

  test('doppelte Meilensteine bekommen eindeutige Kennungen und eine Warnung', () => {
    const index = erzeugeIndex('#META#Header#End#\n# a ms1 b ms1 c ms2\n', { werk: 'd' });
    assert.deepEqual(index.passagen.map((p) => p.kennung), ['d.ms0001', 'd.ms0001-2', 'd.ms0002']);
    assert.ok(index.warnungen.some((w) => w.includes('doppelt')));
  });
});

describe('Kommandozeile und Ablageschutz', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'openiti-passagen-'));
  after(() => rmSync(tmp, { recursive: true, force: true }));
  const datei = join(tmp, '0000Probe.Platzhalter.Test0000001-ara1');
  writeFileSync(datei, probeText());
  const lauf = (...args) => spawnSync(process.execPath, [WERKZEUG, ...args], { encoding: 'utf8' });

  test('imRepository erkennt das Repository', () => {
    assert.equal(imRepository(join(HIER, 'irgendwas')), true);
    assert.equal(imRepository(tmp), false);
  });

  test('index schreibt JSON und TSV außerhalb des Repositorys', () => {
    const r = lauf('index', datei, '--werk', 'probe', '--aus', join(tmp, 'index'));
    assert.equal(r.status, 0, r.stderr);
    const z = JSON.parse(r.stdout);
    assert.equal(z.passagen, 5);
    assert.equal(z.uri, '0000Probe.Platzhalter.Test0000001-ara1');
    for (const endung of ['passagen.json', 'passagen.tsv', 'zuordnung.tsv']) assert.ok(existsSync(join(tmp, 'index', `probe.${endung}`)));
    const zuordnung = readFileSync(join(tmp, 'index', 'probe.zuordnung.tsv'), 'utf8');
    assert.ok(!ARABISCH.test(zuordnung), 'Zuordnungstabelle nur in Umschrift');
    const passagenTsv = readFileSync(join(tmp, 'index', 'probe.passagen.tsv'), 'utf8');
    assert.ok(!ARABISCH.test(passagenTsv));
    assert.match(passagenTsv.split('\n')[0], /\tseite_von\tseite_bis$/);
    assert.match(passagenTsv.split('\n')[1], /^probe\.ms0001\t.*\tV01P002\tV01P002$/);
  });

  test('index verweigert Ausgabe im Repository und falsche SHA-256', () => {
    const r = lauf('index', datei, '--werk', 'probe', '--aus', join(HIER, 'verboten'));
    assert.equal(r.status, 2);
    assert.match(r.stderr, /Repository/);
    assert.ok(!existsSync(join(HIER, 'verboten')));
    const s = lauf('index', datei, '--werk', 'probe', '--aus', join(tmp, 'x'), '--sha256', '0'.repeat(64));
    assert.equal(s.status, 2);
    assert.match(s.stderr, /SHA-256/);
  });

  test('pruefe und text', () => {
    const indexPfad = join(tmp, 'index', 'probe.passagen.json');
    const p = lauf('pruefe', indexPfad);
    assert.equal(p.status, 0, p.stderr);
    assert.match(p.stdout, /5 Passagen geprüft, 0 abweichend/);
    const t = lauf('text', indexPfad, 'probe.ms0002');
    assert.equal(t.status, 0, t.stderr);
    assert.match(t.stdout, /tayammum1/);
    assert.doesNotMatch(t.stdout, /ms002|@QB@/);
    const a = lauf('abdeckung', indexPfad);
    assert.equal(a.status, 0, a.stderr);
    assert.match(a.stdout, /\| Reinheit \| ṭahāra \| 4 K\. \/ 3 ms \|/);
  });

  test('pruefe meldet eine geänderte Datei', () => {
    writeFileSync(datei, probeText().replace('wört1', 'wort1'));
    const p = lauf('pruefe', join(tmp, 'index', 'probe.passagen.json'));
    assert.equal(p.status, 2);
    assert.match(p.stderr, /SHA-256/);
  });
});

test('Quelltexte enthalten keine arabische Schrift (Religion-Prüfung)', () => {
  for (const d of [WERKZEUG, fileURLToPath(import.meta.url)]) assert.ok(!ARABISCH.test(readFileSync(d, 'utf8')), d);
});
