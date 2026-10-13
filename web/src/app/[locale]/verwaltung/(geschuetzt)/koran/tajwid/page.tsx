import { PencilLine } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { KoranNavigation, StatusPille } from '@/components/verwaltung/koran/Teile';
import { QURAN_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { TAJWID_FAMILIEN } from '@/lib/quran/tajwid';
import { ladeTajwidVerwaltung, type TajwidVerwaltung } from '@/server/queries/verwaltung/koran';

/**
 * Verwaltung › Koran & Hadith › Tajwid (ADR 0030, MN-04): Regeln aus dem Import mit dem Stand ihrer Texte (Name,
 * Kurztext, Erklärung de/tr). Öffentlich erscheinen die Texte erst nach der Prüfung.
 */
export default async function TajwidSeite() {
  await verlangeKoranZugang(QURAN_RECHTE);
  const [t, regeln] = await Promise.all([getTranslations('verwaltung.koran'), ladeTajwidVerwaltung()]);
  const familie = (r: TajwidVerwaltung) =>
    (TAJWID_FAMILIEN as readonly string[]).includes(r.familie) ? t(`tajwid.familie.${r.familie}`) : r.familie;
  const texte = (r: TajwidVerwaltung) =>
    t('tajwid.texteVorhanden', {
      kurz: r.kurz?.de ? t('tajwid.ja') : t('tajwid.nein'),
      erklaerung: r.erklaerung?.de ? t('tajwid.ja') : t('tajwid.nein'),
    });
  const bearbeiten = (r: TajwidVerwaltung) => (
    <Button asChild variant="outline">
      <NextLink href={`/verwaltung/koran/tajwid/${r.schluessel}`} aria-label={t('tajwid.bearbeitenAria', { name: r.name.de })}>
        <PencilLine aria-hidden />
        {t('tajwid.bearbeiten')}
      </NextLink>
    </Button>
  );

  return (
    <div className="flex flex-col gap-8">
      <VerwaltungsKopf kennung={t('kennung')} titel={t('tajwid.titel')} einleitung={t('tajwid.einleitung')} />
      <KoranNavigation aktiv="tajwid" />
      {regeln.length === 0 ? (
        <ListenLeer text={t('tajwid.leer')} />
      ) : (
        <TabellenRahmen
          beschriftung={t('tajwid.tabelle')}
          mobil={
            <ul className="flex flex-col gap-3">
              {regeln.map((r) => (
                <ListenKarte
                  key={r.schluessel}
                  titel={r.name.de}
                  angaben={[
                    { label: t('tajwid.spalteFamilie'), wert: familie(r) },
                    { label: t('tajwid.spalteTexte'), wert: texte(r) },
                    { label: t('tajwid.spalteStatus'), wert: <StatusPille status={r.status} /> },
                  ]}
                  aktionen={bearbeiten(r)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full text-start">
            <thead className="bg-sand text-16">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('tajwid.spalteRegel')}
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('tajwid.spalteFamilie')}
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('tajwid.spalteTexte')}
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  {t('tajwid.spalteStatus')}
                </th>
                <th scope="col" className="px-4 py-3 text-end">
                  <span className="sr-only">{t('tajwid.spalteAktion')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {regeln.map((r) => (
                <tr key={r.schluessel} className="border-t border-linie">
                  <th scope="row" className="px-4 py-3 text-start">
                    <span className="flex flex-col">
                      <span className="font-bold">{r.name.de}</span>
                      {r.name.tr ? (
                        <span lang="tr" className="text-16 font-normal text-tinte-2">
                          {r.name.tr}
                        </span>
                      ) : null}
                    </span>
                  </th>
                  <td className="px-4 py-3">
                    <span className={`tj tj-${r.familie} font-bold`}>{familie(r)}</span>
                  </td>
                  <td className="px-4 py-3 text-16">{texte(r)}</td>
                  <td className="px-4 py-3">
                    <StatusPille status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-end">{bearbeiten(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </div>
  );
}
