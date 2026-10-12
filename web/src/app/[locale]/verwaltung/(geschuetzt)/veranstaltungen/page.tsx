import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { KUERZEL_TON } from '@/components/verwaltung/organisationTon';
import { KENNUNG } from '@/components/verwaltung/seiteninhalte-organisationen/bereiche';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumKurz, datumLang, zeitspanne } from '@/lib/i18n/format';
import { lokaleTeile } from '@/lib/termine';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { endgueltigLoeschen, inPapierkorb, wiederherstellen } from '@/server/actions/veranstaltungen';
import { ladeVerwaltungsListe } from '@/server/queries/verwaltung/veranstaltungen';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

type Zeile = Awaited<ReturnType<typeof ladeVerwaltungsListe>>[number];

/**
 * Aktionen einer Zeile (Bearbeiten, Papierkorb, Wiederherstellen, endgültig löschen), gleiche Knöpfe und Rechte in
 * Tabelle und Telefonkarte (H-B06). Die Rechte gibt die Seite vor.
 */
async function ZeilenAktionen({
  z,
  papierkorb,
  bearbeiten,
  loeschen,
}: {
  z: Zeile;
  papierkorb: boolean;
  bearbeiten: boolean;
  loeschen: boolean;
}) {
  const t = await getTranslations('verwaltung.veranstaltungen');
  if (papierkorb) {
    return (
      <>
        {bearbeiten ? (
          <form action={wiederherstellen}>
            <input type="hidden" name="id" value={z.id} />
            <Button type="submit" variant="outline" size="icon">
              <RotateCcw aria-hidden />
              <span className="sr-only">{t('aktionWiederherstellen', { titel: z.titel })}</span>
            </Button>
          </form>
        ) : null}
        {loeschen ? (
          <LoeschenBestaetigen
            id={z.id}
            aktion={endgueltigLoeschen}
            texte={{
              ausloeser: t('aktionLoeschen', { titel: z.titel }),
              titel: t('loeschenTitel'),
              text: t('loeschenText', { titel: z.titel }),
              bestaetigen: t('endgueltigLoeschen'),
              abbrechen: t('abbrechen'),
            }}
          />
        ) : null}
      </>
    );
  }
  return (
    <>
      <Button asChild variant="outline" size="icon">
        <NextLink href={`/verwaltung/veranstaltungen/${z.id}`}>
          {bearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
          <span className="sr-only">{t('aktionBearbeiten', { titel: z.titel })}</span>
        </NextLink>
      </Button>
      {loeschen ? (
        <form action={inPapierkorb}>
          <input type="hidden" name="id" value={z.id} />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            className="border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler"
          >
            <Trash2 aria-hidden />
            <span className="sr-only">{t('aktionPapierkorb', { titel: z.titel })}</span>
          </Button>
        </form>
      ) : null}
    </>
  );
}

/** Verwaltung › Veranstaltungen (design/Dashboard.dc.html section=events, Blatt V02): Tabelle, Papierkorb. */
export default async function VeranstaltungenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/veranstaltungen'>) {
  const a = await verlangeSeitenRecht('veranstaltung.lesen');
  const papierkorb = (await searchParams).ansicht === 'papierkorb';
  // Organisationsredaktion sieht nur die eigene Organisation (K-06, Befund SP-P3 M1)
  const filter = organisationsFilter(a.rollen, 'veranstaltung.bearbeiten');
  const [t, tk, tg, liste] = await Promise.all([
    getTranslations('verwaltung.veranstaltungen'),
    getTranslations('karten'),
    getTranslations('verwaltung.shell'),
    ladeVerwaltungsListe(papierkorb, filter),
  ]);
  const darfAnlegen = filter === null || filter.length > 0;
  const ansichten = [
    { schluessel: 'aktiv', label: t('ansichtAktiv'), href: '/verwaltung/veranstaltungen', aktiv: !papierkorb },
    { schluessel: 'papierkorb', label: t('ansichtPapierkorb'), href: '/verwaltung/veranstaltungen?ansicht=papierkorb', aktiv: papierkorb },
  ];

  const rechte = (z: Zeile) => ({
    bearbeiten: darf(a.rollen, 'veranstaltung.bearbeiten', { organisation: z.organisation }),
    loeschen: darf(a.rollen, 'veranstaltung.loeschen', { organisation: z.organisation }),
  });
  const datum = (z: Zeile) =>
    papierkorb && z.imPapierkorbSeit ? (
      datumLang(z.imPapierkorbSeit, 'de')
    ) : (
      <>
        <span className="whitespace-nowrap">
          {datumKurz(z.beginn, 'de')} {lokaleTeile(z.beginn).jahr},
        </span>{' '}
        <span className="whitespace-nowrap">{zeitspanne(z.beginn, z.ende, 'de')}</span>
        {z.wiederkehrend ? <span className="block text-16 text-tinte-2">{t('wiederkehrend')}</span> : null}
      </>
    );
  const kategorie = (z: Zeile) => (
    <>
      {z.organisation ? (
        <span className={cn(pille, KUERZEL_TON[z.organisation])}>{KENNUNG[z.organisation]}</span>
      ) : (
        <span className={cn(pille, 'bg-sand text-tinte-2')}>{t('allgemein')}</span>
      )}
      <span className="block text-16 text-tinte-2">{tk(`kat_${z.kategorie}`)}</span>
    </>
  );
  const status = (z: Zeile) => (
    <>
      <span className={cn(pille, z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
        {t(`status.${z.status}`)}
      </span>
      <span className="block text-16 text-tinte-2">{t(z.vergangen ? 'status.vergangen' : 'status.kommend')}</span>
    </>
  );
  const teilnehmer = (z: Zeile) =>
    !z.anmeldungAktiv
      ? t('keineAnmeldung')
      : z.plaetze !== null
        ? `${z.angemeldet} / ${z.plaetze}`
        : t('unbegrenzt', { angemeldet: z.angemeldet });

  // Telefon: je Veranstaltung eine Karte statt der breiten Tabelle (H-B06 Muster, Inhaltsliste)
  const mobil = (
    <ul className="flex flex-col gap-3">
      {liste.map((z) => (
        <li key={z.id} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4">
          <h2 className="font-text text-20 font-bold tracking-normal">
            {z.titel}
            {z.istBeispiel ? <span className={cn(pille, 'ml-2 bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span> : null}
          </h2>
          <dl className="grid raster-symbol gap-x-3 gap-y-2 text-16">
            <dt className="font-bold text-tinte-2">{papierkorb ? t('spalte.imPapierkorbSeit') : t('spalte.datum')}</dt>
            <dd>{datum(z)}</dd>
            <dt className="font-bold text-tinte-2">{t('spalte.kategorie')}</dt>
            <dd>{kategorie(z)}</dd>
            <dt className="font-bold text-tinte-2">{t('spalte.status')}</dt>
            <dd>{status(z)}</dd>
            <dt className="font-bold text-tinte-2">{t('spalte.teilnehmer')}</dt>
            <dd className="tabular-nums">{teilnehmer(z)}</dd>
          </dl>
          <div className="flex justify-end gap-2">
            <ZeilenAktionen z={z} papierkorb={papierkorb} {...rechte(z)} />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        aktion={
          darfAnlegen ? (
            <Button asChild>
              <NextLink href="/verwaltung/veranstaltungen/neu">
                <Plus aria-hidden />
                {t('neu')}
              </NextLink>
            </Button>
          ) : null
        }
      />
      <nav aria-label={t('ansichten')}>
        <ul className="flex gap-2">
          {ansichten.map((v) => (
            <li key={v.schluessel}>
              <NextLink
                href={v.href}
                aria-current={v.aktiv ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-12 items-center rounded-pill border px-4 font-bold no-underline',
                  v.aktiv
                    ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss'
                    : 'border-rand bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte',
                )}
              >
                {v.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
      {papierkorb ? <Meldung art="info">{t('papierkorbHinweis')}</Meldung> : null}
      {liste.length === 0 ? (
        <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{papierkorb ? t('leerPapierkorb') : t('leer')}</p>
      ) : (
        <TabellenRahmen beschriftung={t('titel')} mobil={mobil}>
          <table className="w-full border-collapse text-left md:min-w-224">
            <thead className="bg-sand">
              <tr>
                {(['titel', 'datum', 'kategorie', 'status', 'teilnehmer', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {s === 'datum' && papierkorb ? t('spalte.imPapierkorbSeit') : t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((z) => (
                <tr key={z.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold">
                    {z.titel}
                    {z.istBeispiel ? (
                      <span className={cn(pille, 'ml-2 bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3 tabular-nums">{datum(z)}</td>
                  <td className="px-4 py-3">{kategorie(z)}</td>
                  <td className="px-4 py-3">{status(z)}</td>
                  <td className="px-4 py-3 tabular-nums">{teilnehmer(z)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ZeilenAktionen z={z} papierkorb={papierkorb} {...rechte(z)} />
                    </div>
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
