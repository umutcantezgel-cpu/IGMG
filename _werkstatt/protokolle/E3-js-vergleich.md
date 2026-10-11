# JS beim ersten Laden · E0 (3100, 9ebb4bc) gegen E3-Tor-Build (3400, 93a0b3d) · 2026-10-11 20:16 UTC

Methode: alle `/_next/static/**.js` aus dem HTML, je Datei `gzip -9` (nicht Lighthouse-Übertragungsgröße; Lighthouse maß E0 mit 168–174 kB).

| Route | E0 gz | E3 gz | Δ |
|---|---|---|---|
| / | 199362 | 207142 | +7780 |
| /veranstaltungen | 201106 | 206166 | +5060 |

Zuwachs (nur in E3): Tagesbogen live (≈4,0 kB), Zustandsgrafik + Fehlergrenze (≈4,4 kB), Seitenwechsel/Morph im gemeinsamen Teil (≈0,3 kB netto). Rahmen (React/Next) unverändert 148 kB.

Folgerung: Bewegungscode ≈ 8 kB (Budget 60 kB). Gesamt in Lighthouse-Maß geschätzt 176–182 kB – an der 180-kB-Grenze; Paarmessung H-L01 klärt, Kandidat zum Sparen: Zustandsgrafik nur in Fehler-/Leerzuständen laden.
