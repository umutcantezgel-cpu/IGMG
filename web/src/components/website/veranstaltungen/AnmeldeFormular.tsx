import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldAuswahl, FeldHaken, FeldText, Honigtopf } from '@/components/formular/Felder';
import { Erfolg, FehlerZusammenfassung } from '@/components/formular/Rueckmeldung';
import { SendenKnopf } from '@/components/formular/SendenKnopf';
import { pfadFuer } from '@/i18n/navigation';
import type { FormularErgebnis } from '@/lib/formulare/ergebnis';

type Sprache = 'de' | 'tr' | 'en';
type Fehlerstand = Extract<FormularErgebnis, { status: 'fehler' }>;

/**
 * Anmeldeformular der Veranstaltungsdetailseite (B04, E-020, E-028): Server-Komponente – die Seite rendert es leer,
 * `meldeAn` nach einem Fehler mit Werten, Feldfehlern und neuem ALTCHA-Schlüssel. Ein Schritt, Platzauswahl begrenzt.
 */
export async function AnmeldeFormular({
  veranstaltungId,
  sprache,
  verfuegbar,
  ergebnis,
  altchaSchluessel,
}: {
  veranstaltungId: string;
  sprache: Sprache;
  /** freie Plätze; null = unbegrenzt */
  verfuegbar: number | null;
  ergebnis?: Fehlerstand;
  altchaSchluessel?: string;
}) {
  const [t, tf] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'veranstaltung.formular' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  const fehlerTexte: Record<string, string> = {
    ...(tf.raw('fehler') as Record<string, string>),
    ausgebucht: t('ausgebucht'),
    geschlossen: t('geschlossen'),
  };
  const w = ergebnis?.werte ?? {};
  const wert = (k: string) => (typeof w[k] === 'string' ? (w[k] as string) : undefined);
  const f = (k: string) => {
    const s = ergebnis?.feldFehler?.[k];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const datenschutz = { href: pfadFuer('/datenschutz', sprache), label: t('datenschutz') };
  // Formularmuster der Voranmeldung: Felder je Gruppe mit gap-4, Gruppen und Knopf mit gap-6, Knopf volle Breite
  return (
    // Abgesetzt vom Belegungsblock darüber (nur hier, damit geschlossen/ausgebucht keine leere Linie entsteht)
    <div className="flex min-w-0 flex-col gap-6 border-t border-linie pt-6">
      {ergebnis ? (
        <FehlerZusammenfassung
          fehler={ergebnis.fehler}
          feldFehler={ergebnis.feldFehler}
          felder={{ name: t('name'), email: t('email'), telefon: t('telefon'), personen: t('personen'), einwilligung: datenschutz.label }}
          texte={{ fehler: fehlerTexte, zusammenfassung: tf('zusammenfassung') }}
        />
      ) : null}
      <input type="hidden" name="veranstaltungId" value={veranstaltungId} />
      <input type="hidden" name="sprache" value={sprache} />
      <div className="flex flex-col gap-4">
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
              {t('telefon')} <span className="font-normal text-tinte-2">{tf('optional')}</span>
            </>
          }
          hinweis={t('telefonHinweis')}
          wert={wert('telefon')}
          autoComplete="tel"
          maxLaenge={30}
          fehler={f('telefon')}
        />
        <FeldAuswahl
          name="personen"
          label={t('personen')}
          pflicht={tf('pflicht')}
          hinweis={verfuegbar !== null ? t('personenHinweis', { verfuegbar }) : undefined}
          wert={wert('personen') ?? '1'}
          optionen={Array.from({ length: Math.max(1, Math.min(10, verfuegbar ?? 10)) }, (_, i) => ({
            wert: String(i + 1),
            label: String(i + 1),
          }))}
          fehler={f('personen')}
        />
      </div>
      <div className="flex flex-col gap-4">
        <FeldHaken
          name="einwilligung"
          label={t('einwilligung')}
          pflicht={tf('pflicht')}
          wert={wert('einwilligung') === 'ja'}
          fehler={f('einwilligung')}
        />
        <p className="text-16">
          <a href={datenschutz.href} className="font-bold underline underline-offset-2">
            {datenschutz.label}
          </a>
        </p>
      </div>
      <Honigtopf label={tf('honigtopf')} />
      <AltchaFeld key={altchaSchluessel} sprache={sprache} texte={{ label: tf('altcha.label'), hinweis: tf('altcha.hinweis') }} />
      <SendenKnopf className="w-full" texte={{ senden: t('senden'), sendet: tf('sendet') }} />
    </div>
  );
}

export async function AnmeldeErfolg({ sprache }: { sprache: Sprache }) {
  const t = await getTranslations({ locale: sprache, namespace: 'veranstaltung.formular' });
  return <Erfolg text={t('erfolg')} />;
}
