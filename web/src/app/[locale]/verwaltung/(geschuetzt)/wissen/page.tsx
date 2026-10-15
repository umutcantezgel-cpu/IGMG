import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ReihenfolgeEditor } from '@/components/verwaltung/reihenfolge/ReihenfolgeEditor';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumLang } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import {
  speichereWissensReihenfolge,
  wissensThemaEndgueltigLoeschen,
  wissensThemaInPapierkorb,
  wissensThemaWiederherstellen,
} from '@/server/actions/wissen';
import { ladeWissensListe, type WissenListenZeile } from '@/server/queries/verwaltung/wissen';

const FREIGABE_FARBE = {
  entwurf: 'bg-sand text-tinte-2',
  zur_pruefung: 'bg-info-toenung text-info',
  geprueft: 'bg-gruen-50 text-gruen-800',
} as const;

const ZERSTOEREND = 'border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler';

/**
 * Verwaltung › Islamisches Wissen (F-40, ADR 0030): Themen mit Stand der religiösen Prüfung, Sichtbarkeit und
 * Übersetzungsstand je Sprache; Ansichten „Reihenfolge“ (per Tastatur) und „Papierkorb“ (endgültig löschen mit
 * Rückfrage). Freigeben geschieht unter „Freigaben“.
 */
export default async function WissenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/wissen'>) {
  await verlangeSeitenRecht('wissen.bearbeiten');
  const ansicht = (await searchParams).ansicht;
  const papierkorb = ansicht === 'papierkorb';
  const reihenfolge = ansicht === 'reihenfolge';
  const [t, tg, liste] = await Promise.all([
    getTranslations('verwaltung.wissen'),
    getTranslations('verwaltung.shell'),
    ladeWissensListe(papierkorb),
  ]);
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/wissen/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );

  const freigabe = (z: WissenListenZeile) => (
    <span className="flex flex-col items-start gap-1">
      <span className={cn(PILLE, FREIGABE_FARBE[z.freigabe])}>{t(`freigabe.${z.freigabe}`)}</span>
      {z.bestand ? <span className="text-16 text-tinte-2">{t('bestand')}</span> : null}
    </span>
  );
  const website = (z: WissenListenZeile) =>
    z.oeffentlich ? (
      <span className={cn(PILLE, 'bg-gruen-50 text-gruen-800')}>{t('website.oeffentlich')}</span>
    ) : (
      <span className={cn(PILLE, 'bg-sand text-tinte-2')}>
        {z.status === 'entwurf' ? t('website.ausgeblendet') : t('website.nichtOeffentlich')}
      </span>
    );
  const uebersetzung = (z: WissenListenZeile) => (
    <span className="flex flex-col gap-0.5 text-16 tabular-nums">
      {(['tr', 'en'] as const).map((s) => (
        <span key={s}>
          {t('uebersetzungZeile', { sprache: t(`uebersetzungSprache.${s}`), anzahl: z.uebersetzung[s], gesamt: z.uebersetzung.gesamt })}
        </span>
      ))}
    </span>
  );
  const titel = (z: WissenListenZeile) => (
    <span className="flex flex-col gap-1">
      <span>{z.titel}</span>
      <span className="text-16 font-normal text-tinte-2">/islamisches-wissen/{z.slug}</span>
    </span>
  );
  const aktionen = (z: WissenListenZeile) =>
    papierkorb ? (
      <>
        <form action={wissensThemaWiederherstellen}>
          <input type="hidden" name="id" value={z.id} />
          <Button type="submit" variant="outline" aria-label={t('aktionWiederherstellen', { titel: z.titel })}>
            <RotateCcw aria-hidden />
            {t('wiederherstellenKurz')}
          </Button>
        </form>
        <span title={t('endgueltigLoeschen')} className="contents">
          <LoeschenBestaetigen
            id={z.id}
            aktion={wissensThemaEndgueltigLoeschen}
            texte={{
              ausloeser: t('aktionLoeschen', { titel: z.titel }),
              titel: t('loeschenTitel'),
              text: t('loeschenText', { titel: z.titel }),
              bestaetigen: t('endgueltigLoeschen'),
              abbrechen: t('abbrechen'),
            }}
          />
        </span>
      </>
    ) : (
      <>
        <Button asChild variant="outline">
          <NextLink href={`/verwaltung/wissen/${z.id}`} aria-label={t('aktionBearbeiten', { titel: z.titel })}>
            <Pencil aria-hidden />
            {t('bearbeitenKurz')}
          </NextLink>
        </Button>
        <form action={wissensThemaInPapierkorb}>
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
      </>
    );
  const datum = (z: WissenListenZeile) => datumLang(papierkorb && z.imPapierkorbSeit ? z.imPapierkorbSeit : z.aktualisiertAm, 'de');

  const inhalt = reihenfolge ? (
    <>
      <p className="max-w-einleitung text-18 text-tinte-2">{t('reihenfolgeHinweis')}</p>
      {liste.length ? (
        <ReihenfolgeEditor
          aktion={speichereWissensReihenfolge}
          namensraum="verwaltung.wissen.editor"
          eintraege={liste.map((z) => ({
            schluessel: z.id,
            titel: z.titel,
            beschreibung: `/islamisches-wissen/${z.slug}`,
            marke: z.oeffentlich ? t('website.oeffentlich') : t('website.nichtOeffentlich'),
          }))}
        />
      ) : (
        <ListenLeer text={t('leer')} aktion={anlegen} />
      )}
    </>
  ) : liste.length === 0 ? (
    <ListenLeer text={papierkorb ? t('leerPapierkorb') : t('leer')} aktion={papierkorb ? undefined : anlegen} />
  ) : (
    <TabellenRahmen
      beschriftung={papierkorb ? t('tabellePapierkorb') : t('tabelle')}
      mobil={
        <ul className="flex flex-col gap-3">
          {liste.map((z) => (
            <ListenKarte
              key={z.id}
              titel={titel(z)}
              angaben={[
                { label: t('spalte.freigabe'), wert: freigabe(z) },
                { label: t('spalte.website'), wert: website(z) },
                { label: t('spalte.uebersetzung'), wert: uebersetzung(z) },
                { label: papierkorb ? t('spalte.imPapierkorbSeit') : t('spalte.geaendert'), wert: datum(z), zahl: true },
              ]}
              aktionen={aktionen(z)}
            />
          ))}
        </ul>
      }
    >
      <table className="w-full min-w-220 border-collapse text-left">
        <caption className="sr-only">{papierkorb ? t('tabellePapierkorb') : t('tabelle')}</caption>
        <thead className="bg-sand">
          <tr>
            {(['titel', 'freigabe', 'website', 'uebersetzung', 'geaendert', 'aktionen'] as const).map((s) => (
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
              <td className="px-4 py-3">{freigabe(z)}</td>
              <td className="px-4 py-3">{website(z)}</td>
              <td className="px-4 py-3">{uebersetzung(z)}</td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">{datum(z)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">{aktionen(z)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TabellenRahmen>
  );

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={!papierkorb && liste.length ? anlegen : null}
      />
      <Ansichten
        label={t('ansichten')}
        eintraege={[
          { schluessel: 'themen', label: t('ansichtThemen'), href: '/verwaltung/wissen', aktiv: !papierkorb && !reihenfolge },
          { schluessel: 'reihenfolge', label: t('ansichtReihenfolge'), href: '/verwaltung/wissen?ansicht=reihenfolge', aktiv: reihenfolge },
          { schluessel: 'papierkorb', label: t('ansichtPapierkorb'), href: '/verwaltung/wissen?ansicht=papierkorb', aktiv: papierkorb },
        ]}
      />
      <Meldung art="info">{papierkorb ? t('papierkorbHinweis') : t('regel')}</Meldung>
      {inhalt}
    </>
  );
}
