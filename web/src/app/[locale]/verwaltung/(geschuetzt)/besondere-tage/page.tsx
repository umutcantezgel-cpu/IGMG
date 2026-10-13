import { CalendarPlus, Check, Pencil, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { pille } from '@/components/verwaltung/hatim/stil';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { hijriText } from '@/lib/gebetszeiten/hijri';
import { datumLang } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { heuteBerlin } from '@/lib/zeit/heute';
import { bestaetigeBesonderenTag, uebernehmeVorschlaege } from '@/server/actions/besondere-tage';
import { ladeBesondereTageJahr, type BesondererTagZeile } from '@/server/queries/verwaltung/besondere-tage';

const FREIGABE_FARBE = {
  entwurf: 'bg-sand text-tinte-2',
  zur_pruefung: 'bg-warnung-toenung text-warnung',
  geprueft: 'bg-gruen-50 text-gruen-800',
} as const;

const datum = (d: string) => datumLang(new Date(`${d}T12:00:00Z`), 'de');

/**
 * Verwaltung › Besondere Tage (AUFTRAG 3.10, ADR 0030): Einträge je Jahr mit Freigabe, berechnete Vorschläge zum
 * Übernehmen (idempotent), Bestätigen nur für die religiöse Prüfung.
 */
export default async function BesondereTageVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/besondere-tage'>) {
  const a = await verlangeSeitenRecht('kalender.bearbeiten');
  const [t, tg, heute, suche] = await Promise.all([
    getTranslations('verwaltung.besondereTage'),
    getTranslations('verwaltung.shell'),
    heuteBerlin(),
    searchParams,
  ]);
  const gewuenscht = Number(suche.jahr);
  const jahr = Number.isInteger(gewuenscht) && gewuenscht >= 2000 && gewuenscht <= 2100 ? gewuenscht : heute.jahr;
  const { eintraege, offen } = await ladeBesondereTageJahr(jahr);
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const tk = await getTranslations({ locale: 'de', namespace: 'kalender' });

  const aktionen = (z: BesondererTagZeile) => (
    <>
      <Button asChild variant="outline" size="icon">
        <NextLink href={`/verwaltung/besondere-tage/${z.id}`}>
          <Pencil aria-hidden />
          <span className="sr-only">{t('aktionBearbeiten', { titel: z.titel.de })}</span>
        </NextLink>
      </Button>
      {darfFreigeben && z.freigabe !== 'geprueft' ? (
        <form action={bestaetigeBesonderenTag}>
          <input type="hidden" name="id" value={z.id} />
          <Button type="submit" variant="outline">
            <Check aria-hidden />
            {t('bestaetigenKurz')}
            <span className="sr-only">: {z.titel.de}</span>
          </Button>
        </form>
      ) : null}
    </>
  );
  const freigabe = (z: BesondererTagZeile) => (
    <span className="flex flex-col items-start gap-1">
      <span className={cn(pille, FREIGABE_FARBE[z.freigabe])}>{t(`freigabe.${z.freigabe}`)}</span>
      <span className="text-16 text-tinte-2">{t(`quelle.${z.quelle}`)}</span>
    </span>
  );
  const datumZelle = (z: BesondererTagZeile) => (
    <>
      <span className="block">{datum(z.datum)}</span>
      <span className="block text-16 text-tinte-2">{hijriText(z.datum, 'de-DE')}</span>
    </>
  );

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={
          <Button asChild variant="outline">
            <NextLink href="/verwaltung/besondere-tage/neu">
              <Plus aria-hidden />
              {t('neu')}
            </NextLink>
          </Button>
        }
      />
      <nav aria-label={t('jahre')}>
        <ul className="flex flex-wrap gap-2">
          {[heute.jahr - 1, heute.jahr, heute.jahr + 1, heute.jahr + 2].map((j) => (
            <li key={j}>
              <NextLink
                href={`/verwaltung/besondere-tage?jahr=${j}`}
                aria-current={j === jahr ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-12 items-center rounded-pill border px-4 font-bold tabular-nums no-underline',
                  j === jahr
                    ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss'
                    : 'border-rand bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte',
                )}
              >
                {t('jahr', { jahr: j })}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="vorschlaege" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <h2 id="vorschlaege" className="font-display text-24 font-semibold">
          {t('vorschlaege.titel', { jahr })}
        </h2>
        {offen.length ? (
          <>
            <p className="max-w-einleitung text-16 text-tinte-2">{t('vorschlaege.text')}</p>
            <ul className="grid gap-2 md:grid-cols-2">
              {offen.map((v) => (
                <li key={`${v.schluessel}-${v.datum}`} className="flex flex-col rounded-md bg-sand px-4 py-2">
                  <span className="font-bold">{tk(`tage.${v.schluessel}`)}</span>
                  <span className="text-16 text-tinte-2">
                    {datum(v.datum)} · {hijriText(v.datum, 'de-DE')}
                  </span>
                </li>
              ))}
            </ul>
            <form action={uebernehmeVorschlaege}>
              <input type="hidden" name="jahr" value={jahr} />
              <Button type="submit">
                <CalendarPlus aria-hidden />
                {t('vorschlaege.uebernehmen', { anzahl: offen.length })}
              </Button>
            </form>
          </>
        ) : (
          <p className="text-16 text-tinte-2">{t('vorschlaege.keine', { jahr })}</p>
        )}
      </section>

      {eintraege.length === 0 ? (
        <ListenLeer text={t('leer', { jahr })} />
      ) : (
        <TabellenRahmen
          beschriftung={t('tabelle', { jahr })}
          mobil={
            <ul className="flex flex-col gap-3">
              {eintraege.map((z) => (
                <ListenKarte
                  key={z.id}
                  titel={z.titel.de}
                  angaben={[
                    { label: t('spalte.datum'), wert: datumZelle(z) },
                    { label: t('spalte.art'), wert: t(`art.${z.art}`) },
                    { label: t('spalte.freigabe'), wert: freigabe(z) },
                  ]}
                  aktionen={aktionen(z)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full min-w-220 border-collapse text-left">
            <caption className="sr-only">{t('tabelle', { jahr })}</caption>
            <thead className="bg-sand">
              <tr>
                {(['titel', 'datum', 'art', 'freigabe', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eintraege.map((z) => (
                <tr key={z.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold">
                    {z.titel.de}
                  </th>
                  <td className="px-4 py-3">{datumZelle(z)}</td>
                  <td className="px-4 py-3">{t(`art.${z.art}`)}</td>
                  <td className="px-4 py-3">{freigabe(z)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">{aktionen(z)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
