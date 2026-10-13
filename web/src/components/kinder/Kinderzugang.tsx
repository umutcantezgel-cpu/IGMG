'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { klassen } from '@/lib/klassen';
import { passwortVorschlag } from '@/lib/lernen/ansicht';
import { kinderPasswortSetzen, kinderzugangAnlegen, type ZugangZustand } from '@/server/actions/kinder';

export type KinderzugangTexte = {
  benutzername: string;
  benutzernameHilfe: string;
  passwort: string;
  passwortHilfe: string;
  vorschlag: string;
  anlegen: string;
  neuesPasswort: string;
  zuruecksetzenTitel: string;
  zuruecksetzenText: string;
  zuruecksetzen: string;
  gesperrt: string;
  angelegt: string;
  gesetzt: string;
  fehler: Record<string, string>;
  karteTitel: string;
  karteText: string;
  karteEinmal: string;
  karteOhnePasswort: string;
  karteKopf: string;
  karteFuer: string;
  anmeldung: string;
  passwortZeile: string;
  passwortLeer: string;
  drucken: string;
};

type Ergebnis = ZugangZustand & { passwort?: string };

const FELD = 'min-h-12 w-full rounded-md border-2 border-rand bg-weiss px-3 font-mono text-18 tracking-wide';
const KNOPF =
  'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md px-5 font-bold transition duration-(--dauer-rueckmeldung) active:scale-98 disabled:cursor-wait disabled:opacity-60 motion-reduce:active:scale-100';

/** Ergebnis um das eben gesetzte Passwort ergänzen – nur im Browser, aus dem eigenen Formular. */
function mitPasswort(aktion: (v: ZugangZustand, fd: FormData) => Promise<ZugangZustand>) {
  return async (vorher: Ergebnis, fd: FormData): Promise<Ergebnis> => {
    const r = await aktion(vorher, fd).catch((): ZugangZustand => ({ fehler: 'unbekannt' }));
    return r.ok ? { ...r, passwort: String(fd.get('passwort') ?? '') } : r;
  };
}
const anlegenMitPasswort = mitPasswort(kinderzugangAnlegen);
const setzenMitPasswort = mitPasswort(kinderPasswortSetzen);

function vorschlag(): string {
  return passwortVorschlag(crypto.getRandomValues(new Uint8Array(12)));
}

/** Passwortfeld mit „Passwort vorschlagen“ (Zufall im Browser, drei Vierergruppen). Sichtbar, damit es abgeschrieben werden kann. */
function PasswortFeld({ id, label, hilfe, knopf }: { id: string; label: string; hilfe: string; knopf: string }) {
  const [wert, setWert] = useState('');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          name="passwort"
          type="text"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          spellCheck={false}
          autoCapitalize="none"
          value={wert}
          onChange={(e) => setWert(e.currentTarget.value)}
          aria-describedby={`${id}-hilfe`}
          className={FELD}
        />
        <button
          type="button"
          onClick={() => setWert(vorschlag())}
          className={klassen(KNOPF, 'border-2 border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50')}
        >
          {knopf}
        </button>
      </div>
      <p id={`${id}-hilfe`} className="text-16 text-tinte-2">
        {hilfe}
      </p>
    </div>
  );
}

/**
 * Kinderzugang (ADR 0026): anlegen (Benutzername + Passwort) bzw. Passwort neu setzen, dazu die druckbare Zugangskarte
 * mit Benutzername und Anmeldeadresse. Das Passwort erscheint nur einmal direkt nach dem Setzen (es stammt aus dem
 * Formular, der Server schickt es nie zurück); nach dem Neuladen steht dort wieder der Hinweis.
 */
export function Kinderzugang({
  lernendeId,
  sprache,
  kindName,
  benutzername,
  gesperrt,
  adresse,
  texte,
}: {
  lernendeId: string;
  sprache: string;
  kindName: string;
  benutzername: string | null;
  gesperrt: boolean;
  adresse: string;
  texte: KinderzugangTexte;
}) {
  const [anlage, anlegen, legtAn] = useActionState<Ergebnis, FormData>(anlegenMitPasswort, {});
  const [neu, setzen, setzt] = useActionState<Ergebnis, FormData>(setzenMitPasswort, {});
  const ergebnis = (neu.zeit ?? 0) > (anlage.zeit ?? 0) ? neu : anlage.ok ? anlage : neu;
  const karte = useRef<HTMLDivElement>(null);
  const [gewaehlt, setGewaehlt] = useState('');
  const name = benutzername ?? ergebnis.benutzername ?? null;

  useEffect(() => {
    if (ergebnis.ok) karte.current?.focus();
  }, [ergebnis.ok, ergebnis.zeit]);

  const fehler = (z: Ergebnis) =>
    z.fehler ? (
      <p role="alert" className="rounded-md border border-fehler bg-fehler-toenung px-4 py-3 text-16 font-bold text-fehler">
        {texte.fehler[z.fehler] ?? texte.fehler.unbekannt}
      </p>
    ) : null;

  if (!name) {
    return (
      <form action={anlegen} className="flex flex-col gap-5 print:hidden">
        <input type="hidden" name="lernendeId" value={lernendeId} />
        <input type="hidden" name="sprache" value={sprache} />
        {fehler(anlage)}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kind-benutzername" className="font-bold">
            {texte.benutzername}
          </label>
          <input
            id="kind-benutzername"
            name="benutzername"
            required
            minLength={4}
            maxLength={32}
            pattern="[a-z0-9._]+"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={gewaehlt}
            onChange={(e) => setGewaehlt(e.currentTarget.value.toLowerCase())}
            aria-describedby="kind-benutzername-hilfe"
            className={klassen(FELD, 'sm:max-w-md')}
          />
          <p id="kind-benutzername-hilfe" className="text-16 text-tinte-2">
            {texte.benutzernameHilfe}
          </p>
        </div>
        <PasswortFeld
          key={anlage.zeit ?? 0}
          id="kind-passwort"
          label={texte.passwort}
          hilfe={texte.passwortHilfe}
          knopf={texte.vorschlag}
        />
        <button type="submit" disabled={legtAn} className={klassen(KNOPF, 'self-start bg-gruen-700 text-weiss hover:bg-gruen-800')}>
          {texte.anlegen}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {ergebnis.ok ? (
        <p role="status" className="rounded-md border border-gruen-700 bg-gruen-50 px-4 py-3 text-16 font-bold text-gruen-800 print:hidden">
          {ergebnis.ok === 'angelegt' ? texte.angelegt : texte.gesetzt}
        </p>
      ) : null}
      <div
        ref={karte}
        tabIndex={-1}
        id="zugangskarte"
        aria-labelledby="zugangskarte-titel"
        role="group"
        className="flex max-w-(--container-dialog) flex-col gap-4 rounded-lg border-2 border-gruen-700 bg-weiss p-5 outline-none md:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <p id="zugangskarte-titel" className="font-display text-24">
              {texte.karteKopf}
            </p>
            <p className="text-16 text-tinte-2">{texte.karteFuer.replace('{name}', kindName)}</p>
          </div>
          <svg aria-hidden viewBox="3 3 18 18" className="size-10 shrink-0 text-gruen-700">
            <path d="M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z" fill="currentColor" />
          </svg>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3 sm:gap-x-6">
          <dt className="text-16 font-bold text-tinte-2">{texte.anmeldung}</dt>
          <dd className="font-mono text-18 break-all sm:col-span-2">{adresse}</dd>
          <dt className="text-16 font-bold text-tinte-2">{texte.benutzername}</dt>
          <dd className="font-mono text-20 font-bold sm:col-span-2">{name}</dd>
          <dt className="text-16 font-bold text-tinte-2">{texte.passwortZeile}</dt>
          <dd
            className={klassen('font-mono sm:col-span-2', ergebnis.passwort ? 'text-20 font-bold tracking-wide' : 'text-16 text-tinte-2')}
          >
            {ergebnis.passwort ?? texte.passwortLeer}
          </dd>
        </dl>
        <p className="text-16 text-tinte-2 print:hidden">{ergebnis.passwort ? texte.karteEinmal : texte.karteOhnePasswort}</p>
        <button
          type="button"
          onClick={() => window.print()}
          className={klassen(KNOPF, 'self-start border-2 border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50 print:hidden')}
        >
          {texte.drucken}
        </button>
      </div>
      {gesperrt ? (
        <p className="text-16 font-bold text-warnung print:hidden">{texte.gesperrt}</p>
      ) : (
        <form action={setzen} className="flex flex-col gap-4 border-t border-linie pt-5 print:hidden">
          <input type="hidden" name="lernendeId" value={lernendeId} />
          <div className="flex flex-col gap-1">
            <h3 className="text-20">{texte.zuruecksetzenTitel}</h3>
            <p className="text-16 text-tinte-2">{texte.zuruecksetzenText}</p>
          </div>
          {fehler(neu)}
          <PasswortFeld
            key={neu.zeit ?? 0}
            id="kind-passwort-neu"
            label={texte.neuesPasswort}
            hilfe={texte.passwortHilfe}
            knopf={texte.vorschlag}
          />
          <button
            type="submit"
            disabled={setzt}
            className={klassen(KNOPF, 'self-start border-2 border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50')}
          >
            {texte.zuruecksetzen}
          </button>
        </form>
      )}
    </div>
  );
}
