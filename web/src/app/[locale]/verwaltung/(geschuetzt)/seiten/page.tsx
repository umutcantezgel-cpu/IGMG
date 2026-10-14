import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { seiteEndgueltigLoeschen, seiteInPapierkorb, seiteWiederherstellen } from '@/server/actions/seiten';
import { ladeSeitenListe, type SeitenZeile } from '@/server/queries/verwaltung/seiten';

/** Zerstörende Zeilenaktion (Papierkorb): überall gleich ausgezeichnet wie „Endgültig löschen“ (SL-1). */
const ZERSTOEREND = 'border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler';

const STATUS_FARBE: Record<SeitenZeile['anzeige'], string> = {
  entwurf: 'bg-sand text-tinte-2',
  zur_pruefung: 'bg-info-toenung text-info',
  geplant: 'bg-warnung-toenung text-warnung',
  veroeffentlicht: 'bg-gruen-50 text-gruen-800',
};

/** Verwaltung › Seiten (ADR 0032): freie Seiten mit Status, Übersetzungsstand je Sprache und Papierkorb. */
export default async function SeitenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/seiten'>) {
  const a = await verlangeSeitenRecht('seite.lesen');
  const papierkorb = (await searchParams).ansicht === 'papierkorb';
  // Organisationsredaktion sieht nur die eigene Organisation (K-06)
  const filter = organisationsFilter(a.rollen, 'seite.bearbeiten');
  const jetzt = new Date();
  const [t, tg, liste] = await Promise.all([
    getTranslations('verwaltung.seiten'),
    getTranslations('verwaltung.shell'),
    ladeSeitenListe(papierkorb, filter, jetzt),
  ]);
  const darfAnlegen = filter === null || filter.length > 0;
  const leer = liste.length === 0;
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/seiten/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );

  const status = (z: SeitenZeile) => (
    <span className="flex flex-col items-start gap-1">
      <span className={cn(PILLE, STATUS_FARBE[z.anzeige])}>
        {z.anzeige === 'zur_pruefung' && z.pruefArt ? t('statusPruefung', { art: t(`pruefArt.${z.pruefArt}`) }) : t(`status.${z.anzeige}`)}
      </span>
      {z.anzeige === 'geplant' && z.veroeffentlichenAm ? (
        <span className="text-16 text-tinte-2">
          {t('geplantAb', { datum: datumLang(z.veroeffentlichenAm, 'de'), zeit: uhrzeit(z.veroeffentlichenAm, 'de') })}
        </span>
      ) : null}
    </span>
  );

  const uebersetzung = (z: SeitenZeile) => (
    <span className="flex flex-col gap-1.5">
      {(['tr', 'en'] as const).map((s) => (
        <span key={s} className="flex items-center gap-2 text-16">
          <span className="w-8 font-bold">{s.toUpperCase()}</span>
          <span aria-hidden className="h-2 w-20 overflow-hidden rounded-pill bg-sand">
            <span className="block h-full rounded-pill bg-gruen-700" style={{ width: `${z.uebersetzung[s]}%` }} />
          </span>
          <span className="whitespace-nowrap tabular-nums">{t('prozent', { wert: z.uebersetzung[s] })}</span>
          <span className="sr-only">{t(`sprache.${s}`)}</span>
        </span>
      ))}
    </span>
  );

  const titel = (z: SeitenZeile) => (
    <span className="flex flex-col gap-1">
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{z.titel}</span>
        {z.istBeispiel ? <span className={cn(PILLE, 'bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span> : null}
      </span>
      <span className="text-16 font-normal text-tinte-2">/{z.slugDe}</span>
    </span>
  );

  const aktionen = (z: SeitenZeile) => {
    const darfBearbeiten = darf(a.rollen, 'seite.bearbeiten', { organisation: z.organisation });
    const darfLoeschen = darf(a.rollen, 'seite.veroeffentlichen', { organisation: z.organisation });
    // Hauptaktion mit sichtbarem Text, zerstörende Aktion als Symbol mit Tooltip und vollem Namen (SL-1)
    return papierkorb ? (
      <>
        {darfBearbeiten ? (
          <form action={seiteWiederherstellen}>
            <input type="hidden" name="id" value={z.id} />
            <Button type="submit" variant="outline" aria-label={t('aktionWiederherstellen', { titel: z.titel })}>
              <RotateCcw aria-hidden />
              {t('wiederherstellenKurz')}
            </Button>
          </form>
        ) : null}
        {darfLoeschen ? (
          <span title={t('endgueltigLoeschen')} className="contents">
            <LoeschenBestaetigen
              id={z.id}
              aktion={seiteEndgueltigLoeschen}
              texte={{
                ausloeser: t('aktionLoeschen', { titel: z.titel }),
                titel: t('loeschenTitel'),
                text: t('loeschenText', { titel: z.titel }),
                bestaetigen: t('endgueltigLoeschen'),
                abbrechen: t('abbrechen'),
              }}
            />
          </span>
        ) : null}
      </>
    ) : (
      <>
        <Button asChild variant="outline">
          <NextLink
            href={`/verwaltung/seiten/${z.id}`}
            aria-label={t(darfBearbeiten ? 'aktionBearbeiten' : 'aktionAnsehen', { titel: z.titel })}
          >
            {darfBearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
            {t(darfBearbeiten ? 'bearbeitenKurz' : 'ansehenKurz')}
          </NextLink>
        </Button>
        {darfBearbeiten ? (
          <form action={seiteInPapierkorb}>
            <input type="hidden" name="id" value={z.id} />
            <Button
              type="submit"
              variant="outline"
              size="icon"
              className={ZERSTOEREND}
              title={t('inDenPapierkorb')}
              aria-label={t('aktionPapierkorb', { titel: z.titel })}
            >
              <Trash2 aria-hidden />
            </Button>
          </form>
        ) : null}
      </>
    );
  };

  const mobil = (
    <ul className="flex flex-col gap-3">
      {liste.map((z) => (
        <ListenKarte
          key={z.id}
          titel={titel(z)}
          angaben={[
            { label: t('spalte.status'), wert: status(z) },
            { label: t('spalte.uebersetzung'), wert: uebersetzung(z) },
            {
              label: papierkorb ? t('spalte.imPapierkorbSeit') : t('spalte.geaendert'),
              wert: datumLang(papierkorb && z.imPapierkorbSeit ? z.imPapierkorbSeit : z.aktualisiertAm, 'de'),
              zahl: true,
            },
          ]}
          aktionen={aktionen(z)}
        />
      ))}
    </ul>
  );

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={darfAnlegen && !leer ? anlegen : null}
      />
      <Ansichten
        label={t('ansichten')}
        eintraege={[
          { schluessel: 'aktiv', label: t('ansichtAktiv'), href: '/verwaltung/seiten', aktiv: !papierkorb },
          { schluessel: 'papierkorb', label: t('ansichtPapierkorb'), href: '/verwaltung/seiten?ansicht=papierkorb', aktiv: papierkorb },
        ]}
      />
      {papierkorb ? <Meldung art="info">{t('papierkorbHinweis')}</Meldung> : null}
      {leer ? (
        <ListenLeer text={papierkorb ? t('leerPapierkorb') : t('leer')} aktion={darfAnlegen && !papierkorb ? anlegen : undefined} />
      ) : (
        <TabellenRahmen beschriftung={t('titel')} mobil={mobil}>
          <table className="w-full min-w-192 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['titel', 'status', 'uebersetzung', 'geaendert', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {s === 'geaendert' && papierkorb ? t('spalte.imPapierkorbSeit') : t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((z) => (
                <tr key={z.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold">
                    {titel(z)}
                  </th>
                  <td className="px-4 py-3">{status(z)}</td>
                  <td className="px-4 py-3">{uebersetzung(z)}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {datumLang(papierkorb && z.imPapierkorbSeit ? z.imPapierkorbSeit : z.aktualisiertAm, 'de')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">{aktionen(z)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
