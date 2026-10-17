import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  type AbgleichOptionen,
  angenommen,
  bereiteLexikon,
  gleicheAb,
  type HinweisSchluessel,
  normalisiere,
  type Urteil,
} from '@/lib/lernapp/abgleich';

/**
 * Antwortabgleich Türkisch (PLAN §4.1, Tor L1: ≥ 150 Fälle je Sprache). Kleinschreibung nach tr (I → ı, İ → i),
 * Sonderbuchstaben mit Hinweis, Eigennamen-Apostroph tolerant, Zirkumflex still. Neutrale Alltagssätze.
 */
type Fall = [antwort: string, loesung: string | string[], urteil: Urteil, hinweise?: HinweisSchluessel[], optionen?: AbgleichOptionen];

const lex = (...w: string[]) => ({ lexikon: bereiteLexikon(w, 'tr') });

const HANDARBEIT: Fall[] = [
  // gleich, Satzzeichen, Leerraum
  ['Ben su içiyorum.', 'Ben su içiyorum.', 'richtig'],
  ['Ben su içiyorum', 'Ben su içiyorum.', 'richtig'],
  ['ben su içiyorum!', 'Ben su içiyorum.', 'richtig'],
  ['  Ben   su  içiyorum ', 'Ben su içiyorum.', 'richtig'],
  ['Ben\tsu\niçiyorum', 'Ben su içiyorum.', 'richtig'],
  ['"Ben su içiyorum"', 'Ben su içiyorum.', 'richtig'],
  ['BEN SU İÇİYORUM', 'Ben su içiyorum.', 'richtig'],
  ['Okul nerede?', 'Okul nerede?', 'richtig'],
  ['Okul nerede', 'Okul nerede?', 'richtig'],
  ['Okul, nerede?!', 'Okul nerede?', 'richtig'],
  ['\u200FOkul nerede\u200E', 'Okul nerede?', 'richtig'],
  // i und ı, Großbuchstaben
  ['İstanbul büyük bir şehir.', 'İstanbul büyük bir şehir.', 'richtig'],
  ['istanbul büyük bir şehir', 'İstanbul büyük bir şehir.', 'richtig'],
  ['Istanbul büyük bir şehir', 'İstanbul büyük bir şehir.', 'tippfehler', ['sonderzeichen']],
  ['ISTANBUL BÜYÜK BİR ŞEHİR', 'İstanbul büyük bir şehir.', 'tippfehler', ['sonderzeichen']],
  ['İSTANBUL BÜYÜK BİR ŞEHİR', 'İstanbul büyük bir şehir.', 'richtig'],
  ['KAPI açık', 'Kapı açık.', 'richtig'],
  ['Kapi açık', 'Kapı açık.', 'tippfehler', ['sonderzeichen']],
  ['KİTAP masada', 'Kitap masada.', 'richtig'],
  ['KITAP masada', 'Kitap masada.', 'tippfehler', ['sonderzeichen']],
  ['Kiz okula gidiyor', 'Kız okula gidiyor.', 'tippfehler', ['sonderzeichen']],
  ['Kız okula gidiyor', 'Kiz okula gidiyor.', 'tippfehler', ['sonderzeichen']],
  ['Isik yanıyor', 'Işık yanıyor.', 'tippfehler', ['sonderzeichen']],
  ['IŞIK YANIYOR', 'Işık yanıyor.', 'richtig'],
  // ohne Sonderzeichen
  ['Cocuk oynuyor', 'Çocuk oynuyor.', 'tippfehler', ['sonderzeichen']],
  ['Bahcede bir agac var', 'Bahçede bir ağaç var.', 'tippfehler', ['sonderzeichen']],
  ['Ogretmen sinifta', 'Öğretmen sınıfta.', 'tippfehler', ['sonderzeichen']],
  ['Sehir buyuk', 'Şehir büyük.', 'tippfehler', ['sonderzeichen']],
  ['Uzum tatli', 'Üzüm tatlı.', 'tippfehler', ['sonderzeichen']],
  ['Bugun hava guzel', 'Bugün hava güzel.', 'tippfehler', ['sonderzeichen']],
  ['Dogru cevap', 'Doğru cevap.', 'tippfehler', ['sonderzeichen']],
  ['Cay sicak', 'Çay sıcak.', 'tippfehler', ['sonderzeichen']],
  ['Gozluk nerede', 'Gözlük nerede?', 'tippfehler', ['sonderzeichen']],
  ['Kopru uzun', 'Köprü uzun.', 'tippfehler', ['sonderzeichen']],
  ['Bugun hava guzl', 'Bugün hava güzel.', 'tippfehler', ['tippfehler', 'sonderzeichen']],
  ['Bugn hava güzel', 'Bugün hava güzel.', 'tippfehler', ['tippfehler']],
  // Zirkumflex still
  ['Hala bekliyorum', 'Hâlâ bekliyorum.', 'richtig'],
  ['Hâlâ bekliyorum', 'Hala bekliyorum.', 'richtig'],
  ['Kağıt beyaz', 'Kâğıt beyaz.', 'richtig'],
  ['Hikaye güzel', 'Hikâye güzel.', 'richtig'],
  ['Ha\u0302la\u0302 bekliyorum', 'Hâlâ bekliyorum.', 'richtig'],
  // Apostroph der Eigennamen
  ["Ankara'ya gidiyorum.", "Ankara'ya gidiyorum.", 'richtig'],
  ['Ankara’ya gidiyorum', "Ankara'ya gidiyorum.", 'richtig'],
  ['Ankara`ya gidiyorum', "Ankara'ya gidiyorum.", 'richtig'],
  ['Ankaraya gidiyorum', "Ankara'ya gidiyorum.", 'richtig', ['apostroph']],
  ["Ali'nin kitabı", 'Alinin kitabı.', 'richtig', ['apostroph']],
  ["Türkiye'de yaşıyorum", "Türkiye'de yaşıyorum.", 'richtig'],
  ['Turkiyede yasiyorum', "Türkiye'de yaşıyorum.", 'tippfehler', ['apostroph', 'sonderzeichen']],
  // Tippfehler
  ['Okull nerede', 'Okul nerede?', 'tippfehler', ['tippfehler']],
  ['Kitpa masada', 'Kitap masada.', 'tippfehler', ['tippfehler']],
  ['Pencre açık', 'Pencere açık.', 'tippfehler', ['tippfehler']],
  ['Arkadaşm geldi', 'Arkadaşım geldi.', 'tippfehler', ['tippfehler']],
  ['Su soğk', 'Su soğuk.', 'tippfehler', ['tippfehler']],
  ['Sa soğuk', 'Su soğuk.', 'falsch'],
  ['Masa büyük', 'Masa büyük.', 'richtig'],
  ['Kasa büyük', 'Masa büyük.', 'tippfehler', ['tippfehler']],
  ['Kasa büyük', 'Masa büyük.', 'falsch', [], lex('masa', 'kasa', 'büyük')],
  ['Msaa büyük', 'Masa büyük.', 'tippfehler', ['tippfehler'], lex('masa', 'kasa', 'büyük')],
  ['Okull nerede', 'Okul nerede?', 'falsch', [], { toleranz: false }],
  ['Annem ekmk alıyr', 'Annem ekmek alıyor.', 'falsch'],
  ['Annem her gün ekmk alıyr', 'Annem her gün ekmek alıyor.', 'falsch'],
  ['Annem her gün sabah ekmk alıyr', 'Annem her gün sabah ekmek alıyor.', 'tippfehler', ['tippfehler']],
  // falsch
  ['Ben çay içiyorum', 'Ben su içiyorum.', 'falsch'],
  ['Su içiyorum ben', 'Ben su içiyorum.', 'falsch'],
  ['Ben su', 'Ben su içiyorum.', 'falsch'],
  ['Ben soğuk su içiyorum', 'Ben su içiyorum.', 'falsch'],
  ['Okul burada', 'Okul nerede?', 'falsch'],
  ['', 'Okul nerede?', 'falsch', ['leer']],
  ['...', 'Okul nerede?', 'falsch', ['leer']],
  // mehrere Lösungen
  ['Su içiyorum', ['Ben su içiyorum.', 'Su içiyorum.'], 'richtig'],
  ['Ben su içiyorum', ['Ben su içiyorum.', 'Su içiyorum.'], 'richtig'],
  ['Su iciyorum', ['Ben su içiyorum.', 'Su içiyorum.'], 'tippfehler', ['sonderzeichen']],
  ['Adım Ayşe', ['Benim adım Ayşe.', 'Adım Ayşe.'], 'richtig'],
  ['Benim adim Ayse', ['Benim adım Ayşe.', 'Adım Ayşe.'], 'tippfehler', ['sonderzeichen']],
  // Leerzeichen
  ['Bir şey yok', 'Birşey yok.', 'tippfehler', ['leerzeichen']],
  ['Birşey yok', 'Bir şey yok.', 'tippfehler', ['leerzeichen']],
  ['Herşey yolunda', 'Her şey yolunda.', 'tippfehler', ['leerzeichen']],
  // NFC und Ziffern
  ['S\u0327ehir büyük', 'Şehir büyük.', 'richtig'],
  ['Go\u0308zlu\u0308k nerede', 'Gözlük nerede?', 'richtig'],
  ['3 kitap var', '3 kitap var.', 'richtig'],
  ['\u0663 kitap var', '3 kitap var.', 'richtig'],
  ['5 kitap var', '3 kitap var.', 'falsch'],
];

/** Alltagswörter für generierte Fälle. */
const WOERTER = [
  'kitap',
  'okul',
  'çocuk',
  'şehir',
  'öğretmen',
  'ağaç',
  'kapı',
  'pencere',
  'masa',
  'sandalye',
  'ekmek',
  'elma',
  'çanta',
  'gözlük',
  'köprü',
  'ırmak',
  'ışık',
  'bahçe',
  'mutfak',
  'araba',
  'otobüs',
  'istasyon',
  'gazete',
  'arkadaş',
  'güneş',
  'bulut',
  'çiçek',
  'deniz',
  'defter',
  'kalem',
];

const OHNE: Record<string, string> = { ı: 'i', ş: 's', ğ: 'g', ç: 'c', ö: 'o', ü: 'u' };
const ohneSonderzeichen = (w: string) => w.replace(/[ışğçöü]/g, (z) => OHNE[z] ?? z);
const loescheMitte = (w: string) => w.slice(0, Math.floor(w.length / 2)) + w.slice(Math.floor(w.length / 2) + 1);
const umgedreht = (w: string) => Array.from(w).reverse().join('');

const GENERIERT: Fall[] = WOERTER.flatMap((w): Fall[] => {
  const faelle: Fall[] = [
    [w, w, 'richtig'],
    [w.toLocaleUpperCase('tr'), w, 'richtig'],
    // Großbuchstaben ohne tr-Regel: I wird zu ı – bei Wörtern mit i ein Sonderzeichen-Hinweis
    [w.toUpperCase(), w, ...((w.includes('i') ? ['tippfehler', ['sonderzeichen']] : ['richtig']) as [Urteil, HinweisSchluessel[]?])],
    [`¿${w}?`, w, 'richtig'],
    [loescheMitte(w), w, 'tippfehler', ['tippfehler']],
    [umgedreht(w), w, 'falsch'],
  ];
  if (ohneSonderzeichen(w) !== w) faelle.push([ohneSonderzeichen(w), w, 'tippfehler', ['sonderzeichen']]);
  return faelle;
});

const FAELLE: Fall[] = [...HANDARBEIT, ...GENERIERT];

describe('Abgleich Türkisch: Tabelle', () => {
  it('mindestens 150 Fälle', () => {
    expect(FAELLE.length).toBeGreaterThanOrEqual(150);
  });

  it.each(FAELLE)('„%s“ gegen %j → %s %j', (antwort, loesung, urteil, hinweise = [], optionen = {}) => {
    const e = gleicheAb(antwort, loesung, 'tr', optionen);
    expect({ urteil: e.urteil, hinweise: e.hinweise }).toEqual({ urteil, hinweise });
  });
});

describe('Abgleich Türkisch: Normalisierung', () => {
  it('Kleinschreibung nach tr: I → ı, İ → i', () => {
    expect(normalisiere('IŞIK İstanbul', 'tr')).toBe('ışık istanbul');
  });
  it('Zirkumflex fällt still weg, Apostroph bleibt', () => {
    expect(normalisiere("Hâlâ Ankara'ya", 'tr')).toBe("hala ankara'ya");
  });
});

const ZEICHEN = [
  ...'abcçdefgğhıijklmnoöprsştuüvyzABCÇIİÖŞÜâîû',
  ' ',
  '.',
  ',',
  '?',
  "'",
  '’',
  '\u0302',
  '\u0327',
  '\u0307',
  '\u00A0',
  '\u200F',
];
const text = fc.array(fc.constantFrom(...ZEICHEN), { maxLength: 30 }).map((z) => z.join(''));
const wort = fc.array(fc.constantFrom(...'abcçdefgğhıijklmnoöprsştuüvyz'), { minLength: 1, maxLength: 12 }).map((z) => z.join(''));

describe('Abgleich Türkisch: Eigenschaften', () => {
  it('Normalisierung ist idempotent', () => {
    fc.assert(
      fc.property(
        fc.oneof(text, fc.string({ unit: 'binary' })),
        (s) => normalisiere(normalisiere(s, 'tr'), 'tr') === normalisiere(s, 'tr'),
      ),
    );
  });

  it('eine Lösung gegen sich selbst ist immer richtig, ohne Hinweis', () => {
    fc.assert(
      fc.property(fc.oneof(text, fc.string({ unit: 'binary' })), (s) => {
        fc.pre(normalisiere(s, 'tr') !== '');
        const e = gleicheAb(s, [s], 'tr');
        return e.urteil === 'richtig' && e.hinweise.length === 0;
      }),
    );
  });

  it('Urteil und Annahme sind symmetrisch (ohne Lexikon)', () => {
    const paar = fc
      .tuple(fc.array(wort, { minLength: 1, maxLength: 4 }), fc.nat(), fc.constantFrom('ı', 'i', 's', 'ş', '', 'x'))
      .map(([w, i, ein]) => {
        const b = [...w];
        const k = i % b.length;
        const z = b[k]!;
        const p = i % (z.length + 1);
        b[k] = z.slice(0, p) + ein + z.slice(p + 1);
        return [w.join(' '), b.join(' ')] as const;
      });
    fc.assert(
      fc.property(paar, ([a, b]) => {
        const hin = gleicheAb(a, b, 'tr');
        const her = gleicheAb(b, a, 'tr');
        return angenommen(hin) === angenommen(her) && hin.urteil === her.urteil;
      }),
    );
  });
});
