import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumKurz, uhrzeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { lokaleTeile } from '@/lib/termine';
import { ladeProtokoll, type ProtokollZeile } from '@/server/queries/verwaltung/kinderschutz';

const GRENZE = 200;

/** Moderationsprotokoll (S-10): neueste Einträge, ohne Chat-Inhalte. Recht `moderationsprotokoll.lesen`. */
export default async function ProtokollSeite() {
  await verlangeSeitenRecht('moderationsprotokoll.lesen');
  const [t, zeilen] = await Promise.all([getTranslations('verwaltung.kinderschutz'), ladeProtokoll(GRENZE)]);
  const zeit = (d: Date) => `${datumKurz(d, 'de')} ${lokaleTeile(d).jahr}, ${uhrzeit(d, 'de')}`;
  const wo = (z: ProtokollZeile) => (z.kanalArt ? `${t(`kanalArt.${z.kanalArt}`)}${z.gruppe ? ` · ${z.gruppe}` : ''}` : '–');
  return (
    <div className="flex flex-col gap-8">
      <NextLink
        href="/verwaltung/kinderschutz"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('detail.zurueck')}
      </NextLink>
      <VerwaltungsKopf kennung={t('kennung')} titel={t('protokoll.titel')} einleitung={t('protokoll.einleitung')} />
      {zeilen.length === 0 ? (
        <ListenLeer text={t('protokoll.leer')} />
      ) : (
        <>
          <TabellenRahmen
            beschriftung={t('protokoll.beschriftung')}
            mobil={
              <ul className="flex flex-col gap-3">
                {zeilen.map((z) => (
                  <ListenKarte
                    key={z.id}
                    titel={t(`aktionArt.${z.aktion}`)}
                    angaben={[
                      { label: t('protokoll.zeit'), wert: zeit(z.zeitpunkt), zahl: true },
                      { label: t('protokoll.wer'), wert: z.akteur ?? t('protokoll.system') },
                      { label: t('protokoll.wo'), wert: wo(z) },
                      { label: t('protokoll.grund'), wert: <span className="wrap-anywhere">{z.grund}</span> },
                    ]}
                    aktionen={null}
                  />
                ))}
              </ul>
            }
          >
            <table className="w-full text-start">
              <thead className="bg-sand text-16">
                <tr>
                  {(['zeit', 'aktion', 'wer', 'wo', 'grund'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-start">
                      {t(`protokoll.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zeilen.map((z) => (
                  <tr key={z.id} className="border-t border-linie align-top">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">{zeit(z.zeitpunkt)}</td>
                    <td className="px-4 py-3 font-bold">{t(`aktionArt.${z.aktion}`)}</td>
                    <td className="px-4 py-3">{z.akteur ?? t('protokoll.system')}</td>
                    <td className="px-4 py-3">{wo(z)}</td>
                    <td className="px-4 py-3 wrap-anywhere">{z.grund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
          {zeilen.length >= GRENZE ? <p className="text-16 text-tinte-2">{t('protokoll.begrenzt', { anzahl: GRENZE })}</p> : null}
        </>
      )}
    </div>
  );
}
