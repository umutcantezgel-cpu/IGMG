import { getTranslations } from 'next-intl/server';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { istKritisch } from '@/lib/lernapp/freigabe';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { istKurs, richtung } from '@/lib/lernapp/kurse';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { cn } from '@/lib/utils';
import { type Befund, ladeBefunde } from '@/server/queries/lernapp/korrekturen';

/**
 * Verwaltung › Lern-App › Befunde (L3-06b, ADR 0041 Nr. 4–6): Korrekturvorschläge, Änderungsvorschläge, Ablehnungen und
 * Kommentare der Prüfenden zum aktuellen Stand der Einträge, je Kurs und Einheit – ohne Namen der Prüfenden. Die Redaktion
 * arbeitet sie in die Inhaltsdateien ein (`pnpm lernapp:export-korrekturen`); ein neuer Stand (neuer Hash) erledigt den
 * Befund. Nur lesen, Recht `lernapp.bearbeiten`.
 */
export default async function Befunde({ searchParams }: PageProps<'/[locale]/verwaltung/lernapp/befunde'>) {
  const a = await verlangeLernappSeite('lernapp.bearbeiten');
  const roh = (await searchParams).kurs;
  const kurs = typeof roh === 'string' && istKurs(roh) ? roh : null;
  const [t, tl, tg, alle] = await Promise.all([
    getTranslations('verwaltung.lernapp.befunde'),
    getTranslations('verwaltung.lernapp'),
    getTranslations('verwaltung.shell'),
    ladeBefunde(),
  ]);
  const liste = kurs ? alle.filter((b) => b.kurs === kurs) : alle;
  const kurse = [...new Set(alle.map((b) => b.kurs))].filter(istKurs);
  const jeEinheit = new Map<string, Befund[]>();
  for (const b of liste) jeEinheit.set(b.einheit, [...(jeEinheit.get(b.einheit) ?? []), b]);
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const textAttr = (b: Befund) =>
    b.sprache
      ? { lang: b.sprache, dir: richtung(b.sprache), className: cn(b.sprache === 'ar' && 'font-arabic text-arabisch-3') }
      : { dir: 'auto' as const };

  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} />
      <LernappNavigation aktiv="befunde" rollen={a.rollen} />
      <Ansichten
        label={t('kurse')}
        eintraege={[
          { schluessel: 'alle', label: t('alle', { anzahl: alle.length }), href: '/verwaltung/lernapp/befunde', aktiv: !kurs },
          ...kurse.map((k) => ({
            schluessel: k,
            label: t('kursAnzahl', { kurs: tl(`kurs.${k}`), anzahl: alle.filter((b) => b.kurs === k).length }),
            href: `/verwaltung/lernapp/befunde?kurs=${k}`,
            aktiv: kurs === k,
          })),
        ]}
      />
      <p className="max-w-text text-16 text-tinte-2">{t('export')}</p>
      {liste.length === 0 ? (
        <ListenLeer text={t('leer')} />
      ) : (
        [...jeEinheit].map(([einheit, befunde]) => (
          <section key={einheit} aria-labelledby={`einheit-${einheit}`} className="flex flex-col gap-3">
            <h2 id={`einheit-${einheit}`} className="text-24">
              {t('einheit', { einheit })}
            </h2>
            <ul className="flex flex-col gap-3">
              {befunde.map((b) => (
                <li key={b.id} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-mono text-18 font-bold">{b.schluessel}</h3>
                    <span className={cn(PILLE, 'bg-sand text-tinte-2')}>{t(`art.${b.art}`)}</span>
                    <span
                      className={cn(
                        PILLE,
                        b.urteil === 'abgelehnt' || istKritisch(b.kategorie)
                          ? 'bg-fehler-toenung text-fehler'
                          : 'bg-info-toenung text-info',
                      )}
                    >
                      {t(`urteil.${b.urteil}`)}
                      {b.kategorie ? ` · ${t(`kategorie.${b.kategorie}`)}` : ''}
                    </span>
                    {b.inhaltTyp === 'audio' ? <span className="text-16 text-tinte-2">{t('audio')}</span> : null}
                  </div>
                  <dl className="grid gap-x-3 gap-y-1 text-16 sm:grid-cols-4">
                    {b.text ? (
                      <>
                        <dt className="font-bold">{t('aktuell')}</dt>
                        <dd {...textAttr(b)} className={cn('sm:col-span-3', textAttr(b).className)}>
                          {b.text}
                        </dd>
                      </>
                    ) : null}
                    {b.korrektur ? (
                      <>
                        <dt className="font-bold">{t('korrektur')}</dt>
                        <dd {...textAttr(b)} className={cn('sm:col-span-3', textAttr(b).className)}>
                          {b.korrektur}
                        </dd>
                      </>
                    ) : null}
                    {b.kommentar ? (
                      <>
                        <dt className="font-bold">{t('kommentar')}</dt>
                        <dd dir="auto" className="sm:col-span-3">
                          {b.kommentar}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                  <p className="text-16 text-tinte-2">{t('am', { am: zeit(b.am) })}</p>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
