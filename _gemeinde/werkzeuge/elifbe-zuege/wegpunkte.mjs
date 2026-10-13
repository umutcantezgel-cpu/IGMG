// Schreibweg (B-17), Schritt 1: Wegpunkte der Züge je Grundform (Schrifteinheiten der Amiri, y nach unten).
// [x, y] rastet auf die Mittelachse ein, [x, y, 'frei'] bleibt (Spitzen außerhalb der Achse). Reihenfolge der Züge und
// der Punkte = Schreibreihenfolge. Korrekturen der Hoca (MN-07) hier eintragen, dann bauen.mjs und ts.mjs ausführen.
// Aufruf: node _gemeinde/werkzeuge/elifbe-zuege/wegpunkte.mjs  → $SCRATCHPAD/elifbe-zuege/wegpunkte.json
import { mkdirSync, writeFileSync } from "node:fs";

const F = "frei";
const familien = {
  elif: {
    zuege: [
      [
        [110, -706, F],
        [104, -681],
        [122, -13],
        [123, -2, F],
      ],
    ],
  },
  be: {
    zuege: [
      [
        [806, -376, F],
        [810, -360],
        [820, -180],
        [300, -48],
        [140, -308],
        [144, -316, F],
      ],
    ],
  },
  cim: {
    zuege: [
      [
        [606, -228, F],
        [612, -228],
        [136, -188],
        [128, -180, F],
      ],
      [
        [366, -186],
        [100, 150],
        [705, 424],
        [712, 421, F],
      ],
    ],
  },
  dal: {
    zuege: [
      [
        [206, -336, F],
        [214, -282],
        [350, -120],
        [124, -52],
        [104, -62, F],
      ],
    ],
  },
  ra: {
    zuege: [
      [
        [258, -280, F],
        [264, -258],
        [300, -40],
        [160, 200],
        [-74, 166],
        [-80, 164, F],
      ],
    ],
  },
  sin: {
    zuege: [
      [
        [902, -366, F],
        [900, -355],
        [790, -215],
        [776, -326],
        [790, -215],
        [576, -252],
        [595, -150],
        [140, -190],
        [146, -200, F],
      ],
    ],
  },
  sad: {
    zuege: [
      [
        [748, -188],
        [1050, -335],
        [1100, -230],
        [735, -125],
        [590, -135],
        [555, -255],
        [590, -135],
        [150, -195],
        [156, -204, F],
      ],
    ],
  },
  ti: {
    zuege: [
      [
        [318, -112],
        [600, -290],
        [655, -180],
        [310, -72],
        [70, -80],
        [58, -84, F],
      ],
      [
        [312, -716, F],
        [310, -700],
        [330, -150],
      ],
    ],
  },
  ayin: {
    zuege: [
      [
        [336, -404, F],
        [330, -410],
        [110, -300],
        [240, -195],
        [465, -330],
        [470, -336, F],
      ],
      [
        [240, -195],
        [80, 150],
        [710, 355],
        [716, 352, F],
      ],
    ],
  },
  fe: {
    zuege: [
      [
        [845, -345],
        [690, -335],
        [800, -440],
        [842, -352],
        [870, -170],
        [130, -310],
        [134, -318, F],
      ],
    ],
  },
  kaf: {
    // Kopf über freie Punkte: die Unterseite des Kopfes ist dick, die Achse liegt dort nicht mittig
    zuege: [
      [
        [556, -212, F],
        [505, -178, F],
        [445, -192, F],
        [420, -248, F],
        [446, -292, F],
        [500, -322, F],
        [545, -295, F],
        [556, -212],
        [605, -130],
        [500, 40],
        [162, -268],
        [166, -274, F],
      ],
    ],
    zusatz: 40,
  },
  kef: {
    zuege: [
      [
        [468, -784, F],
        [466, -770],
        [555, -115],
        [100, -55],
        [80, -60, F],
      ],
    ],
    // Das kleine Zeichen im Kef ist keine Raute: eigener Zug ohne Achse
    punktZuege: [
      [
        [292, -568, F],
        [288, -563],
        [95, -330],
        [86, -331, F],
      ],
    ],
  },
  lam: {
    zuege: [
      [
        [446, -742, F],
        [442, -732],
        [480, -110],
        [250, 0],
        [146, -300],
        [150, -306, F],
      ],
    ],
  },
  mim: {
    zusatz: 64,
    zuege: [
      [
        [150, -125],
        [135, -210],
        [230, -262],
        [300, -160],
        [160, -128],
        [175, 495],
        [176, 506, F],
      ],
    ],
  },
  nun: {
    zuege: [
      [
        [414, -462, F],
        [415, -450],
        [445, -120],
        [230, 5],
        [125, -290],
        [130, -298, F],
      ],
    ],
  },
  vav: {
    zusatz: 44,
    zuege: [
      [
        [298, -112],
        [175, -110],
        [240, -200],
        [300, -125],
        [-75, 188],
        [-82, 186, F],
      ],
    ],
  },
  he: {
    zuege: [
      [
        [186, -292, F],
        [190, -280],
        [140, -225],
        [100, -120],
        [170, -38],
        [275, -150],
        [196, -244],
      ],
    ],
  },
  ye: {
    zuege: [
      [
        [700, -348, F],
        [640, -338],
        [400, -150],
        [655, 0],
        [280, 150],
        [170, -232],
        [174, -240, F],
      ],
    ],
  },
  hemze: {
    zuege: [
      [
        [196, -214],
        [190, -262],
        [100, -170],
        [170, -105],
        [288, -150],
        [292, -156, F],
      ],
      [
        [170, -105],
        [112, -26],
        [106, -22, F],
      ],
    ],
  },
};

const familieVon = {
  elif: "elif",
  be: "be",
  te: "be",
  se: "be",
  cim: "cim",
  ha: "cim",
  hi: "cim",
  dal: "dal",
  zel: "dal",
  ra: "ra",
  ze: "ra",
  sin: "sin",
  shin: "sin",
  sad: "sad",
  dad: "sad",
  ti: "ti",
  zi: "ti",
  ayin: "ayin",
  gayin: "ayin",
  fe: "fe",
  kaf: "kaf",
  kef: "kef",
  lam: "lam",
  mim: "mim",
  nun: "nun",
  vav: "vav",
  he: "he",
  ye: "ye",
  hemze: "hemze",
};
// Punktformen je Buchstabe: Anzahl Punkte je Form (Paare sind in Amiri eine Kontur)
const punktAnzahl = { te: [2], se: [2, 1], shin: [2, 1], kaf: [2], ye: [2] };

const aus = {};
for (const [slug, fam] of Object.entries(familieVon)) {
  aus[slug] = { ...familien[fam], punktAnzahl: punktAnzahl[slug] ?? [1, 1, 1] };
}
const ARBEIT = `${process.env.SCRATCHPAD ?? "/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad"}/elifbe-zuege`;
mkdirSync(ARBEIT, { recursive: true });
writeFileSync(`${ARBEIT}/wegpunkte.json`, JSON.stringify(aus, null, 1));
console.log(`geschrieben: ${ARBEIT}/wegpunkte.json`);
