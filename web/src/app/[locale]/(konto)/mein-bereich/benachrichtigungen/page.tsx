import { BellOff, BellRing, LifeBuoy, Mail, MonitorSmartphone, Newspaper, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt, Status } from '@/components/mein-bereich/Abschnitt';
import { KNOPF_PRIMAER, KNOPF_SEKUNDAER } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { MitteilungImBrowser } from '@/components/mein-bereich/MitteilungImBrowser';
import type { PushTexte, PushThemaSchluessel } from '@/components/website/push/PushEinstellungen';
import { PushStart } from '@/components/website/push/PushStart';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { GEBETE } from '@/lib/gebetszeiten/typen';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { kindDarfPush } from '@/lib/push/abo';
import type { ZusammenfassungThema } from '@/lib/push/rueckfall';
import { bestellteThemen, waehlbareThemen } from '@/lib/push/zusammenfassung';
import { zusammenfassungsLage } from '@/lib/push/zusammenfassung-mail';
import { vapidAusUmgebung } from '@/lib/push/vapid';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { speichereZusammenfassung } from '@/server/actions/benachrichtigungen';
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

/** Meldungen nach dem Speichern der Zusammenfassung (Weiterleitung der Action, `?zusammenfassung=…`). */
const ZUSAMMENFASSUNG_MELDUNGEN = ['gespeichert', 'aus', 'adresse', 'einwilligung'] as const;

/**
 * Benachrichtigungen (H-P01, ADR 0034): Mitteilungen aufs Gerät mit allen Themen (Gebet, Ankündigung, Chat und
 * Elternkanal, Unterricht – die beiden letzten nur mit Gruppe), Hinweis für iPhone/iPad und Rückfall (Nr. 6, F-38):
 * Zusammenfassung per E-Mail ohne Inhalte (täglich, je Thema, nie für Kinderkonten, nur mit bestätigter Adresse) und der
 * Hinweis in Mein Bereich, auf Wunsch auch als Mitteilung des Browsers. Kinder nur mit Freigabe „Push für das Kind“
 * (ab 16 eigene Zustimmung, D-11) und mit Texten in Du-Form; ohne Freigabe ein freundlicher Hinweis. Funktion `push` aus
 * → 404; ohne VAPID-Schlüssel ein ehrlicher Hinweis.
 */
export default async function BenachrichtigungenSeite({ searchParams }: PageProps<'/[locale]/mein-bereich/benachrichtigungen'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
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
  // Rückfall per E-Mail (F-38): nicht für Kinderkonten; Lage, wählbare und bestellte Themen
  const [sp, lage, waehlbar, bestellt] = await Promise.all([
    searchParams,
    kind ? null : zusammenfassungsLage(k.benutzerId),
    kind ? ([] as ZusammenfassungThema[]) : waehlbareThemen(k.benutzerId),
    kind ? ([] as ZusammenfassungThema[]) : bestellteThemen(k.benutzerId),
  ]);
  const meldung = ZUSAMMENFASSUNG_MELDUNGEN.find((m) => m === sp.zusammenfassung);
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

      {lage ? (
        <Abschnitt
          id="zusammenfassung"
          Icon={Mail}
          titel={t('zusammenfassung.titel')}
          rechts={
            <Status an={bestellt.length > 0} text={bestellt.length ? t('zusammenfassung.bestellt') : t('zusammenfassung.nichtBestellt')} />
          }
          text={t('zusammenfassung.text')}
        >
          <div className="flex flex-col gap-4">
            {meldung ? (
              <p role="status" className="max-w-text rounded-md bg-gruen-50 px-4 py-3 font-bold text-gruen-800">
                {meldung === 'gespeichert' || meldung === 'aus'
                  ? t(`zusammenfassung.meldung.${meldung}`)
                  : t(`zusammenfassung.nichtMoeglich.${meldung}`)}
              </p>
            ) : null}
            {lage.moeglich ? (
              <form action={speichereZusammenfassung} className="flex flex-col gap-4">
                <input type="hidden" name="sprache" value={sprache} />
                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-2 font-bold">{t('zusammenfassung.legende')}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {waehlbar.map((thema) => (
                      <label
                        key={thema}
                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 border-linie bg-weiss px-3 py-2 has-checked:border-gruen-700 has-checked:bg-gruen-50"
                      >
                        <input
                          type="checkbox"
                          name="thema"
                          value={thema}
                          defaultChecked={bestellt.includes(thema)}
                          className="size-5 shrink-0 accent-gruen-700"
                        />
                        <span>{t(`zusammenfassung.themen.${thema}`)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="max-w-text text-16 text-tinte-2">{t('zusammenfassung.adresse')}</p>
                <button type="submit" className={`${KNOPF_PRIMAER} self-start`}>
                  {t('zusammenfassung.speichern')}
                </button>
              </form>
            ) : lage.grund === 'adresse' || lage.grund === 'einwilligung' ? (
              <p className="max-w-text text-tinte-2">{t(`zusammenfassung.nichtMoeglich.${lage.grund}`)}</p>
            ) : null}
          </div>
        </Abschnitt>
      ) : null}

      {kind && !freigabe ? null : (
        <Abschnitt
          id="hinweis-im-browser"
          Icon={MonitorSmartphone}
          titel={t('imBrowser.titel')}
          text={kind ? t('imBrowser.textKind') : t('imBrowser.text')}
        >
          <MitteilungImBrowser
            knopf={KNOPF_SEKUNDAER}
            texte={{
              einschalten: t('imBrowser.einschalten'),
              ausschalten: t('imBrowser.ausschalten'),
              an: t('imBrowser.an'),
              aus: t('imBrowser.aus'),
              verweigert: t('imBrowser.verweigert'),
              nicht: t('imBrowser.nicht'),
            }}
          />
        </Abschnitt>
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
