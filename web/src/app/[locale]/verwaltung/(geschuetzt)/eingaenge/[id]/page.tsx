import { ArrowLeft, Download } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Button } from '@/components/ui/button';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { ABGESCHLOSSEN, bearbeitungsRecht, EINGANG_STATUS } from '@/lib/eingaenge/arten';
import { datumKurz, datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { lokaleTeile } from '@/lib/termine';
import { endgueltigLoeschen, notizHinzufuegen, setzeStatus } from '@/server/actions/eingaenge';
import { ladeEingangDetail } from '@/server/queries/verwaltung/eingaenge';

const karte = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
const feld = 'min-h-12 rounded-md border border-rand bg-weiss px-3 text-18';

const zeitpunkt = (d: Date) => `${datumKurz(d, 'de')} ${lokaleTeile(d).jahr}, ${uhrzeit(d, 'de')}`;

/**
 * Verwaltung › Eingang (C08, Blatt V08): entschlüsselte Angaben – jeder Abruf steht im Audit-Log (G-07) –,
 * Einwilligungen mit Zeitpunkt und Textfassung, Status, interne Notizen, Export und endgültiges Löschen.
 */
export default async function EingangDetail({ params }: PageProps<'/[locale]/verwaltung/eingaenge/[id]'>) {
  const a = await verlangeSeitenRecht('verwaltung.betreten');
  const { id } = await params;
  const d = await ladeEingangDetail(id, a);
  if (!d) notFound();
  const t = await getTranslations('verwaltung.eingaenge');
  const bearbeiten = darf(a.rollen, bearbeitungsRecht(d.art), { organisation: d.organisation });
  const beschriftung = (k: string) => (t.has(`felder.${d.art}.${k}`) ? t(`felder.${d.art}.${k}` as never) : k);
  const anzeige = (k: string, w: unknown): string => {
    if (w === null || w === undefined || w === '') return t('detail.leer');
    if (w === true || w === 'ja') return t('detail.ja');
    if (w === false) return t('detail.nein');
    if (Array.isArray(w)) return w.map((x) => anzeige(k, x)).join(', ');
    if (typeof w === 'string' && t.has(`werte.${k}.${w}`)) return t(`werte.${k}.${w}` as never);
    return String(w);
  };
  const angaben = Object.entries(d.daten).filter(([k]) => k !== 'sprache');
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink href="/verwaltung/eingaenge" className="inline-flex min-h-12 items-center gap-2 self-start font-bold">
        <ArrowLeft aria-hidden className="size-5" />
        {t('detail.zurueckZurListe')}
      </NextLink>
      <VerwaltungsKopf titel={t('detail.titel', { datum: zeitpunkt(d.erstelltAm) })} kennung={tg('gruppe.kommunikation')} />
      <div className="flex flex-col gap-2">
        <p className="text-tinte-2">
          {t(`art.${d.art}`)}
          {d.bezugTitel ? ` · ${d.bezugTitel}` : ''} · {t(`status.${d.status}`)} · {t(`sprachen.${d.sprache}` as never)}
        </p>
        <p className="text-16 text-tinte-2">
          {/* Offene Eingänge tragen die Höchstfrist (Tor B/C SP-B B4), abgeschlossene die Frist der Art */}
          {!d.loeschenAb
            ? t('detail.keineFrist')
            : ABGESCHLOSSEN.has(d.status)
              ? t('detail.loeschenAb', { datum: datumLang(d.loeschenAb, 'de') })
              : t('detail.hoechstfrist', { datum: datumLang(d.loeschenAb, 'de') })}
        </p>
        {!bearbeiten ? <p className="text-16 font-bold">{t('detail.nurLesen')}</p> : null}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section aria-labelledby="eingang-angaben" className={karte}>
            <h2 id="eingang-angaben" className="text-24">
              {t('detail.angaben')}
            </h2>
            <dl className="grid gap-x-6 gap-y-3 sm:raster-stammdaten">
              {angaben.map(([k, w]) => (
                <div key={k} className="contents">
                  <dt className="font-bold">{beschriftung(k)}</dt>
                  <dd className="break-words whitespace-pre-line">{anzeige(k, w)}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="eingang-einwilligungen" className={karte}>
            <h2 id="eingang-einwilligungen" className="text-24">
              {t('detail.einwilligungen')}
            </h2>
            {d.einwilligungen.length ? (
              <ul className="flex flex-col gap-2">
                {d.einwilligungen.map((e) => (
                  <li key={e.textSchluessel} className="text-16">
                    {t('detail.einwilligungZeile', {
                      text: e.textSchluessel,
                      datum: zeitpunkt(e.erteiltAm),
                      version: e.textVersion.slice(0, 12),
                    })}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinte-2">{t('detail.keineEinwilligung')}</p>
            )}
          </section>
        </div>
        <div className="flex flex-col gap-6">
          {bearbeiten ? (
            <section aria-labelledby="eingang-status" className={karte}>
              <h2 id="eingang-status" className="text-24">
                {t('detail.status')}
              </h2>
              <form action={setzeStatus} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={d.id} />
                <label className="flex flex-col gap-1 font-bold">
                  {t('spalte.status')}
                  <select name="status" defaultValue={d.status} className={feld}>
                    {EINGANG_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-16 text-tinte-2">{t('detail.statusHinweis')}</p>
                <Button type="submit" className="self-start">
                  {t('detail.statusSpeichern')}
                </Button>
              </form>
            </section>
          ) : null}
          <section aria-labelledby="eingang-notizen" className={karte}>
            <h2 id="eingang-notizen" className="text-24">
              {t('detail.notizen')}
            </h2>
            {d.notizen.length ? (
              <ul className="flex flex-col gap-3">
                {d.notizen.map((n) => (
                  <li key={n.id} className="flex flex-col gap-1 border-b border-linie pb-3 last:border-0">
                    <span className="text-16 text-tinte-2">
                      {t('detail.notizVon', { name: n.autorName ?? t('detail.unbekannt'), datum: zeitpunkt(n.erstelltAm) })}
                    </span>
                    <p className="whitespace-pre-line">{n.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinte-2">{t('detail.keineNotizen')}</p>
            )}
            {bearbeiten ? (
              <form action={notizHinzufuegen} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={d.id} />
                <label htmlFor="eingang-notiz" className="font-bold">
                  {t('detail.notizNeu')}
                </label>
                <p id="eingang-notiz-hinweis" className="text-16 text-tinte-2">
                  {t('detail.notizHinweis')}
                </p>
                <textarea
                  id="eingang-notiz"
                  name="text"
                  rows={3}
                  maxLength={2000}
                  required
                  aria-describedby="eingang-notiz-hinweis"
                  className="rounded-md border border-rand bg-weiss px-3 py-2 text-18"
                />
                <Button type="submit" variant="outline" className="self-start">
                  {t('detail.notizSpeichern')}
                </Button>
              </form>
            ) : null}
          </section>
          <section aria-label={t('detail.export')} className={karte}>
            <Button asChild variant="outline" className="self-start">
              <a href={`/verwaltung/eingaenge/export?format=json&id=${d.id}`}>
                <Download aria-hidden />
                {t('detail.export')}
              </a>
            </Button>
            <p className="text-16 text-tinte-2">{t('exportHinweis')}</p>
            {bearbeiten ? (
              <LoeschenBestaetigen
                id={d.id}
                aktion={endgueltigLoeschen}
                texte={{
                  ausloeser: t('detail.loeschen'),
                  titel: t('detail.loeschenTitel'),
                  text: t('detail.loeschenText'),
                  bestaetigen: t('detail.loeschenBestaetigen'),
                  abbrechen: t('detail.abbrechen'),
                }}
              />
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
