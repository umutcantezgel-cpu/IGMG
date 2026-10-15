#!/usr/bin/env node
/**
 * Prüfskript für das Echtzeit-Profil (ADR 0027, Z-20): Verhält sich der laufende Centrifugo so, wie die App es erwartet?
 * Ohne Abhängigkeiten (Node ≥ 22 mit eingebautem WebSocket). Erzeugt Tokens wie `web/src/lib/echtzeit/centrifugo.ts`
 * (HS256, Kanal `chat:<id>`) und prüft:
 *   1. Verbinden mit Verbindungs-Token
 *   2. Abonnieren ohne Abo-Token wird abgewiesen (kein Mitlesen fremder Kanäle)
 *   3. Abonnieren mit Abo-Token gelingt (Namensraum „chat“ ist bekannt)
 *   4. Veröffentlichen durch den Browser wird abgewiesen
 *   5. Anwesenheit (Presence) und Verlauf sind gesperrt (S-14)
 *   6. Das Signal der App (`POST /api/publish`, X-API-Key) erreicht den Abonnenten – nur `{ neu: true }`
 *   7. Ein Abo-Token für einen anderen Kanal öffnet nichts (eigene Verbindung)
 *
 * Aufruf auf dem lokalen Server (Werte aus `.env`, siehe LIESMICH.md):
 *   ECHTZEIT_URL=wss://echtzeit.<domain>/connection/websocket ECHTZEIT_API_URL=https://echtzeit.<domain>/api \
 *   ECHTZEIT_GEHEIMNIS=… ECHTZEIT_API_SCHLUESSEL=… node echtzeit/pruefen.mjs
 * Ersatzweise werden CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY und CENTRIFUGO_HTTP_API_KEY gelesen.
 * Exitcode 0: alle Prüfungen bestanden; 1: mindestens eine nicht; 2: Aufruf unvollständig.
 */
import { createHmac, randomUUID } from "node:crypto";

const env = process.env;
const URL_WS = env.ECHTZEIT_URL ?? "ws://127.0.0.1:8000/connection/websocket";
const URL_API = (env.ECHTZEIT_API_URL ?? "http://127.0.0.1:8000/api").replace(
  /\/$/,
  "",
);
const GEHEIMNIS =
  env.ECHTZEIT_GEHEIMNIS ?? env.CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY;
const API_SCHLUESSEL =
  env.ECHTZEIT_API_SCHLUESSEL ?? env.CENTRIFUGO_HTTP_API_KEY;
if (!GEHEIMNIS || !API_SCHLUESSEL || typeof WebSocket !== "function") {
  console.error(
    "Aufruf: ECHTZEIT_URL, ECHTZEIT_API_URL, ECHTZEIT_GEHEIMNIS und ECHTZEIT_API_SCHLUESSEL setzen (Node ≥ 22).",
  );
  process.exit(2);
}

const b64 = (d) => Buffer.from(d).toString("base64url");
function jwt(nutzlast) {
  const kopf = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const rumpf = b64(JSON.stringify(nutzlast));
  return `${kopf}.${rumpf}.${createHmac("sha256", GEHEIMNIS).update(`${kopf}.${rumpf}`).digest("base64url")}`;
}
const exp = Math.floor(Date.now() / 1000) + 120;
const person = `pruefung-${randomUUID().slice(0, 8)}`;
const kanal = `chat:${randomUUID()}`;
const andererKanal = `chat:${randomUUID()}`;

/** Minimaler Client für das JSON-Protokoll von Centrifugo (Befehl mit id → Antwort mit derselben id). */
function verbinde() {
  const ws = new WebSocket(URL_WS);
  const offen = new Map();
  const pushes = [];
  let naechste = 1;
  let beendet = null;
  // Trennt der Server die Verbindung (z. B. ungültiges Token), gelten offene Befehle als abgewiesen
  ws.addEventListener("close", (e) => {
    beendet = `Verbindung getrennt (${e.code} ${e.reason})`;
    for (const fertig of offen.values())
      fertig({ error: { code: e.code, message: beendet } });
    offen.clear();
  });
  ws.addEventListener("message", (e) => {
    for (const zeile of String(e.data).split("\n").filter(Boolean)) {
      const m = JSON.parse(zeile);
      if (m.id && offen.has(m.id)) {
        offen.get(m.id)(m);
        offen.delete(m.id);
      } else if (m.push) pushes.push(m.push);
      else if (Object.keys(m).length === 0) ws.send("{}"); // Ping → Pong
    }
  });
  const befehl = (inhalt) =>
    new Promise((fertig) => {
      if (beendet) return fertig({ error: { code: 0, message: beendet } });
      const id = naechste++;
      offen.set(id, fertig);
      ws.send(JSON.stringify({ id, ...inhalt }));
      setTimeout(
        () =>
          offen.has(id) &&
          (offen.delete(id),
          fertig({ error: { code: 0, message: "keine Antwort" } })),
        5000,
      );
    });
  const bereit = new Promise((ok, fehler) => {
    ws.addEventListener("open", ok, { once: true });
    ws.addEventListener(
      "error",
      () => fehler(new Error(`Keine Verbindung zu ${URL_WS}`)),
      { once: true },
    );
  });
  return { ws, befehl, pushes, bereit };
}

const ergebnisse = [];
const pruefe = (name, ok, info) => {
  ergebnisse.push(ok);
  console.log(
    `${ok ? "ok     " : "FEHLER "} ${name}${info ? ` · ${info}` : ""}`,
  );
};
const fehlerCode = (a) =>
  a.error ? `Fehler ${a.error.code} ${a.error.message}` : "erlaubt";

const c = verbinde();
try {
  await c.bereit;
} catch (e) {
  console.error(String(e.message));
  process.exit(1);
}
const verbunden = await c.befehl({
  connect: { token: jwt({ sub: person, exp }), name: "igmg-pruefung" },
});
pruefe(
  "Verbinden mit Verbindungs-Token",
  !verbunden.error,
  fehlerCode(verbunden),
);

const ohneToken = await c.befehl({ subscribe: { channel: kanal } });
pruefe(
  "Abonnieren ohne Abo-Token abgewiesen",
  Boolean(ohneToken.error),
  fehlerCode(ohneToken),
);

const mitToken = await c.befehl({
  subscribe: {
    channel: kanal,
    token: jwt({ sub: person, channel: kanal, exp }),
  },
});
pruefe(
  "Abonnieren mit Abo-Token (Namensraum „chat“)",
  !mitToken.error,
  fehlerCode(mitToken),
);

const senden = await c.befehl({
  publish: { channel: kanal, data: { neu: true } },
});
pruefe(
  "Veröffentlichen durch den Browser abgewiesen",
  Boolean(senden.error),
  fehlerCode(senden),
);

const anwesenheit = await c.befehl({ presence: { channel: kanal } });
pruefe(
  "Anwesenheit gesperrt",
  Boolean(anwesenheit.error),
  fehlerCode(anwesenheit),
);

const verlauf = await c.befehl({ history: { channel: kanal, limit: 10 } });
pruefe("Verlauf gesperrt", Boolean(verlauf.error), fehlerCode(verlauf));

let signal = "keine Antwort";
try {
  const r = await fetch(`${URL_API}/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-API-Key": API_SCHLUESSEL,
    },
    body: JSON.stringify({ channel: kanal, data: { neu: true } }),
    signal: AbortSignal.timeout(5000),
  });
  signal = `HTTP ${r.status} ${(await r.text()).slice(0, 120)}`;
  await new Promise((w) => setTimeout(w, 500));
} catch (e) {
  signal = String(e.message);
}
const angekommen = c.pushes.find((p) => p.channel === kanal && p.pub);
pruefe(
  "Signal der App erreicht den Abonnenten, nur { neu: true }",
  Boolean(angekommen) && JSON.stringify(angekommen.pub.data) === '{"neu":true}',
  signal,
);

c.ws.close();

// Eigene Verbindung: Ein Abo-Token für einen anderen Kanal darf nichts öffnen (Centrifugo trennt dabei die Verbindung)
const d = verbinde();
await d.bereit;
await d.befehl({
  connect: { token: jwt({ sub: person, exp }), name: "igmg-pruefung" },
});
const fremd = await d.befehl({
  subscribe: {
    channel: andererKanal,
    token: jwt({ sub: person, channel: kanal, exp }),
  },
});
pruefe(
  "Abo-Token eines anderen Kanals abgewiesen",
  Boolean(fremd.error),
  fehlerCode(fremd),
);
d.ws.close();

const bestanden = ergebnisse.every(Boolean);
console.log(
  bestanden
    ? `Echtzeit-Profil in Ordnung (${ergebnisse.length} Prüfungen).`
    : "Echtzeit-Profil NICHT in Ordnung.",
);
process.exit(bestanden ? 0 : 1);
