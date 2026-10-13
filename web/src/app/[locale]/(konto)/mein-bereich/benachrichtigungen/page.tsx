import { BellOff, BellRing, LifeBuoy, Newspaper, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Abschnitt, Status } from '@/components/mein-bereich/Abschnitt';
import { KNOPF_SEKUNDAER } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import type { PushTexte, PushThemaSchluessel } from '@/components/website/push/PushEinstellungen';
import { PushStart } from '@/components/website/push/PushStart';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { GEBETE } from '@/lib/gebetszeiten/typen';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { kindDarfPush } from '@/lib/push/abo';
import { vapidAusUmgebung } from '@/lib/push/vapid';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { eigeneEinwilligungen } from '@/server/queries/mein-bereich/gruppe';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meinBereich.meta');
  return { title: t('benachrichtigungen') };
}

const SCHLUESSEL = [
  'themenTitel',
  'gebeteTitel',
  'minutenTitel',
  'minuten',
  'minutenNull',
  'einwilligung',
  'speichern',
  'aktualisieren',
  'abschalten',
  'aktiv',
  'gespeichert',
  'aus',
  'verweigert',
  'nichtUnterstuetzt',
  'ios',
  'fehler',
  'mindestensEins',
  'einwilligungFehlt',
  'laedt',
] as const;

/**
 * Benachrichtigungen (H-P01, ADR 0034): Mitteilungen aufs Gerät mit allen Themen (Gebet, Ankündigung, Chat und
 * Elternkanal, Unterricht – die beiden letzten nur mit Gruppe), Hinweis für iPhone/iPad und Rückfall (Mail ohne Inhalt,
 * Mein Bereich). Kinder nur mit Freigabe „Push für das Kind“ (ab 16 eigene Zustimmung, D-11) und mit Texten in Du-Form;
 * ohne Freigabe ein freundlicher Hinweis. Funktion `push` aus → 404; ohne VAPID-Schlüssel ein ehrlicher Hinweis.
 */
export default async function BenachrichtigungenSeite() {
  if (!(await funktionAn('push'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache);
  const [t, tp, tl, lernplattform, chatAn] = await Promise.all([
    getTranslations('meinBereich.benachrichtigungen'),
    getTranslations('push'),
    getTranslations('leiste'),
    funktionAn('lernplattform'),
    funktionAn('chat'),
  ]);
  const kind = k.istKind;
  const freigabe = kind ? await kindDarfPush(k.benutzerId) : true;
  const kontext = lernplattform ? await ladeGruppenKontext(k.benutzerId) : null;
  const inGruppe = Boolean(
    kontext && (kontext.leitung.size || kontext.eigeneGruppen.size || [...kontext.kinder.values()].some((g) => g.size)),
  );
  const selbst = kind && kontext ? await eigeneEinwilligungen(kontext, berlinerDatum(new Date())) : null;
  const vapid = vapidAusUmgebung();
  const themen: PushThemaSchluessel[] = [
    'gebet',
    'ankuendigung',
    ...(chatAn && inGruppe ? (['chat'] as const) : []),
    ...(inGruppe ? (['unterricht'] as const) : []),
  ];
  // Kinder: eigene Texte in Du-Form, wo es sie gibt (`push.kind.*`); sonst der allgemeine Wortlaut
  const w = (s: string) => (kind && tp.has(`kind.${s}`) ? tp(`kind.${s}`) : tp(s));
  const texte = {
    // „{minuten} Minuten vorher“ füllt die Insel selbst
    ...Object.fromEntries(SCHLUESSEL.map((s) => [s, s === 'minuten' ? (tp.raw('minuten') as string) : w(s)])),
    themen: Object.fromEntries((['gebet', 'ankuendigung', 'chat', 'unterricht'] as const).map((x) => [x, w(`themen.${x}`)])),
  } as PushTexte;

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="benachrichtigungen"
      titel={t('titel')}
      untertitel={kind ? t('untertitelKind') : t('untertitel')}
      sprachZiel="/mein-bereich/benachrichtigungen"
    >
      {kind && !freigabe ? (
        <Abschnitt
          id="push"
          Icon={BellOff}
          titel={t('kindOhneFreigabe.titel')}
          text={selbst ? t('kindOhneFreigabe.textSelbst') : t('kindOhneFreigabe.text')}
        >
          {selbst ? (
            <Link href={{ pathname: '/mein-bereich', hash: 'einwilligungen' }} prefetch={false} className={KNOPF_SEKUNDAER}>
              {t('kindOhneFreigabe.link')}
            </Link>
          ) : null}
        </Abschnitt>
      ) : vapid ? (
        <PushStart
          titel={t('push.titel')}
          einleitung={kind ? t('push.einleitungKind') : t('push.einleitung')}
          knopf={t('push.knopf')}
          symbol={<BellRing aria-hidden className="size-6 shrink-0 text-gruen-700" />}
          texte={texte}
          oeffentlich={vapid.oeffentlich}
          themen={themen}
          gebete={Object.fromEntries(GEBETE.filter((g) => g !== 'gunes').map((g) => [g, tl(g)]))}
          sprache={sprache}
        />
      ) : (
        <Abschnitt
          id="push"
          Icon={BellRing}
          titel={t('push.titel')}
          rechts={<Status an={false} text={t('bald')} />}
          text={t('push.nichtEingerichtet')}
        />
      )}

      <Abschnitt id="rueckfall" Icon={LifeBuoy} titel={t('rueckfall.titel')} text={kind ? t('rueckfall.textKind') : t('rueckfall.text')}>
        <p className="flex max-w-text items-start gap-3 rounded-md bg-sand px-4 py-3 text-16 text-pretty text-tinte-2">
          <Smartphone aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
          {kind ? t('push.iosKind') : t('push.ios')}
        </p>
      </Abschnitt>

      {kind ? null : (
        <Abschnitt
          id="newsletter"
          Icon={Newspaper}
          titel={t('newsletter.titel')}
          rechts={<Status an={false} text={t('bald')} />}
          text={t('newsletter.text')}
        />
      )}
    </MeinBereichRahmen>
  );
}
