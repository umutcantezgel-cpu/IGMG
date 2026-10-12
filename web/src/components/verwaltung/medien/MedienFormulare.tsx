'use client';

import { type ChangeEvent, useActionState, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { DIREKT_MAX_BYTES, DIREKT_PFAD, neuerEingangsSchluessel } from '@/lib/medien/direkt';
import { aendern, hochladen, type MedienZustand } from '@/server/actions/medien';

type Start = { altDe: string; altTr: string; altEn: string; bildrechte: string };

function useFokus(z: MedienZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok) ref.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  return ref;
}

function TextFelder({ z, start, tv }: { z: MedienZustand; start: Start; tv: string }) {
  const t = useTranslations('verwaltung.medien');
  const fehler = (f: string) => (z.feldFehler?.[f] ? t(`fehler.${z.feldFehler[f]}` as never) : undefined);
  const wert = (f: keyof Start) => z.werte?.[f] ?? start[f];
  return (
    <>
      <Feld
        id="medium-alt-de"
        name="altDe"
        required
        label={t('hochladen.altDe')}
        pflicht={tv}
        hinweis={t('hochladen.altHinweis')}
        defaultValue={wert('altDe')}
        fehler={fehler('altDe')}
      />
      <details className="rounded-md border border-linie px-4 py-2" open={Boolean(start.altTr || start.altEn)}>
        <summary className="min-h-11 cursor-pointer content-center font-bold">{t('hochladen.uebersetzungen')}</summary>
        <div className="flex flex-col gap-4 py-3">
          <Feld
            id="medium-alt-tr"
            name="altTr"
            lang="tr"
            label={t('hochladen.altTr')}
            defaultValue={wert('altTr')}
            fehler={fehler('altTr')}
          />
          <Feld
            id="medium-alt-en"
            name="altEn"
            lang="en"
            label={t('hochladen.altEn')}
            defaultValue={wert('altEn')}
            fehler={fehler('altEn')}
          />
        </div>
      </details>
      <Feld
        id="medium-bildrechte"
        name="bildrechte"
        label={t('hochladen.bildrechte')}
        hinweis={t('hochladen.bildrechteHinweis')}
        defaultValue={wert('bildrechte')}
        fehler={fehler('bildrechte')}
      />
    </>
  );
}

/** Längste Kante beim Verkleinern im Browser (wie auf dem Server, `MAX_KANTE`). */
const KANTE = 2560;

/**
 * Verkleinert ein Bild im Browser auf höchstens `KANTE` px als WebP, bis es unter `grenze` Bytes liegt (ADR 0020:
 * Vercel nimmt höchstens 4,5 MB je Anfrage an). Der Server verarbeitet die Datei danach wie jede andere.
 */
async function verkleinere(datei: File, grenze: number): Promise<File | null> {
  const bild = await createImageBitmap(datei);
  const faktor = Math.min(1, KANTE / Math.max(bild.width, bild.height));
  const leinwand = document.createElement('canvas');
  leinwand.width = Math.round(bild.width * faktor);
  leinwand.height = Math.round(bild.height * faktor);
  leinwand.getContext('2d')?.drawImage(bild, 0, 0, leinwand.width, leinwand.height);
  bild.close();
  for (const qualitaet of [0.9, 0.82, 0.72]) {
    const blob = await new Promise<Blob | null>((fertig) => leinwand.toBlob(fertig, 'image/webp', qualitaet));
    if (blob && blob.size <= grenze) return new File([blob], `${datei.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
  }
  return null;
}

/**
 * Hochladen (C11, ADR 0007): Datei, Alt-Text (Pflicht), Bildrechte; nach Erfolg zur Detailseite. Liegt die Grenze des
 * Servers unter der Dateigröße (Vercel), werden Bilder vorher im Browser verkleinert. Große PDF-Dateien lädt der Browser
 * mit Vercel Blob direkt in den Speicher (`direkt`, ADR 0020, V-05); das Formular schickt dann nur den Eingangsschlüssel.
 * Ohne Direkt-Upload (andere Speicher) werden zu große PDF-Dateien wie bisher abgelehnt.
 */
export function HochladenFormular({ grenzeBytes, direkt = false }: { grenzeBytes: number; direkt?: boolean }) {
  const t = useTranslations('verwaltung.medien');
  const tv = useTranslations('verwaltung');
  // Erfolg leitet die Action selbst zur Detailseite weiter (kein router.push im Effekt, siehe hochladen())
  const [z, absenden, laeuft] = useActionState<MedienZustand, FormData>(hochladen, {});
  const ref = useFokus(z);
  const [vorab, setVorab] = useState<{ fehler?: string; hinweis?: string }>({});
  const [eingang, setEingang] = useState<{ schluessel: string; name: string } | null>(null);
  const [laedtDirekt, setLaedtDirekt] = useState(false);
  const mb = Math.floor(grenzeBytes / 1_000_000);
  const dateiFehler = vorab.fehler ?? (z.feldFehler?.datei ? t(`fehler.${z.feldFehler.datei}` as never) : undefined);
  async function gewaehlt(e: ChangeEvent<HTMLInputElement>) {
    const eingabe = e.currentTarget;
    const datei = eingabe.files?.[0];
    setVorab({});
    setEingang(null);
    if (!datei || datei.size <= grenzeBytes) return;
    if (direkt && datei.type === 'application/pdf') {
      if (datei.size > DIREKT_MAX_BYTES) {
        eingabe.value = '';
        setVorab({ fehler: t('fehler.datei_zuGross') });
        return;
      }
      setLaedtDirekt(true);
      setVorab({ hinweis: t('hochladen.direktLaeuft', { mb }) });
      try {
        const { upload } = await import('@vercel/blob/client');
        const ergebnis = await upload(neuerEingangsSchluessel(), datei, {
          access: 'private',
          handleUploadUrl: DIREKT_PFAD,
          contentType: 'application/pdf',
        });
        // Die große Datei geht nicht mehr über die Server Action, nur ihr Eingangsschlüssel
        eingabe.value = '';
        setEingang({ schluessel: ergebnis.pathname, name: datei.name });
        setVorab({ hinweis: t('hochladen.direktFertig', { name: datei.name }) });
      } catch {
        eingabe.value = '';
        setVorab({ fehler: t('fehler.direktFehlgeschlagen') });
      } finally {
        setLaedtDirekt(false);
      }
      return;
    }
    const kleiner = datei.type.startsWith('image/') ? await verkleinere(datei, grenzeBytes).catch(() => null) : null;
    if (!kleiner) {
      eingabe.value = '';
      setVorab({ fehler: t('fehler.datei_zuGrossServer', { mb }) });
      return;
    }
    const liste = new DataTransfer();
    liste.items.add(kleiner);
    eingabe.files = liste.files;
    setVorab({ hinweis: t('hochladen.verkleinert', { mb }) });
  }
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="medium-datei" className="font-bold">
          {t('hochladen.datei')} <span className="font-normal text-tinte-2">{tv('pflichtfeld')}</span>
        </label>
        <p id="medium-datei-hinweis" className="text-16 text-tinte-2">
          {t('hochladen.dateiHinweis')}
        </p>
        <input
          id="medium-datei"
          type="file"
          name="datei"
          required
          accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
          onChange={gewaehlt}
          // Während des Direkt-Uploads gesperrt: sonst überschriebe das Ergebnis eine neue Auswahl
          disabled={laedtDirekt}
          aria-invalid={dateiFehler ? true : undefined}
          aria-describedby={['medium-datei-hinweis', dateiFehler ? 'medium-datei-fehler' : ''].filter(Boolean).join(' ')}
          className="text-18"
        />
        {dateiFehler ? (
          <p id="medium-datei-fehler" className="text-16 font-bold text-fehler">
            {dateiFehler}
          </p>
        ) : null}
        {vorab.hinweis ? (
          <p role="status" className="text-16 text-gruen-800">
            {vorab.hinweis}
          </p>
        ) : null}
      </div>
      {eingang ? (
        <>
          <input type="hidden" name="eingang" value={eingang.schluessel} />
          <input type="hidden" name="eingangName" value={eingang.name} />
        </>
      ) : null}
      <TextFelder z={z} start={{ altDe: '', altTr: '', altEn: '', bildrechte: '' }} tv={tv('pflichtfeld')} />
      <Button type="submit" className="self-start" disabled={laeuft || laedtDirekt}>
        {laeuft ? t('hochladen.sendet') : t('hochladen.senden')}
      </Button>
    </form>
  );
}

/** Alt-Text und Bildrechte ändern (C11). */
export function MediumTextFormular({ id, start, darf }: { id: string; start: Start; darf: boolean }) {
  const t = useTranslations('verwaltung.medien');
  const tv = useTranslations('verwaltung');
  const [z, absenden, laeuft] = useActionState<MedienZustand, FormData>(aendern, {});
  const ref = useFokus(z);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="id" value={id} />
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : z.ok ? (
          <Meldung art="erfolg" fokus>
            {t('detail.gespeichert')}
          </Meldung>
        ) : null}
      </div>
      <fieldset disabled={!darf} className="flex flex-col gap-4">
        <TextFelder z={z} start={start} tv={tv('pflichtfeld')} />
      </fieldset>
      {darf ? (
        <Button type="submit" className="self-start" disabled={laeuft}>
          {t('detail.speichern')}
        </Button>
      ) : null}
    </form>
  );
}
