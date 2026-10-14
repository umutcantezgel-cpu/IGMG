import { ArrowDown, ArrowUp, ExternalLink, Eye, Pencil, Plus, Settings } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { KARTE } from '@/components/verwaltung/anzeige/stil';
import { folienName, FolienStand, zeitplanText } from '@/components/verwaltung/anzeige/Teile';
import { verlangeAnzeigeZugang } from '@/components/verwaltung/anzeige/zugang';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { aktiveFolien, anzeigeZustand } from '@/lib/anzeige/plan';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { uhrzeitNackt } from '@/lib/i18n/format';
import { verschiebeFolie } from '@/server/actions/anzeige';
import { ladeAnzeige } from '@/server/queries/anzeige';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';
import { ladeFolienListe, type FolieVerwaltung } from '@/server/queries/verwaltung/anzeige';

/**
 * Verwaltung › Anzeige (AUFTRAG 3.10, B-25): was gerade auf dem Bildschirm im Gebetsraum läuft, alle Folien in der
 * Reihenfolge der Anzeige mit Zeitplan, Sichtbarkeit und religiöser Freigabe; sortieren mit Pfeilknöpfen.
 * Redaktion pflegt (`anzeige.bearbeiten`), die religiöse Prüfung sieht die Liste und prüft Vers- und Hadith-Folien.
 */
export default async function AnzeigeVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/anzeige'>) {
  const { bearbeiten } = await verlangeAnzeigeZugang();
  const [t, tg, tz, liste, suche, oeffentlich, fenster] = await Promise.all([
    getTranslations('verwaltung.anzeige'),
    getTranslations('verwaltung.shell'),
    getTranslations('anzeige'),
    ladeFolienListe(),
    searchParams,
    ladeAnzeige(),
    ladeGebetszeitenFenster(),
  ]);
  const jetzt = new Date();
  const heute = fenster.tage.find((d) => d.datum === berlinerDatum(jetzt));
  const cmsAktiv = oeffentlich.folien.length > 0 || Object.keys(oeffentlich.einstellung.iqama).length > 0;
  const plan = heute && cmsAktiv ? anzeigeZustand(heute.datum, heute, oeffentlich.folien, oeffentlich.einstellung, jetzt) : null;
  const uhr = (ms: number) => uhrzeitNackt(new Date(ms), 'de');
  const stand =
    plan?.modus === 'ruhe'
      ? plan.iqama
        ? t('jetzt.ruheIqama', { gebet: tz(`namen.${plan.gebet}`), iqama: plan.iqama, bis: uhr(plan.bisMs) })
        : t('jetzt.ruhe', { gebet: tz(`namen.${plan.gebet}`), bis: uhr(plan.bisMs) })
      : plan?.modus === 'freitag'
        ? t('jetzt.freitag', { bis: uhr(plan.bisMs) })
        : aktiveFolien(oeffentlich.folien, jetzt).length
          ? t('jetzt.folien', { anzahl: aktiveFolien(oeffentlich.folien, jetzt).length })
          : t('jetzt.keineFolien');

  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/anzeige/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );
  const name = (f: FolieVerwaltung) => folienName(f, t);
  // „Bearbeiten“ mit sichtbarem Text (SL-1); die Pfeile als Symbole mit Tooltip und vollem Namen
  const aktionen = (f: FolieVerwaltung, i: number) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {bearbeiten && i > 0 ? (
        <form action={verschiebeFolie}>
          <input type="hidden" name="id" value={f.id} />
          <input type="hidden" name="richtung" value="hoch" />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            title={t('aktion.hochKurz')}
            aria-label={t('aktion.hoch', { titel: name(f) })}
          >
            <ArrowUp aria-hidden />
          </Button>
        </form>
      ) : null}
      {bearbeiten && i < liste.length - 1 ? (
        <form action={verschiebeFolie}>
          <input type="hidden" name="id" value={f.id} />
          <input type="hidden" name="richtung" value="runter" />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            title={t('aktion.runterKurz')}
            aria-label={t('aktion.runter', { titel: name(f) })}
          >
            <ArrowDown aria-hidden />
          </Button>
        </form>
      ) : null}
      <Button asChild variant="outline">
        <NextLink
          href={`/verwaltung/anzeige/${f.id}`}
          aria-label={t(bearbeiten ? 'aktion.bearbeiten' : 'aktion.ansehen', { titel: name(f) })}
        >
          {bearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
          {t(bearbeiten ? 'aktion.bearbeitenKurz' : 'aktion.ansehenKurz')}
        </NextLink>
      </Button>
    </div>
  );

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={bearbeiten && liste.length ? anlegen : null}
      />
      {suche.geloescht ? <Meldung art="erfolg">{t('geloescht')}</Meldung> : null}
      {bearbeiten ? null : <p className="max-w-einleitung text-16 text-tinte-2">{t('nurLesen')}</p>}

      <section aria-labelledby="anzeige-jetzt" className={KARTE}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="anzeige-jetzt" className="font-display text-24 font-semibold">
              {t('jetzt.titel')}
            </h2>
            <p className="text-20 font-bold" role="status">
              {stand}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <NextLink href="/gebetszeiten/anzeige" target="_blank" rel="noopener">
                <ExternalLink aria-hidden />
                {t('oeffnen')}
              </NextLink>
            </Button>
            {bearbeiten ? (
              <Button asChild variant="outline">
                <NextLink href="/verwaltung/anzeige/einstellungen">
                  <Settings aria-hidden />
                  {t('einstellungen')}
                </NextLink>
              </Button>
            ) : null}
          </div>
        </div>
        <p className="max-w-einleitung text-16 text-tinte-2">{t('jetzt.hinweis')}</p>
      </section>

      {liste.length === 0 ? (
        <ListenLeer text={t('leerText')} aktion={bearbeiten ? anlegen : undefined} />
      ) : (
        <TabellenRahmen
          beschriftung={t('tabelle')}
          mobil={
            <ol className="flex flex-col gap-3">
              {liste.map((f, i) => (
                <ListenKarte
                  key={f.id}
                  titel={`${i + 1}. ${name(f)}`}
                  angaben={[
                    { label: t('spalte.art'), wert: t(`art.${f.art}`) },
                    { label: t('spalte.zeitplan'), wert: zeitplanText(f, t, jetzt) },
                    { label: t('spalte.stand'), wert: <FolienStand f={f} t={t} /> },
                  ]}
                  aktionen={aktionen(f, i)}
                />
              ))}
            </ol>
          }
        >
          <table className="w-full min-w-220 border-collapse text-left">
            <caption className="sr-only">{t('tabelle')}</caption>
            <thead className="bg-sand">
              <tr>
                {(['reihenfolge', 'folie', 'zeitplan', 'stand', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((f, i) => (
                <tr key={f.id} className="border-t border-linie align-middle">
                  <td className="px-4 py-3 font-bold tabular-nums">{i + 1}</td>
                  <th scope="row" className="px-4 py-3 text-left">
                    <span className="flex flex-col">
                      <span className="font-bold">{name(f)}</span>
                      <span className="text-16 font-normal text-tinte-2">{t(`art.${f.art}`)}</span>
                    </span>
                  </th>
                  <td className="px-4 py-3 text-16">{zeitplanText(f, t, jetzt)}</td>
                  <td className="px-4 py-3">
                    <FolienStand f={f} t={t} />
                  </td>
                  <td className="px-4 py-3">{aktionen(f, i)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
