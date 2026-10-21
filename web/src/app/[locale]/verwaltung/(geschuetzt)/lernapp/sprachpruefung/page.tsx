import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { ZiehenKnopf } from '@/components/verwaltung/lernapp/Pruefoberflaeche';
import { SprachWahl } from '@/components/verwaltung/lernapp/SprachWahl';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { richtung, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { pruefTexte, pruefUi, rohPruefTexte } from '@/lib/lernapp/verwaltung/pruefung-texte';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { ladePruefSprachen, ladeWarteschlange, type WarteEintrag } from '@/server/queries/lernapp/sprachpruefung';

/**
 * Verwaltung › Lern-App › Sprachprüfung (L3-06, ADR 0041 Nr. 3/10, PLAN §6.5/§7.2): Warteschlange je eigener Prüfsprache –
 * Einheiten je Art (Zieltext, Übersetzung je Richtung, Audio) mit ihrer jüngsten Stichprobe; ziehen, öffnen, Ergebnis.
 * Recht `lernapp.sprache.pruefen`, die Einträge nur in den Sprachen aus `lernapp_pruefer_sprache` (auch für die
 * Administration). Einzige Seite der Verwaltung mit Sprachwahl de/tr/ar (`?ui=`).
 */
export default async function Sprachpruefung({ searchParams }: PageProps<'/[locale]/verwaltung/lernapp/sprachpruefung'>) {
  const a = await verlangeLernappSeite('lernapp.sprache.pruefen');
  const ui = pruefUi((await searchParams).ui);
  const t = pruefTexte(ui);
  const roh = rohPruefTexte(ui);
  const tg = await getTranslations('verwaltung.shell');
  const sprachen = await ladePruefSprachen(a.benutzerId);
  const liste = await ladeWarteschlange(sprachen);
  const uiAttr = { lang: ui, dir: richtung(ui) } as const;
  const sprachName = (s: string) => roh.sprachname[s as keyof typeof roh.sprachname] ?? s;
  const artText = (w: WarteEintrag) =>
    w.richtung
      ? `${t(`art.${w.art}`)}: ${t('richtung', { ziel: sprachName(zerlegeRichtung(w.richtung).ziel), ausgang: sprachName(zerlegeRichtung(w.richtung).ausgang) })}`
      : t(`art.${w.art}`);
  const stand = (w: WarteEintrag) =>
    !w.letzte
      ? t('warteschlange.keine')
      : w.letzte.entscheidung === 'offen'
        ? t('warteschlange.offen', { geprueft: w.letzte.geprueft, groesse: w.letzte.groesse })
        : `${t(`warteschlange.${w.letzte.entscheidung}`)}${w.letzte.aktuell ? '' : ` · ${t('warteschlange.veraltet')}`}`;
  const aktion = (w: WarteEintrag) =>
    w.letzte?.entscheidung === 'offen' ? (
      <NextLink
        href={`/verwaltung/lernapp/sprachpruefung/${w.letzte.id}?ui=${ui}`}
        {...uiAttr}
        className="inline-flex min-h-11 items-center gap-1 font-bold text-gruen-800 underline underline-offset-4"
      >
        {t('warteschlange.oeffnen')}
        <ArrowRight aria-hidden className="size-4" />
      </NextLink>
    ) : w.ziehbar ? (
      <ZiehenKnopf
        einheit={w.einheit}
        art={w.art}
        richtung={w.richtung}
        ui={ui}
        texte={{ knopf: t('warteschlange.ziehen'), laeuft: t('stichprobe.laeuft'), fehler: roh.fehler }}
      />
    ) : w.letzte ? (
      <NextLink
        href={`/verwaltung/lernapp/sprachpruefung/${w.letzte.id}?ui=${ui}`}
        {...uiAttr}
        className="inline-flex min-h-11 items-center gap-1 font-bold text-gruen-800 underline underline-offset-4"
      >
        {t('warteschlange.ansehen')}
      </NextLink>
    ) : null;

  return (
    <>
      <VerwaltungsKopf
        kennung={tg('gruppe.inhalte')}
        titel={t('titel')}
        titelLang={ui}
        einleitung={<span {...uiAttr}>{t('einleitung')}</span>}
      />
      <LernappNavigation aktiv="sprachpruefung" rollen={a.rollen} />
      <SprachWahl ui={ui} pfad="/verwaltung/lernapp/sprachpruefung" />
      {sprachen.length === 0 ? (
        <Meldung art="info">
          <span {...uiAttr}>{t('keineSprache')}</span>
        </Meldung>
      ) : (
        <p {...uiAttr}>{t('eigeneSprachen', { sprachen: sprachen.map(sprachName).join(', ') })}</p>
      )}
      <section aria-labelledby="warteschlange" className="flex flex-col gap-3">
        <h2 id="warteschlange" className="text-30" {...uiAttr}>
          {t('warteschlange.titel')}
        </h2>
        {liste.length === 0 ? (
          <div {...uiAttr}>
            <ListenLeer text={t('warteschlange.leer')} />
          </div>
        ) : (
          <TabellenRahmen
            beschriftung={t('warteschlange.beschriftung')}
            mobil={
              <ul className="flex flex-col gap-3">
                {liste.map((w) => (
                  <li
                    key={`${w.einheit}|${w.art}|${w.richtung}`}
                    className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4"
                  >
                    <span className="font-mono">{w.einheit}</span>
                    <span {...uiAttr}>{artText(w)}</span>
                    <span {...uiAttr}>{`${sprachName(w.sprache)} · ${t('warteschlange.kandidaten', { anzahl: w.kandidaten })}`}</span>
                    <span {...uiAttr}>{stand(w)}</span>
                    {aktion(w)}
                  </li>
                ))}
              </ul>
            }
          >
            <table className="w-full text-start">
              <thead className="bg-sand text-16" {...uiAttr}>
                <tr>
                  {(['einheit', 'art', 'sprache', 'stand', 'aktion'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-start">
                      {t(`warteschlange.spalte.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liste.map((w) => (
                  <tr key={`${w.einheit}|${w.art}|${w.richtung}`} className="border-t border-linie">
                    <th scope="row" className="px-4 py-3 text-start font-normal">
                      <span className="font-mono">{w.einheit}</span>
                      <span className="block text-16 text-tinte-2" {...uiAttr}>
                        {t('warteschlange.kandidaten', { anzahl: w.kandidaten })}
                      </span>
                    </th>
                    <td className="px-4 py-3" {...uiAttr}>
                      {artText(w)}
                    </td>
                    <td className="px-4 py-3" {...uiAttr}>
                      {sprachName(w.sprache)}
                    </td>
                    <td className="px-4 py-3" {...uiAttr}>
                      {stand(w)}
                    </td>
                    <td className="px-4 py-3">{aktion(w)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </section>
    </>
  );
}
