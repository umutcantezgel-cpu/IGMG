import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldBereich, FeldEinwilligung, FeldText, Honigtopf } from '@/components/formular/Felder';
import { Erfolg, FehlerZusammenfassung } from '@/components/formular/Rueckmeldung';
import { SendenKnopf } from '@/components/formular/SendenKnopf';
import { pfadFuer } from '@/i18n/navigation';
import type { FormularErgebnis } from '@/lib/formulare/ergebnis';

type Sprache = 'de' | 'tr' | 'en';
type Fehlerstand = Extract<FormularErgebnis, { status: 'fehler' }>;

/**
 * Kontaktformular der Seite /kontakt (B03, K-07, E-028): Server-Komponente ohne eigenes `<form>` – das umgibt
 * `FormularInsel`. Felder wie im Anmeldeformular der Veranstaltungen; `sendeKontakt` rendert es nach einem Fehler mit
 * Werten, Feldfehlern und neuem ALTCHA-Schlüssel neu (Lösungen sind einmalig). Die Seite rendert es leer.
 */
export async function KontaktFormular({
  sprache,
  ergebnis,
  altchaSchluessel,
}: {
  sprache: Sprache;
  ergebnis?: Fehlerstand;
  altchaSchluessel?: string;
}) {
  const [t, tf] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'kontaktformular' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  const fehlerTexte = tf.raw('fehler') as Record<string, string>;
  const w = ergebnis?.werte ?? {};
  const wert = (k: string) => (typeof w[k] === 'string' ? (w[k] as string) : undefined);
  const f = (k: string) => {
    const s = ergebnis?.feldFehler?.[k];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const datenschutz = { href: pfadFuer('/datenschutz', sprache), label: t('datenschutz') };
  const optional = <span className="font-normal text-tinte-2">{tf('optional')}</span>;
  return (
    <>
      {ergebnis ? (
        <FehlerZusammenfassung
          fehler={ergebnis.fehler}
          feldFehler={ergebnis.feldFehler}
          felder={{
            name: t('name'),
            email: t('email'),
            telefon: t('telefon'),
            betreff: t('betreff'),
            nachricht: t('nachricht'),
            einwilligung: datenschutz.label,
          }}
          texte={{ fehler: fehlerTexte, zusammenfassung: tf('zusammenfassung') }}
        />
      ) : null}
      <input type="hidden" name="sprache" value={sprache} />
      <FeldText
        name="name"
        label={t('name')}
        pflicht={tf('pflicht')}
        wert={wert('name')}
        autoComplete="name"
        maxLaenge={100}
        fehler={f('name')}
      />
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
      <FeldText
        name="telefon"
        typ="tel"
        label={
          <>
            {t('telefon')} {optional}
          </>
        }
        hinweis={t('telefonHinweis')}
        wert={wert('telefon')}
        autoComplete="tel"
        maxLaenge={30}
        fehler={f('telefon')}
      />
      <FeldText
        name="betreff"
        label={
          <>
            {t('betreff')} {optional}
          </>
        }
        wert={wert('betreff')}
        maxLaenge={100}
        fehler={f('betreff')}
      />
      <FeldBereich
        name="nachricht"
        label={t('nachricht')}
        pflicht={tf('pflicht')}
        wert={wert('nachricht')}
        zeilen={6}
        maxLaenge={2000}
        fehler={f('nachricht')}
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
      <div className="self-start">
        <SendenKnopf texte={{ senden: tf('senden'), sendet: tf('sendet') }} />
      </div>
    </>
  );
}

/** Erfolgsmeldung nach dem Absenden (E-028): auf dem Server gerendert, `FormularInsel` zeigt sie an. */
export async function KontaktErfolg({ sprache }: { sprache: Sprache }) {
  const tf = await getTranslations({ locale: sprache, namespace: 'formulare' });
  return <Erfolg text={tf('erfolg')} />;
}
