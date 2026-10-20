'use client';

import type { ReactNode } from 'react';
import { formatiere, type Werte, type Ziffern } from '@/lib/lernapp/format';
import { richtung, type SpielerTexte, type UiSprache } from '../typen';

/** Platzhalter für einen Einschub in einer Vorlage (wird an dieser Stelle geteilt). */
const EINSCHUB = String.fromCharCode(0);

/**
 * Vorlage der Oberfläche mit einem Wert in anderer Sprache (`lang`/`dir`, isoliert wie `<bdi>`, KERN 4.0 §7), z. B.
 * „Gehört zu: {kategorie}“ mit einer deutschen Kategorie in der arabischen Oberfläche.
 */
export function MitEinschub({
  vorlage,
  name,
  wert,
  sprache,
  ui,
  ziffern,
  werte = {},
}: {
  vorlage: string;
  name: string;
  wert: string;
  sprache: UiSprache;
  ui: UiSprache;
  ziffern: Ziffern;
  werte?: Werte;
}) {
  const [vor, nach] = formatiere(vorlage, { ...werte, [name]: EINSCHUB }, ui, ziffern).split(EINSCHUB);
  return (
    <>
      {vor}
      <bdi lang={sprache} dir={richtung(sprache)}>
        {wert}
      </bdi>
      {nach}
    </>
  );
}

/**
 * Nach der Antwort im Wissenskurs (L2-03): das Ergebnis in Worten, die Begründung und die aufklappbare Quellenzeile der
 * Aussage (KERN 4.0 §2.3 „Kennzeichnung“), jeweils in der Sprache der Inhalte. Farbe trägt nie allein die Bedeutung.
 */
export function Erklaerung({
  kopf,
  begruendung,
  quelle,
  sprache,
  texte,
}: {
  kopf?: ReactNode;
  begruendung?: string;
  quelle?: string;
  /** Sprache der Inhalte (Wissenskurs: Deutsch) */
  sprache: UiSprache;
  texte: SpielerTexte['aufgaben']['wissen'];
}) {
  if (!kopf && !begruendung && !quelle) return null;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4">
      {kopf}
      {begruendung ? (
        <p className="text-18">
          <span className="font-bold">{texte.begruendung}</span>{' '}
          <bdi lang={sprache} dir={richtung(sprache)}>
            {begruendung}
          </bdi>
        </p>
      ) : null}
      {quelle ? (
        <details className="text-16">
          <summary className="cursor-pointer py-2.5 font-bold">{texte.quelleZeigen}</summary>
          <p className="text-tinte-2">
            <span className="sr-only">{texte.quelle}: </span>
            <bdi lang={sprache} dir={richtung(sprache)}>
              {quelle}
            </bdi>
          </p>
        </details>
      ) : null}
    </div>
  );
}
