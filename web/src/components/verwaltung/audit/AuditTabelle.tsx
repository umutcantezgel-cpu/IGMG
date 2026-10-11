import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
/** Eine Zeile der Tabelle mit fertig formatierten Texten. */
export type AnzeigeZeile = {
  id: number;
  zeitpunkt: string;
  iso: string;
  benutzer: { haupt: string; zweit: string | null };
  aktion: string;
  ziel: { typ: string; kurz: string | null } | null;
  details: string[];
};

export type TabellenTexte = {
  beschriftung: string;
  keinWert: string;
  spalten: { zeitpunkt: string; benutzer: string; aktion: string; ziel: string; details: string };
};

/**
 * Protokolltabelle nach Muster 7: Zeitpunkt als Zeilenkopf (th scope=row), Scroll-Container mit `relative`.
 * Nur lesen: keine Schaltflächen je Zeile.
 */
export function AuditTabelle({ zeilen, texte }: { zeilen: AnzeigeZeile[]; texte: TabellenTexte }) {
  const s = texte.spalten;
  return (
    <TabellenRahmen beschriftung={texte.beschriftung}>
      <table className="w-full min-w-[48rem] border-collapse text-left">
        <caption className="sr-only">{texte.beschriftung}</caption>
        <thead className="bg-sand">
          <tr>
            <th scope="col" className="px-4 py-3 text-16 font-bold">
              {s.zeitpunkt}
            </th>
            <th scope="col" className="px-4 py-3 text-16 font-bold">
              {s.benutzer}
            </th>
            <th scope="col" className="px-4 py-3 text-16 font-bold">
              {s.aktion}
            </th>
            <th scope="col" className="px-4 py-3 text-16 font-bold">
              {s.ziel}
            </th>
            <th scope="col" className="px-4 py-3 text-16 font-bold">
              {s.details}
            </th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr key={z.id} className="border-t border-linie align-top">
              <th scope="row" className="px-4 py-3 text-left font-normal whitespace-nowrap">
                <time dateTime={z.iso}>{z.zeitpunkt}</time>
              </th>
              <td className="px-4 py-3">
                <span className="block font-bold">{z.benutzer.haupt}</span>
                {z.benutzer.zweit ? <span className="block text-16 break-words text-tinte-2">{z.benutzer.zweit}</span> : null}
              </td>
              <td className="px-4 py-3">{z.aktion}</td>
              <td className="px-4 py-3">
                {z.ziel ? (
                  <>
                    <span className="block">{z.ziel.typ}</span>
                    {z.ziel.kurz ? <span className="block text-16 text-tinte-2">{z.ziel.kurz}</span> : null}
                  </>
                ) : (
                  texte.keinWert
                )}
              </td>
              <td className="px-4 py-3 text-16">
                {z.details.length > 0
                  ? z.details.map((d) => (
                      <span key={d} className="block break-words">
                        {d}
                      </span>
                    ))
                  : texte.keinWert}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TabellenRahmen>
  );
}
