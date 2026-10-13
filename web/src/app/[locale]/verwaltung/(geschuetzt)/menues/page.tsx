import { eq } from 'drizzle-orm';
import { RotateCcw } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { MenueEditor, type MenueGruppeWerte, type MenuePunktWerte } from '@/components/verwaltung/menues/MenueEditor';
import { Ansichten } from '@/components/verwaltung/seiten/Ansichten';
import { zielGruppen } from '@/components/verwaltung/seiten/optionen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { baueMenues } from '@/components/website/navigation';
import { pfadFuer, type Ziel } from '@/i18n/navigation';
import { db, schema } from '@/lib/db';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { fussMenue, kopfMenue } from '@/lib/validierung/menue';
import { menueZuruecksetzen, speichereMenue } from '@/server/actions/menues';

const SPRACHEN = ['de', 'tr', 'en'] as const;

/** Text in allen drei Sprachen aus einem Namensraum der Website (Bestandsmenü als Startwert). */
async function dreisprachig(namensraum: string) {
  const [de, tr, en] = await Promise.all(SPRACHEN.map((locale) => getTranslations({ locale, namespace: namensraum })));
  return (k: string) => ({ de: de(k), tr: tr(k), en: en(k) });
}

/** Bestand des Kopfmenüs (navigation.ts) in der Form des Editors: Gruppen, Einträge, Ziele als deutsche Pfade. */
async function kopfBestand(): Promise<MenueGruppeWerte[]> {
  const text = await dreisprachig('kopf');
  // Gleiche Struktur wie öffentlich; Texte je Sprache über die Schlüssel, Ziele als deutscher Pfad
  const schluessel = baueMenues(
    (k) => k,
    (ziel: Ziel) => pfadFuer(ziel, 'de'),
  );
  return schluessel.map((m) => ({
    titel: text(m.label),
    kinder: m.punkte.map((p) => ({ titel: text(p.label), beschreibung: text(p.beschreibung), ziel: p.href })),
  }));
}

/** Bestand des Schnellzugriffs im Fuß (Footer.tsx). */
async function fussBestand(): Promise<MenuePunktWerte[]> {
  const text = await dreisprachig('fuss');
  const liste: [string, string][] = [
    ['qGebetszeiten', '/gebetszeiten'],
    ['qVeranstaltungen', '/veranstaltungen'],
    ['qBildung', '/bildung/korankurse'],
    ['qSpenden', '/projekte'],
    ['qKontakt', '/kontakt'],
    ['qUeberUns', '/ueber-uns'],
  ];
  return liste.map(([k, ziel]) => ({ titel: text(k), beschreibung: { de: '' }, ziel }));
}

/**
 * Verwaltung › Menüs (ADR 0032): Kopf- und Fußmenü der Website. Ohne gespeichertes Menü steht der Bestand zum
 * Bearbeiten bereit; „Standardmenü wiederherstellen“ entfernt das gespeicherte Menü (mit Rückfrage).
 */
export default async function Menues({ searchParams }: PageProps<'/[locale]/verwaltung/menues'>) {
  await verlangeSeitenRecht('menue.bearbeiten');
  const schluessel = (await searchParams).menue === 'fuss' ? 'fuss' : 'kopf';
  const [t, tg, ziele, [zeile]] = await Promise.all([
    getTranslations('verwaltung.menues'),
    getTranslations('verwaltung.shell'),
    zielGruppen(),
    db.select().from(schema.menue).where(eq(schema.menue.schluessel, schluessel)).limit(1),
  ]);
  const gespeichert = zeile ? (schluessel === 'kopf' ? kopfMenue : fussMenue).safeParse(zeile.eintraege) : null;
  const start =
    gespeichert?.success && zeile
      ? (gespeichert.data as MenueGruppeWerte[] | MenuePunktWerte[])
      : schluessel === 'kopf'
        ? await kopfBestand()
        : await fussBestand();
  // Ziele des Bestands, die keine Option sind (z. B. Organisationsseiten), bleiben wählbar
  const bekannt = new Set([...ziele.seiten, ...ziele.bereiche].map((z) => z.wert));
  const alleZiele = (schluessel === 'kopf' ? (start as MenueGruppeWerte[]).flatMap((g) => g.kinder) : (start as MenuePunktWerte[])).map(
    (p) => p.ziel,
  );
  const zusatz = [...new Set(alleZiele.filter((z) => !bekannt.has(z)))].map((z) => ({ wert: z, label: z }));
  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einleitung')} />
      <Ansichten
        label={t('ansichten')}
        eintraege={[
          { schluessel: 'kopf', label: t('kopf'), href: '/verwaltung/menues', aktiv: schluessel === 'kopf' },
          { schluessel: 'fuss', label: t('fuss'), href: '/verwaltung/menues?menue=fuss', aktiv: schluessel === 'fuss' },
        ]}
      />
      <Meldung art="info">
        {zeile && gespeichert?.success
          ? t('eigenesAktiv', { datum: `${datumLang(zeile.aktualisiertAm, 'de')}, ${uhrzeit(zeile.aktualisiertAm, 'de')}` })
          : t('standardAktiv')}
      </Meldung>
      <p className="max-w-einleitung text-18 text-tinte-2">{t(schluessel === 'kopf' ? 'kopfHinweis' : 'fussHinweis')}</p>
      <MenueEditor
        key={`${schluessel}-${zeile ? 'eigen' : 'standard'}`}
        aktion={speichereMenue}
        schluessel={schluessel}
        start={start}
        ziele={{ seiten: ziele.seiten, bereiche: [...ziele.bereiche, ...zusatz] }}
      />
      {zeile ? (
        <details className="rounded-lg border border-linie bg-weiss p-5 md:p-6">
          <summary className="flex min-h-12 cursor-pointer items-center gap-2 font-bold">
            <RotateCcw aria-hidden className="size-5" />
            {t('zuruecksetzen')}
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <p className="max-w-einleitung text-16 text-tinte-2">{t('zuruecksetzenText', { menue: t(schluessel) })}</p>
            <form action={menueZuruecksetzen}>
              <input type="hidden" name="schluessel" value={schluessel} />
              <Button type="submit" variant="destructive">
                <RotateCcw aria-hidden />
                {t('zuruecksetzen')}
              </Button>
            </form>
          </div>
        </details>
      ) : null}
    </>
  );
}
