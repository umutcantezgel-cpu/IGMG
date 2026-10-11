import { Download, Eye } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { EINGANG_ARTEN, EINGANG_STATUS } from '@/lib/eingaenge/arten';
import { datumKurz, datumLang, uhrzeit } from '@/lib/i18n/format';
import { lokaleTeile } from '@/lib/termine';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeEingangsListe, listenFilterSchema, SEITENGROESSE, sichtbarkeit } from '@/server/queries/verwaltung/eingaenge';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
const STATUS_TOENUNG: Record<string, string> = {
  neu: 'bg-info-toenung text-info',
  in_bearbeitung: 'bg-warnung-toenung text-warnung',
  erledigt: 'bg-gruen-50 text-gruen-800',
  abgelehnt: 'bg-sand text-tinte-2',
};
const feld = 'min-h-11 rounded-md border border-rand bg-weiss px-3 text-18';

/**
 * Verwaltung › Eingänge (C08, Blatt V08): Liste ohne Personendaten (G-07), Filter nach Art und Status, Export.
 * Nur Arten mit Leserecht; Organisationsredaktion nur Anmeldungen zu Veranstaltungen der eigenen Organisation.
 */
export default async function EingaengeVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/eingaenge'>) {
  const a = await verlangeSeitenRecht('verwaltung.betreten');
  const { arten } = sichtbarkeit(a);
  if (!arten.length) redirect('/verwaltung/kein-zugriff');
  const sp = await searchParams;
  const filter = listenFilterSchema.parse(sp);
  const [t, { zeilen, gesamt }] = await Promise.all([getTranslations('verwaltung.eingaenge'), ladeEingangsListe(filter, a)]);
  const seiten = Math.max(1, Math.ceil(gesamt / SEITENGROESSE));
  const abfrage = (zusatz: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const werte: Record<string, string | number | undefined> = { art: filter.art, status: filter.status, ...zusatz };
    for (const [k, v] of Object.entries(werte)) if (v !== undefined && v !== '') p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : '';
  };
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-display-2">{t('titel')}</h1>
        <p className="max-w-[70ch] text-tinte-2">{t('untertitel')}</p>
      </div>
      {sp.geloescht === '1' ? <Meldung art="erfolg">{t('geloescht')}</Meldung> : null}
      <form method="get" aria-label={t('filter')} className="flex flex-wrap items-end gap-3 rounded-lg border border-linie bg-weiss p-4">
        <label className="flex flex-col gap-1 text-16 font-bold">
          {t('spalte.art')}
          <select name="art" defaultValue={filter.art ?? ''} className={feld}>
            <option value="">{t('alleArten')}</option>
            {EINGANG_ARTEN.filter((art) => arten.includes(art)).map((art) => (
              <option key={art} value={art}>
                {t(`art.${art}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-16 font-bold">
          {t('spalte.status')}
          <select name="status" defaultValue={filter.status ?? ''} className={feld}>
            <option value="">{t('alleStatus')}</option>
            <option value="offen">{t('offen')}</option>
            {EINGANG_STATUS.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="outline">
          {t('anwenden')}
        </Button>
        <span className="ml-auto flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={`/verwaltung/eingaenge/export${abfrage({ format: 'csv' })}`}>
              <Download aria-hidden />
              {t('exportCsv')}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`/verwaltung/eingaenge/export${abfrage({ format: 'json' })}`}>
              <Download aria-hidden />
              {t('exportJson')}
            </a>
          </Button>
        </span>
        <p className="w-full text-16 text-tinte-2">{t('exportHinweis')}</p>
      </form>
      <p className="text-16 text-tinte-2" role="status">
        {t('anzahl', { anzahl: gesamt })}
      </p>
      {zeilen.length === 0 ? (
        <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{t('leer')}</p>
      ) : (
        <TabellenRahmen beschriftung={t('titel')}>
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['eingegangen', 'art', 'bezug', 'status', 'sprache', 'loeschenAb', 'aktion'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zeilen.map((z) => {
                const datum = `${datumKurz(z.erstelltAm, 'de')} ${lokaleTeile(z.erstelltAm).jahr}, ${uhrzeit(z.erstelltAm, 'de')}`;
                return (
                  <tr key={z.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 font-bold whitespace-nowrap">
                      {datum}
                    </th>
                    <td className="px-4 py-3">{t(`art.${z.art}`)}</td>
                    <td className="px-4 py-3">
                      {z.bezugTitel ?? '–'}
                      {z.art === 'veranstaltungsanmeldung' && z.anzahl > 1 ? (
                        <span className="block text-16 text-tinte-2">× {z.anzahl}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(pille, STATUS_TOENUNG[z.status])}>{t(`status.${z.status}`)}</span>
                    </td>
                    <td className="px-4 py-3">{t(`sprachen.${z.sprache}`)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{z.loeschenAb ? datumLang(z.loeschenAb, 'de') : '–'}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="icon">
                        <NextLink href={`/verwaltung/eingaenge/${z.id}`}>
                          <Eye aria-hidden />
                          <span className="sr-only">{t('ansehen', { datum })}</span>
                        </NextLink>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
      {seiten > 1 ? (
        <nav aria-label={t('seiten', { seite: filter.seite, seiten })} className="flex items-center gap-3">
          {filter.seite > 1 ? (
            <Button asChild variant="outline">
              <NextLink href={`/verwaltung/eingaenge${abfrage({ seite: filter.seite - 1 })}`}>{t('zurueck')}</NextLink>
            </Button>
          ) : null}
          <span>{t('seiten', { seite: filter.seite, seiten })}</span>
          {filter.seite < seiten ? (
            <Button asChild variant="outline">
              <NextLink href={`/verwaltung/eingaenge${abfrage({ seite: filter.seite + 1 })}`}>{t('weiter')}</NextLink>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
