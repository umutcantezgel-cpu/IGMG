import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldEinwilligung, FeldOptionen, FeldText, Honigtopf } from '@/components/formular/Felder';
import { ErfolgsAnsicht, FehlerZusammenfassung } from '@/components/formular/Rueckmeldung';
import { SendenKnopf } from '@/components/formular/SendenKnopf';
import { pfadFuer } from '@/i18n/navigation';
import type { FormularErgebnis } from '@/lib/formulare/ergebnis';
import { THEMEN } from '@/lib/validierung/formulare/newsletter';

type Sprache = 'de' | 'tr' | 'en';
type Fehlerstand = Extract<FormularErgebnis, { status: 'fehler' }>;

/**
 * Newsletter-Anmeldung (/newsletter, E-028): Server-Komponente ohne eigenes `<form>` (das umgibt `FormularInsel`).
 * E-Mail, Sprache der Mails (Vorgabe: Sprache der Seite), Themen als Karten, Einwilligung wörtlich aus `messages`
 * (Textversion), Honigtopf und ALTCHA. `meldeNewsletterAn` rendert sie nach einem Fehler mit Werten neu.
 */
export async function NewsletterFormular({
  sprache,
  ergebnis,
  altchaSchluessel,
}: {
  sprache: Sprache;
  ergebnis?: Fehlerstand;
  altchaSchluessel?: string;
}) {
  const [t, tf] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'newsletter' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  const fehlerTexte = tf.raw('fehler') as Record<string, string>;
  const w = ergebnis?.werte ?? {};
  const wert = (k: string) => (typeof w[k] === 'string' ? (w[k] as string) : undefined);
  // Listenfelder (Themen) melden Fehler mit Index („themen.0“): zählt für das Feld davor
  const f = (k: string) => {
    const s = Object.entries(ergebnis?.feldFehler ?? {}).find(([feld]) => feld.split('.')[0] === k)?.[1];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const themenWert = Array.isArray(w.themen) ? (w.themen as string[]) : [];
  const datenschutz = { href: pfadFuer('/datenschutz', sprache), label: t('datenschutz') };
  return (
    <>
      {ergebnis ? (
        <FehlerZusammenfassung
          fehler={ergebnis.fehler}
          feldFehler={ergebnis.feldFehler}
          felder={{ email: t('email'), mailSprache: t('mailSprache'), themen: t('themen'), einwilligung: datenschutz.label }}
          texte={{ fehler: fehlerTexte, zusammenfassung: tf('zusammenfassung') }}
        />
      ) : null}
      <input type="hidden" name="sprache" value={sprache} />
      <FeldText
        name="email"
        typ="email"
        label={t('email')}
        pflicht={tf('pflicht')}
        wert={wert('email')}
        autoComplete="email"
        maxLaenge={254}
        fehler={f('email')}
      />
      <FeldOptionen
        name="mailSprache"
        typ="radio"
        label={t('mailSprache')}
        kompakt
        wert={wert('mailSprache') ?? sprache}
        fehler={f('mailSprache')}
        optionen={(['de', 'tr', 'en'] as const).map((s) => ({ wert: s, label: t(`sprachen.${s}`) }))}
      />
      <FeldOptionen
        name="themen"
        typ="checkbox"
        label={t('themen')}
        hinweis={t('themenHinweis')}
        wert={themenWert}
        fehler={f('themen')}
        optionen={THEMEN.map((thema) => ({ wert: thema, label: t(`thema.${thema}`), beschreibung: t(`thema.${thema}Text`) }))}
      />
      <FeldEinwilligung
        name="einwilligung"
        text={t('einwilligung')}
        link={datenschutz}
        wert={wert('einwilligung') === 'ja'}
        fehler={f('einwilligung')}
      />
      <Honigtopf label={tf('honigtopf')} />
      <AltchaFeld key={altchaSchluessel} sprache={sprache} texte={{ label: tf('altcha.label'), hinweis: tf('altcha.hinweis') }} />
      <div className="self-stretch sm:self-start">
        <SendenKnopf className="w-full sm:w-auto" texte={{ senden: t('senden'), sendet: t('sendet') }} />
      </div>
    </>
  );
}

/** Erfolg (E-028): verrät nie, ob die Adresse schon angemeldet war – immer dieselbe Antwort. */
export async function NewsletterErfolg({ sprache }: { sprache: Sprache }) {
  const t = await getTranslations({ locale: sprache, namespace: 'newsletter' });
  return <ErfolgsAnsicht titel={t('erfolgTitel')} text={t('erfolg')} />;
}
