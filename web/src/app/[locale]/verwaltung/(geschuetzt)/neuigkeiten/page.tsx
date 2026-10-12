import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { datumLang } from '@/lib/i18n/format';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { endgueltigLoeschen, inPapierkorb, wiederherstellen } from '@/server/actions/neuigkeiten';
import { ladeVerwaltungsListe } from '@/server/queries/verwaltung/neuigkeiten';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

type Zeile = Awaited<ReturnType<typeof ladeVerwaltungsListe>>[number];

/** Verwaltung › Neuigkeiten (design/Dashboard.dc.html section=news, Blatt V03): Tabelle, Papierkorb. */
export default async function NeuigkeitenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/neuigkeiten'>) {
  const a = await verlangeSeitenRecht('nachricht.lesen');
  const papierkorb = (await searchParams).ansicht === 'papierkorb';
  // Organisationsredaktion sieht nur die eigene Organisation (K-06)
  const filter = organisationsFilter(a.rollen, 'nachricht.bearbeiten');
  const [t, tk, liste] = await Promise.all([
    getTranslations('verwaltung.neuigkeiten'),
    getTranslations('karten'),
    ladeVerwaltungsListe(papierkorb, filter),
  ]);
  const darfAnlegen = filter === null || filter.length > 0;
  const ansichten = [
    { schluessel: 'aktiv', label: t('ansichtAktiv'), href: '/verwaltung/neuigkeiten', aktiv: !papierkorb },
    { schluessel: 'papierkorb', label: t('ansichtPapierkorb'), href: '/verwaltung/neuigkeiten?ansicht=papierkorb', aktiv: papierkorb },
  ];
  const tg = await getTranslations('verwaltung.shell');
  const leer = liste.length === 0;
  // Anlegen steht im Kopf oder – bei leerer Liste – im Leerzustand, nie an beiden Stellen (K-16)
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/neuigkeiten/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );

  /** Aktionen einer Zeile: Tabelle und Telefonkarte teilen Knöpfe und Rechte (je Zeile wie bisher). */
  const aktionen = (z: Zeile) => {
    const darfBearbeiten = darf(a.rollen, 'nachricht.bearbeiten', { organisation: z.organisation });
    const darfLoeschen = darf(a.rollen, 'nachricht.loeschen', { organisation: z.organisation });
    return papierkorb ? (
      <>
        {darfBearbeiten ? (
          <form action={wiederherstellen}>
            <input type="hidden" name="id" value={z.id} />
            <Button type="submit" variant="outline" size="icon">
              <RotateCcw aria-hidden />
              <span className="sr-only">{t('aktionWiederherstellen', { titel: z.titel })}</span>
            </Button>
          </form>
        ) : null}
        {darfLoeschen ? (
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
    ) : (
      <>
        <Button asChild variant="outline" size="icon">
          <NextLink href={`/verwaltung/neuigkeiten/${z.id}`}>
            {darfBearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
            <span className="sr-only">{t('aktionBearbeiten', { titel: z.titel })}</span>
          </NextLink>
        </Button>
        {darfLoeschen ? (
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
  };

  // Telefon: je Nachricht eine Karte statt der breiten Tabelle (Muster der Veranstaltungsliste, H-B06)
  const mobil = (
    <ul className="flex flex-col gap-3">
      {liste.map((z) => (
        <ListenKarte
          key={z.id}
          titel={
            <>
              <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{z.titel}</span>
                {z.istBeispiel ? <span className={cn(pille, 'bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span> : null}
              </span>
            </>
          }
          angaben={[
            {
              label: papierkorb ? t('spalte.imPapierkorbSeit') : t('spalte.datum'),
              wert: datumLang(papierkorb && z.imPapierkorbSeit ? z.imPapierkorbSeit : z.datum, 'de'),
              zahl: true,
            },
            {
              label: t('spalte.kategorie'),
              wert: (
                <>
                  <span className="font-bold">{z.organisation ? z.organisation.toUpperCase() : t('allgemein')}</span>
                  <span className="block text-16 text-tinte-2">{tk(`nkat_${z.kategorie}`)}</span>
                </>
              ),
            },
            {
              label: t('spalte.status'),
              wert: (
                <span className={cn(pille, z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
                  {t(`status.${z.status}`)}
                </span>
              ),
            },
          ]}
          aktionen={aktionen(z)}
        />
      ))}
    </ul>
  );

  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} aktion={darfAnlegen && !leer ? anlegen : null} />
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
          <table className="w-full min-w-192 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['titel', 'datum', 'kategorie', 'status', 'aktionen'] as const).map((s) => (
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
                    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{z.titel}</span>
                      {z.istBeispiel ? <span className={cn(pille, 'bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span> : null}
                    </span>
                  </th>
                  <td className="px-4 py-3">{datumLang(papierkorb && z.imPapierkorbSeit ? z.imPapierkorbSeit : z.datum, 'de')}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold">{z.organisation ? z.organisation.toUpperCase() : t('allgemein')}</span>
                    <span className="block text-16 text-tinte-2">{tk(`nkat_${z.kategorie}`)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(pille, z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
                      {t(`status.${z.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">{aktionen(z)}</div>
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
