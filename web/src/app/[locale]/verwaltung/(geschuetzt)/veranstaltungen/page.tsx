import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { KUERZEL_TON } from '@/components/verwaltung/organisationTon';
import { KENNUNG } from '@/components/verwaltung/seiteninhalte-organisationen/bereiche';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
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
            className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler focus-visible:text-fehler"
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
  const datum = (z: Zeile, karte = false) =>
    papierkorb && z.imPapierkorbSeit ? (
      datumLang(z.imPapierkorbSeit, 'de')
    ) : (
      <>
        <span className={karte ? 'whitespace-nowrap' : undefined}>
          {datumKurz(z.beginn, 'de')} {lokaleTeile(z.beginn).jahr},
        </span>{' '}
        <span className="whitespace-nowrap">{zeitspanne(z.beginn, z.ende, 'de')}</span>
        {z.wiederkehrend ? (
          karte ? (
            <span className="text-tinte-2"> · {t('wiederkehrend')}</span>
          ) : (
            <span className="block text-16 text-tinte-2">{t('wiederkehrend')}</span>
          )
        ) : null}
      </>
    );
  const orgPille = (z: Zeile) =>
    z.organisation ? (
      <span className={cn(pille, KUERZEL_TON[z.organisation])}>{KENNUNG[z.organisation]}</span>
    ) : (
      <span className={cn(pille, 'bg-sand text-tinte-2')}>{t('allgemein')}</span>
    );
  const kategorie = (z: Zeile) => (
    <>
      {orgPille(z)}
      <span className="block text-16 text-tinte-2">{tk(`kat_${z.kategorie}`)}</span>
    </>
  );
  // In „Aktuell“ zeigt der Status nur die Pille; im Papierkorb steht zusätzlich kommend/vergangen darunter
  const status = (z: Zeile) => (
    <>
      <span className={cn(pille, z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
        {t(`status.${z.status}`)}
      </span>
      {papierkorb ? <span className="block text-16 text-tinte-2">{t(z.vergangen ? 'status.vergangen' : 'status.kommend')}</span> : null}
    </>
  );
  const teilnehmer = (z: Zeile) =>
    !z.anmeldungAktiv
      ? t('keineAnmeldung')
      : z.plaetze !== null
        ? `${z.angemeldet} / ${z.plaetze}`
        : t('unbegrenzt', { angemeldet: z.angemeldet });
  const leer = liste.length === 0;
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/veranstaltungen/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );

  // Aktuell: kommende und vergangene Veranstaltungen als Gruppen, leere Gruppen entfallen (H-C04); der Papierkorb bleibt ungegliedert
  const gruppen = papierkorb
    ? null
    : (['kommend', 'vergangen'] as const)
        .map((g) => ({ g, eintraege: liste.filter((z) => z.vergangen === (g === 'vergangen')) }))
        .filter((gruppe) => gruppe.eintraege.length > 0);

  const zeile = (z: Zeile) => (
    <tr key={z.id} className="border-t border-linie align-middle">
      <th scope="row" className="px-3 py-3 font-bold">
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{z.titel}</span>
          {z.istBeispiel ? <span className={cn(pille, 'bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span> : null}
        </span>
      </th>
      <td className="px-3 py-3 tabular-nums">{datum(z)}</td>
      <td className="px-3 py-3">{kategorie(z)}</td>
      <td className="px-3 py-3">{status(z)}</td>
      <td className="px-3 py-3 tabular-nums">{teilnehmer(z)}</td>
      <td className="px-3 py-3">
        <div className="flex gap-2">
          <ZeilenAktionen z={z} papierkorb={papierkorb} {...rechte(z)} />
        </div>
      </td>
    </tr>
  );

  // Telefon: je Veranstaltung eine Karte statt der breiten Tabelle (H-B06 Muster; H-C04 Telefonkarte)
  const karte = (z: Zeile) => (
    <li key={z.id} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4">
      <h3 className="font-text text-20 font-bold tracking-normal">
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{z.titel}</span>
          {z.istBeispiel ? <span className={cn(pille, 'bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span> : null}
        </span>
      </h3>
      <dl className="flex flex-col gap-2 text-16">
        <div>
          <dt className={papierkorb ? 'font-bold text-tinte-2' : 'sr-only'}>
            {papierkorb ? t('spalte.imPapierkorbSeit') : t('spalte.datum')}
          </dt>
          <dd>{datum(z, true)}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="sr-only">{t('spalte.kategorie')}</dt>
          <dd>{orgPille(z)}</dd>
          <dd className="text-tinte-2">{tk(`kat_${z.kategorie}`)}</dd>
          <dt className="sr-only">{t('spalte.status')}</dt>
          <dd>{status(z)}</dd>
        </div>
        {z.anmeldungAktiv ? (
          <div>
            <dt className="font-bold text-tinte-2">{t('spalte.teilnehmer')}</dt>
            <dd className="tabular-nums">{teilnehmer(z)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="flex justify-end gap-2">
        <ZeilenAktionen z={z} papierkorb={papierkorb} {...rechte(z)} />
      </div>
    </li>
  );
  const mobil = gruppen ? (
    gruppen.map(({ g, eintraege }) => (
      <section key={g} aria-labelledby={`veranstaltungen-${g}`} className="flex flex-col gap-3">
        <h2 id={`veranstaltungen-${g}`} className="text-24">
          {t(`status.${g}`)}
        </h2>
        <ul className="flex flex-col gap-3">{eintraege.map(karte)}</ul>
      </section>
    ))
  ) : (
    <ul className="flex flex-col gap-3">{liste.map(karte)}</ul>
  );

  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} aktion={darfAnlegen && !papierkorb && !leer ? anlegen : null} />
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
      {leer ? (
        <ListenLeer text={papierkorb ? t('leerPapierkorb') : t('leer')} aktion={darfAnlegen && !papierkorb ? anlegen : undefined} />
      ) : (
        <TabellenRahmen beschriftung={t('titel')} mobil={mobil}>
          <table className="w-full min-w-220 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['titel', 'datum', 'kategorie', 'status', 'teilnehmer', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-3 py-3 text-16 font-bold">
                    {s === 'datum' && papierkorb ? t('spalte.imPapierkorbSeit') : t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            {gruppen ? (
              gruppen.map(({ g, eintraege }) => (
                <tbody key={g}>
                  <tr className="border-t border-linie">
                    <th scope="rowgroup" colSpan={6} className="bg-papier px-3 py-2 text-left text-16 font-bold text-tinte-2">
                      {t(`status.${g}`)}
                    </th>
                  </tr>
                  {eintraege.map(zeile)}
                </tbody>
              ))
            ) : (
              <tbody>{liste.map(zeile)}</tbody>
            )}
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
