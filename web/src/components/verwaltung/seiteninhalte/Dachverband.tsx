'use client';

import { CalendarPlus, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { freitagAb } from '@/lib/dachverband/auswahl';
import {
  DACHVERBAND_ARTEN,
  DACHVERBAND_MAX,
  type DachverbandEintrag,
  type DachverbandInhalt,
} from '@/lib/validierung/seiteninhalte/dachverband';
import { holeDachverbandFeed, type FeedZustand } from '@/server/actions/seiteninhalte';
import { Abschnitt, AuswahlFeld, Liste, MehrsprachigFeld, SchalterFeld, TextFeld } from './Felder';
import { optional } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

/** Heutiger Kalendertag in Europe/Berlin (Verwaltung: die Uhr des Browsers genügt). */
function heuteBerlin(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  );
}

/** Freie Kennung für einen neuen Eintrag (Muster `[a-z0-9-]{3,80}`). */
function neueKennung(basis: string, vorhanden: readonly DachverbandEintrag[]): string {
  const belegt = new Set(vorhanden.map((e) => e.schluessel));
  if (!belegt.has(basis)) return basis;
  for (let n = 2; ; n++) if (!belegt.has(`${basis}-${n}`)) return `${basis}-${n}`;
}

const leererEintrag = (vorhanden: readonly DachverbandEintrag[]): DachverbandEintrag => ({
  schluessel: neueKennung(`eintrag-${heuteBerlin()}`, vorhanden),
  art: 'kampagne',
  datum: heuteBerlin(),
  titel: { de: '' },
  url: '',
  sichtbar: true,
  herkunft: 'redaktion',
});

/**
 * „Jetzt aus dem Feed holen“: eigenes Formular außerhalb des Bearbeitungsformulars (Formulare dürfen nicht verschachtelt
 * sein). Neue Einträge aus der Antwort gehen an den Editor, damit das nächste Speichern sie nicht überschreibt.
 */
function FeedAbruf({ onNeu }: { onNeu: (neu: DachverbandEintrag[]) => void }) {
  const t = useTranslations('verwaltung.seiteninhalte.dachverband.feed');
  const [zustand, absenden, laeuft] = useActionState<FeedZustand, FormData>(holeDachverbandFeed, {});
  const verarbeitet = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!zustand.zeit || verarbeitet.current === zustand.zeit) return;
    verarbeitet.current = zustand.zeit;
    if (zustand.neueEintraege?.length) onNeu(zustand.neueEintraege);
  }, [zustand, onNeu]);
  const e = zustand.ergebnis;
  const meldung = zustand.fehler ? (
    <Meldung art="fehler">{t(zustand.fehler)}</Meldung>
  ) : e ? (
    e.status === 'ok' ? (
      <Meldung art="erfolg">{t('neu', { neu: e.neu, vorhanden: e.vorhanden, abgewiesen: e.abgewiesen })}</Meldung>
    ) : e.status === 'unveraendert' ? (
      <Meldung art="info">{t('unveraendert', { vorhanden: e.vorhanden })}</Meldung>
    ) : e.status === 'uebersprungen' ? (
      <Meldung art="info">{t('uebersprungen')}</Meldung>
    ) : e.fehlerCode === 'unlesbar' || e.fehlerCode === 'schema' ? (
      <Meldung art="fehler">{t('unlesbar')}</Meldung>
    ) : (
      <Meldung art="fehler">{t('fehler', { code: e.fehlerCode ?? 'unbekannt' })}</Meldung>
    )
  ) : null;
  return (
    <form
      action={absenden}
      aria-labelledby="dachverband-feed-titel"
      className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6"
    >
      <h2 id="dachverband-feed-titel" className="font-display text-24 font-semibold">
        {t('titel')}
      </h2>
      <p className="max-w-text text-16 text-tinte-2">{t('text')}</p>
      <div>
        <Button type="submit" variant="outline" disabled={laeuft}>
          <RefreshCw aria-hidden />
          {laeuft ? t('laeuft') : t('holen')}
        </Button>
      </div>
      {meldung}
    </form>
  );
}

/**
 * Formular „Aus dem Dachverband“ (Plan Marktstart P3): Liste der Einträge mit Art, Datum, mehrsprachigen Feldern,
 * Adressen und dem Schalter „Sichtbar“; „Freitagspredigt eintragen“ legt oben einen Eintrag mit dem nächsten Freitag an.
 * Bei Freitagspredigten gibt es kein Kurztext-Feld (G-06). Hinweise: keine politischen Pressemitteilungen, keine
 * Textauszüge aus Predigten, Feed-Einträge ausblenden statt löschen.
 */
export function DachverbandFormular({
  startwerte,
  nurLesen,
  aktion,
}: {
  startwerte: DachverbandInhalt;
  nurLesen: boolean;
  aktion: Aktion;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  const [ansage, setAnsage] = useState('');
  const arten = DACHVERBAND_ARTEN.map((a) => ({ wert: a, text: t(`dachverband.arten.${a}`) }));
  const eintraege = wert.eintraege;

  const hutbaEintragen = () => {
    const datum = freitagAb(heuteBerlin());
    const neu: DachverbandEintrag = {
      schluessel: neueKennung(`hutba-${datum}`, eintraege),
      art: 'hutba',
      datum,
      titel: { de: '' },
      url: '',
      sichtbar: true,
      herkunft: 'redaktion',
    };
    setWert({ ...wert, eintraege: [neu, ...eintraege] });
    setAnsage(t('dachverband.hutbaEingetragen', { datum }));
    requestAnimationFrame(() => document.getElementById('si-eintraege-0')?.focus());
  };

  const uebernimmFeed = (neue: DachverbandEintrag[]) =>
    setWert((alt) => {
      const vorhanden = new Set(alt.eintraege.map((e) => e.schluessel));
      return { ...alt, eintraege: [...neue.filter((n) => !vorhanden.has(n.schluessel)), ...alt.eintraege] };
    });

  return (
    <div className="flex flex-col gap-6">
      <Meldung art="info">
        <p>{t('dachverband.einleitung')}</p>
        <p className="mt-2">{t('dachverband.regeln')}</p>
        <p className="mt-2">{t('dachverband.ausblenden')}</p>
      </Meldung>
      {nurLesen ? null : <FeedAbruf onNeu={uebernimmFeed} />}
      <FormularRahmen bereich="dachverband" wert={wert} aktion={aktion} nurLesen={nurLesen}>
        <Abschnitt id="eintraege" titel={t('dachverband.abschnitt')}>
          <div className="flex flex-col gap-2">
            <div>
              <Button type="button" variant="outline" onClick={hutbaEintragen} disabled={eintraege.length >= DACHVERBAND_MAX}>
                <CalendarPlus aria-hidden />
                {t('dachverband.hutbaEintragen')}
              </Button>
            </div>
            <p role="status" aria-live="polite" className="text-16 text-tinte-2">
              {ansage}
            </p>
          </div>
          <Liste
            pfad="eintraege"
            titel={t('dachverband.liste')}
            eintraege={eintraege}
            maximal={DACHVERBAND_MAX}
            onChange={(neu) => setWert({ ...wert, eintraege: neu })}
            neu={() => leererEintrag(eintraege)}
            renderEintrag={(e, i, aendern) => (
              <>
                <p className="text-16 text-tinte-2">
                  {t(`dachverband.herkunft.${e.herkunft}`)} · {t('dachverband.kennung', { schluessel: e.schluessel })}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <AuswahlFeld
                    pfad={`eintraege.${i}.art`}
                    label={t('feld.art')}
                    wert={e.art}
                    optionen={arten}
                    // Freitagspredigten ohne Kurztext (G-06): beim Wechsel zur Hutba entfällt er
                    onChange={(art) => aendern(art === 'hutba' ? { ...e, art, kurztext: undefined } : { ...e, art })}
                  />
                  <TextFeld
                    pfad={`eintraege.${i}.datum`}
                    label={t('feld.datum')}
                    hinweis={t('dachverband.hinweis.datum')}
                    wert={e.datum}
                    onChange={(datum) => aendern({ ...e, datum: datum.trim() })}
                  />
                </div>
                <MehrsprachigFeld
                  pfad={`eintraege.${i}.titel`}
                  label={t('feld.titel')}
                  hinweis={t('dachverband.hinweis.titel')}
                  wert={e.titel}
                  onChange={(titel) => aendern({ ...e, titel })}
                />
                {e.art === 'hutba' ? (
                  <p className="text-16 text-tinte-2">{t('dachverband.hutbaKurztext')}</p>
                ) : (
                  <MehrsprachigFeld
                    pfad={`eintraege.${i}.kurztext`}
                    label={t('feld.kurztext')}
                    hinweis={t('dachverband.hinweis.kurztext')}
                    pflicht={false}
                    zeilen={3}
                    wert={e.kurztext ?? { de: '' }}
                    onChange={(kurztext) => aendern({ ...e, kurztext: optional(kurztext) })}
                  />
                )}
                <TextFeld
                  pfad={`eintraege.${i}.url`}
                  label={t('feld.url')}
                  hinweis={t('dachverband.hinweis.url')}
                  pflicht
                  wert={e.url}
                  onChange={(url) => aendern({ ...e, url: url.trim() })}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <TextFeld
                    pfad={`eintraege.${i}.urlTr`}
                    label={t('feld.urlTr')}
                    wert={e.urlTr ?? ''}
                    onChange={(url) => aendern({ ...e, urlTr: url.trim() || undefined })}
                  />
                  <TextFeld
                    pfad={`eintraege.${i}.urlEn`}
                    label={t('feld.urlEn')}
                    wert={e.urlEn ?? ''}
                    onChange={(url) => aendern({ ...e, urlEn: url.trim() || undefined })}
                  />
                </div>
                <div className="grid items-end gap-4 md:grid-cols-2">
                  <TextFeld
                    pfad={`eintraege.${i}.gueltigBis`}
                    label={t('feld.gueltigBis')}
                    hinweis={t('dachverband.hinweis.gueltigBis')}
                    wert={e.gueltigBis ?? ''}
                    onChange={(bis) => aendern({ ...e, gueltigBis: bis.trim() || undefined })}
                  />
                  <SchalterFeld
                    pfad={`eintraege.${i}.sichtbar`}
                    label={t('feld.sichtbar')}
                    wert={e.sichtbar}
                    onChange={(sichtbar) => aendern({ ...e, sichtbar })}
                  />
                </div>
              </>
            )}
          />
        </Abschnitt>
      </FormularRahmen>
    </div>
  );
}
