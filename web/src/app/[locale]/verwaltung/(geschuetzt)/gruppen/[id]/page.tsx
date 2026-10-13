import { ArrowLeft, CalendarPlus, UserMinus, UserPlus } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { ChatLage } from '@/components/verwaltung/lernen/ChatLage';
import { GruppenFormular } from '@/components/verwaltung/lernen/GruppenFormular';
import { alsTag, feldKlein, karte, pilleGut, pilleNeutral, pilleWarnung } from '@/components/verwaltung/lernen/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { alterAus } from '@/lib/chat/regeln';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { datumKurz, datumLang } from '@/lib/i18n/format';
import { tagPlus } from '@/lib/lernen/termine';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gruppeFormularWerte } from '@/lib/validierung/lernen';
import {
  leitungEntfernen,
  leitungZuweisen,
  mitgliedEntfernen,
  mitgliedHinzufuegen,
  speichereGruppe,
  termineAnlegen,
} from '@/server/actions/gruppen';
import { ladeGruppe, ladeKursAuswahl, ladeLeitungsAuswahl, ladeMitgliedsAuswahl } from '@/server/queries/verwaltung/gruppen';

const MELDUNGEN = ['angelegt', 'leitung', 'leitungEntfernt', 'mitglied', 'mitgliedEntfernt', 'termine'] as const;
const FEHLER = ['keineLehrkraft', 'zeitraum', 'zeitraumZuLang'] as const;

/**
 * Verwaltung › Gruppe (H-L01): Lage des Chats (S-02), Leitung (Lehrkraft/Aufsicht), Mitglieder, Terminserie und Angaben.
 * Mitglieder nur mit Leserecht „Lernende“ (sonst nur die Zahl). Keine Chat-Inhalte (ADR 0026).
 */
export default async function GruppeBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/gruppen/[id]'>) {
  const a = await verlangeSeitenRecht('gruppe.lesen');
  if (!(await funktionAn('lernplattform'))) notFound();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const g = await ladeGruppe(id);
  if (!g) notFound();
  const bearbeiten = darf(a.rollen, 'gruppe.bearbeiten');
  const mitgliederSehen = darf(a.rollen, 'lernende.lesen');
  const [t, tl, tg, kurse, lehrkraefte, auswahl, chatFunktion] = await Promise.all([
    getTranslations('verwaltung.gruppen'),
    getTranslations('verwaltung.lernen'),
    getTranslations('verwaltung.shell'),
    ladeKursAuswahl(),
    bearbeiten ? ladeLeitungsAuswahl(g.id) : Promise.resolve([]),
    bearbeiten && mitgliederSehen ? ladeMitgliedsAuswahl(g.id) : Promise.resolve([]),
    funktionAn('chat'),
  ]);
  const heute = berlinerDatum(new Date());
  const meldung = MELDUNGEN.find((m) => m === sp.meldung);
  const fehler = FEHLER.find((f) => f === sp.fehler);
  const terminBis = g.ende && g.ende > heute && g.ende <= tagPlus(heute, 366) ? g.ende : tagPlus(heute, 56);
  const terminVon = g.beginn && g.beginn > heute ? g.beginn : heute;

  return (
    <>
      <NextLink
        href="/verwaltung/gruppen"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf
        titel={g.name.de}
        titelLang="de"
        kennung={tg('gruppe.inhalte')}
        einleitung={
          [g.kurs, g.kursart ? tl(`kursart.${g.kursart}`) : null, g.ort, g.status === 'archiviert' ? t('status.archiviert') : null]
            .filter(Boolean)
            .join(' · ') || undefined
        }
      />
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`, { anzahl: Number(sp.anzahl ?? 0) || 0 })}</Meldung> : null}
      {fehler ? <Meldung art="fehler">{t(`fehler.${fehler}`)}</Meldung> : null}
      {!bearbeiten ? <Meldung art="info">{t('nurLesen')}</Meldung> : null}

      <ChatLage
        chatModus={g.chatModus}
        erwachsene={g.leitung.length}
        chatFunktion={chatFunktion}
        chatVon={g.chatVon}
        chatBis={g.chatBis}
        mindestalter={g.chatMindestalter}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section id="leitung" aria-labelledby="gruppe-leitung" className={karte}>
          <h2 id="gruppe-leitung" className="text-24">
            {t('leitung.titel')}
          </h2>
          <p className="text-16 text-tinte-2">{t('leitung.hinweis')}</p>
          {g.leitung.length ? (
            <ul className="flex flex-col divide-y divide-linie">
              {g.leitung.map((l) => (
                <li key={l.benutzerId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-bold">{l.name}</span>
                    <span className="flex flex-wrap gap-1.5">
                      <span className={l.rolle === 'lehrkraft' ? pilleGut : pilleNeutral}>{t(`leitung.rolle.${l.rolle}`)}</span>
                      {!l.zweiFaktor ? <span className={pilleWarnung}>{t('leitung.ohneZweiFaktor')}</span> : null}
                      {l.gesperrt ? <span className={pilleWarnung}>{t('leitung.gesperrt')}</span> : null}
                    </span>
                  </span>
                  {bearbeiten ? (
                    <form action={leitungEntfernen}>
                      <input type="hidden" name="gruppeId" value={g.id} />
                      <input type="hidden" name="benutzerId" value={l.benutzerId} />
                      <Button type="submit" variant="outline" size="sm" aria-label={t('leitung.entfernenLabel', { name: l.name })}>
                        <UserMinus aria-hidden />
                        {t('leitung.entfernen')}
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-bold">{t('leitung.leer')}</p>
          )}
          {bearbeiten ? (
            lehrkraefte.length ? (
              <form action={leitungZuweisen} className="flex flex-col gap-3 border-t border-linie pt-4">
                <input type="hidden" name="gruppeId" value={g.id} />
                <div className="grid gap-3">
                  <label className="flex min-w-0 flex-col gap-1 font-bold">
                    {t('leitung.konto')}
                    <select name="benutzerId" required className={feldKlein}>
                      {lehrkraefte.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name}
                          {k.zweiFaktor ? '' : ` · ${t('leitung.ohneZweiFaktor')}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 font-bold">
                    {t('leitung.art')}
                    <select name="rolle" defaultValue="lehrkraft" className={feldKlein}>
                      <option value="lehrkraft">{t('leitung.rolle.lehrkraft')}</option>
                      <option value="aufsicht">{t('leitung.rolle.aufsicht')}</option>
                    </select>
                  </label>
                </div>
                <Button type="submit" variant="secondary" className="self-start">
                  <UserPlus aria-hidden />
                  {t('leitung.zuweisen')}
                </Button>
              </form>
            ) : (
              <p className="border-t border-linie pt-4 text-16 text-tinte-2">
                {t('leitung.keineLehrkraefte')}{' '}
                {darf(a.rollen, 'gemeindekonto.bearbeiten') ? (
                  <NextLink href="/verwaltung/gemeinde-konten/einladen" className="font-bold underline underline-offset-4">
                    {t('leitung.einladen')}
                  </NextLink>
                ) : null}
              </p>
            )
          ) : null}
        </section>

        <section id="termine" aria-labelledby="gruppe-termine" className={karte}>
          <h2 id="gruppe-termine" className="text-24">
            {t('termine.titel')}
          </h2>
          <p className="text-16 text-tinte-2" role="status">
            {t('termine.anzahl', { anzahl: g.termineKuenftig })}
          </p>
          {g.termine.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.termine.map((tm) => (
                <li key={tm.id} className="flex flex-wrap items-center gap-2 rounded-md border border-linie bg-papier px-3 py-2">
                  <span className="font-bold">{datumKurz(alsTag(tm.datum), 'de')}</span>
                  {tm.beginn ? (
                    <span className="text-tinte-2 tabular-nums">{t('uhr', { zeit: tm.ende ? `${tm.beginn}–${tm.ende}` : tm.beginn })}</span>
                  ) : null}
                  {tm.ausgefallen ? <span className={pilleWarnung}>{t('termine.ausgefallen')}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {bearbeiten ? (
            g.wochentage.length ? (
              <form action={termineAnlegen} className="flex flex-col gap-3 border-t border-linie pt-4">
                <input type="hidden" name="gruppeId" value={g.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1 font-bold">
                    {t('termine.von')}
                    <input type="date" name="von" required defaultValue={terminVon} className={feldKlein} />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 font-bold">
                    {t('termine.bis')}
                    <input type="date" name="bis" required defaultValue={terminBis} className={feldKlein} />
                  </label>
                </div>
                <p className="text-16 text-tinte-2">{t('termine.hinweis')}</p>
                <Button type="submit" variant="secondary" className="self-start">
                  <CalendarPlus aria-hidden />
                  {t('termine.erzeugen')}
                </Button>
              </form>
            ) : (
              <p className="border-t border-linie pt-4 text-16 text-tinte-2">{t('termine.keineWochentage')}</p>
            )
          ) : null}
        </section>
      </div>

      <section id="mitglieder" aria-labelledby="gruppe-mitglieder" className={karte}>
        <h2 id="gruppe-mitglieder" className="text-24">
          {t('mitglieder.titel')}
        </h2>
        <p className="text-16 text-tinte-2" role="status">
          {t('mitglieder.anzahl', { anzahl: g.mitglieder.length })}
        </p>
        {mitgliederSehen ? (
          <>
            {g.mitglieder.length ? (
              <ul className="grid gap-x-6 md:grid-cols-2">
                {g.mitglieder.map((m) => {
                  const alter = m.sechzehnAm ? alterAus(m.sechzehnAm, heute) : null;
                  const zuJung = alter !== null && alter < g.chatMindestalter;
                  return (
                    <li key={m.lernendeId} className="flex flex-wrap items-center justify-between gap-3 border-b border-linie py-3">
                      <span className="flex min-w-0 flex-col gap-1">
                        <NextLink href={`/verwaltung/lernende/${m.lernendeId}`} className="font-bold underline underline-offset-4">
                          {m.anzeigename}
                        </NextLink>
                        <span className="flex flex-wrap items-center gap-1.5 text-16 text-tinte-2">
                          {alter !== null ? t('mitglieder.alter', { alter }) : t('mitglieder.alterUnbekannt')}
                          {' · '}
                          {t('mitglieder.seit', { datum: datumLang(alsTag(m.seit), 'de') })}
                          {zuJung && g.chatModus !== 'aus' ? (
                            <span className={pilleWarnung}>{t('mitglieder.chatAb', { alter: g.chatMindestalter })}</span>
                          ) : null}
                        </span>
                      </span>
                      {bearbeiten ? (
                        <form action={mitgliedEntfernen}>
                          <input type="hidden" name="gruppeId" value={g.id} />
                          <input type="hidden" name="lernendeId" value={m.lernendeId} />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            aria-label={t('mitglieder.entfernenLabel', { name: m.anzeigename })}
                          >
                            <UserMinus aria-hidden />
                            {t('mitglieder.entfernen')}
                          </Button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{t('mitglieder.leer')}</p>
            )}
            {bearbeiten && g.status === 'aktiv' ? (
              auswahl.length ? (
                <form action={mitgliedHinzufuegen} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <input type="hidden" name="gruppeId" value={g.id} />
                  <label className="flex min-w-0 flex-1 flex-col gap-1 font-bold sm:max-w-md">
                    {t('mitglieder.auswahl')}
                    <select name="lernendeId" required className={feldKlein}>
                      {auswahl.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.anzeigename}
                          {l.sechzehnAm ? ` · ${t('mitglieder.alter', { alter: alterAus(l.sechzehnAm, heute) })}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" variant="secondary" className="self-start sm:self-auto">
                    <UserPlus aria-hidden />
                    {t('mitglieder.zuordnen')}
                  </Button>
                </form>
              ) : (
                <p className="text-16 text-tinte-2">{t('mitglieder.keineAuswahl')}</p>
              )
            ) : null}
          </>
        ) : (
          <p className="text-16 text-tinte-2">{t('mitglieder.ohneRecht')}</p>
        )}
      </section>

      <section aria-labelledby="gruppe-angaben" className="flex flex-col gap-4">
        <h2 id="gruppe-angaben" className="text-24">
          {t('angaben')}
        </h2>
        <GruppenFormular
          aktion={speichereGruppe}
          startwerte={gruppeFormularWerte(g)}
          kurse={kurse}
          modus="bearbeiten"
          nurLesen={!bearbeiten}
        />
      </section>
    </>
  );
}
