import { Eye, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeRezitationsListe, type RezitationZeile } from '@/server/queries/verwaltung/rezitationen';

const PILLE = 'inline-flex rounded-pill px-3 text-16 leading-normal font-bold';

/**
 * Verwaltung › Rezitationen (O-Q02, H-Q05, ADR 0029): Liste mit Vollständigkeit (Suren mit Audio, mit Verszeiten, mit
 * geprüften Wortzeiten), Status und Vereinbarung. Anlegen, Vereinbarung und Freigabe auf der Detailseite.
 */
export default async function RezitationenSeite() {
  await verlangeSeitenRecht('rezitation.bearbeiten');
  const [t, tg, zeilen] = await Promise.all([
    getTranslations('verwaltung.rezitationen'),
    getTranslations('verwaltung.shell'),
    ladeRezitationsListe(),
  ]);
  const name = (z: RezitationZeile) => z.name.de;
  const status = (z: RezitationZeile) => (
    <span className="flex flex-wrap gap-1">
      <span className={cn(PILLE, z.aktiv ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
        {z.aktiv ? t('status.aktiv') : t('status.inaktiv')}
      </span>
      {z.standard ? <span className={cn(PILLE, 'bg-info-toenung text-info')}>{t('status.standard')}</span> : null}
    </span>
  );
  const vereinbarung = (z: RezitationZeile) =>
    z.vereinbarung && !z.vereinbarung.imPapierkorb ? (
      <span className="text-gruen-800">{t('liste.vereinbarungDa')}</span>
    ) : (
      <span className="font-bold text-fehler">{t('liste.vereinbarungFehlt')}</span>
    );
  const zahl = (n: number) => t('liste.zaehler', { anzahl: n });
  const oeffnen = (z: RezitationZeile) => (
    <Button asChild variant="outline" size="icon">
      <NextLink href={`/verwaltung/rezitationen/${z.id}`}>
        <Eye aria-hidden />
        <span className="sr-only">{t('liste.bearbeiten', { name: name(z) })}</span>
      </NextLink>
    </Button>
  );
  const neu = (
    <Button asChild>
      <NextLink href="/verwaltung/rezitationen/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );

  return (
    <div className="flex flex-col gap-8">
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} aktion={neu} />
      <Meldung art="info">{t('reihenfolge')}</Meldung>
      {zeilen.length === 0 ? (
        <ListenLeer text={t('liste.leer')} aktion={neu} />
      ) : (
        <TabellenRahmen
          beschriftung={t('liste.beschriftung')}
          mobil={
            <ul className="flex flex-col gap-3">
              {zeilen.map((z) => (
                <ListenKarte
                  key={z.id}
                  titel={name(z)}
                  angaben={[
                    { label: t('spalte.art'), wert: t(`art.${z.art}`) },
                    { label: t('spalte.status'), wert: status(z) },
                    { label: t('spalte.vereinbarung'), wert: vereinbarung(z) },
                    { label: t('spalte.audio'), wert: zahl(z.mitAudio), zahl: true },
                    { label: t('spalte.verse'), wert: zahl(z.mitVerszeiten), zahl: true },
                    { label: t('spalte.woerter'), wert: zahl(z.mitWortzeiten), zahl: true },
                  ]}
                  aktionen={oeffnen(z)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full text-start">
            <thead className="bg-sand text-16">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('spalte.name')}
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('spalte.art')}
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('spalte.status')}
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('spalte.vereinbarung')}
                </th>
                <th scope="col" className="px-4 py-3 text-end">
                  {t('spalte.audio')}
                </th>
                <th scope="col" className="px-4 py-3 text-end">
                  {t('spalte.verse')}
                </th>
                <th scope="col" className="px-4 py-3 text-end">
                  {t('spalte.woerter')}
                </th>
                <th scope="col" className="px-4 py-3 text-end">
                  <span className="sr-only">{t('spalte.aktion')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map((z) => (
                <tr key={z.id} className="border-t border-linie">
                  <th scope="row" className="px-4 py-3 text-start">
                    <NextLink href={`/verwaltung/rezitationen/${z.id}`} className="font-bold text-gruen-800 underline underline-offset-4">
                      {name(z)}
                    </NextLink>
                    <span className="block text-16 font-normal text-tinte-2">{z.rezitator}</span>
                  </th>
                  <td className="px-4 py-3">{t(`art.${z.art}`)}</td>
                  <td className="px-4 py-3">{status(z)}</td>
                  <td className="px-4 py-3">{vereinbarung(z)}</td>
                  <td className="px-4 py-3 text-end tabular-nums">{zahl(z.mitAudio)}</td>
                  <td className="px-4 py-3 text-end tabular-nums">{zahl(z.mitVerszeiten)}</td>
                  <td className="px-4 py-3 text-end tabular-nums">{zahl(z.mitWortzeiten)}</td>
                  <td className="px-4 py-3 text-end">{oeffnen(z)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </div>
  );
}
