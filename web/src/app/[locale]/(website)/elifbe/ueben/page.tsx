import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { glypheVon } from '@/components/website/elifbe/Schreibweg';
import { UebenStart } from '@/components/website/elifbe/UebenStart';
import { RUNDE, type SpurGlyphe, type UebenDaten, type UebenTexte } from '@/components/website/elifbe/uebenTypen';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { BUCHSTABEN, buchstabeFuer, formen, zeichen } from '@/lib/elifbe/alphabet';
import { buchstabenDer, LEKTIONEN } from '@/lib/elifbe/lektionen';
import { silbentafel } from '@/lib/elifbe/silben';
import { UEBUNGS_ARTEN } from '@/lib/elifbe/uebung';
import { schreibweg } from '@/lib/elifbe/zuege';
import { metadatenFuer } from '@/lib/seo/metadaten';

export const ensureStatic = 'navigation';

/** Buchstaben zum Nachspuren: je Grundform einer mit wenigen, klaren Zügen. */
const SPUR = ['elif', 'be', 'te', 'dal', 'ra', 'ze', 'lam', 'nun', 'vav', 'mim'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('elifbe.ueben');
  return metadatenFuer({ pfad: '/elifbe/ueben', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Üben (Lazy-Insel ≤ 10 kB gz nach Klick): alle Zeichen entstehen hier auf dem Server aus Codepunkten und gehen als
 * Daten an die Insel; die Insel wählt, mischt und bewertet nur. Fortschritt bleibt im Browser.
 */
export default async function UebenSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('elifbe');
  const silbenLektion = LEKTIONEN.find((l) => l.schluessel === 'harakat') ?? LEKTIONEN[0]!;
  const daten: UebenDaten = {
    buchstaben: BUCHSTABEN.map((b) => ({
      slug: b.slug,
      name: b.elifbe,
      zeichen: zeichen(b),
      formen: (({ anfang, mitte, ende }) => ({ anfang, mitte, ende }))(formen(b)),
      verbindet: b.verbindetRechts,
      verbindetLinks: b.verbindetLinks,
      aehnlich: b.aehnlich,
    })),
    silben: silbentafel(buchstabenDer(silbenLektion), silbenLektion.arten).flatMap(({ silben }) =>
      silben.flatMap((s) => (s ? [{ text: s.text, umschrift: s.umschrift[sprache], buchstabe: s.buchstabe }] : [])),
    ),
    spurBuchstaben: [...SPUR],
    spur: SPUR.flatMap((slug): SpurGlyphe[] => {
      const b = buchstabeFuer(slug);
      const g = glypheVon(slug);
      if (!b || !g) return [];
      const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = g.box;
      // Ausschnitt: Glyphe mit Rand, quadratisch, damit das Zeichenfeld groß bleibt
      const seite = Math.max(x2 - x1, y2 - y1) + 260;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      return [
        {
          slug,
          name: b.elifbe,
          viewBox: [mx - seite / 2, my - seite / 2, seite, seite].map(Math.round).join(' '),
          rumpf: g.rumpf,
          punkte: g.punkte,
          zuege: schreibweg(b).zuege.map((z) => ({ d: z.d, breite: z.breite })),
        },
      ];
    }),
  };
  const tu = (k: string, w?: Record<string, string | number>) => t(`ueben.${k}`, w);
  const roh = (k: string) => t.raw(`ueben.${k}`) as string;
  const texte: UebenTexte = {
    wahl: tu('wahl'),
    alle: tu('alle'),
    alleText: tu('alleText'),
    frageErkennen: tu('frageErkennen'),
    frageZuordnen: tu('frageZuordnen'),
    frageLesen: tu('frageLesen'),
    frageNachspuren: roh('frageNachspuren'),
    richtig: tu('richtig'),
    falsch: roh('falsch'),
    spurNochmal: tu('spurNochmal'),
    spurLoeschen: tu('spurLoeschen'),
    spurUeberspringen: tu('spurUeberspringen'),
    spurGeschafft: roh('spurGeschafft'),
    weiter: tu('weiter'),
    fertigTitel: tu('fertigTitel'),
    nochEineRunde: tu('nochEineRunde'),
    andereUebung: tu('andereUebung'),
    aufgabe: roh('aufgabe'),
    sterne: tu('sterne'),
    geuebt: roh('geuebt'),
    vergessen: tu('vergessen'),
    laden: tu('laden'),
    zeichenfeld: roh('zeichenfeld'),
    arten: Object.fromEntries(UEBUNGS_ARTEN.map((a) => [a, { titel: tu(a), text: tu(`${a}Text`) }])) as UebenTexte['arten'],
    formen: { anfang: t('formen.anfang'), mitte: t('formen.mitte'), ende: t('formen.ende') },
    fertig: Array.from({ length: RUNDE + 1 }, (_, richtig) => tu('fertigText', { richtig, anzahl: RUNDE })),
  };
  return (
    <Seitenrahmen
      bereich="bildung"
      seite="elifbe"
      sprachZiel="/elifbe/ueben"
      pfad={[{ label: t('pfadLernen'), ziel: '/lernen' }, { label: t('titel'), ziel: '/elifbe' }, { label: t('pfadUeben') }]}
    >
      <PageHeader kennung={t('kennung')} titel={t('ueben.titel')} untertitel={t('ueben.untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-6 px-4 py-abschnitt-klein md:px-8">
        <noscript>
          <p className="rounded-lg border border-rand bg-weiss p-5 text-18">{t('ueben.ohneSkript')}</p>
        </noscript>
        <UebenStart daten={daten} texte={texte} />
        <p className="text-16 text-tinte-2">{t('ueben.datenschutz')}</p>
      </div>
    </Seitenrahmen>
  );
}
