import { Eye, ScrollText, ShieldAlert, ShieldCheck } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { GrundFormular } from '@/components/verwaltung/kinderschutz/GrundFormular';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumKurz, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { lokaleTeile } from '@/lib/termine';
import { cn } from '@/lib/utils';
import { notfallpauseSetzen } from '@/server/actions/kinderschutz';
import { ladeKinderschutzLage, ladeMeldungen, type MeldungZeile } from '@/server/queries/verwaltung/kinderschutz';

const PILLE = 'inline-flex rounded-pill px-3 text-16 leading-normal font-bold';
const STATUS_TON: Record<MeldungZeile['status'], string> = {
  offen: 'bg-fehler-toenung text-fehler',
  in_bearbeitung: 'bg-warnung-toenung text-tinte',
  erledigt: 'bg-gruen-50 text-gruen-800',
};
const FILTER = ['offen_alle', 'alle', 'erledigt'] as const;

/**
 * Verwaltung › Meldungen & Kinderschutz (S-08, S-10, S-11, S-17): Lage mit Notfall-Pause und Prüfung der Hash-Kette,
 * Liste der Meldungen ohne Inhalt. Nur Rolle `kinderschutz` (nie über „Administration darf alles“, ADR 0026).
 */
export default async function KinderschutzSeite({ searchParams }: PageProps<'/[locale]/verwaltung/kinderschutz'>) {
  const a = await verlangeSeitenRecht('meldung.chat.lesen');
  const roh = (await searchParams).ansicht;
  const ansicht = FILTER.find((f) => f === roh) ?? 'offen_alle';
  const [t, lage, zeilen] = await Promise.all([
    getTranslations('verwaltung.kinderschutz'),
    ladeKinderschutzLage(),
    ladeMeldungen({ status: ansicht === 'alle' ? undefined : ansicht }),
  ]);
  const darfPause = darf(a.rollen, 'chat.notfallpause');
  const eingang = (z: MeldungZeile) => `${datumKurz(z.erstelltAm, 'de')} ${lokaleTeile(z.erstelltAm).jahr}, ${uhrzeit(z.erstelltAm, 'de')}`;
  const kanal = (z: MeldungZeile) =>
    z.kanalArt ? `${t(`kanalArt.${z.kanalArt}`)}${z.gruppe ? ` · ${z.gruppe}` : ''}` : t('kanalArt.ohne');
  const ansehen = (z: MeldungZeile) => (
    <Button asChild variant="outline" size="icon">
      <NextLink href={`/verwaltung/kinderschutz/${z.id}`}>
        <Eye aria-hidden />
        <span className="sr-only">{t('liste.ansehen', { datum: eingang(z) })}</span>
      </NextLink>
    </Button>
  );
  const pille = (z: MeldungZeile) => <span className={cn(PILLE, STATUS_TON[z.status])}>{t(`status.${z.status}`)}</span>;

  return (
    <div className="flex flex-col gap-8">
      <VerwaltungsKopf
        kennung={t('kennung')}
        titel={t('titel')}
        einleitung={t('einleitung')}
        aktion={
          <Button asChild variant="outline">
            <NextLink href="/verwaltung/kinderschutz/protokoll">
              <ScrollText aria-hidden />
              {t('protokoll.link')}
            </NextLink>
          </Button>
        }
      />

      <section aria-labelledby="ks-lage" className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 shadow-s1">
          <h2 id="ks-lage" className="text-24 font-bold">
            {t('lage.titel')}
          </h2>
          <p className="text-20 font-bold">{t('lage.offen', { anzahl: lage.offen })}</p>
          <p className="text-tinte-2">{t('lage.inBearbeitung', { anzahl: lage.inBearbeitung })}</p>
          <p className={cn('flex items-start gap-2', lage.ketteIntakt ? 'text-gruen-800' : 'font-bold text-fehler')}>
            {lage.ketteIntakt ? (
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
            ) : (
              <ShieldAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            )}
            {lage.ketteIntakt ? t('lage.ketteIntakt', { anzahl: lage.eintraege }) : t('lage.ketteGebrochen')}
          </p>
        </div>
        <div
          className={cn(
            'flex flex-col gap-3 rounded-lg border bg-weiss p-6 shadow-s1',
            lage.notfallpause ? 'border-2 border-fehler' : 'border-linie',
          )}
        >
          <h2 className="text-24 font-bold">{t('notfall.titel')}</h2>
          <p className={lage.notfallpause ? 'font-bold text-fehler' : 'text-tinte-2'}>
            {lage.notfallpause ? t('notfall.an') : t('notfall.aus')}
          </p>
          {darfPause ? (
            <GrundFormular
              aktion={notfallpauseSetzen}
              felder={{ an: lage.notfallpause ? '0' : '1' }}
              knopf={lage.notfallpause ? t('notfall.aufheben') : t('notfall.einschalten')}
              gefahr={!lage.notfallpause}
            />
          ) : (
            <p className="text-16 text-tinte-2">{t('notfall.keinRecht')}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="ks-liste" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="ks-liste" className="text-24 font-bold">
            {t('liste.titel')}
          </h2>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 font-bold">
              {t('liste.filter')}
              <select
                name="ansicht"
                defaultValue={ansicht}
                className="min-h-12 rounded-md border border-rand bg-weiss px-3.5 text-18 font-normal text-tinte"
              >
                <option value="offen_alle">{t('liste.filterOffen')}</option>
                <option value="alle">{t('liste.filterAlle')}</option>
                <option value="erledigt">{t('liste.filterErledigt')}</option>
              </select>
            </label>
            <Button type="submit" variant="outline">
              {t('liste.filterAnwenden')}
            </Button>
          </form>
        </div>
        {zeilen.length === 0 ? (
          <ListenLeer text={t('liste.leer')} />
        ) : (
          <TabellenRahmen
            beschriftung={t('liste.beschriftung')}
            mobil={
              <ul className="flex flex-col gap-3">
                {zeilen.map((z) => (
                  <ListenKarte
                    key={z.id}
                    titel={t(`grundArt.${z.grund}`)}
                    angaben={[
                      { label: t('spalte.eingang'), wert: eingang(z), zahl: true },
                      { label: t('spalte.kanal'), wert: kanal(z) },
                      { label: t('spalte.status'), wert: pille(z) },
                    ]}
                    aktionen={ansehen(z)}
                  />
                ))}
              </ul>
            }
          >
            <table className="w-full text-start">
              <thead className="bg-sand text-16">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('spalte.eingang')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('spalte.grund')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('spalte.kanal')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('spalte.status')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-end">
                    <span className="sr-only">{t('spalte.aktion')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map((z) => (
                  <tr key={z.id} className="border-t border-linie">
                    <td className="px-4 py-3 tabular-nums">{eingang(z)}</td>
                    <td className="px-4 py-3 font-bold">{t(`grundArt.${z.grund}`)}</td>
                    <td className="px-4 py-3">{kanal(z)}</td>
                    <td className="px-4 py-3">{pille(z)}</td>
                    <td className="px-4 py-3 text-end">{ansehen(z)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </section>
    </div>
  );
}
