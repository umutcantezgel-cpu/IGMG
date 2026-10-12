import { connection } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { ErneutPruefen } from '@/components/verwaltung/startklar/ErneutPruefen';
import { PruefListe, type PruefGruppe, type PruefStatus, type PruefZeile } from '@/components/verwaltung/startklar/PruefListe';
import { STATUS_STIL } from '@/components/verwaltung/startklar/status';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { db } from '@/lib/db';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { fuehreStartklarAus, type Bereich, type Pruefung } from '@/lib/startklar/pruefungen';
import { cn } from '@/lib/utils';

/** Reihenfolge der Bereiche auf der Seite (Umgebung bis E-Mail). */
const BEREICHE = ['umgebung', 'auslieferung', 'datenbank', 'inhalte', 'recht', 'mail'] as const satisfies readonly Bereich[];
/** Reihenfolge der offenen Punkte: Fehler zuerst, erledigte am Ende. */
const RANG: Record<PruefStatus, number> = { fehler: 0, warnung: 1, manuell: 2, hinweis: 3, ok: 4 };
const STATUS_REIHE = ['fehler', 'warnung', 'manuell', 'hinweis', 'ok'] as const satisfies readonly PruefStatus[];

/**
 * Verwaltung › Startklar-Cockpit (AUFTRAG V-11, Z-12): was vor dem Livegang noch fehlt, verständlich ohne Technikwissen.
 * Recht `einstellung.bearbeiten` (kein neues Recht). Die Prüfungen stammen aus `fuehreStartklarAus` und laufen auch
 * auf der Kommandozeile (`pnpm startklar`).
 */
export default async function StartklarSeite() {
  await connection();
  await verlangeSeitenRecht('einstellung.bearbeiten');
  const [t, tg, ergebnis] = await Promise.all([
    getTranslations('verwaltung.startklar'),
    getTranslations('verwaltung.shell'),
    fuehreStartklarAus({ env: process.env, db }),
  ]);

  const zeitpunkt = new Date(ergebnis.zeitpunkt);
  const zeile = (p: Pruefung): PruefZeile => ({
    id: p.id,
    status: p.status,
    statusText: t(`status.${p.status}`),
    titel: p.titel,
    meldung: p.meldung,
    ort: p.ort,
    aufwand: p.aufwand,
    // Der Konzept-Hinweis hat einen Schalter: „ok“ heißt, er ist ausgeschaltet, also bietet die Zeile „einschalten“ an.
    schalter: p.id === 'inhalte.konzepthinweis' ? (p.status === 'ok' ? 'einschalten' : 'ausschalten') : undefined,
  });

  const gruppen: PruefGruppe[] = BEREICHE.map((bereich) => {
    const alle = ergebnis.pruefungen.filter((p) => p.bereich === bereich);
    const offen = alle
      .filter((p) => p.status !== 'ok')
      .sort((a, b) => RANG[a.status] - RANG[b.status])
      .map(zeile);
    const erledigt = alle.filter((p) => p.status === 'ok').map(zeile);
    return {
      schluessel: bereich,
      titel: t(`bereiche.${bereich}`),
      beschreibung: t(`bereichTexte.${bereich}`),
      offen,
      erledigt,
      erledigtText: t('erledigt', { anzahl: erledigt.length }),
    };
  }).filter((g) => g.offen.length + g.erledigt.length > 0);

  const z = ergebnis.zaehler;
  const gesamtText =
    z.fehler > 0 ? t('gesamt.fehlerText', { anzahl: z.fehler }) : t('gesamt.startklarText', { anzahl: z.warnung + z.manuell });

  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.betrieb')} einleitung={t('einleitung')} />
      <section
        aria-labelledby="startklar-gesamt"
        className="flex flex-col gap-5 rounded-lg border border-linie bg-weiss p-5 md:flex-row md:items-start md:gap-8 md:p-6"
      >
        {/* max-md:-ml-3.5: die sichtbare Sternspitze fluchtet auf dem Telefon mit Überschrift und Zählern (H-E02, Innenrand im 96er-Raster) */}
        <Zustandsgrafik art={ergebnis.startklar ? 'erfolg' : 'fehler'} className="self-start max-md:-ml-3.5" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="startklar-gesamt" className="text-display-2">
              {ergebnis.startklar ? t('gesamt.startklar') : t('gesamt.nochNicht')}
            </h2>
            <p className="text-18">{gesamtText}</p>
          </div>
          <dl className="flex flex-col divide-y divide-linie rounded-md border border-linie md:flex-row md:flex-wrap md:gap-2 md:divide-y-0 md:rounded-none md:border-0">
            {STATUS_REIHE.map((s) => {
              const { Icon, ziffer } = STATUS_STIL[s];
              return (
                <div key={s} className="flex min-h-12 items-center gap-3 px-3 md:gap-2 md:rounded-md md:border md:border-linie md:py-1">
                  <dt className="inline-flex flex-1 items-center gap-1.5 text-16 text-tinte-2 md:flex-none md:whitespace-nowrap">
                    <Icon aria-hidden className="size-4 shrink-0" />
                    {t(`status.${s}`)}
                  </dt>
                  <dd className={cn('text-24 font-bold tabular-nums', z[s] > 0 ? ziffer : 'text-tinte-3')}>{z[s]}</dd>
                </div>
              );
            })}
          </dl>
          <p className="text-16 text-tinte-2">
            {t('zeile', {
              art: t(`betriebsart.${ergebnis.betriebsart}`),
              zeit: `${datumLang(zeitpunkt, 'de')}, ${uhrzeit(zeitpunkt, 'de')}`,
            })}
          </p>
          <div>
            <ErneutPruefen stand={ergebnis.zeitpunkt} texte={{ knopf: t('erneutPruefen'), laeuft: t('erneutLaeuft') }} />
          </div>
        </div>
      </section>
      <PruefListe
        gruppen={gruppen}
        texte={{
          offenLeer: t('offenLeer'),
          wo: t('wo'),
          aufwand: t('aufwand'),
          konzept: {
            einschalten: t('konzept.einschalten'),
            ausschalten: t('konzept.ausschalten'),
            laeuft: t('konzept.laeuft'),
            eingeschaltet: t('konzept.eingeschaltet'),
            ausgeschaltet: t('konzept.ausgeschaltet'),
            fehler: t('konzept.fehler'),
            keinRecht: t('konzept.keinRecht'),
          },
        }}
      />
      <div className="flex flex-col gap-1 border-t border-linie pt-4 text-16 text-tinte-2">
        <p>{t('fussnote.kommandozeile')}</p>
        <p>{t('fussnote.anleitung')}</p>
      </div>
    </>
  );
}
