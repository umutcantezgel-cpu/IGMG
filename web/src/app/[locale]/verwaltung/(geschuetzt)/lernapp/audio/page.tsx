import { Trash2, UserRound, Volume2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { ClipAnhoeren } from '@/components/verwaltung/lernapp/ClipAnhoeren';
import { AktionsKnopf, SprecherFormular } from '@/components/verwaltung/lernapp/Formulare';
import { AufnahmeStudio } from '@/components/verwaltung/lernapp/AufnahmeStudio';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { istSprache, richtung, type Sprache, SPRACHEN } from '@/lib/lernapp/kurse';
import { buendelAdresse } from '@/lib/lernapp/paket/buendel';
import { stimmenArt } from '@/lib/lernapp/verwaltung/audio';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { cn } from '@/lib/utils';
import { aufnahmeVerwerfen, sprecherAnlegen, stimmeWaehlen } from '@/server/actions/lernapp-audio';
import { ladeSprecher, ladeStudio, STUDIO_SEITE, type StudioFilter } from '@/server/queries/lernapp/audio-studio';

const LAGE_FARBE = {
  fehlt: 'bg-warnung-toenung text-warnung',
  auffaellig: 'bg-fehler-toenung text-fehler',
  vorhanden: 'bg-gruen-50 text-gruen-800',
} as const;
const FILTER: StudioFilter[] = ['fehlt', 'auffaellig', 'alle'];

/**
 * Verwaltung › Lern-App › Audio-Studio (L3-06, PLAN §7.1, ADR 0039 Nr. 7/8): vertonbare Zieltexte je Sprachkurs mit Lage
 * (fehlt, auffällig, vorhanden), Clips zum Anhören, Wahl Sprachausgabe ↔ Aufnahme je Clip, Rohaufnahmen und Aufnahme mit den
 * Bausteinen der Rezitations-Werkstatt; Sprecherinnen und Sprecher nur mit Vereinbarung. Religionsbezug, Wissen und
 * Koran-Arabisch erscheinen nie (nie vertont). Recht `lernapp.audio.bearbeiten`; Mikrofon nur hier (Permissions-Policy).
 */
export default async function AudioStudio({ searchParams }: PageProps<'/[locale]/verwaltung/lernapp/audio'>) {
  const a = await verlangeLernappSeite('lernapp.audio.bearbeiten');
  const sp = await searchParams;
  const kurs: Sprache = istSprache(sp.kurs) ? sp.kurs : 'de';
  const filter: StudioFilter = FILTER.includes(sp.filter as StudioFilter) ? (sp.filter as StudioFilter) : 'fehlt';
  const seite = Math.max(0, Math.min(10_000, Number.parseInt(String(sp.seite ?? '0'), 10) || 0));
  const [t, tl, tg, studio, sprecher] = await Promise.all([
    getTranslations('verwaltung.lernapp.audio'),
    getTranslations('verwaltung.lernapp'),
    getTranslations('verwaltung.shell'),
    ladeStudio(kurs, filter, seite),
    ladeSprecher(),
  ]);
  const seiten = Math.max(1, Math.ceil(studio.gesamt / STUDIO_SEITE));
  const href = (o: { kurs?: Sprache; filter?: StudioFilter; seite?: number }) =>
    `/verwaltung/lernapp/audio?${new URLSearchParams({ kurs: o.kurs ?? kurs, filter: o.filter ?? filter, seite: String(o.seite ?? 0) })}`;
  const mitVereinbarung = sprecher.filter((s) => !s.vereinbarung.imPapierkorb).map((s) => ({ id: s.id, name: s.name }));
  const clipTexte = { anhoeren: t('anhoeren', { stimme: '' }).trim(), langsam: t('langsam'), stopp: t('anhalten'), fehler: t('clipFehlt') };
  const stimmenName = (stimme: string) => {
    const art = stimmenArt(stimme);
    const name = art === 'mensch' ? sprecher.find((s) => `mensch:${s.id}` === stimme)?.name : null;
    return name ? `${t(`stimmenArt.${art}`)}: ${name}` : t(`stimmenArt.${art}`);
  };

  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} />
      <LernappNavigation aktiv="audio" rollen={a.rollen} />
      <Ansichten
        label={t('kurs')}
        eintraege={SPRACHEN.map((s) => ({
          schluessel: s,
          label: tl(`kurs.${s}`),
          href: href({ kurs: s, filter, seite: 0 }),
          aktiv: s === kurs,
        }))}
      />
      <Ansichten
        label={t('filter')}
        eintraege={FILTER.map((f) => ({
          schluessel: f,
          label: t(`filterText.${f}`, { anzahl: studio.zaehler[f] }),
          href: href({ filter: f, seite: 0 }),
          aktiv: f === filter,
        }))}
      />

      <section aria-labelledby="studio-liste" className="flex flex-col gap-3">
        <h2 id="studio-liste" className="sr-only">
          {t(`filterText.${filter}`, { anzahl: studio.gesamt })}
        </h2>
        {studio.eintraege.length === 0 ? (
          <ListenLeer text={t('leer')} />
        ) : (
          <ul className="flex flex-col gap-3">
            {studio.eintraege.map((e) => {
              const mensch = e.clips.some((c) => c.art === 'mensch');
              const tts = e.clips.some((c) => c.art === 'sprachausgabe');
              return (
                <li key={e.schluessel} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span
                      lang={kurs}
                      dir={richtung(kurs)}
                      className={cn('text-20 font-bold', kurs === 'ar' && 'font-arabic text-arabisch-3')}
                    >
                      {e.text}
                    </span>
                    <span className={cn(PILLE, LAGE_FARBE[e.lage])}>{t(`lage.${e.lage}`)}</span>
                    <span className="font-mono text-16 text-tinte-2">{e.schluessel}</span>
                  </div>
                  {e.clips.length === 0 ? (
                    <p className="text-16 text-tinte-2">{t('keinClip')}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-16 font-bold">{t('wirksam', { stimme: e.wirksam ? stimmenName(e.wirksam) : '–' })}</p>
                      <ul className="flex flex-col gap-2">
                        {e.clips.map((c) => (
                          <li key={c.id} className="flex flex-wrap items-center gap-2">
                            <Volume2 aria-hidden className="size-5 text-tinte-2" />
                            <span className="text-16">{stimmenName(c.stimme)}</span>
                            {c.gesperrt ? <span className={cn(PILLE, 'bg-fehler-toenung text-fehler')}>{t('clipGesperrt')}</span> : null}
                            <ClipAnhoeren
                              quelle={{ adresse: buendelAdresse(kurs, c.buendel), versatz: c.versatz, laenge: c.laenge }}
                              texte={{ ...clipTexte, anhoeren: t('anhoeren', { stimme: stimmenName(c.stimme) }) }}
                              langsamAnbieten={false}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {mensch || e.aufnahmen.length || e.wahl ? (
                    <div role="group" aria-label={t('wahl')} className="flex flex-wrap gap-2">
                      <AktionsKnopf
                        aktion={stimmeWaehlen}
                        felder={{ eintrag: e.schluessel, wahl: 'sprachausgabe' }}
                        knopf={t('wahlSprachausgabe')}
                        gedrueckt={e.wahl === 'sprachausgabe' || (!mensch && tts)}
                      />
                      <AktionsKnopf
                        aktion={stimmeWaehlen}
                        felder={{ eintrag: e.schluessel, wahl: 'mensch' }}
                        knopf={t('wahlMensch')}
                        gedrueckt={e.wahl !== 'sprachausgabe' && mensch}
                      />
                    </div>
                  ) : null}
                  {e.aufnahmen.length ? (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-16 font-bold">{t('aufnahmen')}</h3>
                      <ul className="flex flex-col gap-2">
                        {e.aufnahmen.map((x) => (
                          <li key={x.id} className="flex flex-wrap items-center gap-2">
                            <UserRound aria-hidden className="size-5 text-tinte-2" />
                            <span className="text-16">
                              {t('aufnahmeZeile', {
                                sprecher: x.sprecher,
                                dauer: x.dauerMs ? `${(x.dauerMs / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} s` : '–',
                                status: t(`aufnahmeStatus.${x.status as 'neu'}`),
                              })}
                            </span>
                            {x.status !== 'verworfen' ? (
                              <>
                                <ClipAnhoeren
                                  quelle={{ adresse: `/verwaltung/lernapp/audio/aufnahme/${x.id}` }}
                                  texte={{ ...clipTexte, anhoeren: t('aufnahmeAnhoeren') }}
                                  langsamAnbieten={false}
                                />
                                <AktionsKnopf
                                  aktion={aufnahmeVerwerfen}
                                  felder={{ id: x.id }}
                                  knopf={t('aufnahmeVerwerfen')}
                                  variante="ghost"
                                  icon={<Trash2 aria-hidden />}
                                />
                              </>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <AufnahmeStudio eintrag={e.schluessel} sprecher={mitVereinbarung} />
                </li>
              );
            })}
          </ul>
        )}
        {seiten > 1 ? (
          <nav aria-label={t('seite', { seite: seite + 1, seiten })} className="flex flex-wrap items-center gap-3">
            {seite > 0 ? (
              <NextLink
                href={href({ seite: seite - 1 })}
                className="inline-flex min-h-11 items-center font-bold underline underline-offset-4"
              >
                {t('zurueck')}
              </NextLink>
            ) : null}
            <span>{t('seite', { seite: seite + 1, seiten })}</span>
            {seite + 1 < seiten ? (
              <NextLink
                href={href({ seite: seite + 1 })}
                className="inline-flex min-h-11 items-center font-bold underline underline-offset-4"
              >
                {t('vor')}
              </NextLink>
            ) : null}
          </nav>
        ) : null}
      </section>

      <section aria-labelledby="studio-sprecher" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-6">
        <h2 id="studio-sprecher" className="text-30">
          {t('sprecherTitel')}
        </h2>
        <p className="max-w-text text-tinte-2">{t('sprecherText')}</p>
        {sprecher.length === 0 ? (
          <p>{t('sprecherLeer')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sprecher.map((s) => (
              <li key={s.id}>
                {t('sprecherZeile', {
                  name: s.name,
                  vereinbarung: s.vereinbarung.imPapierkorb ? t('vereinbarungPapierkorb') : t('vereinbarungDa'),
                  aufnahmen: s.aufnahmen,
                })}{' '}
                ({[s.kiSyntheseErlaubt ? t('b1') : null, s.klonenErlaubt ? t('b2') : null].filter(Boolean).join(', ') || t('nurA')})
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-20 font-bold">{t('neuSprecher')}</h3>
        {mitVereinbarung.length === 0 ? <Meldung art="info">{t('ohneSprecher')}</Meldung> : null}
        <SprecherFormular aktion={sprecherAnlegen} />
      </section>
    </>
  );
}
