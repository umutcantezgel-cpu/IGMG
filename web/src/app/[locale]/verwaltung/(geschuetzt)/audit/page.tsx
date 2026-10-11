import { getTranslations } from 'next-intl/server';
import type { AuditAktion } from '@/lib/audit';
import { AuditFilter, type Auswahl } from '@/components/verwaltung/audit/AuditFilter';
import { AuditSeiten } from '@/components/verwaltung/audit/AuditSeiten';
import { AuditTabelle, type AnzeigeZeile } from '@/components/verwaltung/audit/AuditTabelle';
import { benutzerAnzeige, detailZeilen, zeitpunktText, zielAnzeige } from '@/components/verwaltung/audit/anzeige';
import { Meldung } from '@/components/verwaltung/Meldung';
import { isoZeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import {
  AKTION_SCHLUESSEL,
  AKTIONEN,
  filterAusSuche,
  istAktion,
  ladeAuditSeite,
  ladeKonten,
  ladeZielTypen,
  OHNE_KONTO,
} from '@/server/queries/verwaltung/audit';

/** Stellt einen Wert in die Auswahl, wenn er dort fehlt (z. B. ein Konto, das es nicht mehr gibt). */
function mitAktuellem(optionen: Auswahl[], wert: string, bezeichnung: string): Auswahl[] {
  if (wert === '' || optionen.some((o) => o.wert === wert)) return optionen;
  return [...optionen, { wert, label: bezeichnung }];
}

/**
 * Verwaltung › Audit-Log (C13, G-07). Nur lesen: Recht `audit.lesen` (nur Administration, matrix.ts), Filter und
 * Seiten über Suchparameter (?von, ?bis, ?aktion, ?zielTyp, ?benutzer, ?seite). Keine Aktionen, kein Export.
 */
export default async function AuditLogSeite({ searchParams }: PageProps<'/[locale]/verwaltung/audit'>) {
  await verlangeSeitenRecht('audit.lesen');
  const suche = filterAusSuche(await searchParams);
  const [t, ergebnis, konten, zielTypen] = await Promise.all([
    getTranslations('verwaltung.audit'),
    ladeAuditSeite(suche.filter, suche.seite),
    ladeKonten(),
    ladeZielTypen(),
  ]);

  const aktionNamen = Object.fromEntries(AKTIONEN.map((aktion) => [aktion, t(`aktion.${AKTION_SCHLUESSEL[aktion]}`)])) as Record<
    AuditAktion,
    string
  >;
  const zielNamen: Record<string, string> = {
    veranstaltung: t('ziel.veranstaltung'),
    einladung: t('ziel.einladung'),
    eingang: t('ziel.eingang'),
  };
  const keinWert = t('keinWert');
  const system = t('system');
  const kontoFehlt = t('kontoFehlt');

  const aktionen: Auswahl[] = AKTIONEN.map((aktion) => ({ wert: aktion, label: aktionNamen[aktion] })).sort((x, y) =>
    x.label.localeCompare(y.label, 'de'),
  );
  const ziele = mitAktuellem(
    zielTypen.map((typ) => ({ wert: typ, label: Object.hasOwn(zielNamen, typ) ? zielNamen[typ] : typ })),
    suche.werte.zielTyp,
    suche.werte.zielTyp,
  );
  const benutzer = mitAktuellem(
    [{ wert: OHNE_KONTO, label: system }, ...konten.map((k) => ({ wert: k.id, label: `${k.name} (${k.email})` }))],
    suche.werte.benutzer,
    kontoFehlt,
  );

  const fehlerVon = suche.fehler.von ? t('fehler.datum') : undefined;
  const fehlerBis = suche.fehler.bis ? t('fehler.datum') : suche.fehler.zeitraum ? t('fehler.zeitraum') : undefined;
  const mitFehler = suche.fehler.von || suche.fehler.bis || suche.fehler.zeitraum;
  const filterAktiv = Object.values(suche.werte).some((w) => w !== '');

  const zeilen: AnzeigeZeile[] = ergebnis.zeilen.map((z) => ({
    id: z.id,
    zeitpunkt: zeitpunktText(z.zeitpunkt),
    iso: isoZeit(z.zeitpunkt),
    benutzer: benutzerAnzeige(z, { system, kontoFehlt }),
    aktion: istAktion(z.aktion) ? aktionNamen[z.aktion] : z.aktion,
    ziel: zielAnzeige(z.zielTyp, z.zielId, zielNamen, keinWert),
    details: detailZeilen(z.details),
  }));

  /** Adresse derselben Filter mit der Seite `nummer` (ohne Seitenangabe für Seite 1). */
  const adresse = (nummer: number): string => {
    const p = new URLSearchParams(Object.entries(suche.werte).filter(([, w]) => w !== ''));
    if (nummer > 1) p.set('seite', String(nummer));
    const q = p.toString();
    return q ? `/verwaltung/audit?${q}` : '/verwaltung/audit';
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-display-2">{t('titel')}</h1>
        <p className="text-tinte-2">{t('einleitung')}</p>
      </div>
      <section aria-labelledby="audit-filter-titel" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 md:p-6">
        <h2 id="audit-filter-titel" className="text-20 font-bold">
          {t('filterTitel')}
        </h2>
        {mitFehler ? <Meldung art="fehler">{t('fehler.zusammenfassung')}</Meldung> : null}
        <AuditFilter
          werte={suche.werte}
          fehler={{ von: fehlerVon, bis: fehlerBis }}
          aktionen={aktionen}
          ziele={ziele}
          benutzer={benutzer}
          texte={{
            von: t('filter.von'),
            bis: t('filter.bis'),
            aktion: t('filter.aktion'),
            zielTyp: t('filter.zielTyp'),
            benutzer: t('filter.benutzer'),
            alle: t('filter.alle'),
            absenden: t('filter.absenden'),
            zuruecksetzen: t('filter.zuruecksetzen'),
          }}
        />
      </section>
      <section aria-labelledby="audit-liste-titel" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="audit-liste-titel" className="text-20 font-bold">
            {t('listeTitel')}
          </h2>
          <p className="text-tinte-2 tabular-nums">{t('anzahl', { anzahl: ergebnis.gesamt })}</p>
        </div>
        {zeilen.length === 0 ? (
          <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{filterAktiv ? t('leerMitFilter') : t('leer')}</p>
        ) : (
          <AuditTabelle
            zeilen={zeilen}
            texte={{
              beschriftung: t('tabelle'),
              keinWert,
              spalten: {
                zeitpunkt: t('spalte.zeitpunkt'),
                benutzer: t('spalte.benutzer'),
                aktion: t('spalte.aktion'),
                ziel: t('spalte.ziel'),
                details: t('spalte.details'),
              },
            }}
          />
        )}
        <AuditSeiten
          seite={ergebnis.seite}
          seiten={ergebnis.seiten}
          zurueckHref={adresse(ergebnis.seite - 1)}
          weiterHref={adresse(ergebnis.seite + 1)}
          texte={{
            navName: t('seitenNav'),
            zurueck: t('zurueck'),
            weiter: t('weiter'),
            seite: t('seite', { seite: ergebnis.seite, seiten: ergebnis.seiten }),
          }}
        />
      </section>
    </>
  );
}
