import { ClipboardList, ListPlus, Target, TrendingUp, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { FELD, KNOPF_LEISE, KNOPF_PRIMAER, KNOPF_SEKUNDAER, LeerHinweis, Pille, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText } from '@/lib/lernen/ansicht';
import { einheitenVon, KeinGruppenZugang, lektionenVon, standDerGruppe, zuweisungsDetails } from '@/lib/lernapp/gruppe/dienst';
import { WOCHENZIELE } from '@/lib/lernapp/gruppe/regeln';
import { RICHTUNGEN, istRichtung } from '@/lib/lernapp/kurse';
import type { LernText } from '@/lib/db/schema/lernapp';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { darfInGruppe } from '@/lib/rechte/gruppen';
import {
  lernappGruppenBestenlisteSetzen,
  lernappGruppenzielSetzen,
  lernappZuweisen,
  lernappZuweisungEntfernen,
} from '@/server/actions/lernapp-gruppe';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('lernapp') };
}

const UUID = /^[0-9a-f-]{36}$/i;
const OK = ['zugewiesen', 'entfernt', 'ziel', 'bestenliste', 'doppelt', 'grenze', 'ungueltig'] as const;
const FEHLER_OK: ReadonlySet<string> = new Set(['doppelt', 'grenze', 'ungueltig']);

/**
 * Lehrkraft › Lern-App der Gruppe (L7-02; PLAN §3.1 Konto-Seite; ADR 0043 Nr. 7/8; KERN 4.0 §5): Einheit oder Lektion
 * zuweisen (zweistufig ohne JavaScript: Einheit wählen, dann ganze Einheit oder eine Lektion), Zuweisungen mit Stand,
 * Gruppenziel, Bestenliste (nur mit `lernapp_rangliste`) und der Stand der Woche – Zahlen nur von Lernenden mit
 * Einwilligung `lernapp`. Nur die Lehrkraft der Gruppe (`aufgabe.bearbeiten`, nicht die Aufsicht) und nur mit
 * `lernapp_gruppen`; sonst 404 wie „gibt es nicht“.
 */
export default async function LernAppGruppe({ params, searchParams }: PageProps<'/[locale]/mein-bereich/unterricht/[gruppe]/lern-app'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform')) || !(await funktionAn('lernapp_gruppen'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['lehrkraft']);
  const [{ gruppe: gruppeId }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(gruppeId)) notFound();
  const kontext = await ladeGruppenKontext(k.benutzerId);
  if (!darfInGruppe(kontext, 'aufgabe.bearbeiten', gruppeId)) notFound();
  const heute = berlinerDatum(new Date());
  const [stand, rangliste, t, einheiten] = await Promise.all([
    standDerGruppe(kontext, gruppeId, heute).catch((e: unknown) => {
      if (e instanceof KeinGruppenZugang) return null;
      throw e;
    }),
    funktionAn('lernapp_rangliste'),
    getTranslations('unterricht'),
    Promise.all(RICHTUNGEN.map(async (kurs) => ({ kurs, einheiten: await einheitenVon(kurs) }))),
  ]);
  if (!stand) notFound();
  const tl = (s: string, w?: Record<string, string | number>) => t(`lernapp.${s}`, w);
  const name = text(stand.name, sprache);
  const themaIn = (thema: LernText | null | undefined) => (thema ? (thema[sprache === 'tr' ? 'tr' : 'de'] ?? thema.de ?? '') : '');
  const kursName = (kurs: string) => (istRichtung(kurs) ? tl(`kurs.${kurs}`) : kurs);
  const ok = typeof sp.ok === 'string' && (OK as readonly string[]).includes(sp.ok) ? sp.ok : null;

  // Schritt 2: gewählte Einheit (`?einheit=<kurs>|<einheit>`) mit ihren Lektionen
  const wahl = typeof sp.einheit === 'string' ? sp.einheit.split('|') : [];
  const gewaehlt = (() => {
    const [kurs, einheit] = wahl;
    if (!istRichtung(kurs) || !einheit) return null;
    const e = einheiten.find((x) => x.kurs === kurs)?.einheiten.find((x) => x.schluessel === einheit);
    return e ? { kurs, einheit: e } : null;
  })();
  const [lektionen, details] = await Promise.all([
    gewaehlt ? lektionenVon(gewaehlt.kurs, gewaehlt.einheit.schluessel) : Promise.resolve([]),
    zuweisungsDetails(stand.zuweisungen),
  ]);
  const mitEinwilligung = stand.zeilen.filter((z) => z.einwilligung).length;
  const hatEinheiten = einheiten.some((e) => e.einheiten.length);
  const zuweisungsTitel = (z: (typeof stand.zuweisungen)[number]) => {
    const d = details.get(z.id);
    return [
      kursName(z.kurs),
      themaIn(d?.thema) || z.einheit,
      d?.nr ? tl('zuweisungen.lektion', { nr: d.nr }) : z.lektion ? null : tl('zuweisungen.ganze'),
    ]
      .filter(Boolean)
      .join(' · ');
  };
  const gruppeZiel = { pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } } as const;

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="unterricht"
      titel={tl('titel')}
      untertitel={name}
      sprachZiel={{ pathname: '/mein-bereich/unterricht/[gruppe]/lern-app', params: { gruppe: gruppeId } }}
      zwischen={[{ label: t('meta.gruppe'), ziel: gruppeZiel }]}
    >
      <ZurueckLink ziel={gruppeZiel} text={tl('zurueck')} />
      {ok ? (
        <Meldung art={FEHLER_OK.has(ok) ? 'fehler' : 'erfolg'} fokus>
          {tl(`ok.${ok}`)}
        </Meldung>
      ) : null}

      <Abschnitt id="zuweisen" Icon={ListPlus} titel={tl('zuweisen.titel')} text={tl('zuweisen.text')}>
        {hatEinheiten ? (
          <div className="flex flex-col gap-6">
            {/* Schritt 1: Einheit wählen (GET auf dieselbe Seite, ohne JavaScript) */}
            <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="lernapp-einheit" className="font-bold">
                  {tl('zuweisen.einheit')}
                </label>
                <select
                  id="lernapp-einheit"
                  name="einheit"
                  required
                  defaultValue={gewaehlt ? `${gewaehlt.kurs}|${gewaehlt.einheit.schluessel}` : ''}
                  className={FELD}
                >
                  <option value="" disabled>
                    {tl('zuweisen.einheitWahl')}
                  </option>
                  {einheiten
                    .filter((e) => e.einheiten.length)
                    .map((e) => (
                      <optgroup key={e.kurs} label={kursName(e.kurs)}>
                        {e.einheiten.map((x) => (
                          <option key={x.schluessel} value={`${e.kurs}|${x.schluessel}`}>
                            {tl('zuweisen.einheitText', { stufe: x.stufe.toUpperCase(), thema: themaIn(x.thema) || x.schluessel })}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              </div>
              <button type="submit" className={KNOPF_SEKUNDAER}>
                {tl('zuweisen.waehlen')}
              </button>
            </form>

            {gewaehlt && lektionen.length ? (
              <form action={lernappZuweisen} className="flex flex-col gap-4 rounded-md bg-papier p-4 md:p-5">
                <input type="hidden" name="sprache" value={sprache} />
                <input type="hidden" name="gruppe" value={gruppeId} />
                <input type="hidden" name="kurs" value={gewaehlt.kurs} />
                <input type="hidden" name="einheit" value={gewaehlt.einheit.schluessel} />
                <p className="font-bold">
                  {tl('zuweisen.gewaehlt', {
                    kurs: kursName(gewaehlt.kurs),
                    thema: themaIn(gewaehlt.einheit.thema) || gewaehlt.einheit.schluessel,
                  })}
                </p>
                <fieldset className="flex flex-col gap-1">
                  <legend className="mb-2 font-bold">{tl('zuweisen.lektionWahl')}</legend>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="radio" name="lektion" value="" defaultChecked className="size-5 accent-gruen-700" />
                    {tl('zuweisen.ganze')}
                  </label>
                  {lektionen.map((l) => (
                    <label key={l.schluessel} className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input type="radio" name="lektion" value={l.schluessel} className="size-5 accent-gruen-700" />
                      {tl('zuweisen.lektion', { nr: l.nr })}
                    </label>
                  ))}
                </fieldset>
                <div className="flex max-w-80 flex-col gap-1.5">
                  <label htmlFor="lernapp-faellig" className="font-bold">
                    {tl('zuweisen.faellig')}
                  </label>
                  <input id="lernapp-faellig" type="date" name="faellig" min={heute} className={FELD} />
                </div>
                <button type="submit" className={`self-start ${KNOPF_PRIMAER}`}>
                  {tl('zuweisen.knopf')}
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <LeerHinweis text={tl('zuweisen.keineEinheiten')} />
        )}
      </Abschnitt>

      <Abschnitt id="zuweisungen" Icon={ClipboardList} titel={tl('zuweisungen.titel')} text={tl('zuweisungen.hinweis')}>
        {stand.zuweisungen.length ? (
          <ul className="flex flex-col divide-y divide-linie">
            {stand.zuweisungen.map((z) => {
              const titel = zuweisungsTitel(z);
              return (
                <li key={z.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-bold">{titel}</span>
                    <span className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                      <Pille ton={z.erledigt ? 'gruen' : 'sand'}>
                        {tl('zuweisungen.erledigt', { anzahl: z.erledigt, gesamt: mitEinwilligung })}
                      </Pille>
                      {z.faellig ? <span>{tl('zuweisungen.faellig', { datum: datumText(z.faellig, sprache) })}</span> : null}
                    </span>
                  </div>
                  <form action={lernappZuweisungEntfernen}>
                    <input type="hidden" name="sprache" value={sprache} />
                    <input type="hidden" name="gruppe" value={gruppeId} />
                    <input type="hidden" name="aufgabe" value={z.id} />
                    <button type="submit" aria-label={tl('zuweisungen.entfernenAria', { titel })} className={KNOPF_LEISE}>
                      {tl('zuweisungen.entfernen')}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-tinte-2">{tl('zuweisungen.leer')}</p>
        )}
      </Abschnitt>

      <Abschnitt id="gruppenziel" Icon={Target} titel={tl('ziel.titel')} text={tl('ziel.text')}>
        <div className="flex flex-col gap-4">
          {stand.ziel ? (
            stand.ziel.zuWenige ? (
              <p className="text-tinte-2">{tl('ziel.zuWenige')}</p>
            ) : (
              <p className="flex flex-wrap items-center gap-2 font-bold tabular-nums">
                {tl('ziel.stand', { summe: stand.ziel.summe, ziel: stand.ziel.ziel })}
                {stand.ziel.erreicht ? <Pille ton="gruen">{tl('ziel.erreicht')}</Pille> : null}
              </p>
            )
          ) : null}
          <form action={lernappGruppenzielSetzen} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="sprache" value={sprache} />
            <input type="hidden" name="gruppe" value={gruppeId} />
            <div className="flex max-w-80 flex-1 flex-col gap-1.5">
              <label htmlFor="lernapp-ziel" className="font-bold">
                {tl('ziel.wahl')}
              </label>
              <select id="lernapp-ziel" name="ziel" defaultValue={String(stand.einstellung.wochenzielXp ?? '')} className={FELD}>
                <option value="">{tl('ziel.keins')}</option>
                {WOCHENZIELE.map((n) => (
                  <option key={n} value={n}>
                    {tl('ziel.xp', { n })}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={KNOPF_SEKUNDAER}>
              {tl('ziel.speichern')}
            </button>
          </form>
        </div>
      </Abschnitt>

      {rangliste ? (
        <Abschnitt
          id="bestenliste"
          Icon={UsersRound}
          titel={tl('bestenliste.titel')}
          text={tl('bestenliste.text')}
          rechts={
            <Pille ton={stand.einstellung.bestenliste ? 'gruen' : 'sand'}>
              {tl(stand.einstellung.bestenliste ? 'bestenliste.an' : 'bestenliste.aus')}
            </Pille>
          }
        >
          <form action={lernappGruppenBestenlisteSetzen}>
            <input type="hidden" name="sprache" value={sprache} />
            <input type="hidden" name="gruppe" value={gruppeId} />
            <input type="hidden" name="an" value={stand.einstellung.bestenliste ? '0' : '1'} />
            <button type="submit" className={KNOPF_SEKUNDAER}>
              {tl(stand.einstellung.bestenliste ? 'bestenliste.ausschalten' : 'bestenliste.einschalten')}
            </button>
          </form>
        </Abschnitt>
      ) : null}

      <Abschnitt
        id="stand"
        Icon={TrendingUp}
        titel={tl('stand.titel')}
        text={tl('stand.text', { von: datumText(stand.woche.von, sprache), bis: datumText(stand.woche.bis, sprache) })}
      >
        {stand.zeilen.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-16">
              <caption className="sr-only">{tl('stand.tabelle')}</caption>
              <thead>
                <tr className="border-b-2 border-linie">
                  <th scope="col" className="py-2 pe-4 text-start">
                    {tl('stand.name')}
                  </th>
                  <th scope="col" className="py-2 pe-4 text-end">
                    {tl('stand.lerntage')}
                  </th>
                  <th scope="col" className="py-2 pe-4 text-end">
                    {tl('stand.lektionen')}
                  </th>
                  <th scope="col" className="py-2 pe-4 text-end">
                    {tl('stand.xp')}
                  </th>
                  <th scope="col" className="py-2 text-end">
                    {tl('stand.erledigt')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stand.zeilen.map((z) => (
                  <tr key={z.lernendeId} className="border-b border-linie">
                    <th scope="row" className="py-2 pe-4 text-start font-bold">
                      {z.name}
                    </th>
                    {z.woche ? (
                      <>
                        <td className="py-2 pe-4 text-end tabular-nums">{z.woche.lerntage}</td>
                        <td className="py-2 pe-4 text-end tabular-nums">{z.woche.lektionen}</td>
                        <td className="py-2 pe-4 text-end tabular-nums">{z.woche.xp}</td>
                        <td className="py-2 text-end tabular-nums">{z.erledigt ?? 0}</td>
                      </>
                    ) : (
                      <td colSpan={4} className="py-2 text-end text-tinte-2">
                        {tl(z.konto ? 'stand.keineEinwilligung' : 'stand.keinKonto')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <LeerHinweis text={tl('stand.leer')} />
        )}
      </Abschnitt>
    </MeinBereichRahmen>
  );
}
