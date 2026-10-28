import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { abfluegeNachArt, flughaefen } from '@/lib/hadsch-umra/auswahl';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { waehle } from '@/lib/i18n/inhalt';
import type { HadschUmraInhalt } from '@/lib/validierung/seiteninhalte/hadsch-umra';
import { ZielLink } from './ZielLink';

/** Kalendertag JJJJ-MM-TT als Datum (Mittag UTC hält den Tag in Europe/Berlin stabil). */
const tag = (datum: string) => new Date(`${datum}T12:00:00Z`);

/**
 * Abflüge ab Frankfurt und Hessen (Plan Marktstart P4): je Art eine Tabelle mit Beschriftung (`caption`), Gruppe, Flug,
 * Hin- und Rückflug. Vergangene Abflüge entfallen (`heute` aus `heuteBerlin()`, statische Seite). Darunter Stand, Quellen
 * bei IGMG Reisen und der Hinweis, dass nur deren Angaben verbindlich sind. Server-Komponente ohne Client-JavaScript.
 */
export async function Abfluege({ abfluege, heute, sprache }: { abfluege: HadschUmraInhalt['abfluege']; heute: string; sprache: Locale }) {
  const [t, td] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'hadschUmra.abfluege' }),
    getTranslations({ locale: sprache, namespace: 'dachverband' }),
  ]);
  const gruppen = abfluegeNachArt(abfluege.eintraege, heute);
  /** „Frankfurt (FRA)“ für bekannte Codes, sonst der Code selbst; mehrere mit Schrägstrich. */
  const flughafenText = (angabe: string | undefined) => {
    const codes = flughaefen(angabe);
    if (!codes.length) return t('ohneAngabe');
    return codes.map((c) => (t.has(`flughaefen.${c}`) ? t(`flughaefen.${c}`) : c)).join(' / ');
  };

  return (
    <div className="flex flex-col gap-6">
      {gruppen.length ? (
        gruppen.map((g) => (
          // Auf schmalen Bildschirmen scrollt die Tabelle waagerecht: Der Bereich ist per Tastatur erreichbar und trägt die
          // Beschriftung der Tabelle als Namen (WCAG 2.1.1, axe „scrollable-region-focusable“)
          <div
            key={g.art}
            role="region"
            aria-labelledby={`hu-abfluege-${g.art}`}
            tabIndex={0}
            className="relative overflow-x-auto rounded-lg border border-linie bg-weiss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gruen-950"
          >
            <table className="w-full min-w-2xl border-collapse text-18">
              <caption id={`hu-abfluege-${g.art}`} className="px-4 pt-4 pb-2 text-left font-text text-20 font-bold tracking-normal">
                {t(`tabelle.${g.art}`)}
              </caption>
              <thead>
                <tr className="bg-sand text-left">
                  <th scope="col" className="px-4 py-3">
                    {t('gruppe')}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t('flug')}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t('hin')}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t('rueck')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.eintraege.map((a, i) => {
                  const gruppe = waehle(a.gruppe, sprache);
                  return (
                    <tr key={`${a.hin}-${i}`} className="border-t border-linie align-top">
                      <th scope="row" lang={gruppe.rueckfall ? 'de' : undefined} className="px-4 py-3 text-left font-bold">
                        {gruppe.text}
                      </th>
                      <td className="px-4 py-3">
                        {t('flugText', { von: flughafenText(a.abflughafen), nach: flughafenText(a.zielflughafen) })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        <time dateTime={a.hin}>{datumOhneWochentag(tag(a.hin), sprache)}</time>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        <time dateTime={a.rueck}>{datumOhneWochentag(tag(a.rueck), sprache)}</time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="max-w-text text-tinte-2">{t('keine')}</p>
      )}
      <div className="flex max-w-text flex-col gap-1 text-16 text-tinte-2">
        <p>
          {abfluege.stand ? `${t('stand', { datum: datumOhneWochentag(tag(abfluege.stand), sprache) })} ` : null}
          <strong className="font-bold text-tinte">{t('verbindlich')}</strong>
        </p>
        {abfluege.quellen.length ? (
          <div className="flex flex-wrap items-center gap-x-4">
            <span>{t('quelle')}</span>
            {abfluege.quellen.map((q, i) => (
              <ZielLink key={i} ziel={q} sprache={sprache} text={typeof q === 'string' ? td(`ziele.${q}.titel`) : new URL(q.de).hostname} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
