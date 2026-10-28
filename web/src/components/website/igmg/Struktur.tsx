import { Building2, ExternalLink, Target, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { OrgCard } from '@/components/website/OrgCard';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/**
 * Reiter „Struktur“ (design/IGMGInfo.dc.html Z. 68–95; Plan Marktstart P1): Leitung der Zentrale (Präsidium und
 * erweiterter Vorstand), Organe laut Satzung, drei Organisationsstufen, Fachvereine und Einrichtungen sowie die vier
 * Organisationskarten mit Kurzbeschreibung. Gremien und Fachvereine entfallen, solange sie leer sind.
 * Fachvereine mit belegter Adresse verlinken nach außen wie die Verweisliste (`hrefLang`, sichtbarer Sprachhinweis beim
 * Rückfall, Linkname mit Kontext, K-14: nur Links).
 */
export async function Struktur({ inhalt, sprache }: { inhalt: IgmgInhalt; sprache: Sprache }) {
  const [t, td] = await Promise.all([getTranslations('igmg'), getTranslations('dachverband')]);
  const stufen = [
    { Icon: Building2, titel: t('stufe1Titel'), text: t('stufe1Text') },
    { Icon: Users, titel: t('stufe2Titel'), text: t('stufe2Text') },
    { Icon: Target, titel: t('stufe3Titel'), text: t('stufe3Text') },
  ];
  const sprachHinweis: Partial<Record<Sprache, string>> = { de: td('aufDeutsch'), tr: td('aufTuerkisch') };
  const { gremien, fachvereine } = inhalt.struktur;
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="igmg-zentralverband" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10">
        <h2 id="igmg-zentralverband" className="text-display-2">
          {t('strukturTitel')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-20 font-bold">{t('praesidium')}</h3>
            <Text feld={inhalt.struktur.praesidium} sprache={sprache} als="p" />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-20 font-bold">{t('ausschuss')}</h3>
            <Text feld={inhalt.struktur.ausschuss} sprache={sprache} als="p" />
          </div>
        </div>
      </section>
      {gremien.de.trim() ? (
        <section aria-labelledby="igmg-gremien" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10">
          <h2 id="igmg-gremien" className="text-display-2">
            {t('gremienTitel')}
          </h2>
          <Text feld={gremien} sprache={sprache} als="p" className="max-w-text text-pretty" />
        </section>
      ) : null}
      <section aria-labelledby="igmg-orgstruktur" className="flex flex-col gap-4">
        <h2 id="igmg-orgstruktur" className="text-display-2">
          {t('organisationsstrukturTitel')}
        </h2>
        <ol className="grid raster-kacheln gap-4">
          {stufen.map(({ Icon, titel, text }) => (
            <li key={titel} className="flex items-start gap-3.5 rounded-lg border border-linie bg-weiss p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gruen-50 text-gruen-800">
                <Icon aria-hidden className="size-6" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="text-20 font-bold">{titel}</h3>
                <p className="text-16 text-tinte-2">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      {fachvereine.length ? (
        <section aria-labelledby="igmg-fachvereine" className="flex flex-col gap-4">
          <h2 id="igmg-fachvereine" className="text-display-2">
            {t('fachvereineTitel')}
          </h2>
          <ul className="grid raster-kacheln gap-4">
            {fachvereine.map((verein) => {
              const eigene = verein.url?.[sprache];
              const href = verein.url ? (eigene ?? verein.url.de) : null;
              // Ohne Adresse in der Seitensprache gilt die deutsche Seite (sichtbarer Hinweis, K-02)
              const zielSprache: Sprache = eigene ? sprache : 'de';
              const hinweis = zielSprache !== sprache ? sprachHinweis[zielSprache] : undefined;
              const sichtbar = hinweis ? `${verein.name} ${hinweis}` : verein.name;
              return (
                <li key={verein.name} className="flex min-w-0 flex-col gap-1 rounded-lg border border-linie bg-weiss p-5">
                  <h3 className="text-20 font-bold">
                    {href ? (
                      <a
                        href={href}
                        hrefLang={zielSprache}
                        rel="noopener noreferrer"
                        aria-label={`${sichtbar}: ${td('externeSeite')}`}
                        className="inline-flex min-h-12 flex-wrap items-center gap-x-2 text-gruen-700 underline underline-offset-3 transition duration-(--dauer-rueckmeldung) hover:decoration-2"
                      >
                        <span>{verein.name}</span>
                        {hinweis ? <span className="text-16 font-normal text-tinte-2">{hinweis}</span> : null}
                        <ExternalLink aria-hidden className="size-4 shrink-0" />
                      </a>
                    ) : (
                      verein.name
                    )}
                  </h3>
                  <Text feld={verein.bereich} sprache={sprache} als="p" className="text-16 text-tinte-2" />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <section aria-labelledby="igmg-organisationen" className="flex flex-col gap-4">
        <h2 id="igmg-organisationen" className="text-display-2">
          {t('organisationenTitel')}
        </h2>
        <div className="grid raster-kacheln gap-4">
          <OrgCard org="at" desc={t('orgBeschreibung_at')} />
          <OrgCard org="kt" desc={t('orgBeschreibung_kt')} />
          <OrgCard org="gt" desc={t('orgBeschreibung_gt')} />
          <OrgCard org="kgt" desc={t('orgBeschreibung_kgt')} />
        </div>
      </section>
    </div>
  );
}
