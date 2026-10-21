import { Ban, Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { AktionsKnopf, AlternativeFormular } from '@/components/verwaltung/lernapp/Formulare';
import { LernappNavigation, StatusPille } from '@/components/verwaltung/lernapp/Navigation';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import type { Status } from '@/lib/lernapp/freigabe';
import { istRichtung, kursVonSlug, type KursSlug, richtung, type Sprache, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { cn } from '@/lib/utils';
import { alternativeErgaenzen, eintragSperren, meldungErledigen } from '@/server/actions/lernapp-meldungen';
import { ladeMeldungen, zaehleOffeneLernappMeldungen } from '@/server/queries/lernapp/meldungen';

/**
 * Verwaltung › Lern-App › Meldungen (L3-06, ADR 0041 Nr. 9): Meldungen aus der App mit Aufgabe, Kategorie und ggf. der
 * mitgeschickten Antwort (nur angemeldete Personen ab 16). Aktionen: angenommene Fassung ergänzen (an der Aufgabe bzw. an der
 * Übersetzung der Richtung), Aufgabe oder verwendeten Eintrag sperren, ohne Änderung erledigen. Recht `lernapp.bearbeiten`.
 */
export default async function Meldungen({ searchParams }: PageProps<'/[locale]/verwaltung/lernapp/meldungen'>) {
  const a = await verlangeLernappSeite('lernapp.bearbeiten');
  const ansicht = (await searchParams).ansicht === 'erledigt' ? 'erledigt' : 'offen';
  const [t, tg, liste, offen] = await Promise.all([
    getTranslations('verwaltung.lernapp.meldungen'),
    getTranslations('verwaltung.shell'),
    ladeMeldungen(ansicht),
    zaehleOffeneLernappMeldungen(),
  ]);
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  /** Sprache der Lösung bzw. Alternative: Zielsprache, bei Übersetzungen die Ausgangssprache der Richtung. */
  const loesungsSprache = (kurs: string, ziel: 'aufgabe' | 'uebersetzung'): Sprache => {
    if (ziel === 'uebersetzung' && istRichtung(kurs)) return zerlegeRichtung(kurs).ausgang;
    const k = kursVonSlug(kurs as KursSlug);
    return k === 'tr' || k === 'ar' ? k : 'de';
  };

  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} />
      <LernappNavigation aktiv="meldungen" rollen={a.rollen} />
      <Ansichten
        label={t('ansichten')}
        eintraege={[
          { schluessel: 'offen', label: t('offen', { anzahl: offen }), href: '/verwaltung/lernapp/meldungen', aktiv: ansicht === 'offen' },
          {
            schluessel: 'erledigt',
            label: t('erledigt'),
            href: '/verwaltung/lernapp/meldungen?ansicht=erledigt',
            aktiv: ansicht === 'erledigt',
          },
        ]}
      />
      {liste.length === 0 ? (
        <ListenLeer text={t('leer')} />
      ) : (
        <ul className="flex flex-col gap-4">
          {liste.map((m) => {
            const sprache = m.ziel.art === 'keine' ? null : loesungsSprache(m.kurs, m.ziel.art);
            const antwortSprache = istRichtung(m.kurs)
              ? m.ziel.art === 'uebersetzung'
                ? zerlegeRichtung(m.kurs).ausgang
                : zerlegeRichtung(m.kurs).ziel
              : 'de';
            return (
              <li key={m.id} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-text text-20 font-bold tracking-normal">{t(`kategorie.${m.kategorie}`)}</h2>
                  <span className={cn(PILLE, m.status === 'offen' ? 'bg-info-toenung text-info' : 'bg-gruen-50 text-gruen-800')}>
                    {t(m.status === 'offen' ? 'statusOffen' : 'statusErledigt')}
                  </span>
                </div>
                <p className="text-16">
                  <span className="font-mono">{t('aufgabe', { aufgabe: m.aufgabe, kurs: m.kurs })}</span>
                  {' · '}
                  {m.status === 'offen'
                    ? t('eingegangen', { am: zeit(m.am) })
                    : t('erledigtAm', { am: m.erledigtAm ? zeit(m.erledigtAm) : '–' })}
                </p>
                {m.aufgabeDaten ? (
                  <p className="flex flex-wrap items-center gap-2 text-16">
                    {t('typ', { typ: m.aufgabeDaten.typ })}
                    <StatusPille status={m.aufgabeDaten.status as Status} />
                  </p>
                ) : (
                  <p className="text-16 text-tinte-2">{t('aufgabeFehlt')}</p>
                )}
                {m.antwort ? (
                  <div className="flex flex-col gap-1">
                    <h3 className="text-16 font-bold">{t('antwort')}</h3>
                    <p
                      lang={antwortSprache}
                      dir={richtung(antwortSprache)}
                      className={cn(antwortSprache === 'ar' && 'font-arabic text-arabisch-3')}
                    >
                      {m.antwort}
                    </p>
                  </div>
                ) : null}
                {m.loesung && sprache ? (
                  <dl className="grid gap-x-3 gap-y-1 text-16 sm:grid-cols-4">
                    <dt className="font-bold">{t('loesung')}</dt>
                    <dd
                      lang={sprache}
                      dir={richtung(sprache)}
                      className={cn('sm:col-span-3', sprache === 'ar' && 'font-arabic text-arabisch-3')}
                    >
                      {m.loesung.haupt || '–'}
                    </dd>
                    <dt className="font-bold">{t('alternativen')}</dt>
                    <dd
                      lang={sprache}
                      dir={richtung(sprache)}
                      className={cn('sm:col-span-3', sprache === 'ar' && 'font-arabic text-arabisch-3')}
                    >
                      {m.loesung.alternativen.length ? m.loesung.alternativen.join(' · ') : <span lang="de">{t('keineAlternativen')}</span>}
                    </dd>
                  </dl>
                ) : null}
                {m.status === 'offen' && m.aufgabeDaten ? (
                  <div className="flex flex-col gap-4 border-t border-linie pt-4">
                    {m.ziel.art !== 'keine' && sprache ? (
                      <AlternativeFormular aktion={alternativeErgaenzen} id={m.id} sprache={sprache} laenge={m.ziel.laenge} />
                    ) : null}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-16 font-bold">{t('sperren')}</h3>
                      <div className="flex flex-wrap gap-2">
                        <AktionsKnopf
                          aktion={eintragSperren}
                          felder={{ id: m.id, ziel: m.aufgabe }}
                          knopf={t('sperrenAufgabe')}
                          variante="destructive"
                          icon={<Ban aria-hidden />}
                          erfolg={t('erledigtText')}
                        />
                        {m.verweise.map((v) => (
                          <AktionsKnopf
                            key={v.schluessel}
                            aktion={eintragSperren}
                            felder={{ id: m.id, ziel: v.schluessel }}
                            knopf={t('sperrenEintrag', { text: v.schluessel })}
                            variante="outline"
                            icon={<Ban aria-hidden />}
                            erfolg={t('erledigtText')}
                          />
                        ))}
                      </div>
                    </div>
                    <AktionsKnopf
                      aktion={meldungErledigen}
                      felder={{ id: m.id }}
                      knopf={t('erledigen')}
                      variante="secondary"
                      icon={<Check aria-hidden />}
                      erfolg={t('erledigtText')}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
