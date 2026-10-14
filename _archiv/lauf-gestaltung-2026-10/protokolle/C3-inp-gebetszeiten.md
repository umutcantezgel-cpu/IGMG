# INP /gebetszeiten nach de91dcd (Reiter per useDeferredValue) · verschränkt 3100/3500, 5 Runden, Telefon 390, CPU 4×

```
/gebetszeiten Lauf 1: INP 264 ms · 6 Interaktionen · je Eingabe {"reiter":264,"menue":200,"tab":64}
/gebetszeiten Lauf 1: INP 80 ms · 6 Interaktionen · je Eingabe {"menue":80,"reiter":80,"tab":56}
/gebetszeiten Lauf 1: INP 216 ms · 6 Interaktionen · je Eingabe {"menue":216,"reiter":160,"tab":48}
/gebetszeiten Lauf 1: INP 96 ms · 6 Interaktionen · je Eingabe {"reiter":96,"menue":72,"tab":48}
/gebetszeiten Lauf 1: INP 232 ms · 6 Interaktionen · je Eingabe {"reiter":232,"menue":112,"tab":64}
/gebetszeiten Lauf 1: INP 64 ms · 6 Interaktionen · je Eingabe {"menue":64,"tab":64,"reiter":56}
/gebetszeiten Lauf 1: INP 160 ms · 6 Interaktionen · je Eingabe {"reiter":160,"menue":104,"tab":48}
/gebetszeiten Lauf 1: INP 96 ms · 6 Interaktionen · je Eingabe {"reiter":96,"menue":88,"tab":64}
/gebetszeiten Lauf 1: INP 136 ms · 6 Interaktionen · je Eingabe {"reiter":136,"menue":112,"tab":48}
/gebetszeiten Lauf 1: INP 80 ms · 6 Interaktionen · je Eingabe {"reiter":80,"tab":80,"menue":64}
```

| Server | INP je Runde (ms) | Median | Reiter je Runde (ms) | Median Reiter |
|---|---|---|---|---|
| 3100 | [264, 216, 232, 160, 136] | 216 | [264, 160, 232, 160, 136] | 160 |
| 3500 | [80, 96, 64, 96, 80] | 80 | [80, 96, 56, 96, 80] | 80 |

Ergebnis: Auf /gebetszeiten liegt INP im Median bei 80 ms (vorher 208 ms auf 6e1b46a, Ausgangsstand 216 ms). Die übrigen zehn Hauptansichten berührt de91dcd nicht; ihre Werte aus C3-inp.md (6e1b46a, höchstens 144 ms) gelten weiter. Damit sind alle 11 Hauptansichten ≤ 200 ms.
