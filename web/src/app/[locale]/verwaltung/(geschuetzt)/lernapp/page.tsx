import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Klappe } from '@/components/verwaltung/Klappe';
import { LernappNavigation, StatusPille } from '@/components/verwaltung/lernapp/Navigation';
import { ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { STATUS } from '@/lib/lernapp/freigabe';
import { SPRACHEN } from '@/lib/lernapp/kurse';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { darf } from '@/lib/rechte/pruefe';
import { ladeLernappUebersicht } from '@/server/queries/lernapp/verwaltung';

/**
 * Verwaltung › Lern-App › Übersicht (L3-06, PLAN §7.1): offene Befunde, Prüfquoten je Prüfsprache, Stand je Kurs, Stufe und
 * Einheit (Einheiten und Einträge nach Status) sowie letzter Import und Paketstand. Nur lesen (`lernapp.lesen`).
 */
export default async function LernappUebersicht() {
  const a = await verlangeLernappSeite('lernapp.lesen');
  const [t, tl, tg, u] = await Promise.all([
    getTranslations('verwaltung.lernapp.uebersicht'),
    getTranslations('verwaltung.lernapp'),
    getTranslations('verwaltung.shell'),
    ladeLernappUebersicht(),
  ]);
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const darfBearbeiten = darf(a.rollen, 'lernapp.bearbeiten');
  const befunde = [
    {
      schluessel: 'meldungen',
      wert: u.befunde.meldungen,
      titel: t('meldungen'),
      text: null,
      href: darfBearbeiten ? '/verwaltung/lernapp/meldungen' : null,
    },
    { schluessel: 'konflikte', wert: u.befunde.konflikte, titel: t('konflikte'), text: t('konflikteText'), href: null },
    { schluessel: 'kritisch', wert: u.befunde.kritisch, titel: t('kritisch'), text: t('kritischText'), href: null },
    {
      schluessel: 'nachbessern',
      wert: u.befunde.nachbessern,
      titel: t('nachbessern'),
      text: null,
      href: darf(a.rollen, 'lernapp.sprache.pruefen') ? '/verwaltung/lernapp/sprachpruefung' : null,
    },
  ];

  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={tl('titel')} einleitung={tl('einleitung')} />
      <LernappNavigation aktiv="uebersicht" rollen={a.rollen} />

      <section aria-labelledby="lernapp-befunde" className="flex flex-col gap-3">
        <h2 id="lernapp-befunde" className="text-30">
          {t('befunde')}
        </h2>
        <p className="text-tinte-2">{t('befundeText')}</p>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {befunde.map((b) => (
            <li key={b.schluessel} className="flex flex-col gap-1 rounded-lg border border-linie bg-weiss p-4">
              <span className="text-30 font-bold tabular-nums">{b.wert}</span>
              <span className="font-bold">{b.titel}</span>
              {b.text ? <span className="text-16 text-tinte-2">{b.text}</span> : null}
              {b.href && b.wert > 0 ? (
                <NextLink
                  href={b.href}
                  className="inline-flex min-h-11 items-center gap-1 font-bold text-gruen-800 underline underline-offset-4"
                >
                  {tl(`navigation.${b.schluessel === 'meldungen' ? 'meldungen' : 'sprachpruefung'}`)}
                  <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                </NextLink>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="lernapp-quoten" className="flex flex-col gap-3">
        <h2 id="lernapp-quoten" className="text-30">
          {t('quoten')}
        </h2>
        <p className="text-tinte-2">{t('quotenText')}</p>
        <TabellenRahmen beschriftung={t('quoten')}>
          <table className="w-full text-start">
            <thead className="bg-sand text-16">
              <tr>
                {(['sprache', 'stichproben', 'offen', 'bestanden', 'nachbessern', 'geprueft', 'pruefende'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-start">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPRACHEN.map((s) => {
                const q = u.quoten.jeSprache[s]!;
                return (
                  <tr key={s} className="border-t border-linie">
                    <th scope="row" className="px-4 py-3 text-start">
                      {tl(`sprache.${s}`)}
                    </th>
                    <td className="px-4 py-3 tabular-nums">{q.stichproben}</td>
                    <td className="px-4 py-3 tabular-nums">{q.offen}</td>
                    <td className="px-4 py-3 tabular-nums">{q.bestanden}</td>
                    <td className="px-4 py-3 tabular-nums">{q.nachbessern}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {t('geprueftWert', { geprueft: q.geprueft, gezogen: q.gezogen, quote: q.quote })}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{u.pruefende.jeSprache[s] ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TabellenRahmen>
        <p className="text-16 text-tinte-2">{t('pruefendeReligioes', { anzahl: u.pruefende.religioes })}</p>
      </section>

      <section aria-labelledby="lernapp-stand" className="flex flex-col gap-3">
        <h2 id="lernapp-stand" className="text-30">
          {t('stand')}
        </h2>
        <p className="text-tinte-2">{t('standText')}</p>
        {u.baum.length === 0 ? (
          <ListenLeer text={t('leer')} />
        ) : (
          <ul className="flex flex-col gap-4">
            {u.baum.map((k) => (
              <li key={k.kurs} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-text text-24 font-bold tracking-normal">{tl(`kurs.${k.kurs}` as never)}</h3>
                  <NextLink
                    href={`/verwaltung/lernapp/kurse/${k.kurs}`}
                    className="inline-flex min-h-11 items-center gap-1 font-bold text-gruen-800 underline underline-offset-4"
                  >
                    {t('zumKurs', { kurs: tl(`kurs.${k.kurs}` as never) })}
                    <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                  </NextLink>
                </div>
                <p className="text-16">
                  {t('einheiten', { anzahl: k.einheiten.gesamt })}: {STATUS.map((s) => `${k.einheiten[s]} ${tl(`status.${s}`)}`).join(', ')}
                  {' · '}
                  {t('eintraege', { anzahl: k.eintraege.gesamt })}
                </p>
                {k.stufen.map((s) => (
                  <Klappe
                    key={s.stufe}
                    titel={t('stufe', { stufe: tl(`stufe.${s.stufe}` as never) })}
                    stand={`${t('einheiten', { anzahl: s.einheiten.gesamt })}, ${s.einheiten.veroeffentlicht} ${tl('status.veroeffentlicht')}`}
                    className="border-t border-linie"
                  >
                    <ul aria-label={t('einheitenListe', { stufe: tl(`stufe.${s.stufe}` as never) })} className="flex flex-col gap-2 pb-3">
                      {s.liste.map((e) => (
                        <li key={e.schluessel} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-16">{e.schluessel}</span>
                          <StatusPille status={e.status} />
                          <span className="text-16 text-tinte-2">
                            {t('eintraege', { anzahl: e.eintraege.gesamt })}
                            {e.eintraege.gesamt > 0
                              ? ` (${STATUS.filter((x) => e.eintraege[x] > 0)
                                  .map((x) => `${e.eintraege[x]} ${tl(`status.${x}`)}`)
                                  .join(', ')})`
                              : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Klappe>
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lernapp-import" className="flex flex-col gap-3">
        <h2 id="lernapp-import" className="text-30">
          {t('import')}
        </h2>
        <p className="text-tinte-2">{t('importText')}</p>
        <ul className="flex flex-col gap-1">
          {u.importe.length === 0 ? <li>{t('keinImport')}</li> : null}
          {u.importe.map((i) => (
            <li key={i.quelle}>
              {t('importZeile', {
                quelle: t(`quelle.${i.quelle}`),
                am: i.am ? zeit(new Date(i.am)) : '–',
                dateien: i.dateien,
                konflikte: i.konflikte,
              })}
            </li>
          ))}
          {u.kurse.map((k) => (
            <li key={k.id}>
              {t('paketstand', { kurs: tl(`kurs.${k.id}` as never), version: k.version, am: zeit(k.aktualisiertAm) })}
              {k.aktiv ? null : ` ${t('inaktiv')}`}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
