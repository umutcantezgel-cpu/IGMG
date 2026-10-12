import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { datumLang } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { endgueltigLoeschen, inPapierkorb, wiederherstellen } from '@/server/actions/kurse';
import { ladeKursListe } from '@/server/queries/verwaltung/kurse';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

type Zeile = Awaited<ReturnType<typeof ladeKursListe>>[number];

/** Verwaltung › Kurse (V06, Muster Veranstaltungen): Tabelle mit Papierkorb-Ansicht. */
export default async function KurseVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/kurse'>) {
  const a = await verlangeSeitenRecht('kurs.lesen');
  const papierkorb = (await searchParams).ansicht === 'papierkorb';
  const [t, liste] = await Promise.all([getTranslations('verwaltung.kurse'), ladeKursListe(papierkorb)]);
  const darfBearbeiten = darf(a.rollen, 'kurs.bearbeiten');
  const darfLoeschen = darf(a.rollen, 'kurs.loeschen');
  const ansichten = [
    { schluessel: 'aktiv', label: t('ansichtAktiv'), href: '/verwaltung/kurse', aktiv: !papierkorb },
    { schluessel: 'papierkorb', label: t('ansichtPapierkorb'), href: '/verwaltung/kurse?ansicht=papierkorb', aktiv: papierkorb },
  ];
  const spalten = ['titel', 'zielgruppe', 'zeiten', 'status', 'aktionen'] as const;
  const tg = await getTranslations('verwaltung.shell');
  const leer = liste.length === 0;
  // Anlegen steht im Kopf oder – bei leerer Liste – im Leerzustand, nie an beiden Stellen (K-16)
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/kurse/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );

  /** Aktionen einer Zeile: Tabelle und Telefonkarte teilen Knöpfe und Rechte. */
  const aktionen = (z: Zeile) =>
    papierkorb ? (
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
          <NextLink href={`/verwaltung/kurse/${z.id}`}>
            {darfBearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
            <span className="sr-only">
              {darfBearbeiten ? t('aktionBearbeiten', { titel: z.titel }) : t('aktionAnsehen', { titel: z.titel })}
            </span>
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

  // Telefon: je Kurs eine Karte. Eine Status-Pille; die Verfügbarkeit steht als Text darunter (K-16).
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
            { label: t('spalte.zielgruppe'), wert: z.zielgruppe ?? t('keineAngabe') },
            { label: t('spalte.zeiten'), wert: z.zeiten ?? t('keineAngabe') },
            {
              label: papierkorb ? t('spalte.imPapierkorbSeit') : t('spalte.status'),
              wert:
                papierkorb && z.imPapierkorbSeit ? (
                  datumLang(z.imPapierkorbSeit, 'de')
                ) : (
                  <span className="flex flex-col items-start gap-1.5">
                    <span className={cn(pille, z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
                      {t(`status.${z.status}`)}
                    </span>
                    <span className={cn(z.verfuegbarkeit === 'geschlossen' ? 'font-bold text-fehler' : 'text-tinte-2')}>
                      {t(`verfuegbarkeitText.${z.verfuegbarkeit}`)}
                    </span>
                  </span>
                ),
              zahl: papierkorb,
            },
          ]}
          aktionen={aktionen(z)}
        />
      ))}
    </ul>
  );

  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} aktion={darfBearbeiten && !leer ? anlegen : null} />
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
        <ListenLeer text={papierkorb ? t('leerPapierkorb') : t('leer')} aktion={darfBearbeiten && !papierkorb ? anlegen : undefined} />
      ) : (
        <TabellenRahmen beschriftung={t('titel')} mobil={mobil}>
          <table className="w-full min-w-184 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {spalten.map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {s === 'status' && papierkorb ? t('spalte.imPapierkorbSeit') : t(`spalte.${s}`)}
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
                  <td className="px-4 py-3">{z.zielgruppe ?? t('keineAngabe')}</td>
                  <td className="px-4 py-3">{z.zeiten ?? t('keineAngabe')}</td>
                  <td className="px-4 py-3">
                    {papierkorb && z.imPapierkorbSeit ? (
                      datumLang(z.imPapierkorbSeit, 'de')
                    ) : (
                      <span className="flex flex-wrap gap-1.5">
                        <span className={cn(pille, z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
                          {t(`status.${z.status}`)}
                        </span>
                        <span
                          className={cn(
                            pille,
                            z.verfuegbarkeit === 'geschlossen' ? 'bg-fehler-toenung text-fehler' : 'bg-gruen-50 text-gruen-800',
                          )}
                        >
                          {t(`verfuegbarkeitText.${z.verfuegbarkeit}`)}
                        </span>
                      </span>
                    )}
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
