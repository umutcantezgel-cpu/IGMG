import { Pencil, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { pille, SICHTBAR_FARBE, STATUS_FARBE } from '@/components/verwaltung/hatim/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeHatimVerwaltungsListe, type HatimVerwaltung } from '@/server/queries/verwaltung/hatim';

const tag = (d: string) => datumOhneWochentag(new Date(`${d}T12:00:00Z`), 'de');

/** Verwaltung › Hatim (AUFTRAG 3.10): alle Hatims mit Sichtbarkeit, Stand und Fortschritt (nur Zahlen). */
export default async function HatimVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/hatim'>) {
  await verlangeSeitenRecht('hatim.bearbeiten');
  const [t, tg, liste, suche] = await Promise.all([
    getTranslations('verwaltung.hatim'),
    getTranslations('verwaltung.shell'),
    ladeHatimVerwaltungsListe(),
    searchParams,
  ]);
  const titel = (h: HatimVerwaltung) => h.titel.de;
  const zeitraum = (h: HatimVerwaltung) =>
    h.ziel ? t('zeitraumBis', { beginn: tag(h.beginn), ziel: tag(h.ziel) }) : t('zeitraum', { beginn: tag(h.beginn) });
  const fortschritt = (h: HatimVerwaltung) =>
    t('fortschritt', { gelesen: h.gelesen, vergeben: h.vergeben - h.gelesen, frei: 30 - h.vergeben });
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/hatim/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );
  const bearbeiten = (h: HatimVerwaltung) => (
    <Button asChild variant="outline" size="icon">
      <NextLink href={`/verwaltung/hatim/${h.id}`}>
        <Pencil aria-hidden />
        <span className="sr-only">{t('aktionBearbeiten', { titel: titel(h) })}</span>
      </NextLink>
    </Button>
  );
  const pillen = (h: HatimVerwaltung) => (
    <span className="inline-flex flex-wrap gap-2">
      <span className={cn(pille, SICHTBAR_FARBE[h.oeffentlich])}>{t(`sichtbarkeit.${h.oeffentlich}`)}</span>
      <span className={cn(pille, STATUS_FARBE[h.status])}>{t(`status.${h.status}`)}</span>
    </span>
  );
  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={liste.length ? anlegen : null}
      />
      {suche.geloescht ? <Meldung art="erfolg">{t('geloescht')}</Meldung> : null}
      {liste.length === 0 ? (
        <ListenLeer text={t('leerText')} aktion={anlegen} />
      ) : (
        <TabellenRahmen
          beschriftung={t('tabelle')}
          mobil={
            <ul className="flex flex-col gap-3">
              {liste.map((h) => (
                <ListenKarte
                  key={h.id}
                  titel={titel(h)}
                  angaben={[
                    { label: t('spalte.zeitraum'), wert: zeitraum(h) },
                    { label: t('spalte.status'), wert: pillen(h) },
                    { label: t('spalte.fortschritt'), wert: fortschritt(h), zahl: true },
                  ]}
                  aktionen={bearbeiten(h)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full min-w-220 border-collapse text-left">
            <caption className="sr-only">{t('tabelle')}</caption>
            <thead className="bg-sand">
              <tr>
                {(['titel', 'zeitraum', 'status', 'fortschritt', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((h) => (
                <tr key={h.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold">
                    {titel(h)}
                  </th>
                  <td className="px-4 py-3">{zeitraum(h)}</td>
                  <td className="px-4 py-3">{pillen(h)}</td>
                  <td className="px-4 py-3 tabular-nums">{fortschritt(h)}</td>
                  <td className="px-4 py-3">{bearbeiten(h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
