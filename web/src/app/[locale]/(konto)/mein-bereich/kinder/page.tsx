import { ArrowRight, CalendarDays, KeyRound, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { LeerHinweis, Pille } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText, zeitspanne } from '@/lib/lernen/ansicht';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { kinderDerEltern } from '@/server/queries/mein-bereich/kinder';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kinder.meta');
  return { title: t('uebersicht') };
}

/**
 * Eltern › Meine Kinder (AUFTRAG 3.5): je Kind eine Karte mit Gruppe, nächstem Termin, gemeldeten Fehltagen und dem
 * Stand des eigenen Zugangs. Nur eigene Kinder (Eltern-Kind-Bezug, ADR 0026). Funktion `lernplattform` aus → 404.
 */
export default async function KinderSeite() {
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['eltern']);
  const heute = berlinerDatum(new Date());
  const [kinder, t] = await Promise.all([kinderDerEltern(await ladeGruppenKontext(k.benutzerId), heute), getTranslations('kinder')]);

  return (
    <MeinBereichRahmen konto={k} aktuell="kinder" titel={t('titel')} untertitel={t('untertitel')} sprachZiel="/mein-bereich/kinder">
      {kinder.length ? (
        <ul className="grid gap-4 xl:grid-cols-2">
          {kinder.map((kind) => (
            <li key={kind.id} className="flex">
              <article aria-labelledby={`kind-${kind.id}`} className="flex w-full flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6">
                <div className="flex items-center gap-4">
                  <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-display text-24 text-weiss">
                    {Array.from(kind.name.trim())[0]?.toLocaleUpperCase(sprache) ?? ''}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 id={`kind-${kind.id}`} className="text-24">
                      {kind.name}
                    </h2>
                    {kind.status !== 'aktiv' ? <Pille ton="warnung" className="self-start">{t(`karte.status.${kind.status}`)}</Pille> : null}
                  </div>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-0.5">
                    <dt className="flex items-center gap-1.5 text-16 font-bold text-tinte-2">
                      <UsersRound aria-hidden className="size-4" />
                      {t('karte.gruppe')}
                    </dt>
                    <dd>{kind.gruppen.length ? kind.gruppen.map((g) => text(g.name, sprache)).join(', ') : t('karte.keineGruppe')}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="flex items-center gap-1.5 text-16 font-bold text-tinte-2">
                      <CalendarDays aria-hidden className="size-4" />
                      {t('karte.naechster')}
                    </dt>
                    <dd className="tabular-nums">
                      {kind.naechster
                        ? [datumText(kind.naechster.datum, sprache, 'tag'), zeitspanne(kind.naechster.beginn, kind.naechster.ende)].filter(Boolean).join(', ')
                        : t('karte.keinTermin')}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="flex items-center gap-1.5 text-16 font-bold text-tinte-2">
                      <KeyRound aria-hidden className="size-4" />
                      {t('karte.zugang')}
                    </dt>
                    <dd>{t(kind.zugang ? 'karte.zugangJa' : 'karte.zugangNein')}</dd>
                  </div>
                </dl>
                {kind.fehltAm.length ? (
                  <p className="rounded-md bg-sand px-3 py-2 text-16 text-tinte-2">
                    {t('karte.fehltAm', { daten: kind.fehltAm.map((d) => datumText(d, sprache)).join(', ') })}
                  </p>
                ) : null}
                <Link
                  href={{ pathname: '/mein-bereich/kinder/[id]', params: { id: kind.id } }}
                  prefetch={false}
                  aria-label={t('karte.oeffnenAria', { name: kind.name })}
                  className="group mt-auto inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-gruen-700 px-5 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 motion-reduce:active:scale-100"
                >
                  {t('karte.oeffnen')}
                  <ArrowRight
                    aria-hidden
                    className="size-5 transition-transform duration-(--dauer-rueckmeldung) group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <LeerHinweis titel={t('leer.titel')} text={t('leer.text')} rahmen />
      )}
    </MeinBereichRahmen>
  );
}
