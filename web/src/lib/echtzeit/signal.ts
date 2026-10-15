/**
 * Echtzeit-Signal im Browser (ADR 0027, Kür K-A): eine WebSocket-Verbindung zu Centrifugo mit Abos für einen oder
 * mehrere Kanäle. Jede Veröffentlichung heißt nur „Kanal hat Neues“ – ohne Inhalt, ohne Absender (S-16); `beiNeuem`
 * stößt den Abruf an. Ping (`{}`) beantwortet die Verbindung selbst. Ohne Konfiguration gibt es keine Tokens und keine
 * Verbindung: Es bleibt beim adaptiven Abruf.
 */
export type SignalTokens = { url: string; verbindung: string; abos: { kanal: string; abo: string }[] };

/** Verbindet und abonniert; liefert die Funktion zum Trennen. `beiEnde` meldet eine vom Server beendete Verbindung. */
export function verbindeSignal(t: SignalTokens, beiNeuem: () => void, beiEnde?: () => void): () => void {
  const ws = new WebSocket(t.url);
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, connect: { token: t.verbindung } }));
    t.abos.forEach((a, i) => ws.send(JSON.stringify({ id: i + 2, subscribe: { channel: a.kanal, token: a.abo } })));
  };
  ws.onmessage = (e) => {
    for (const zeile of String(e.data).split('\n')) {
      if (zeile === '{}') ws.send('{}');
      else if (zeile.includes('"push"')) beiNeuem();
    }
  };
  ws.onclose = () => beiEnde?.();
  return () => {
    ws.onclose = null;
    ws.close();
  };
}
