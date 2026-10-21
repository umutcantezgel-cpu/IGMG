'use client';

import { Plus, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, type RefObject, useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { LernappZustand } from '@/lib/lernapp/verwaltung/aktion';

/**
 * Formulare der Lern-App-Verwaltung (L3-06): Server Action mit Rückmeldung und Fokus darauf (K-07), Fehler am Feld über
 * `aria-describedby`. Texte aus `messages/verwaltung/lernapp.json` (`fehler`, `feldFehler`).
 */
type Aktion = (vorher: LernappZustand, fd: FormData) => Promise<LernappZustand>;

function useRueckmeldung(z: LernappZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.gespeichert) ref.current?.focus();
  }, [z]);
  return ref;
}

function useFehlerText() {
  const t = useTranslations('verwaltung.lernapp');
  return {
    fehler: (k: string) => (t.has(`fehler.${k}`) ? t(`fehler.${k}` as never) : t('fehler.pruefen')),
    feld: (k: string | undefined) => (k ? (t.has(`feldFehler.${k}`) ? t(`feldFehler.${k}` as never) : t('fehler.pruefen')) : undefined),
    t,
  };
}

function Rueckmeldung({ z, erfolg, refDiv }: { z: LernappZustand; erfolg?: string; refDiv: RefObject<HTMLDivElement | null> }) {
  const { fehler, t } = useFehlerText();
  return (
    <div ref={refDiv} tabIndex={-1} className="outline-none empty:hidden">
      {z.fehler ? (
        <Meldung art="fehler">{fehler(z.fehler)}</Meldung>
      ) : z.gespeichert ? (
        <Meldung art="erfolg">{erfolg ?? t('gespeichert')}</Meldung>
      ) : null}
    </div>
  );
}

/** Ein Knopf mit versteckten Feldern (Erledigen, Sperren, Verwerfen, Stimme wählen). */
export function AktionsKnopf({
  aktion,
  felder,
  knopf,
  erfolg,
  variante = 'outline',
  icon,
  gedrueckt,
  label,
}: {
  aktion: Aktion;
  felder: Record<string, string>;
  knopf: string;
  erfolg?: string;
  variante?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  icon?: ReactNode;
  /** Umschalter (`aria-pressed`) */
  gedrueckt?: boolean;
  /** Zugänglicher Name, wenn der sichtbare Text nicht reicht */
  label?: string;
}) {
  const { t } = useFehlerText();
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRueckmeldung(z);
  return (
    <form action={absenden} className="flex flex-col gap-2">
      <Rueckmeldung z={z} erfolg={erfolg} refDiv={ref} />
      {Object.entries(felder).map(([name, wert]) => (
        <input key={name} type="hidden" name={name} value={wert} />
      ))}
      <Button
        type="submit"
        variant={variante}
        size="sm"
        disabled={laeuft}
        aria-pressed={gedrueckt}
        aria-label={label}
        className="self-start"
      >
        {icon}
        {laeuft ? t('laeuft') : knopf}
      </Button>
    </form>
  );
}

/** Prüfsprachen einer Person (je Sprache: keine, Muttersprache, sehr gut). */
export function PruefsprachenFormular({
  aktion,
  benutzerId,
  name,
  sprachen,
  werte,
}: {
  aktion: Aktion;
  benutzerId: string;
  name: string;
  sprachen: readonly ('de' | 'tr' | 'ar')[];
  werte: Partial<Record<string, string>>;
}) {
  const { t } = useFehlerText();
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRueckmeldung(z);
  const basis = useId();
  return (
    <form action={absenden} className="flex flex-col gap-3" aria-label={t('pruefende.fuer', { name })}>
      <Rueckmeldung z={z} refDiv={ref} />
      <input type="hidden" name="benutzerId" value={benutzerId} />
      <div className="grid gap-3 sm:grid-cols-3">
        {sprachen.map((s) => (
          <Rahmen
            key={s}
            id={`${basis}-${s}`}
            label={t('pruefende.sprachFeld', { sprache: t(`sprache.${s}`) })}
            kinder={(aria) => (
              <select {...aria} name={`sprache_${s}`} defaultValue={werte[s] ?? ''} className={eingabe}>
                <option value="">{t('pruefende.ebene.keine')}</option>
                <option value="muttersprache">{t('pruefende.ebene.muttersprache')}</option>
                <option value="sehr_gut">{t('pruefende.ebene.sehr_gut')}</option>
              </select>
            )}
          />
        ))}
      </div>
      <Button type="submit" variant="secondary" disabled={laeuft} className="self-start">
        <Save aria-hidden />
        {laeuft ? t('laeuft') : t('pruefende.speichern')}
      </Button>
    </form>
  );
}

/** Sprecherin oder Sprecher mit unterschriebener Vereinbarung (PDF) anlegen; Modul B1 und B2 getrennt. */
export function SprecherFormular({ aktion }: { aktion: Aktion }) {
  const { t, feld } = useFehlerText();
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRueckmeldung(z);
  const basis = useId();
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <Rueckmeldung z={z} refDiv={ref} />
      <Rahmen
        id={`${basis}-name`}
        label={t('audio.name')}
        fehler={feld(z.feldFehler?.name)}
        kinder={(aria) => (
          <input {...aria} name="name" defaultValue={z.werte?.name ?? ''} maxLength={120} autoComplete="off" className={eingabe} />
        )}
      />
      <Rahmen
        id={`${basis}-datei`}
        label={t('audio.vereinbarung')}
        fehler={feld(z.feldFehler?.datei)}
        kinder={(aria) => (
          <input {...aria} type="file" name="datei" accept="application/pdf,.pdf" className="min-h-12 w-full max-w-full text-18" />
        )}
      />
      <label className="flex min-h-12 items-center gap-3">
        <input type="checkbox" name="b1" value="1" className="size-5" />
        {t('audio.b1Feld')}
      </label>
      <label className="flex min-h-12 items-center gap-3">
        <input type="checkbox" name="b2" value="1" className="size-5" />
        {t('audio.b2Feld')}
      </label>
      <Button type="submit" disabled={laeuft} className="self-start">
        <Plus aria-hidden />
        {laeuft ? t('laeuft') : t('audio.anlegen')}
      </Button>
    </form>
  );
}

/** Eine angenommene Fassung ergänzen (Meldungen). `sprache`: Sprache der Fassung (lang/dir). */
export function AlternativeFormular({
  aktion,
  id,
  sprache,
  laenge,
}: {
  aktion: Aktion;
  id: string;
  sprache: 'de' | 'tr' | 'ar';
  laenge: number;
}) {
  const { t, feld } = useFehlerText();
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRueckmeldung(z);
  const basis = useId();
  return (
    <form action={absenden} className="flex flex-col gap-3" noValidate>
      <Rueckmeldung z={z} erfolg={t('meldungen.erledigtText')} refDiv={ref} />
      <input type="hidden" name="id" value={id} />
      <Rahmen
        id={`${basis}-alternative`}
        label={t('meldungen.alternative')}
        hinweis={t('meldungen.alternativeHinweis')}
        fehler={feld(z.feldFehler?.alternative)}
        kinder={(aria) => (
          <input
            {...aria}
            name="alternative"
            defaultValue={z.werte?.alternative ?? ''}
            maxLength={laenge}
            lang={sprache}
            dir={sprache === 'ar' ? 'rtl' : 'ltr'}
            autoComplete="off"
            className={eingabe}
          />
        )}
      />
      <Button type="submit" variant="secondary" disabled={laeuft} className="self-start">
        <Plus aria-hidden />
        {laeuft ? t('laeuft') : t('meldungen.ergaenzen')}
      </Button>
    </form>
  );
}
