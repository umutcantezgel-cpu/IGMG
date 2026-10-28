import { ListChecks, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Verweisliste } from '@/components/website/dachverband/Verweisliste';
import { Text } from '@/components/website/Text';
import { formatKennzahl, formatStand } from '@/lib/dachverband/kennzahl';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import type { IgmgInhalt, Kennzahl, ZahlArt } from '@/lib/validierung/seiteninhalte/igmg';

type Kachel = { schluessel: string; label: string; wert: string; zusatz?: Mehrsprachig };

/**
 * Reiter „Überblick“ (design/IGMGInfo.dc.html Z. 28–44; Plan Marktstart P1): Was die IGMG ist, daneben die Kennzahlen
 * mit Stand und Quelle (Broschüre), darunter das Leitbild. Kennzahlen ohne Angabe entfallen; alte Texte erscheinen
 * unverändert (`formatKennzahl`). IGMG-Zahlen stehen nur hier, nie neben Zahlen der Gemeinde (Plan, Grundsätze).
 */
export async function Ueberblick({ inhalt, sprache }: { inhalt: IgmgInhalt; sprache: Sprache }) {
  const [t, td] = await Promise.all([getTranslations('igmg'), getTranslations('dachverband')]);
  const z = inhalt.zahlen;
  const vorlage = (art: ZahlArt, zahl: string) => t(`zahlArt.${art}`, { zahl });

  const kacheln: Kachel[] = (
    [
      { schluessel: 'moscheen', label: t('moscheen'), k: z.moscheen },
      { schluessel: 'zweigstellen', label: t('zweigstellen'), k: z.zweigstellen },
      { schluessel: 'regionen', label: t('regionen'), k: z.regionen },
      { schluessel: 'mitglieder', label: t('mitglieder'), k: z.mitglieder },
      { schluessel: 'mitwirkende', label: t('mitwirkende'), k: z.mitwirkende },
      ...(z.region ? [{ schluessel: 'region', label: t('regionHessen', { name: z.region.name }), k: z.region.zweigstellen }] : []),
      { schluessel: 'menschenErreicht', label: t('menschenErreicht'), k: z.menschenErreicht },
    ] satisfies { schluessel: string; label: string; k: Kennzahl | null }[]
  ).flatMap(({ schluessel, label, k }) => {
    const wert = formatKennzahl(k, sprache, vorlage);
    if (!wert) return [];
    return [{ schluessel, label, wert, ...(typeof k === 'object' && k?.zusatz ? { zusatz: k.zusatz } : {}) }];
  });

  const stand = formatStand(z.stand, sprache);
  const quelle = z.quelle ? waehle(z.quelle.titel, sprache) : null;
  const quelleHref = z.quelle ? (z.quelle.url[sprache] ?? z.quelle.url.de) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section
        aria-labelledby="igmg-ueberblick"
        className="flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10 lg:col-span-2"
      >
        <h2 id="igmg-ueberblick" className="flex items-center gap-2.5 text-display-2">
          <User aria-hidden className="size-7 shrink-0 text-gruen-700" />
          {t('ueberblickTitel')}
        </h2>
        <Text feld={inhalt.ueberblick.text} sprache={sprache} als="p" className="max-w-einleitung text-20 leading-einleitung text-pretty" />
        <Text
          feld={inhalt.ueberblick.auftrag}
          sprache={sprache}
          als="p"
          className="max-w-text rounded-md bg-gruen-50 px-5 py-4 text-pretty"
        />
      </section>
      <section
        aria-labelledby="igmg-zahlen"
        className="flex min-w-0 flex-col gap-4 rounded-lg bg-gruen-950 p-5 text-weiss md:p-8 lg:row-span-2"
      >
        <h2 id="igmg-zahlen" className="text-display-2">
          {t('zahlenTitel')}
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
          {kacheln.map((kachel) => (
            <div key={kachel.schluessel} className="flex flex-col gap-0.5 border-t border-gruen-800 py-3">
              <dt className="text-gruen-100">{kachel.label}</dt>
              <dd className="text-36 font-bold break-words">{kachel.wert}</dd>
              {/* In der Gruppe einer <dl> sind nur dt und dd erlaubt (axe „definition-list“) – der Zusatz ist ein zweites dd */}
              {kachel.zusatz ? (
                <dd className="text-16 text-gruen-100">
                  <Text feld={kachel.zusatz} sprache={sprache} />
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
        {stand || quelle ? (
          // Stand und Beleg der Zahlen (E-044 Nr. 1); helle Schrift auf dunklem Grund statt der Quellenzeile der Seite
          <p className="flex flex-col gap-1 border-t border-gruen-800 pt-4 text-16 text-gruen-100">
            {stand ? <span>{t('stand', { datum: stand })}</span> : null}
            {quelle && quelleHref ? (
              <span>
                {t('quelle')}:{' '}
                <a
                  href={quelleHref}
                  rel="noopener noreferrer"
                  lang={quelle.rueckfall ? 'de' : undefined}
                  aria-label={`${quelle.text}: ${td('externeSeite')}`}
                  className="inline-flex min-h-12 items-center font-bold text-weiss underline underline-offset-3"
                >
                  {quelle.text}
                </a>
              </span>
            ) : null}
          </p>
        ) : null}
      </section>
      {inhalt.leitbild.punkte.length ? (
        <section
          aria-labelledby="igmg-leitbild"
          className="flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10 lg:col-span-2"
        >
          <h2 id="igmg-leitbild" className="flex items-center gap-2.5 text-display-2">
            <ListChecks aria-hidden className="size-7 shrink-0 text-gruen-700" />
            {t('leitbildTitel')}
          </h2>
          <ul className="flex max-w-text list-disc flex-col gap-2 pl-6 text-pretty marker:text-gruen-700">
            {inhalt.leitbild.punkte.map((punkt, i) => (
              <li key={i}>
                <Text feld={punkt} sprache={sprache} />
              </li>
            ))}
          </ul>
          {inhalt.leitbild.quelle ? <Verweisliste eintraege={[inhalt.leitbild.quelle]} mitBeschreibung={false} /> : null}
        </section>
      ) : null}
    </div>
  );
}
