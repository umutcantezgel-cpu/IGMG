'use client';

import { ArrowRight, Download, Save, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { Haken } from '@/components/konto/Haken';
import { PasswortFeld } from '@/components/konto/PasswortFeld';
import { Button } from '@/components/ui/button';
import { QrCode } from '@/components/verwaltung/anmeldung/QrCode';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import {
  datenExportieren,
  kontoPasswortAendern,
  kontoZweiFaktorAbschalten,
  kontoZweiFaktorBestaetigen,
  kontoZweiFaktorStarten,
  loeschAntragStellen,
  profilSpeichern,
  type MeinZustand,
} from '@/server/actions/mein-bereich';

/**
 * Formulare in „Mein Bereich › Konto“ (ADR 0026). Fehler als Schlüssel unter `meinBereich`, Erfolg als Meldung mit
 * Fokus. Knöpfe ≥ 48 px, Rückmeldung über Farbe und Druck (B-01).
 */
const KNOPF = 'transition duration-(--dauer-rueckmeldung) active:scale-98 disabled:cursor-wait motion-reduce:active:scale-100';

function useMeldungsFokus(zustand: MeinZustand, id: string) {
  useEffect(() => {
    if (zustand.fehler || zustand.ok) document.getElementById(id)?.focus();
  }, [zustand, id]);
}

function Rueckmeldung({ zustand, id, erfolg }: { zustand: MeinZustand; id: string; erfolg: string }) {
  const t = useTranslations('meinBereich');
  if (zustand.fehler)
    return (
      <Meldung art="fehler" id={id} fokus>
        {t(zustand.fehler)}
      </Meldung>
    );
  if (zustand.ok)
    return (
      <Meldung art="erfolg" id={id} fokus>
        {erfolg}
      </Meldung>
    );
  return null;
}

// ───────────────────────────── Profil ─────────────────────────────

export function ProfilFormular({
  name,
  anzeigename,
  sprache,
  istKind,
}: {
  name: string;
  anzeigename: string;
  sprache: string;
  istKind: boolean;
}) {
  const t = useTranslations('meinBereich');
  const ort = useLocale();
  const [zustand, aktion, laeuft] = useActionState<MeinZustand, FormData>(profilSpeichern, {});
  useMeldungsFokus(zustand, 'profil-meldung');
  const ff = (f: string) => (zustand.feldFehler?.[f] ? t(zustand.feldFehler[f]) : undefined);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={ort} />
      <Rueckmeldung zustand={zustand} id="profil-meldung" erfolg={t('konto.profil.gespeichert')} />
      {istKind ? null : (
        <div className="grid gap-5 md:grid-cols-2">
          <Feld
            id="profil-name"
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            label={t('konto.profil.name')}
            defaultValue={name}
            fehler={ff('name')}
          />
          <Feld
            id="profil-anzeigename"
            name="anzeigename"
            required
            maxLength={40}
            label={t('konto.profil.anzeigename')}
            hinweis={t('konto.profil.anzeigenameHinweis')}
            defaultValue={anzeigename}
            fehler={ff('anzeigename')}
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profil-sprache" className="font-bold">
          {t('konto.profil.sprache')}
        </label>
        <select
          id="profil-sprache"
          name="profilSprache"
          defaultValue={sprache}
          aria-describedby="profil-sprache-hinweis"
          className="min-h-12 w-full max-w-80 rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte"
        >
          <option value="de" lang="de">
            Deutsch
          </option>
          <option value="tr" lang="tr">
            Türkçe
          </option>
          <option value="en" lang="en">
            English
          </option>
        </select>
        <p id="profil-sprache-hinweis" className="text-16 text-tinte-2">
          {t('konto.profil.spracheHinweis')}
        </p>
      </div>
      <Button type="submit" disabled={laeuft} className={`self-start ${KNOPF}`}>
        {laeuft ? <LadeStern /> : <Save aria-hidden />}
        {t('konto.profil.speichern')}
      </Button>
    </form>
  );
}

// ───────────────────────────── Passwort ─────────────────────────────

export function PasswortAendernFormular() {
  const t = useTranslations('meinBereich');
  const [zustand, aktion, laeuft] = useActionState<MeinZustand, FormData>(kontoPasswortAendern, {});
  useMeldungsFokus(zustand, 'passwort-meldung');
  const ff = (f: string) => (zustand.feldFehler?.[f] ? t(zustand.feldFehler[f]) : undefined);
  return (
    <form action={aktion} className="flex max-w-120 flex-col gap-5" noValidate>
      <Rueckmeldung zustand={zustand} id="passwort-meldung" erfolg={t('konto.passwort.gespeichert')} />
      <PasswortFeld
        id="passwort-aktuell"
        name="aktuell"
        label={t('konto.passwort.aktuell')}
        autoComplete="current-password"
        fehler={ff('aktuell')}
      />
      <PasswortFeld id="passwort-neu" name="neu" label={t('konto.passwort.neu')} autoComplete="new-password" staerke fehler={ff('neu')} />
      <PasswortFeld
        id="passwort-wiederholung"
        name="wiederholung"
        label={t('konto.passwort.wiederholung')}
        autoComplete="new-password"
        fehler={ff('wiederholung')}
      />
      <Button type="submit" disabled={laeuft} className={`self-start ${KNOPF}`}>
        {laeuft ? <LadeStern /> : <Save aria-hidden />}
        {t('konto.passwort.speichern')}
      </Button>
    </form>
  );
}

// ───────────────────────────── Zwei-Faktor ─────────────────────────────

/** Einrichtung: Passwort bestätigen → QR (lokal als SVG) + Schlüssel + Ersatzcodes → Code bestätigen. */
export function ZweiFaktorEinrichten() {
  const t = useTranslations('meinBereich');
  const ort = useLocale();
  const [start, startAktion, startLaeuft] = useActionState<MeinZustand, FormData>(kontoZweiFaktorStarten, {});
  const [ende, endeAktion, endeLaeuft] = useActionState<MeinZustand, FormData>(kontoZweiFaktorBestaetigen, {});
  const totp = start.totp;
  useEffect(() => {
    if (totp) document.getElementById('zwei-faktor-schritt2')?.focus();
  }, [totp]);
  if (!totp) {
    return (
      <form action={startAktion} className="flex max-w-120 flex-col gap-5" noValidate>
        {start.fehler ? <Meldung art="fehler">{t(start.fehler)}</Meldung> : null}
        <PasswortFeld
          id="zwei-faktor-passwort"
          name="passwort"
          label={t('konto.zweiFaktor.schritt1')}
          autoComplete="current-password"
          fehler={start.feldFehler?.passwort ? t(start.feldFehler.passwort) : undefined}
        />
        <Button type="submit" disabled={startLaeuft} className={`self-start ${KNOPF}`}>
          {t('konto.zweiFaktor.weiter')}
          {startLaeuft ? <LadeStern /> : <ArrowRight aria-hidden />}
        </Button>
      </form>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="self-start rounded-lg border border-linie bg-weiss p-3 shadow-s1">
          <QrCode text={totp.uri} titel={t('konto.zweiFaktor.qrAlt')} groesse={200} />
        </div>
        <section aria-labelledby="zwei-faktor-schritt2" className="flex min-w-0 flex-col gap-3">
          <h3 id="zwei-faktor-schritt2" tabIndex={-1} className="text-20 outline-none">
            {t('konto.zweiFaktor.schritt2')}
          </h3>
          <p className="text-pretty">{t('konto.zweiFaktor.scannen')}</p>
          <p className="text-16 text-tinte-2">{t('konto.zweiFaktor.manuell')}</p>
          <code data-testid="totp-geheimnis" className="block rounded-md bg-sand px-3.5 py-2.5 font-mono text-18 break-all">
            {totp.geheimnis}
          </code>
        </section>
      </div>
      <section aria-labelledby="zwei-faktor-ersatz" className="flex flex-col gap-3">
        <h3 id="zwei-faktor-ersatz" className="text-20">
          {t('konto.zweiFaktor.ersatzTitel')}
        </h3>
        <Meldung art="info">{t('konto.zweiFaktor.ersatzHinweis')}</Meldung>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] gap-2 font-mono text-16 sm:text-18">
          {totp.ersatzcodes.map((c) => (
            <li key={c} className="rounded-md bg-sand px-3 py-2.5 text-center tracking-wide">
              {c}
            </li>
          ))}
        </ul>
      </section>
      <form action={endeAktion} className="flex max-w-120 flex-col gap-5" noValidate>
        <input type="hidden" name="sprache" value={ort} />
        <h3 className="text-20">{t('konto.zweiFaktor.schritt3')}</h3>
        {ende.fehler ? <Meldung art="fehler">{t(ende.fehler)}</Meldung> : null}
        <Feld
          id="zwei-faktor-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          label={t('konto.zweiFaktor.code')}
          fehler={ende.feldFehler?.code ? t(ende.feldFehler.code) : undefined}
          className="tracking-code tabular-nums"
        />
        <Button type="submit" disabled={endeLaeuft} className={`self-start ${KNOPF}`}>
          {endeLaeuft ? <LadeStern /> : <ShieldCheck aria-hidden />}
          {t('konto.zweiFaktor.bestaetigen')}
        </Button>
      </form>
    </div>
  );
}

export function ZweiFaktorAbschalten() {
  const t = useTranslations('meinBereich');
  const [offen, setOffen] = useState(false);
  const [zustand, aktion, laeuft] = useActionState<MeinZustand, FormData>(kontoZweiFaktorAbschalten, {});
  useMeldungsFokus(zustand, 'abschalten-meldung');
  if (zustand.ok)
    return (
      <Meldung art="erfolg" id="abschalten-meldung" fokus>
        {t('konto.zweiFaktor.abgeschaltet')}
      </Meldung>
    );
  if (!offen)
    return (
      <Button type="button" variant="outline" onClick={() => setOffen(true)} className={KNOPF} aria-expanded={false}>
        <ShieldOff aria-hidden />
        {t('konto.zweiFaktor.abschalten')}
      </Button>
    );
  return (
    <form action={aktion} className="tritt-auf flex max-w-120 flex-col gap-5 rounded-md bg-sand p-4" noValidate>
      <p className="text-pretty">{t('konto.zweiFaktor.abschaltenText')}</p>
      {zustand.fehler ? <Meldung art="fehler">{t(zustand.fehler)}</Meldung> : null}
      <PasswortFeld
        id="abschalten-passwort"
        name="passwort"
        label={t('konto.zweiFaktor.passwort')}
        autoComplete="current-password"
        fehler={zustand.feldFehler?.passwort ? t(zustand.feldFehler.passwort) : undefined}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="destructive" disabled={laeuft} className={KNOPF}>
          {laeuft ? <LadeStern /> : <ShieldOff aria-hidden />}
          {t('konto.zweiFaktor.abschaltenKnopf')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOffen(false)} className={KNOPF}>
          {t('abbrechen')}
        </Button>
      </div>
    </form>
  );
}

// ───────────────────────────── Datenexport ─────────────────────────────

export function DatenExport() {
  const t = useTranslations('meinBereich');
  const [laeuft, starte] = useTransition();
  const [meldung, setMeldung] = useState<{ art: 'erfolg' | 'fehler'; text: string } | null>(null);
  const exportieren = () =>
    starte(async () => {
      setMeldung(null);
      const r = await datenExportieren();
      if (!r.datei) return setMeldung({ art: 'fehler', text: t(r.fehler ?? 'fehler.allgemein') });
      const url = URL.createObjectURL(new Blob([r.datei], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `igmg-wetzlar-meine-daten-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMeldung({ art: 'erfolg', text: t('konto.export.fertig') });
    });
  return (
    <div className="flex flex-col gap-4">
      {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
      <Button type="button" variant="secondary" onClick={exportieren} disabled={laeuft} className={`self-start ${KNOPF}`}>
        {laeuft ? <LadeStern /> : <Download aria-hidden />}
        {laeuft ? t('konto.export.laeuft') : t('konto.export.knopf')}
      </Button>
    </div>
  );
}

// ───────────────────────────── Löschantrag ─────────────────────────────

export function LoeschAntrag() {
  const t = useTranslations('meinBereich');
  const [offen, setOffen] = useState(false);
  const [zustand, aktion, laeuft] = useActionState<MeinZustand, FormData>(loeschAntragStellen, {});
  useMeldungsFokus(zustand, 'loeschen-meldung');
  if (zustand.ok)
    return (
      <Meldung art="erfolg" id="loeschen-meldung" fokus>
        {t('konto.loeschen.eingegangen')}
      </Meldung>
    );
  if (!offen)
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOffen(true)}
        className={`border-fehler text-fehler hover:text-fehler ${KNOPF}`}
      >
        <Trash2 aria-hidden />
        {t('konto.loeschen.oeffnen')}
      </Button>
    );
  const ff = (f: string) => (zustand.feldFehler?.[f] ? t(zustand.feldFehler[f]) : undefined);
  return (
    <form
      action={aktion}
      className="tritt-auf flex max-w-140 flex-col gap-5 rounded-md border border-fehler bg-fehler-toenung p-4"
      noValidate
    >
      {zustand.fehler ? (
        <Meldung art="fehler" id="loeschen-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <PasswortFeld
        id="loeschen-passwort"
        name="passwort"
        label={t('konto.loeschen.passwort')}
        autoComplete="current-password"
        fehler={ff('passwort')}
      />
      <Haken id="loeschen-bestaetigt" name="bestaetigt" label={t('konto.loeschen.bestaetigt')} fehler={ff('bestaetigt')} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="destructive" disabled={laeuft} className={KNOPF}>
          {laeuft ? <LadeStern /> : <Trash2 aria-hidden />}
          {t('konto.loeschen.knopf')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOffen(false)} className={KNOPF}>
          {t('abbrechen')}
        </Button>
      </div>
    </form>
  );
}
