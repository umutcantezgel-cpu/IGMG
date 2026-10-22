'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { ReligioeserBausteinTyp, ReligioesesUrteil } from '@/lib/lernapp/freigabe';
import type { LernappZustand } from '@/lib/lernapp/verwaltung/aktion';

type Aktion = (vorher: LernappZustand, fd: FormData) => Promise<LernappZustand>;

/** Reihenfolge der Urteile: „unsicher bzw. Änderungsvorschlag“ zuerst, ohne Vorauswahl (nichts wird aus Versehen freigegeben). */
const URTEILE: readonly ReligioesesUrteil[] = ['aenderungsvorschlag', 'ok', 'abgelehnt'];

/**
 * Urteil der religiösen Prüfung (L6-03, ADR 0040 Nr. 5): je Beleg der Haken „Quelle geprüft, Aussage stimmt nach hanefitischer
 * Lehre“ (ohne Belege ein Haken für den Inhalt), dann das Urteil – „unsicher oder Änderungsvorschlag“ steht zuerst und ist,
 * wie die übrigen, nicht vorausgewählt. Gesendet wird der Hash, den die Person gesehen hat; hat sich der Baustein inzwischen
 * geändert, lehnt die Action ab. Rückmeldung mit Fokus (K-07), Fehler am Feld über `aria-describedby`.
 */
export function ReligioesesUrteilFormular({
  aktion,
  typ,
  id,
  hash,
  belege,
}: {
  aktion: Aktion;
  typ: ReligioeserBausteinTyp;
  id: string;
  hash: string;
  /**
   * Kennung, Wert des Hakens (Kennung und Hash der gezeigten Fassung, `belegHaken`) und sichtbarer Name je Beleg (z. B.
   * „Beleg 1“) samt der Kennung seiner Karte
   */
  belege: readonly { id: string; wert: string; name: string; karte: string }[];
}) {
  const t = useTranslations('verwaltung.lernapp');
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRef<HTMLDivElement>(null);
  const basis = useId();
  useEffect(() => {
    if (z.fehler || z.gespeichert) ref.current?.focus();
  }, [z]);
  const fehler = (k: string) => (t.has(`fehler.${k}`) ? t(`fehler.${k}` as never) : t('fehler.pruefen'));
  const feld = (k: string | undefined) =>
    k ? (t.has(`feldFehler.${k}`) ? t(`feldFehler.${k}` as never) : t('fehler.pruefen')) : undefined;
  const urteilFehler = feld(z.feldFehler?.urteil);
  const gespeichert =
    z.hinweis && t.has(`religioes.formular.gespeichert.${z.hinweis}`)
      ? t(`religioes.formular.gespeichert.${z.hinweis}` as never)
      : t('gespeichert');

  return (
    <form action={absenden} className="flex flex-col gap-5" noValidate aria-labelledby={`${basis}-titel`}>
      <h2 id={`${basis}-titel`} className="font-display text-24 font-semibold">
        {t('religioes.formular.titel')}
      </h2>
      <div ref={ref} tabIndex={-1} className="outline-none empty:hidden">
        {z.fehler && z.fehler !== 'pruefen' ? (
          <Meldung art="fehler">{fehler(z.fehler)}</Meldung>
        ) : z.fehler ? (
          <Meldung art="fehler">{t('fehler.pruefen')}</Meldung>
        ) : z.gespeichert ? (
          <Meldung art="erfolg">{gespeichert}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="typ" value={typ} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="hash" value={hash} />

      {belege.length ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">{t('religioes.formular.belege')}</legend>
          {belege.map((b) => (
            <label key={b.id} className="flex min-h-12 items-center gap-3">
              <input type="checkbox" name="beleg" value={b.wert} className="size-6 shrink-0" aria-describedby={b.karte} />
              <span>
                <span className="font-bold">{b.name}:</span> {t('religioes.formular.belegHaken')}
              </span>
            </label>
          ))}
        </fieldset>
      ) : typ !== 'aussage' ? (
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" name="bestaetigt" value="1" className="size-6 shrink-0" />
          <span>{t(`religioes.formular.inhaltHaken.${typ}`)}</span>
        </label>
      ) : null}

      <fieldset className="flex flex-col gap-2" aria-describedby={urteilFehler ? `${basis}-urteil-fehler` : undefined}>
        <legend className="mb-2 font-bold">{t('religioes.formular.urteil')}</legend>
        {URTEILE.map((u) => (
          <div key={u} className="flex min-h-12 items-start gap-3 py-1">
            <input
              id={`${basis}-urteil-${u}`}
              type="radio"
              name="urteil"
              value={u}
              className="mt-1 size-6 shrink-0"
              aria-describedby={`${basis}-hinweis-${u}`}
            />
            <div className="flex flex-col">
              <label htmlFor={`${basis}-urteil-${u}`} className="min-h-7 font-bold">
                {t(`religioes.formular.urteile.${u}`)}
              </label>
              <span id={`${basis}-hinweis-${u}`} className="text-16 text-tinte-2">
                {t(`religioes.formular.urteilHinweis.${u}`)}
              </span>
            </div>
          </div>
        ))}
        {urteilFehler ? (
          <p id={`${basis}-urteil-fehler`} className="text-16 font-bold text-fehler">
            {urteilFehler}
          </p>
        ) : null}
      </fieldset>

      <Rahmen
        id={`${basis}-vorschlag`}
        label={t('religioes.formular.vorschlag')}
        hinweis={t('religioes.formular.vorschlagHinweis')}
        fehler={feld(z.feldFehler?.vorschlag)}
        kinder={(aria) => <textarea {...aria} name="vorschlag" rows={4} maxLength={2000} lang="de" className={`${eingabe} py-2`} />}
      />
      <Rahmen
        id={`${basis}-kommentar`}
        label={t('religioes.formular.kommentar')}
        hinweis={t('religioes.formular.kommentarHinweis')}
        fehler={feld(z.feldFehler?.kommentar)}
        kinder={(aria) => <textarea {...aria} name="kommentar" rows={3} maxLength={1000} lang="de" className={`${eingabe} py-2`} />}
      />
      <Button type="submit" disabled={laeuft} className="self-start">
        <Save aria-hidden />
        {laeuft ? t('laeuft') : t('religioes.formular.speichern')}
      </Button>
    </form>
  );
}
