'use client';

import { Send } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Pruefliste } from '@/lib/lernapp/aufgaben/auswertung/schreiben';
import type { Oberflaeche, RichtungId } from '@/lib/lernapp/kurse';
import { vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';
import type { KeineAbgabe, PruefAntwort, SchreibenFehler } from '@/lib/lernapp/schreiben/abgabe';
import type { SchreibabgabeTexte } from '../typen';

/** Adresse der Route (`schreiben/abgabe.ts`, SCHREIBEN_ADRESSE); hier als Text, damit Zod nicht in den Chunk kommt. */
const ADRESSE = '/api/lernapp/schreiben';

const KNOPF = 'inline-flex min-h-12 druck items-center gap-2 self-start rounded-pill px-6 font-bold';
const SENDEN = `${KNOPF} bg-gruen-700 text-weiss hover:bg-gruen-800 disabled:bg-linie disabled:text-tinte-2`;
const NEBEN = `${KNOPF} border-2 border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50`;

type Grund = KeineAbgabe | 'anmeldung' | 'grenze' | 'bremse' | 'fehler';
type Gruppe = { id: string; name: string };
export type Lage =
  | { art: 'pruefe' }
  /** Schalter `lernapp_gruppen` aus (404 ohne Körper) – dann gibt es kein Angebot */
  | { art: 'aus' }
  | { art: 'ohneKonto' }
  | { art: 'bereit'; gruppen: Gruppe[]; sendet: boolean }
  | { art: 'gesendet' }
  | { art: 'nicht'; grund: Grund };

/** Gründe, bei denen „Erneut versuchen“ sinnvoll ist (vorübergehend); die übrigen ändern sich nicht durch Wiederholen. */
const VORUEBERGEHEND: ReadonlySet<Grund> = new Set(['fehler', 'bremse', 'anmeldung']);
const GRUENDE: ReadonlySet<string> = new Set<Grund>(['zuweisung', 'aufgabe', 'einwilligung', 'eltern', 'grenze', 'bremse']);

async function fehlerGrund(r: Response): Promise<Grund> {
  if (r.status === 401) return 'anmeldung';
  if (r.status === 429) {
    const f = (await r.json().catch(() => null)) as { fehler?: SchreibenFehler } | null;
    return f?.fehler === 'grenze' ? 'grenze' : 'bremse';
  }
  const f = (await r.json().catch(() => null)) as { fehler?: string } | null;
  return f?.fehler && GRUENDE.has(f.fehler) ? (f.fehler as Grund) : 'fehler';
}

/**
 * Darf diese Aufgabe an die Lehrkraft? Ohne verbundenes Konto fragt die Übung erst nach einer ausdrücklichen Handlung
 * („Mit meinem Konto prüfen“, KERN 4.0 §6; wie „Meine Gruppe anzeigen“ in `GruppeInsel`). Die Anmeldung der Website
 * genügt dafür – die Abgabe braucht keinen Abgleich (`lernapp_sync`), sonst wäre sie ohne diesen Schalter eine Sackgasse.
 */
export async function frage(ui: Oberflaeche, kurs: RichtungId, aufgabe: string, ausdruecklich = false): Promise<Lage> {
  try {
    if (!ausdruecklich) {
      const { profil } = await vorhandenesProfil();
      if (!profil?.benutzerId) return { art: 'ohneKonto' };
    }
    const such = new URLSearchParams({ ui, kurs, aufgabe });
    const r = await fetch(`${ADRESSE}?${such}`, { headers: { accept: 'application/json' }, cache: 'no-store' });
    if (r.status === 404 && !r.headers.get('content-type')?.includes('json')) return { art: 'aus' };
    if (!r.ok) return { art: 'nicht', grund: await fehlerGrund(r) };
    const a = (await r.json()) as PruefAntwort;
    return a.moeglich ? { art: 'bereit', gruppen: a.gruppen, sendet: false } : { art: 'nicht', grund: a.grund };
  } catch {
    return { art: 'nicht', grund: 'fehler' };
  }
}

/**
 * „An deine Lehrkraft senden“ in der Schreibübung (L5-03; PLAN §4.3; ADR 0042 Nr. 11; KERN 4.0 §5 und §6): eigener Chunk,
 * erst nach „Text prüfen“ geladen und nur mit dem Schalter `lernapp_gruppen`. Ohne verbundenes Konto entsteht keine
 * Anfrage, bis die Person „Mit meinem Konto prüfen“ wählt (dann genügt die Anmeldung der Website; ohne sie folgt
 * „Anmelden“). Mit verbundenem Konto fragt die Übung sofort. Der Server prüft, ob diese Aufgabe einer
 * eigenen Gruppe zugewiesen ist und die Einwilligung `lernapp` gilt (bei Kindern die der Eltern); gesendet wird erst auf
 * Knopfdruck. Die Kennung der Abgabe entsteht einmal je Text: „Erneut versuchen“ sendet dieselbe Kennung, der Server
 * speichert sie nur einmal. Der Text bleibt sonst auf dem Gerät; Meldungen gehen in die eine Live-Region des Spielers.
 */
export default function Abgabe({
  ui,
  kurs,
  aufgabe,
  text,
  pruefliste,
  texte,
  melde,
}: {
  ui: Oberflaeche;
  kurs: RichtungId;
  aufgabe: string;
  text: string;
  pruefliste: Pruefliste;
  texte: SchreibabgabeTexte;
  melde: (text: string) => void;
}) {
  const id = useId();
  const [lage, setLage] = useState<Lage>({ art: 'pruefe' });
  const [gruppe, setGruppe] = useState<string | null>(null);
  const kennung = useRef<string | null>(null);
  const ergebnis = useRef<HTMLParagraphElement>(null);
  const knopf = useRef<HTMLButtonElement>(null);
  // Gruppennamen gibt es auf Deutsch und Türkisch; die arabische Oberfläche zeigt den deutschen Namen
  const nameLang = ui === 'tr' ? 'tr' : 'de';

  const uebernimm = useCallback((l: Lage) => {
    if (l.art === 'bereit') setGruppe(l.gruppen.length === 1 ? l.gruppen[0]!.id : null);
    setLage(l);
  }, []);

  useEffect(() => {
    let aktiv = true;
    void frage(ui, kurs, aufgabe).then((l) => {
      if (aktiv) uebernimm(l);
    });
    return () => {
      aktiv = false;
    };
  }, [aufgabe, kurs, ui, uebernimm]);

  // Fokus nur nach einer Handlung (Senden, erneut versuchen) auf das Ergebnis bzw. wieder auf „Senden“ – nie beim ersten
  // Nachfragen (der Fokus bleibt dann in der Prüfliste)
  const [fokus, setFokus] = useState(0);
  useEffect(() => {
    if (fokus) (ergebnis.current ?? knopf.current)?.focus();
  }, [fokus]);
  const zeige = (l: Lage) => {
    uebernimm(l);
    setFokus((n) => n + 1);
  };
  // „Mit meinem Konto prüfen“ und „Erneut versuchen“ sind ausdrückliche Handlungen: Die Übung fragt den Server auch ohne
  // verbundenes Gerät (Anmeldung der Website; ohne Anmeldung folgt der Hinweis mit „Anmelden“)
  const erneut = () => {
    setLage({ art: 'pruefe' });
    void frage(ui, kurs, aufgabe, true).then(zeige);
  };

  const sende = async (gruppen: Gruppe[]) => {
    if (!gruppe) return;
    kennung.current ??= crypto.randomUUID();
    setLage({ art: 'bereit', gruppen, sendet: true });
    melde(texte.sendet);
    try {
      const r = await fetch(ADRESSE, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ id: kennung.current, kurs, aufgabe, gruppe, text, pruefliste }),
      });
      if (!r.ok) {
        const grund = await fehlerGrund(r);
        melde(texte.grund[grund]);
        return zeige({ art: 'nicht', grund });
      }
      melde(texte.gesendet);
      zeige({ art: 'gesendet' });
    } catch {
      melde(texte.grund.fehler);
      zeige({ art: 'nicht', grund: 'fehler' });
    }
  };

  if (lage.art === 'aus') return null;
  const anmeldeAdresse = `/lern-app/${ui}/anmelden`;

  return (
    <section aria-labelledby={`${id}-titel`} className="flex flex-col gap-3 rounded-lg border-2 border-linie bg-weiss p-4 md:p-6">
      <h4 id={`${id}-titel`} className="text-18 font-bold">
        {texte.titel}
      </h4>
      <p className="text-16">{texte.text}</p>
      {lage.art === 'pruefe' ? <p className="text-16 text-tinte-2">{texte.laedt}</p> : null}
      {lage.art === 'ohneKonto' ? (
        <>
          <p className="text-16 text-tinte-2">{texte.ohneKonto}</p>
          <button type="button" onClick={erneut} className={NEBEN}>
            {texte.kontoPruefen}
          </button>
        </>
      ) : null}
      {lage.art === 'bereit' ? (
        <>
          {lage.gruppen.length === 1 ? (
            <p className="text-16">
              {texte.an.split('{gruppe}').map((teil, i) =>
                i === 0 ? (
                  teil
                ) : (
                  <span key={i}>
                    <bdi lang={nameLang} className="font-bold">
                      {lage.gruppen[0]!.name}
                    </bdi>
                    {teil}
                  </span>
                ),
              )}
            </p>
          ) : (
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1 text-16 font-bold">{texte.gruppeWahl}</legend>
              {lage.gruppen.map((g) => (
                <label key={g.id} className="flex min-h-11 cursor-pointer items-center gap-3 px-2">
                  <input
                    type="radio"
                    name={`${id}-gruppe`}
                    checked={gruppe === g.id}
                    onChange={() => setGruppe(g.id)}
                    disabled={lage.sendet}
                    className="size-5 accent-gruen-700"
                  />
                  <bdi lang={nameLang} className="text-18">
                    {g.name}
                  </bdi>
                </label>
              ))}
            </fieldset>
          )}
          <button ref={knopf} type="button" onClick={() => void sende(lage.gruppen)} disabled={!gruppe || lage.sendet} className={SENDEN}>
            <Send aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
            {lage.sendet ? texte.sendet : texte.senden}
          </button>
        </>
      ) : null}
      {lage.art === 'gesendet' ? (
        <p ref={ergebnis} tabIndex={-1} className="text-16 font-bold text-gruen-800 outline-none">
          {texte.gesendet}
        </p>
      ) : null}
      {lage.art === 'nicht' ? (
        <div className="flex flex-col gap-3">
          <p ref={ergebnis} tabIndex={-1} className="rounded-md bg-sand p-3 text-16 outline-none">
            {texte.grund[lage.grund]}
          </p>
          {lage.grund === 'anmeldung' ? (
            <a href={anmeldeAdresse} target="_blank" rel="noopener" className={`${NEBEN} no-underline`}>
              {texte.anmelden}
            </a>
          ) : null}
          {VORUEBERGEHEND.has(lage.grund) ? (
            <button type="button" onClick={erneut} className={NEBEN}>
              {texte.erneut}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
