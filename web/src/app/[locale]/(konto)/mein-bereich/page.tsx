import {
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Presentation,
  Route,
  ShieldAlert,
  Users,
  UsersRound,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Kacheln, type Kachel } from '@/components/mein-bereich/Kacheln';
import { BEREICH_ICON, MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { SchuelerStart } from '@/components/mein-bereich/SchuelerStart';
import { Achtstern } from '@/components/website/Icons';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum, naechstesGebet } from '@/lib/gebetszeiten/naechstes';
import { vornameAus } from '@/lib/konto/regeln';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { kindDarfPush } from '@/lib/push/abo';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meinBereich.meta');
  return { title: t('start') };
}

/**
 * Startseite von „Mein Bereich“ (ADR 0026): Begrüßung mit Vornamen, nächstes Gebet in Wetzlar (Moschee-Zeiten,
 * serverseitig zum Zeitpunkt der Anfrage, ohne hochzählende Uhr), Kacheln je Kontoart. Noch nicht gebaute Bereiche
 * erscheinen als „bald verfügbar“.
 */
export default async function MeinBereichStart({ searchParams }: PageProps<'/[locale]/mein-bereich'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache);
  const [t, tl, fenster, lernplattform, chatAn, pushAn, sp] = await Promise.all([
    getTranslations('meinBereich'),
    getTranslations('leiste'),
    ladeGebetszeitenFenster(),
    funktionAn('lernplattform'),
    funktionAn('chat'),
    funktionAn('push'),
    searchParams,
  ]);
  // Bereiche hinter Funktionsschaltern (ADR 0035) verschwinden ganz; Kinder sehen Benachrichtigungen nur mit Freigabe
  const benachrichtigungen = pushAn && (!k.istKind || (await kindDarfPush(k.benutzerId)));
  const istSchueler = lernplattform && k.gemeindeRollen.includes('schueler');
  const eigeneGruppe = istSchueler ? [...(await ladeGruppenKontext(k.benutzerId)).eigeneGruppen][0] : undefined;

  const jetzt = new Date();
  const heute = berlinerDatum(jetzt);
  const i = fenster.tage.findIndex((tag) => tag.datum === heute);
  const gebet =
    i >= 0
      ? naechstesGebet(
          { datum: fenster.tage[i].datum, zeiten: fenster.tage[i] },
          fenster.tage[i + 1] ? { datum: fenster.tage[i + 1].datum, zeiten: fenster.tage[i + 1] } : null,
          jetzt,
          true,
        )
      : null;
  const uhrzeit = gebet
    ? new Intl.DateTimeFormat(sprache === 'tr' ? 'tr-TR' : sprache === 'en' ? 'en-GB' : 'de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
      }).format(gebet.zeitpunkt)
    : null;

  const p = (ziel: Parameters<typeof pfadFuer>[0]) => pfadFuer(ziel, sprache);
  // Kinder werden geduzt (eigene Texte, wo es sie gibt)
  const KIND_TEXT = new Set(['lesezeichen', 'konto', 'benachrichtigungen']);
  const kachel = (schluessel: string, Icon: Kachel['Icon'], href: string | null): Kachel => ({
    schluessel,
    Icon,
    titel: t(`kachel.${schluessel}.titel`),
    text: t(`kachel.${schluessel}.${k.istKind && KIND_TEXT.has(schluessel) ? 'textKind' : 'text'}`),
    href,
  });
  const rollen = k.gemeindeRollen;
  const kacheln: Kachel[] = [
    ...(lernplattform && rollen.includes('eltern') ? [kachel('kinder', Users, p('/mein-bereich/kinder'))] : []),
    ...(lernplattform && rollen.includes('lehrkraft')
      ? [
          kachel('unterricht', Presentation, p('/mein-bereich/unterricht')),
          kachel('anwesenheit', ClipboardCheck, p({ pathname: '/mein-bereich/unterricht', hash: 'heute' })),
        ]
      : []),
    ...(istSchueler
      ? [
          kachel('lernweg', Route, p({ pathname: '/mein-bereich', hash: 'lernweg' })),
          ...(eigeneGruppe
            ? [kachel('gruppe', UsersRound, p({ pathname: '/mein-bereich/gruppen/[id]', params: { id: eigeneGruppe } }))]
            : []),
        ]
      : []),
    kachel('lesezeichen', BookMarked, p('/mein-bereich/lesezeichen')),
    kachel('quran', BookOpen, p('/quran')),
    kachel('gebetszeiten', Clock, p('/gebetszeiten')),
    ...(k.istKind ? [] : [kachel('veranstaltungen', CalendarDays, p('/veranstaltungen'))]),
    // Benachrichtigungen für Kinder nur mit Freigabe „Push für das Kind“ (ADR 0034, ab 16 eigene Zustimmung, D-11)
    ...(benachrichtigungen ? [kachel('benachrichtigungen', BEREICH_ICON.benachrichtigungen, p('/mein-bereich/benachrichtigungen'))] : []),
    kachel('konto', BEREICH_ICON.konto, p('/mein-bereich/konto')),
    ...(k.verwaltungsRollen.length ? [kachel('verwaltung', ExternalLink, '/verwaltung')] : []),
  ];

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="start"
      titel={t('start.titel', { vorname: vornameAus(k.anzeigename) })}
      untertitel={k.istKind ? t('start.untertitelKind') : t('start.untertitel')}
      sprachZiel="/mein-bereich"
    >
      {istSchueler ? (
        <SchuelerStart
          konto={k}
          sprache={sprache}
          heute={heute}
          chatAn={chatAn}
          rueckmeldung={sp.einwilligung === 'erteilt' || sp.einwilligung === 'widerrufen' ? sp.einwilligung : undefined}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="gebet-titel" className="flex flex-col gap-3 rounded-lg bg-gruen-950 p-6 text-weiss">
          <h2 id="gebet-titel" className="flex items-center gap-2 font-text text-18 font-bold text-gruen-100">
            <Achtstern size={16} />
            {t('start.gebet.titel')}
          </h2>
          {gebet && uhrzeit ? (
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-36 leading-none">{tl(gebet.gebet)}</span>
              <span className="text-24 tabular-nums">{t('start.gebet.um', { zeit: uhrzeit })}</span>
              {gebet.morgen ? <span className="text-18 text-gruen-100">{t('start.gebet.morgen')}</span> : null}
            </p>
          ) : (
            <p>{t('start.gebet.keine')}</p>
          )}
          <a
            href={p('/gebetszeiten')}
            className="mt-auto inline-flex min-h-12 items-center gap-2 self-start font-bold text-weiss underline decoration-gruen-100 underline-offset-3 outline-weiss hover:text-gruen-100"
          >
            {t('start.gebet.alle')}
          </a>
        </section>
        {!k.zweiFaktorErfuellt && !k.istKind ? (
          <section aria-labelledby="schutz-titel" className="flex flex-col gap-3 rounded-lg border border-warnung bg-warnung-toenung p-6">
            <h2 id="schutz-titel" className="flex items-center gap-2 font-text text-18 font-bold text-warnung">
              <ShieldAlert aria-hidden className="size-5" />
              {t('start.schutz.titel')}
            </h2>
            <p className="text-pretty text-tinte">{t('start.schutz.text')}</p>
            <a
              href={p({ pathname: '/mein-bereich/konto', hash: 'zwei-faktor' })}
              className="mt-auto inline-flex min-h-12 items-center self-start font-bold"
            >
              {t('start.schutz.knopf')}
            </a>
          </section>
        ) : (
          <section aria-labelledby="konto-titel" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
            <h2 id="konto-titel" className="font-text text-18 font-bold text-gruen-800">
              {k.istKind ? t('start.kontoTitelKind') : t('start.kontoTitel')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {k.gemeindeRollen.map((r) => (
                <li key={r} className="rounded-pill bg-gruen-50 px-3 py-1 text-16 font-bold text-gruen-800">
                  {t(`kontoart.${r}`)}
                </li>
              ))}
              {k.verwaltungsRollen.length ? (
                <li className="rounded-pill bg-sand px-3 py-1 text-16 font-bold text-tinte-2">{t('kontoart.verwaltung')}</li>
              ) : null}
            </ul>
            <p className="text-16 text-pretty text-tinte-2">{k.istKind ? t('start.kontoTextKind') : t('start.kontoText')}</p>
          </section>
        )}
      </div>
      <Kacheln titel={k.istKind ? t('start.bereicheKind') : t('start.bereiche')} kacheln={kacheln} bald={t('nav.bald')} />
    </MeinBereichRahmen>
  );
}
