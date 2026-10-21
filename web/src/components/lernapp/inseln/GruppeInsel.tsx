'use client';

import { BookOpenCheck, CircleCheck, Target, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { formatiere, intlSprache } from '@/lib/lernapp/format';
import type { GruppeAntwort, ListenPlatz, ZielStand, ZustimmungAntwort } from '@/lib/lernapp/gruppe/protokoll';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';

export type GruppeTexte = {
  laden: string;
  ladenText: string;
  laedt: string;
  anmeldenText: string;
  anmelden: string;
  fehler: string;
  bremse: string;
  einwilligung: { fehlt: string; eltern: string };
  keineGruppe: string;
  zuweisungen: {
    titel: string;
    leer: string;
    einheit: string;
    lektion: string;
    faellig: string;
    erledigt: string;
    offen: string;
    oeffnen: string;
    hinweis: string;
  };
  ziel: { titel: string; stand: string; erreicht: string; zuWenige: string };
  bestenliste: { gruppe: string; familie: string; text: string; verborgen: string; leer: string; ich: string; xp: string };
  zustimmung: {
    titel: string;
    text: string;
    zustimmen: string;
    ausblenden: string;
    erteilt: string;
    nicht: string;
    ohneEinwilligung: string;
  };
};

/** Adresse der Route (`gruppe/protokoll.ts`, GRUPPE_ADRESSE); hier als Text, damit Zod nicht in die Insel kommt. */
const ADRESSE = '/api/lernapp/gruppe';

type Lage = { art: 'frei' } | { art: 'laedt' } | { art: 'anmelden' } | { art: 'daten'; daten: GruppeAntwort };

/**
 * Gruppe in der Lern-App (L7-02; PLAN §3.1; ADR 0043 Nr. 7/8; KERN 4.0 §5): Zuweisungen der Lehrkraft, Gruppenziel ohne
 * Namen und – nur für Konten ab 16, wenn die Lehrkraft bzw. die Eltern sie eingeschaltet haben – Bestenlisten der eigenen
 * Gruppe und Familie mit der eigenen Zustimmung (jederzeit ausblenden). Die Listen sieht nur, wer selbst zugestimmt hat
 * und deren Einwilligung gilt (gegenseitiger Kreis); sonst steht dort ein Hinweis. Ohne Einwilligung gibt es statt des
 * Knopfs „Zustimmen“ einen Hinweis (der Server lehnt sonst ab). Ohne verbundenes Konto entsteht keine Anfrage,
 * bis die Person „Meine Gruppe anzeigen“ wählt; ist das Gerät mit einem Konto verbunden, lädt die Insel sofort. Alle
 * Regeln (Alter, Zustimmung, Einwilligung, Gruppenisolation) setzt der Server durch; die Insel zeigt nur, was kommt.
 * Zahlen stehen statisch (keine hochzählenden Zahlen), die Liste ist ungeordnet (keine Ränge, keine Medaillen).
 */
export function GruppeInsel({ ui, texte }: { ui: Oberflaeche; texte: GruppeTexte }) {
  const [lage, setLage] = useState<Lage>({ art: 'frei' });
  const [meldung, setMeldung] = useState('');
  const [ziffern, setZiffern] = useState<'oestlich' | 'westlich'>('oestlich');
  const [sendet, setSendet] = useState(false);
  const f = (vorlage: string, werte: Record<string, string | number> = {}) => formatiere(vorlage, werte, ui, ziffern);
  const datum = (iso: string) =>
    new Intl.DateTimeFormat(intlSprache(ui, ziffern), { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

  const laden = useCallback(async () => {
    setLage({ art: 'laedt' });
    setMeldung(texte.laedt);
    try {
      const r = await fetch(`${ADRESSE}?ui=${ui}`, { headers: { accept: 'application/json' }, cache: 'no-store' });
      if (r.status === 401) {
        setMeldung('');
        return setLage({ art: 'anmelden' });
      }
      if (r.status === 429) {
        setMeldung(texte.bremse);
        return setLage({ art: 'frei' });
      }
      if (!r.ok) {
        setMeldung(texte.fehler);
        return setLage({ art: 'frei' });
      }
      setLage({ art: 'daten', daten: (await r.json()) as GruppeAntwort });
      setMeldung('');
    } catch {
      setMeldung(texte.fehler);
      setLage({ art: 'frei' });
    }
  }, [texte, ui]);

  useEffect(() => {
    let aktiv = true;
    void einstellungsSpeicher(ui)
      .laden()
      .then((e) => aktiv && setZiffern(e.ziffern));
    // Mit verbundenem Konto sofort laden; sonst erst nach dem Klick (ohne Konto keine Anfrage, KERN 4.0 §6)
    void vorhandenesProfil().then(({ profil }) => {
      if (aktiv && profil?.benutzerId) void laden();
    });
    return () => {
      aktiv = false;
    };
  }, [laden, ui]);

  const zustimmung = async (aktion: 'zustimmen' | 'ausblenden') => {
    if (lage.art !== 'daten') return;
    setSendet(true);
    try {
      const r = await fetch(ADRESSE, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ aktion, ui }),
      });
      if (!r.ok) return setMeldung(r.status === 429 ? texte.bremse : texte.fehler);
      const a = (await r.json()) as ZustimmungAntwort;
      setMeldung(a.erteilt ? texte.zustimmung.erteilt : texte.zustimmung.nicht);
      // Die Listen neu holen: Die eigene Zeile erscheint bzw. verschwindet sofort
      await laden();
      setMeldung(a.erteilt ? texte.zustimmung.erteilt : texte.zustimmung.nicht);
    } catch {
      setMeldung(texte.fehler);
    } finally {
      setSendet(false);
    }
  };

  const knopf = 'inline-flex min-h-12 druck items-center gap-2 rounded-pill px-5 font-bold disabled:bg-linie disabled:text-tinte-2';
  const haupt = `${knopf} bg-gruen-700 text-weiss hover:bg-gruen-800`;
  const neben = `${knopf} border border-rand bg-weiss text-tinte hover:border-gruen-700`;
  const anmeldeAdresse = `/lern-app/${ui}/anmelden?weiter=${encodeURIComponent(`/lern-app/${ui}/gruppe`)}`;

  const liste = (plaetze: ListenPlatz[]) =>
    plaetze.length ? (
      <ul className="flex flex-col gap-2">
        {plaetze.map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            className={`flex min-h-11 items-center justify-between gap-3 rounded-md px-4 py-2 ${p.ich ? 'bg-gruen-50 font-bold' : 'bg-papier'}`}
          >
            <span>{p.ich ? `${p.name} (${texte.bestenliste.ich})` : p.name}</span>
            <span className="tabular-nums">{f(texte.bestenliste.xp, { n: p.xp })}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-16 text-tinte-2">{texte.bestenliste.leer}</p>
    );

  const ziel = (z: ZielStand) => (
    <div className="flex flex-col gap-2 rounded-md bg-sand p-4">
      <p className="flex items-center gap-2 font-bold">
        <Target aria-hidden className="size-5 shrink-0 text-gruen-700" />
        {texte.ziel.titel}
      </p>
      {z.zuWenige ? (
        <p className="text-16 text-tinte-2">{f(texte.ziel.zuWenige, { ziel: z.ziel })}</p>
      ) : (
        <>
          <p className="text-18 tabular-nums">{f(texte.ziel.stand, { summe: z.summe, ziel: z.ziel })}</p>
          <div aria-hidden className="h-2 overflow-hidden rounded-pill bg-weiss">
            <div className="h-full lern-leiste bg-gruen-700" style={{ '--anteil': z.anteil } as CSSProperties} />
          </div>
          {z.erreicht ? <p className="text-16 font-bold text-gruen-800">{texte.ziel.erreicht}</p> : null}
        </>
      )}
    </div>
  );

  return (
    <div className="flex max-w-(--container-lesen) flex-col gap-6">
      {lage.art === 'frei' || lage.art === 'laedt' ? (
        <section className="flex flex-col items-start gap-3 rounded-lg border border-linie bg-weiss p-5">
          <p className="text-16 text-tinte-2">{texte.ladenText}</p>
          <button type="button" disabled={lage.art === 'laedt'} onClick={() => void laden()} className={haupt}>
            <UsersRound aria-hidden className="size-5" />
            {texte.laden}
          </button>
        </section>
      ) : lage.art === 'anmelden' ? (
        <section className="flex flex-col items-start gap-3 rounded-lg border border-linie bg-weiss p-5">
          <p className="text-16">{texte.anmeldenText}</p>
          <a href={anmeldeAdresse} className={`${haupt} no-underline hover:text-weiss`}>
            {texte.anmelden}
          </a>
        </section>
      ) : (
        <>
          {lage.daten.einwilligung !== 'erteilt' ? (
            <p className="rounded-md border border-linie bg-sand p-4 text-16">{texte.einwilligung[lage.daten.einwilligung]}</p>
          ) : null}

          <section aria-labelledby="zuweisungen" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5">
            <h2 id="zuweisungen" className="flex items-center gap-2 text-24">
              <BookOpenCheck aria-hidden className="size-6 shrink-0 text-gruen-700" />
              {texte.zuweisungen.titel}
            </h2>
            {lage.daten.zuweisungen.length ? (
              <>
                <ul className="flex flex-col gap-2">
                  {lage.daten.zuweisungen.map((z) => (
                    <li key={z.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-papier px-4 py-3">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-bold">{z.thema ?? z.einheit}</span>
                        <span className="text-16 text-tinte-2">
                          {[
                            z.nr !== null ? f(texte.zuweisungen.lektion, { n: z.nr }) : z.lektion ? null : texte.zuweisungen.einheit,
                            z.gruppe,
                            z.faellig ? f(texte.zuweisungen.faellig, { datum: datum(z.faellig) }) : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-16 font-bold ${z.erledigt ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2'}`}
                      >
                        {z.erledigt ? <CircleCheck aria-hidden className="size-4 shrink-0" /> : null}
                        {z.erledigt ? texte.zuweisungen.erledigt : texte.zuweisungen.offen}
                      </span>
                      <a
                        href={
                          z.lektion ? `/lern-app/${ui}/${z.kurs}/ueben?l=${encodeURIComponent(z.lektion)}` : `/lern-app/${ui}/${z.kurs}`
                        }
                        className={`${neben} no-underline`}
                      >
                        {texte.zuweisungen.oeffnen}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-16 text-tinte-2">{texte.zuweisungen.hinweis}</p>
              </>
            ) : (
              <p className="text-16 text-tinte-2">{texte.zuweisungen.leer}</p>
            )}
          </section>

          {lage.daten.gruppen.length || lage.daten.familien.length ? null : <p className="text-16 text-tinte-2">{texte.keineGruppe}</p>}

          {lage.daten.gruppen.map((g) => (
            <section
              key={g.id}
              aria-labelledby={`gruppe-${g.id}`}
              className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5"
            >
              <h2 id={`gruppe-${g.id}`} className="flex items-center gap-2 text-24">
                <UsersRound aria-hidden className="size-6 shrink-0 text-gruen-700" />
                {g.name}
              </h2>
              {g.ziel ? ziel(g.ziel) : null}
              {g.bestenliste || g.verborgen ? (
                <div className="flex flex-col gap-2">
                  <h3 className="text-20">{texte.bestenliste.gruppe}</h3>
                  <p className="text-16 text-tinte-2">{g.bestenliste ? texte.bestenliste.text : texte.bestenliste.verborgen}</p>
                  {g.bestenliste ? liste(g.bestenliste) : null}
                </div>
              ) : null}
            </section>
          ))}

          {lage.daten.familien.map((fa, i) => (
            <section key={i} aria-labelledby={`familie-${i}`} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
              <h2 id={`familie-${i}`} className="text-24">
                {texte.bestenliste.familie}
              </h2>
              <p className="text-16 text-tinte-2">{fa.bestenliste ? texte.bestenliste.text : texte.bestenliste.verborgen}</p>
              {fa.bestenliste ? liste(fa.bestenliste) : null}
            </section>
          ))}

          {lage.daten.zustimmung ? (
            <section aria-labelledby="zustimmung" className="flex flex-col items-start gap-3 rounded-lg border border-linie bg-weiss p-5">
              <h2 id="zustimmung" className="text-24">
                {texte.zustimmung.titel}
              </h2>
              <p className="text-16">{texte.zustimmung.text}</p>
              <p className="text-16 font-bold">{lage.daten.zustimmung.erteilt ? texte.zustimmung.erteilt : texte.zustimmung.nicht}</p>
              {lage.daten.zustimmung.erteilt || lage.daten.einwilligung === 'erteilt' ? (
                <button
                  type="button"
                  disabled={sendet}
                  onClick={() => void zustimmung(lage.daten.zustimmung?.erteilt ? 'ausblenden' : 'zustimmen')}
                  className={lage.daten.zustimmung.erteilt ? neben : haupt}
                >
                  {lage.daten.zustimmung.erteilt ? texte.zustimmung.ausblenden : texte.zustimmung.zustimmen}
                </button>
              ) : (
                <p className="text-16 text-tinte-2">{texte.zustimmung.ohneEinwilligung}</p>
              )}
            </section>
          ) : null}
        </>
      )}
      <p role="status" className="min-h-6 text-16 font-bold text-gruen-800">
        {meldung}
      </p>
    </div>
  );
}
