import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { ordneWarteschlange } from '@/lib/lernapp/freigabe';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { cn } from '@/lib/utils';
import { ladeReligioeseBausteine, type ReligioeserEintrag } from '@/server/queries/lernapp/religioes';

const STAND_FARBE = ['bg-sand text-tinte-2', 'bg-info-toenung text-info', 'bg-gruen-50 text-gruen-800'] as const;

/**
 * Verwaltung › Lern-App › Religiöse Prüfung (L6-03, ADR 0040 Nr. 5, PLAN §6.7 Nr. 6, §7.1): Warteschlange der Bausteine mit
 * Zwei-Prüfer-Freigabe – „unsicher“ (Belegprüfung) zuerst, dann was die Person noch prüfen kann (1/2 vor 0/2). Recht
 * `lernapp.religioes.pruefen` (nie per Administration). Die Ansicht zeigt den Stand und das eigene Urteil, nicht, wer sonst
 * geprüft hat. Ansicht „Freigegeben“: alle Bausteine mit 2/2.
 */
export default async function ReligioesePruefung({ searchParams }: PageProps<'/[locale]/verwaltung/lernapp/religioes'>) {
  const a = await verlangeLernappSeite('lernapp.religioes.pruefen');
  const geprueftAnsicht = (await searchParams).ansicht === 'geprueft';
  const [t, tg, alle] = await Promise.all([
    getTranslations('verwaltung.lernapp.religioes'),
    getTranslations('verwaltung.shell'),
    ladeReligioeseBausteine(a.benutzerId),
  ]);
  const offen = ordneWarteschlange(alle.filter((b) => !b.lage.geprueft));
  const geprueft = alle.filter((b) => b.lage.geprueft);
  const liste = geprueftAnsicht ? geprueft : offen;

  const hinweise = (b: ReligioeserEintrag) =>
    [
      b.unsicher && t('hinweise.unsicher'),
      b.lage.kiHerkunft && t('hinweise.kiHerkunft'),
      b.lage.gesperrt && t('hinweise.einwand'),
      b.verfasser && t('hinweise.verfasser'),
      b.eigenes === 'ok' && t('hinweise.eigenesOk'),
      b.eigenes && b.eigenes !== 'ok' && t('hinweise.eigenerEinwand'),
    ].filter((x): x is string => Boolean(x));
  const name = (b: ReligioeserEintrag) => `${t(`typ.${b.typ}`)} ${b.schluessel}`;
  const stand = (b: ReligioeserEintrag) => (
    <span className={cn(PILLE, STAND_FARBE[b.stand] ?? STAND_FARBE[0])} aria-label={t('standName', { stand: b.stand })}>
      {t('stand', { stand: b.stand })}
    </span>
  );
  const aktion = (b: ReligioeserEintrag) => (
    <NextLink
      href={`/verwaltung/lernapp/religioes/${b.typ}-${b.id}`}
      aria-label={t('pruefenName', { baustein: name(b) })}
      className="inline-flex min-h-11 items-center gap-1 font-bold text-gruen-800 underline underline-offset-4"
    >
      {b.erledigt || b.lage.geprueft ? t('ansehen') : t('pruefen')}
      <ArrowRight aria-hidden className="size-4" />
    </NextLink>
  );
  const kurz = (b: ReligioeserEintrag) => (b.titel.length > 140 ? `${b.titel.slice(0, 139)}…` : b.titel);

  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} />
      <LernappNavigation aktiv="religioes" rollen={a.rollen} />
      <Meldung art="info">{t('regeln')}</Meldung>
      <Ansichten
        label={t('ansichten')}
        eintraege={[
          {
            schluessel: 'offen',
            label: t('offen', { anzahl: offen.length }),
            href: '/verwaltung/lernapp/religioes',
            aktiv: !geprueftAnsicht,
          },
          {
            schluessel: 'geprueft',
            label: t('geprueft', { anzahl: geprueft.length }),
            href: '/verwaltung/lernapp/religioes?ansicht=geprueft',
            aktiv: geprueftAnsicht,
          },
        ]}
      />
      {liste.length === 0 ? (
        <ListenLeer text={geprueftAnsicht ? t('leerGeprueft') : t('leer')} />
      ) : (
        <TabellenRahmen
          beschriftung={t('beschriftung')}
          mobil={
            <ul className="flex flex-col gap-3">
              {liste.map((b) => (
                <li key={`${b.typ}-${b.id}`} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4">
                  <span className="font-bold">{t(`typ.${b.typ}`)}</span>
                  <span className="font-mono text-16 break-all">{b.schluessel}</span>
                  <span lang={b.titelLang}>{kurz(b)}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    {stand(b)}
                    {hinweise(b).map((h) => (
                      <span key={h} className="text-16 text-tinte-2">
                        {h}
                      </span>
                    ))}
                  </span>
                  {aktion(b)}
                </li>
              ))}
            </ul>
          }
        >
          <table className="w-full text-start">
            <thead className="bg-sand text-16">
              <tr>
                {(['baustein', 'inhalt', 'stand', 'hinweis', 'aktion'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-start">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((b) => (
                <tr key={`${b.typ}-${b.id}`} className="border-t border-linie align-top">
                  <th scope="row" className="px-4 py-3 text-start font-normal">
                    <span className="block font-bold">{t(`typ.${b.typ}`)}</span>
                    <span className="block font-mono text-16 break-all text-tinte-2">{b.schluessel}</span>
                  </th>
                  <td className="max-w-text px-4 py-3" lang={b.titelLang}>
                    {kurz(b)}
                  </td>
                  <td className="px-4 py-3">{stand(b)}</td>
                  <td className="px-4 py-3 text-16">
                    <ul className="flex flex-col gap-1">
                      {hinweise(b).map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">{aktion(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
