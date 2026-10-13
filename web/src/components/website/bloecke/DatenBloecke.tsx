import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { EventCard } from '@/components/website/EventCard';
import { NewsCard } from '@/components/website/NewsCard';
import { oeffnungszeitText } from '@/components/website/fuss/zeiten';
import { Link } from '@/i18n/link';
import type { Ziel } from '@/i18n/navigation';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { text, type Sprache } from '@/lib/i18n/inhalt';
import { telefonHref } from '@/lib/telefon';
import type { BlockVon } from '@/lib/validierung/bloecke';
import { datumszeilen } from '@/lib/zeit/datumszeilen';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';
import { ladeNachrichten } from '@/server/queries/nachrichten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';
import { GebetszeitenHeute } from './GebetszeitenHeute';
import { BlockKopf, BlockRahmen, tx } from './hilfen';

const LOCALE: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };
const MEHR_LINK =
  'inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800';

/** Überschrift: eigener Titel des Bausteins oder der Standardtitel aus den Sprachdateien. */
function kopf(b: { id: string; titel: { de: string; tr?: string; en?: string } }, sprache: Sprache, standard: string) {
  const eigen = tx(b.titel, sprache);
  return { id: `b-${b.id}`, text: eigen.text || standard, lang: eigen.text ? eigen.lang : undefined };
}

function MehrLink({ ziel, text: inhalt }: { ziel: Ziel; text: string }) {
  return (
    <Link href={ziel} className={MEHR_LINK}>
      {inhalt}
      <ArrowRight aria-hidden className="size-5" />
    </Link>
  );
}

/** Baustein „Nächste Termine“: die nächsten n Veranstaltungen aus dem Bestand (gecacht, Tag veranstaltungen). */
export async function TermineAnsicht({ b, sprache }: { b: BlockVon<'termine'>; sprache: Sprache }) {
  const [t, alle] = await Promise.all([getTranslations({ locale: sprache, namespace: 'bloecke' }), ladeVeranstaltungen()]);
  const termine = alle.filter((v) => !v.vergangen && (!b.organisation || v.organisation === b.organisation)).slice(0, b.anzahl);
  const k = kopf(b, sprache, t('termineTitel'));
  return (
    <BlockRahmen breit beschriftung={k.id}>
      <BlockKopf id={k.id} titel={k.text} lang={k.lang} />
      {termine.length ? (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {termine.map((v) => (
            <li key={v.id} className="flex">
              <EventCard v={v} sprache={sprache} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-linie bg-weiss px-5 py-6 text-18 text-tinte-2">{t('keineTermine')}</p>
      )}
      <MehrLink ziel="/veranstaltungen" text={t('alleTermine')} />
    </BlockRahmen>
  );
}

/** Baustein „Neueste Nachrichten“: die neuesten n Beiträge (gecacht, Tag nachrichten). */
export async function NachrichtenAnsicht({ b, sprache }: { b: BlockVon<'nachrichten'>; sprache: Sprache }) {
  const [t, alle] = await Promise.all([getTranslations({ locale: sprache, namespace: 'bloecke' }), ladeNachrichten()]);
  const liste = alle.slice(0, b.anzahl);
  const k = kopf(b, sprache, t('nachrichtenTitel'));
  return (
    <BlockRahmen breit beschriftung={k.id}>
      <BlockKopf id={k.id} titel={k.text} lang={k.lang} />
      {liste.length ? (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liste.map((n) => (
            <li key={n.id} className="flex">
              <NewsCard n={n} sprache={sprache} bild={n.bild} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-linie bg-weiss px-5 py-6 text-18 text-tinte-2">{t('keineNachrichten')}</p>
      )}
      <MehrLink ziel="/nachrichten" text={t('alleNachrichten')} />
    </BlockRahmen>
  );
}

/** Baustein „Kontakt“: Kontaktkarte aus „Seiteninhalte › Kontaktdaten“ (Platzhalter bis zur Pflege). */
export async function KontaktAnsicht({ b, sprache }: { b: BlockVon<'kontakt'>; sprache: Sprache }) {
  const [t, kontakt] = await Promise.all([getTranslations({ locale: sprache, namespace: 'bloecke' }), ladeSeiteninhalt('kontakt')]);
  const k = kopf(b, sprache, t('kontaktTitel'));
  const telefon = telefonHref(kontakt.telefon);
  const zeile = 'flex min-h-12 items-center gap-3 text-18';
  return (
    <BlockRahmen beschriftung={k.id}>
      <BlockKopf id={k.id} titel={k.text} lang={k.lang} />
      <div className="grid gap-6 rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:grid-cols-2 md:p-8">
        <address className="flex flex-col not-italic">
          <span className={zeile}>
            <MapPin aria-hidden className="size-5 shrink-0 text-gruen-700" />
            <span>{kontakt.adresse}</span>
          </span>
          {telefon ? (
            <a href={telefon} className={`${zeile} underline underline-offset-4`}>
              <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span>{kontakt.telefon}</span>
            </a>
          ) : (
            <span className={zeile}>
              <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span>{kontakt.telefon}</span>
            </span>
          )}
          <a href={`mailto:${kontakt.email}`} className={`${zeile} underline underline-offset-4`}>
            <Mail aria-hidden className="size-5 shrink-0 text-gruen-700" />
            <span>{kontakt.email}</span>
          </a>
        </address>
        {kontakt.oeffnungszeiten.length ? (
          <div className="flex flex-col gap-2">
            <p className="font-bold">{t('oeffnungszeiten')}</p>
            <dl className="grid raster-symbol gap-x-4 gap-y-1.5 text-18">
              {kontakt.oeffnungszeiten.map((z) => (
                <div key={z.zeiten + z.tage.de} className="contents">
                  <dt className="text-tinte-2">{text(z.tage, sprache)}</dt>
                  <dd className="font-bold">{oeffnungszeitText(z, sprache)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
      <MehrLink ziel="/kontakt" text={t('zurKontaktseite')} />
    </BlockRahmen>
  );
}

/** Baustein „Gebetszeiten heute“: die sechs Zeiten des Tages (gecachtes Fenster, Tag gebetszeiten; Tageswahl im Browser). */
export async function GebetszeitenAnsicht({ b, sprache }: { b: BlockVon<'gebetszeiten'>; sprache: Sprache }) {
  const [t, tl, fenster] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'bloecke' }),
    getTranslations({ locale: sprache, namespace: 'leiste' }),
    ladeGebetszeitenFenster(),
  ]);
  const k = kopf(b, sprache, tl('listeHeute'));
  const namen = Object.fromEntries(GEBETE.map((g) => [g, tl(g)])) as Record<Gebet, string>;
  // Nur gestern bis übermorgen an den Browser: genug für den Tageswechsel, wenig Daten
  const i = Math.max(
    0,
    fenster.tage.findIndex((x) => x.datum === fenster.referenz),
  );
  const tage = fenster.tage.slice(Math.max(0, i - 1), i + 3).map(({ datum, imsak, gunes, ogle, ikindi, aksam, yatsi }) => ({
    datum,
    imsak,
    gunes,
    ogle,
    ikindi,
    aksam,
    yatsi,
  }));
  return (
    <BlockRahmen breit beschriftung={k.id}>
      <BlockKopf id={k.id} titel={k.text} lang={k.lang} />
      <GebetszeitenHeute
        tage={tage}
        referenz={fenster.referenz}
        namen={namen}
        datumszeilen={datumszeilen(
          tage.map((x) => x.datum),
          LOCALE[sprache],
        )}
        uhrSuffix={tl('uhr', { zeit: '' }).trim() || null}
      />
      {fenster.quelle === 'berechnet' && !fenster.bestaetigt ? <p className="text-16 text-tinte-2">{t('gebetszeitenBerechnet')}</p> : null}
      <MehrLink ziel="/gebetszeiten" text={tl('alle')} />
    </BlockRahmen>
  );
}
