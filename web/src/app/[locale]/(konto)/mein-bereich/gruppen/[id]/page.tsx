import { CalendarDays, Clock, MapPin, MessagesSquare, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { DatumsMarke, KNOPF_PRIMAER, KNOPF_SEKUNDAER, Pille } from '@/components/mein-bereich/Bausteine';
import type { BereichSchluessel } from '@/components/mein-bereich/eintraege';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText, kanaeleFuer, wochentagKurz, wochentageText, zeitspanne } from '@/lib/lernen/ansicht';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { gruppeAnsicht } from '@/server/queries/mein-bereich/gruppe';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('gruppe') };
}

/**
 * Meine Gruppe (AUFTRAG 3.5): Zeiten, Ort, nächste Termine, Leitung (Vorname + Initial, S-14) und der Weg in den Chat –
 * Gruppenkanal für Schüler und Leitung, Elternkanal für Eltern und Leitung (S-01). Sichtbar für Mitglieder, Eltern eines
 * Mitglieds und die Leitung (`gruppe.sehen`), sonst 404. Kinder werden geduzt.
 */
export default async function GruppenSeite({ params }: PageProps<'/[locale]/mein-bereich/gruppen/[id]'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache);
  const { id } = await params;
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const heute = berlinerDatum(new Date());
  const [g, chatAn, t, tu] = await Promise.all([
    gruppeAnsicht(id, kontext, heute),
    funktionAn('chat'),
    getTranslations('gruppenSeite'),
    getTranslations('unterricht'),
  ]);
  if (!g) notFound();
  const name = text(g.name, sprache);
  const leitung = kontext.leitung.has(g.id);
  const schueler = kontext.eigeneGruppen.has(g.id);
  const eigeneKinder = [...kontext.kinder.entries()].filter(([, gruppen]) => gruppen.has(g.id)).map(([kind]) => kind);
  const duzen = schueler && !leitung && !eigeneKinder.length;
  const anrede = duzen ? 'du' : 'sie';
  const aktuell: BereichSchluessel = leitung && k.gemeindeRollen.includes('lehrkraft') ? 'unterricht' : schueler ? 'gruppe' : 'kinder';
  const kanaele = chatAn ? kanaeleFuer(kontext, g.id) : [];
  const zeiten = [wochentageText(g.wochentage, sprache), zeitspanne(g.uhrzeitVon, g.uhrzeitBis)].filter(Boolean).join(' · ');

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell={aktuell}
      titel={name}
      untertitel={zeiten || undefined}
      sprachZiel={{ pathname: '/mein-bereich/gruppen/[id]', params: { id: g.id } }}
    >
      <div className="grid gap-4 lg:grid-cols-5">
        <section aria-labelledby="gruppe-kopf" className="flex flex-col gap-4 rounded-lg bg-gruen-950 p-6 text-weiss lg:col-span-3">
          <h2 id="gruppe-kopf" className="sr-only">
            {name}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {zeiten ? (
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-16 font-bold text-gruen-100">
                  <Clock aria-hidden className="size-4" />
                  {t('wann')}
                </dt>
                <dd className="text-20 font-bold">{zeiten}</dd>
              </div>
            ) : null}
            {g.ort ? (
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-16 font-bold text-gruen-100">
                  <MapPin aria-hidden className="size-4" />
                  {t('wo')}
                </dt>
                <dd className="text-20 font-bold">{g.ort}</dd>
              </div>
            ) : null}
          </dl>
          {leitung && k.gemeindeRollen.includes('lehrkraft') ? (
            <Link
              href={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: g.id } }}
              prefetch={false}
              className="mt-auto inline-flex min-h-12 items-center self-start font-bold text-weiss underline decoration-gruen-100 underline-offset-3 outline-weiss hover:text-gruen-100"
            >
              {tu('titel')}: {name}
            </Link>
          ) : null}
        </section>

        <div className="min-w-0 lg:col-span-2">
          <Abschnitt id="leitung" Icon={Users} titel={t('leitungTitel')}>
            <ul className="flex flex-col gap-2">
              {g.leitung.map((l, i) => (
                <li key={`${l.name}-${i}`} className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{l.name}</span>
                  <Pille>{t(`rolle.${l.rolle}`)}</Pille>
                </li>
              ))}
            </ul>
          </Abschnitt>
        </div>
      </div>

      <Abschnitt id="termine" Icon={CalendarDays} titel={t('termineTitel')}>
        {g.termine.length ? (
          <ul className="flex flex-col divide-y divide-linie">
            {g.termine.map((x) => (
              <li key={x.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <DatumsMarke tag={wochentagKurz(x.datum, sprache)} datum={x.datum.slice(8, 10)} hervor={x.datum === heute} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={x.ausgefallen ? 'font-bold text-tinte-2 line-through' : 'font-bold'}>
                    {datumText(x.datum, sprache, 'tag')}
                  </span>
                  <span className="text-16 text-tinte-2 tabular-nums">{zeitspanne(x.beginn, x.ende)}</span>
                </div>
                {x.ausgefallen ? <Pille ton="warnung">{t('ausgefallen')}</Pille> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinte-2">{t(`${anrede}.termineLeer`)}</p>
        )}
      </Abschnitt>

      {chatAn && kanaele.length ? (
        <Abschnitt
          id="chat"
          Icon={MessagesSquare}
          titel={t('chatTitel')}
          text={g.chatModus === 'aus' ? t(`${anrede}.chatAus`) : t(`${anrede}.chatText`)}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              {kanaele.map((kanal, i) => (
                <Link
                  key={kanal}
                  href={{
                    pathname: '/mein-bereich/gruppen/[id]/chat',
                    params: { id: g.id },
                    ...(kanal === 'eltern' ? { query: { kanal } } : {}),
                  }}
                  prefetch={false}
                  className={i === 0 ? KNOPF_PRIMAER : KNOPF_SEKUNDAER}
                >
                  <MessagesSquare aria-hidden className="size-5" />
                  {duzen ? t('du.chatOeffnen') : t('sie.chatOeffnen', { kanal: t(`kanal.${kanal}`) })}
                </Link>
              ))}
            </div>
            {g.chatModus !== 'aus' ? (
              <p className="text-16 text-tinte-2">{t('oeffnungszeiten', { von: g.chatVon, bis: g.chatBis })}</p>
            ) : null}
            <p className="text-16 text-tinte-2">{t(`${anrede}.datenschutz`)}</p>
          </div>
        </Abschnitt>
      ) : null}
    </MeinBereichRahmen>
  );
}
