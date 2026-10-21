import { ArrowLeft, Play } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Ansichten } from '@/components/verwaltung/seiten/Ansichten';
import { Meldung } from '@/components/verwaltung/Meldung';
import { StatusPille } from '@/components/verwaltung/lernapp/Navigation';
import { Vorschau } from '@/components/verwaltung/lernapp/Vorschau';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { istKurs, istRichtung, type KursId, RICHTUNGEN, type RichtungId, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { rohTexte } from '@/lib/lernapp/texte';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { ladeKursBaum, ladeVorschau } from '@/server/queries/lernapp/verwaltung';

/**
 * Verwaltung › Lern-App › Kurs (L3-06, PLAN §7.1): Baum Abschnitt (Stufe) → Einheit → Lektion mit Status und die Vorschau einer
 * Lektion im echten Spieler (`?richtung=<richtung>&lektion=<schlüssel>`), ohne Ereignisse und ohne Speicherung. Wissen und
 * Koran-Arabisch zeigen nur den Baum (Pakete erst mit zwei Freigaben, L6).
 */
export default async function LernappKurs({ params, searchParams }: PageProps<'/[locale]/verwaltung/lernapp/kurse/[kurs]'>) {
  await verlangeLernappSeite('lernapp.lesen');
  const { kurs: roh } = await params;
  if (!istKurs(roh)) notFound();
  const kurs: KursId = roh;
  const sp = await searchParams;
  const [t, tl, tg, baum] = await Promise.all([
    getTranslations('verwaltung.lernapp.kurse'),
    getTranslations('verwaltung.lernapp'),
    getTranslations('verwaltung.shell'),
    ladeKursBaum(kurs),
  ]);
  const richtungen = RICHTUNGEN.filter((r) => zerlegeRichtung(r).ziel === kurs);
  const gewuenscht = typeof sp.richtung === 'string' && istRichtung(sp.richtung) ? sp.richtung : null;
  const richtung: RichtungId | null = gewuenscht && richtungen.includes(gewuenscht) ? gewuenscht : (richtungen[0] ?? null);
  const lektion = typeof sp.lektion === 'string' && sp.lektion.startsWith(`${kurs}.`) && sp.lektion.length <= 120 ? sp.lektion : null;
  const vorschau = richtung && lektion ? await ladeVorschau(richtung, lektion) : null;
  const kursName = tl(`kurs.${kurs}`);
  const richtungsName = (r: RichtungId) =>
    tl('richtung', { ziel: tl(`sprache.${zerlegeRichtung(r).ziel}`), ausgang: tl(`sprache.${zerlegeRichtung(r).ausgang}`) });
  const vorschauHref = (l: string) =>
    `/verwaltung/lernapp/kurse/${kurs}?${new URLSearchParams({ richtung: richtung ?? '', lektion: l })}#vorschau`;

  return (
    <>
      <NextLink
        href="/verwaltung/lernapp"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel', { kurs: kursName })} einleitung={t('einleitung')} />
      {richtungen.length ? (
        <Ansichten
          label={t('richtung')}
          eintraege={richtungen.map((r) => ({
            schluessel: r,
            label: richtungsName(r),
            href: `/verwaltung/lernapp/kurse/${kurs}?richtung=${r}`,
            aktiv: r === richtung,
          }))}
        />
      ) : null}

      {lektion ? (
        <section
          id="vorschau"
          aria-labelledby="vorschau-titel"
          className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-6"
        >
          <h2 id="vorschau-titel" className="text-30">
            {t('vorschauVon', { lektion })}
          </h2>
          <Meldung art="info">{t('vorschauHinweis')}</Meldung>
          {vorschau ? (
            <Vorschau
              lektion={vorschau.lektion}
              texte={{
                spieler: rohTexte('de', 'spieler'),
                aufgaben: rohTexte('de', 'aufgaben'),
                tastatur: rohTexte('de', 'tastatur'),
                aufgaben2: rohTexte('de', 'aufgaben2'),
                sprechen: rohTexte('de', 'sprechen'),
                schreiben: rohTexte('de', 'schreiben'),
              }}
              laedt={t('vorschauLaedt')}
              ende={t('vorschauEnde')}
            />
          ) : (
            <Meldung art="fehler">{t('vorschauFehlt')}</Meldung>
          )}
        </section>
      ) : null}

      {baum.length === 0 ? (
        <ListenLeer text={t('leer')} />
      ) : (
        baum.map((a) => (
          <section key={a.stufe} aria-labelledby={`stufe-${a.stufe}`} className="flex flex-col gap-3">
            <h2 id={`stufe-${a.stufe}`} className="text-30">
              {tl('uebersicht.stufe', { stufe: tl(`stufe.${a.stufe}` as never) })}
            </h2>
            <ul className="flex flex-col gap-3">
              {a.einheiten.map((e) => (
                <li key={e.schluessel} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-text text-20 font-bold tracking-normal">
                      {e.thema.de || t('einheit', { schluessel: e.schluessel })}
                    </h3>
                    <StatusPille status={e.status} />
                    <span className="font-mono text-16 text-tinte-2">{e.schluessel}</span>
                    {e.nurFuerAusgang ? (
                      <span className="text-16 text-tinte-2">{t('nurFuer', { sprache: tl(`sprache.${e.nurFuerAusgang}` as never) })}</span>
                    ) : null}
                  </div>
                  <ul aria-label={t('lektionen')} className="flex flex-col gap-1">
                    {e.lektionen.map((l) => (
                      <li key={l.schluessel} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                          {t('lektion', { schluessel: l.schluessel, art: t(`lektionArt.${l.art}` as never), aufgaben: l.aufgaben })}
                        </span>
                        <StatusPille status={l.status} />
                        {richtung ? (
                          <NextLink
                            href={vorschauHref(l.schluessel)}
                            aria-current={lektion === l.schluessel ? 'true' : undefined}
                            aria-label={t('vorschauVon', { lektion: l.schluessel })}
                            className="inline-flex min-h-11 items-center gap-1 font-bold text-gruen-800 underline underline-offset-4"
                          >
                            <Play aria-hidden className="size-4" />
                            {t('vorschau')}
                          </NextLink>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
