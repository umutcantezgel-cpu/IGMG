import { ExternalLink, RotateCcw } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ReihenfolgeEditor } from '@/components/verwaltung/reihenfolge/ReihenfolgeEditor';
import { PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { speichereStartseite, startseiteRevisionWiederherstellen, startseiteZuruecksetzen } from '@/server/actions/startseite';
import { ladeStartseiteVerwaltung } from '@/server/queries/verwaltung/startseite';

/**
 * Verwaltung › Startseite (F-40, Plan §3.7, ADR 0032 Nr. 6): Reihenfolge und Sichtbarkeit der Abschnitte unter dem festen
 * Kopf, per Tastatur („Nach oben“, „Nach unten“, „Anzeigen“). Ohne gespeicherte Ordnung steht die Standardreihenfolge
 * bereit; „Standardreihenfolge wiederherstellen“ entfernt die gespeicherte Ordnung. Darunter die letzten Fassungen.
 */
export default async function StartseiteVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/startseite'>) {
  await verlangeSeitenRecht('startseite.bearbeiten');
  const [t, tg, stand, sp] = await Promise.all([
    getTranslations('verwaltung.startseite'),
    getTranslations('verwaltung.shell'),
    ladeStartseiteVerwaltung(),
    searchParams,
  ]);
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const name = (s: string) => t(`abschnitt.${s}.titel`);
  const eintraege = stand.ordnung.map((e) => ({
    schluessel: e.schluessel,
    titel: name(e.schluessel),
    beschreibung: t(`abschnitt.${e.schluessel}.beschreibung`),
    sichtbar: e.sichtbar,
  }));
  const meldung = sp.zurueckgesetzt ? t('zurueckgesetzt') : sp.wiederhergestellt ? t('wiederhergestellt') : null;

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noopener">
              <ExternalLink aria-hidden />
              {t('ansehen')}
            </a>
          </Button>
        }
      />
      {meldung ? <Meldung art="erfolg">{meldung}</Meldung> : null}
      <Meldung art="info">
        {stand.gespeichert
          ? stand.gespeichert.von
            ? t('eigenesAktiv', { datum: zeit(stand.gespeichert.am), name: stand.gespeichert.von })
            : t('eigenesAktivOhneName', { datum: zeit(stand.gespeichert.am) })
          : t('standardAktiv')}
      </Meldung>
      <ReihenfolgeEditor
        // Nach „Zurückholen“ und „Standard wiederherstellen“ (Adresse mit Zeitstempel) startet der Editor neu mit dem Stand
        // des Servers; nach „Speichern“ bleibt er stehen (seine Liste ist der gespeicherte Stand, die Rückmeldung bleibt)
        key={String(sp.wiederhergestellt ?? sp.zurueckgesetzt ?? 'start')}
        aktion={speichereStartseite}
        eintraege={eintraege}
        namensraum="verwaltung.startseite.editor"
        mitSichtbarkeit
        fest={{ titel: t('fest.titel'), beschreibung: t('fest.beschreibung'), marke: t('fest.marke') }}
      />
      {stand.gespeichert ? (
        <details className="rounded-lg border border-linie bg-weiss p-5 md:p-6">
          <summary className="flex min-h-12 cursor-pointer items-center gap-2 font-bold">
            <RotateCcw aria-hidden className="size-5" />
            {t('zuruecksetzen')}
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <p className="max-w-einleitung text-16 text-tinte-2">{t('zuruecksetzenText')}</p>
            <form action={startseiteZuruecksetzen}>
              <Button type="submit" variant="destructive">
                <RotateCcw aria-hidden />
                {t('zuruecksetzen')}
              </Button>
            </form>
          </div>
        </details>
      ) : null}
      <section aria-labelledby="fassungen" className="flex flex-col gap-3">
        <h2 id="fassungen" className="font-display text-24 font-semibold">
          {t('verlauf.titel')}
        </h2>
        <p className="max-w-einleitung text-16 text-tinte-2">{t('verlauf.einleitung')}</p>
        {stand.verlauf.length === 0 ? (
          <p className="text-16 text-tinte-2">{t('verlauf.leer')}</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {stand.verlauf.map((f, i) => {
              const sichtbar = f.ordnung.filter((e) => e.sichtbar);
              const aus = f.ordnung.filter((e) => !e.sichtbar);
              // Die neueste Fassung gilt, wenn gespeichert ist oder sie „Standard wiederhergestellt“ festhält
              const aktuell = i === 0 && (stand.gespeichert !== null || f.kommentar === 'standard');
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-linie bg-weiss p-4 md:p-5">
                  <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1">
                    <p className="flex flex-wrap items-center gap-2 font-bold tabular-nums">
                      {zeit(f.erstelltAm)}
                      {aktuell ? <span className={cn(PILLE, 'bg-gruen-50 text-gruen-800')}>{t('verlauf.aktuell')}</span> : null}
                      {f.kommentar === 'standard' ? (
                        <span className={cn(PILLE, 'bg-sand text-tinte-2')}>{t('verlauf.standardVermerk')}</span>
                      ) : f.kommentar === 'wiederhergestellt' ? (
                        <span className={cn(PILLE, 'bg-sand text-tinte-2')}>{t('verlauf.wiederhergestelltVermerk')}</span>
                      ) : null}
                    </p>
                    <p className="text-16 text-tinte-2">
                      {t('verlauf.spalteVon')}: {f.von ?? t('verlauf.unbekannt')}
                    </p>
                    <p className="text-16">
                      <span className="sr-only">{t('verlauf.spalteReihenfolge')}: </span>
                      {sichtbar.map((e) => name(e.schluessel)).join(' · ')}
                    </p>
                    {aus.length ? (
                      <p className="text-16 text-tinte-2">
                        {t('verlauf.ausgeblendet')}: {aus.map((e) => name(e.schluessel)).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  {!aktuell ? (
                    <form action={startseiteRevisionWiederherstellen}>
                      <input type="hidden" name="revisionId" value={f.id} />
                      <Button type="submit" variant="secondary" aria-label={t('verlauf.zurueckholenName', { zeit: zeit(f.erstelltAm) })}>
                        <RotateCcw aria-hidden />
                        {t('verlauf.zurueckholen')}
                      </Button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
