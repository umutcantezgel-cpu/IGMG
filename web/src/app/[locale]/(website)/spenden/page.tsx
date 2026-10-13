import { ArrowRight, ChevronDown, Copy, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { GiroCode } from '@/components/website/spenden/GiroCode';
import { KopierKnopf } from '@/components/website/spenden/KopierKnopf';
import { Text } from '@/components/website/Text';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { spendenAnsicht, type SpendenZweckAnsicht } from '@/lib/spenden/ansicht';
import { ladeEinstellung } from '@/server/queries/einstellungen';

export const ensureStatic = 'navigation';

const TEXTLINK = 'inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('spenden');
  return metadatenFuer({ pfad: '/spenden', titel: t('titel'), beschreibung: t('metaBeschreibung') });
}

/**
 * Spenden (AUFTRAG 3.10, MN-13): Bankverbindung aus der Einstellung „spenden“, Spendenzwecke und je Zweck ein statischer
 * GiroCode (EPC-QR, ohne Betrag). Kein Zahlungsdienst – die Banking-App öffnet die Überweisung. Ohne gültige IBAN
 * (Prüfziffer) ein ehrlicher Platzhalter und kein QR-Code. Statisch; Änderungen in der Verwaltung erneuern den Tag
 * „einstellungen“.
 */
export default async function SpendenSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tk, einstellung] = await Promise.all([getTranslations('spenden'), getTranslations('kopf'), ladeEinstellung('spenden')]);
  const ansicht = spendenAnsicht(einstellung, t('allgemeinZweck'));
  const zweckTitel = (z: SpendenZweckAnsicht) => (z.titel ? text(z.titel, sprache) : t('allgemeinTitel'));

  return (
    <Seitenrahmen bereich="moschee" seite="spenden" sprachZiel="/spenden" pfad={[{ label: tk('moschee') }, { label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        {!ansicht ? (
          <section
            aria-labelledby="spenden-platzhalter"
            data-spenden="platzhalter"
            className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-6 md:flex-row md:p-10"
          >
            <Zustandsgrafik art="leer" className="shrink-0" />
            <div className="flex flex-col gap-3">
              <h2 id="spenden-platzhalter" className="text-display-2">
                {t('platzhalter.titel')}
              </h2>
              <p className="max-w-text text-18">{t('platzhalter.text')}</p>
              <p className="max-w-text text-tinte-2">{t('platzhalter.eintrag')}</p>
              <p className="flex flex-wrap items-center gap-x-2">
                {t('platzhalter.kontakt')}
                <Link href="/kontakt" className={TEXTLINK}>
                  {t('platzhalter.kontaktLink')}
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Telefon: Zwecke → Bankverbindung → So geht’s → Bestätigung (order); ab lg Bankverbindung rechts daneben */}
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
              <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-10">
                <section aria-labelledby="spenden-zwecke" className="order-1 flex flex-col gap-4">
                  <h2 id="spenden-zwecke" className="flex items-center gap-2.5 text-display-2">
                    <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
                    {t('zwecke.titel')}
                  </h2>
                  <ul className="grid gap-4 md:grid-cols-2">
                    {ansicht.zwecke.map((z) => (
                      <li key={z.schluessel} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5">
                        <h3 className="font-text text-20 leading-snug font-bold tracking-normal">
                          {z.titel ? <Text feld={z.titel} sprache={sprache} /> : t('allgemeinTitel')}
                        </h3>
                        {z.beschreibung ? (
                          <Text feld={z.beschreibung} sprache={sprache} als="p" className="text-16 text-tinte-2" />
                        ) : z.titel ? null : (
                          <p className="text-16 text-tinte-2">{t('allgemeinText')}</p>
                        )}
                        <p className="text-16">
                          <span className="font-bold">{t('zwecke.verwendungszweck')}: </span>
                          {z.verwendungszweck}
                        </p>
                        {/* Mehrere Zwecke: jeder klappt seinen eigenen Code auf; groß steht der erste in der Bankverbindung */}
                        {ansicht.zwecke.length > 1 ? (
                          <details className="group border-t border-linie pt-2">
                            <summary className={`${TEXTLINK} cursor-pointer list-none`}>
                              <ChevronDown aria-hidden className="size-5 shrink-0 group-open:rotate-180" />
                              {t('girocode.zeigen')}
                            </summary>
                            <div className="tritt-auf mt-3 w-48 rounded-md border border-linie bg-weiss p-2">
                              <GiroCode
                                nutzlast={z.nutzlast}
                                titel={t('girocode.label', { zweck: zweckTitel(z) })}
                                className="block size-full"
                              />
                            </div>
                          </details>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
                <section aria-labelledby="spenden-schritte" className="order-3 flex flex-col gap-4 rounded-lg bg-sand p-6 md:p-8">
                  <h2 id="spenden-schritte" className="text-24">
                    {t('schritte.titel')}
                  </h2>
                  <ol className="grid gap-4 md:grid-cols-3">
                    {(['eins', 'zwei', 'drei'] as const).map((s, i) => (
                      <li key={s} className="flex gap-3 rounded-md bg-weiss p-4">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-bold text-weiss tabular-nums"
                        >
                          {i + 1}
                        </span>
                        <span className="text-16">{t(`schritte.${s}`)}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section aria-labelledby="spenden-quittung" className="order-4 flex flex-col gap-2">
                  <h2 id="spenden-quittung" className="text-24">
                    {t('quittung.titel')}
                  </h2>
                  <p className="max-w-text text-tinte-2">{t('quittung.text')}</p>
                </section>
              </div>
              <section
                aria-labelledby="spenden-bank"
                className="order-2 flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 shadow-s1 lg:order-none"
              >
                <h2 id="spenden-bank" className="font-text text-20 font-bold tracking-normal">
                  {t('bank.titel')}
                </h2>
                <dl className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <dt className="text-16 font-bold text-tinte-2">{t('bank.empfaenger')}</dt>
                    <dd className="text-18">{ansicht.empfaenger}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-16 font-bold text-tinte-2">{t('bank.iban')}</dt>
                    <dd className="flex flex-col items-start gap-2">
                      <span data-iban className="text-18 font-bold tabular-nums select-all md:text-20">
                        {ansicht.ibanAnzeige}
                      </span>
                      <KopierKnopf
                        text={ansicht.iban}
                        kinder={
                          <>
                            <Copy aria-hidden className="size-5" />
                            <span>{t('bank.kopieren')}</span>
                          </>
                        }
                        texte={{ kopiert: t('bank.kopiert'), fehler: t('bank.kopierenFehler') }}
                      />
                    </dd>
                  </div>
                  {ansicht.bic ? (
                    <div className="flex flex-col">
                      <dt className="text-16 font-bold text-tinte-2">{t('bank.bic')}</dt>
                      <dd className="text-18 tabular-nums">{ansicht.bic}</dd>
                    </div>
                  ) : null}
                </dl>
                <figure className="flex flex-col items-center gap-3 border-t border-linie pt-4">
                  <div className="w-56 rounded-md border border-linie bg-weiss p-2">
                    <GiroCode
                      nutzlast={ansicht.zwecke[0].nutzlast}
                      titel={t('girocode.label', { zweck: zweckTitel(ansicht.zwecke[0]) })}
                      className="block size-full"
                    />
                  </div>
                  <figcaption className="flex flex-col gap-1 text-center">
                    <span className="font-bold">
                      {t('girocode.titel')} · {zweckTitel(ansicht.zwecke[0])}
                    </span>
                    <span className="text-16 text-tinte-2">{t('girocode.text')}</span>
                  </figcaption>
                </figure>
                <p className="flex items-start gap-2 rounded-md bg-sand p-3 text-16">
                  <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
                  {t('keinDienst')}
                </p>
              </section>
            </div>
          </>
        )}
      </div>
    </Seitenrahmen>
  );
}
