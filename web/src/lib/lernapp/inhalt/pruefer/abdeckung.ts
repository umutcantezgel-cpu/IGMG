import { SPRACH_STUFEN, type Sprache } from '../../kurse';
import type { Inhalte } from './dateien';
import type { SprachStufe } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „Abdeckung des Rahmenplans“ (PLAN §6.2, §6.4; Tor L4 „Lemma-Ziele ±5 %“).
 *
 * - Rahmenplan ↔ Leitfaden: Themen und Religionsbezug-Kandidaten der Einheiten gibt es im Leitfaden (blockierend); die
 *   Budgets der Einheiten ergeben das Budget der Stufe (Warnung).
 * - Inhalt ↔ Rahmenplan: Jede Einheit steht im Rahmenplan (blockierend; Vorkurs-Einheiten mit `nurFuerAusgang` nur
 *   Warnung); Stationen wie im Rahmenplan (Warnung).
 * - Abdeckung je Kurs und Stufe ({@link AbdeckungZeile}): Einheiten vorhanden, Lemmata gegen das Budget. Ist eine Stufe
 *   vollständig, muss die Lemma-Zahl innerhalb von ±5 % des Budgets liegen (blockierend), sonst nur Bericht.
 */

export type AbdeckungZeile = {
  kurs: Sprache;
  stufe: SprachStufe;
  einheiten: number;
  einheitenRahmen: number;
  lemmata: number;
  budget: number;
  /** Lemmata / Budget */
  anteil: number;
  vollstaendig: boolean;
};

export const ABDECKUNG_TOLERANZ = 0.05;

export function pruefeAbdeckung(inhalte: Inhalte): { befunde: Befunde; zeilen: AbdeckungZeile[] } {
  const b = new Befunde('abdeckung');
  const zeilen: AbdeckungZeile[] = [];
  const leitfaden = inhalte.leitfaden?.daten;
  const themen = new Set(leitfaden?.themen.map((t) => t.id) ?? []);
  const kandidaten = new Set([
    ...(leitfaden?.religionsbezug.orte_ereignisse.map((o) => o.id) ?? []),
    ...(leitfaden?.religionsbezug.formeln.liste.map((f) => f.id) ?? []),
  ]);

  for (const [sprache, { pfad, daten: r }] of inhalte.rahmen) {
    for (const st of r.stufen) {
      const summe = st.einheiten.reduce((s, e) => s + e.lemmaBudget, 0);
      if (summe !== st.lemmaBudget)
        b.warnung(pfad, `Budgets der Einheiten ${summe} ≠ Budget der Stufe ${st.lemmaBudget}`, `${sprache}.${st.stufe}`);
      for (const e of st.einheiten) {
        if (leitfaden && !themen.has(e.thema)) b.blockierend(pfad, `Thema ${e.thema} fehlt im Leitfaden`, e.schluessel);
        for (const k of e.religionsbezugKandidaten)
          if (leitfaden && !kandidaten.has(k)) b.blockierend(pfad, `Religionsbezug-Kandidat ${k} fehlt im Leitfaden`, e.schluessel);
      }
    }
  }

  const rahmenEinheiten = new Map<string, { stationen: readonly string[] }>();
  for (const [, { daten: r }] of inhalte.rahmen)
    for (const st of r.stufen) for (const e of st.einheiten) rahmenEinheiten.set(e.schluessel, e);

  const jeStufe = new Map<string, { einheiten: Set<string>; lemmata: number }>();
  for (const { pfad, daten: d } of inhalte.sprache) {
    const e = d.einheit.schluessel;
    if (inhalte.rahmen.has(d.kurs)) {
      const soll = rahmenEinheiten.get(e);
      if (!soll) {
        if (d.einheit.nurFuerAusgang) b.warnung(pfad, 'Vorkurs-Einheit ohne Eintrag im Rahmenplan', e);
        else b.blockierend(pfad, 'Einheit steht nicht im Rahmenplan', e);
      } else {
        const zaehle = (arten: readonly string[]) => arten.reduce((m, a) => m.set(a, (m.get(a) ?? 0) + 1), new Map<string, number>());
        const ist = zaehle(d.lektionen.map((l) => l.art));
        const fehlen = [...zaehle(soll.stationen)]
          .filter(([a, n]) => (ist.get(a) ?? 0) < n)
          .map(([a, n]) => `${a} ${ist.get(a) ?? 0}/${n}`);
        if (fehlen.length) b.warnung(pfad, `Stationen gegenüber dem Rahmenplan: ${fehlen.join(', ')}`, e);
      }
    }
    const k = `${d.kurs}|${d.stufe}`;
    const z = jeStufe.get(k) ?? { einheiten: new Set<string>(), lemmata: 0 };
    z.einheiten.add(e);
    z.lemmata += d.lemmata.filter((l) => !l.religionsbezug).length;
    jeStufe.set(k, z);
  }

  for (const [sprache, { pfad, daten: r }] of inhalte.rahmen)
    for (const st of r.stufen) {
      const z = jeStufe.get(`${sprache}|${st.stufe}`);
      if (!z) continue;
      const vorhanden = st.einheiten.filter((e) => z.einheiten.has(e.schluessel)).length;
      const zeile: AbdeckungZeile = {
        kurs: sprache,
        stufe: st.stufe,
        einheiten: vorhanden,
        einheitenRahmen: st.einheiten.length,
        lemmata: z.lemmata,
        budget: st.lemmaBudget,
        anteil: z.lemmata / st.lemmaBudget,
        vollstaendig: vorhanden === st.einheiten.length,
      };
      zeilen.push(zeile);
      if (zeile.vollstaendig && Math.abs(zeile.anteil - 1) > ABDECKUNG_TOLERANZ)
        b.blockierend(
          pfad,
          `${sprache}.${st.stufe} vollständig, aber ${z.lemmata} Lemmata statt ${st.lemmaBudget} ± ${ABDECKUNG_TOLERANZ * 100} %`,
          `${sprache}.${st.stufe}`,
        );
    }
  zeilen.sort((a, c) => a.kurs.localeCompare(c.kurs) || SPRACH_STUFEN.indexOf(a.stufe) - SPRACH_STUFEN.indexOf(c.stufe));
  return { befunde: b, zeilen };
}
