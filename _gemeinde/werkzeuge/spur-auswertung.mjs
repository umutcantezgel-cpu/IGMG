// Auswertung einer Chromium-Spur (Trace-Ereignisse): lange Aufgaben des Hauptthreads mit Anteilen. Genutzt von spur.mjs und spur-lh.mjs.
export function auswerten(ereignisse) {
  // Hauptthread finden: der CrRendererMain-Thread mit den meisten Seitenereignissen (Layout, FunctionCall, ParseHTML)
  const hauptthread = (() => {
    const renderer = new Set(ereignisse.filter((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain').map((e) => `${e.pid}:${e.tid}`));
    const zaehler = new Map();
    for (const e of ereignisse) {
      const k = `${e.pid}:${e.tid}`;
      if (renderer.has(k) && ['Layout', 'FunctionCall', 'ParseHTML', 'EvaluateScript'].includes(e.name)) zaehler.set(k, (zaehler.get(k) ?? 0) + 1);
    }
    return [...zaehler.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
  })();
  const aufHaupt = ereignisse.filter((e) => `${e.pid}:${e.tid}` === hauptthread && e.ph === 'X' && e.dur);
  const fcp = ereignisse.find((e) => e.name === 'firstContentfulPaint' && `${e.pid}:${e.tid}` === hauptthread)?.ts ?? ereignisse.find((e) => e.name === 'firstContentfulPaint')?.ts ?? aufHaupt[0]?.ts;
  const navStart = ereignisse.find((e) => e.name === 'navigationStart' && `${e.pid}:${e.tid}` === hauptthread)?.ts;
  const start = navStart ?? aufHaupt.reduce((m, e) => Math.min(m, e.ts), Infinity);
  const aufgaben = aufHaupt.filter((e) => (e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask') && e.dur > 50000).filter((e, i, l) => !l.some((o) => o !== e && o.ts <= e.ts && o.ts + o.dur >= e.ts + e.dur && o.dur > e.dur));
  const GRUPPEN = {
    Skript: ['EvaluateScript', 'v8.compile', 'FunctionCall', 'TimerFire', 'EventDispatch', 'v8.run', 'V8.Execute', 'RunMicrotasks', 'FireAnimationFrame'],
    Stil: ['UpdateLayoutTree', 'RecalculateStyles', 'ScheduleStyleRecalculation'],
    Layout: ['Layout', 'UpdateLayerTree', 'PrePaint'],
    Zeichnen: ['Paint', 'PaintImage', 'Layerize', 'Commit', 'CompositeLayers'],
    HTML: ['ParseHTML'],
  };
  const gruppe = (n) => Object.entries(GRUPPEN).find(([, l]) => l.includes(n))?.[0];
  const lang = aufgaben.map((t) => {
    const innen = aufHaupt.filter((e) => e !== t && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur);
    const summe = {};
    for (const e of innen) {
      const g = gruppe(e.name);
      if (!g) continue;
      // nur oberste Ebene je Gruppe zählen: Ereignis, das nicht in einem anderen derselben Gruppe liegt
      const verschachtelt = innen.some((o) => o !== e && gruppe(o.name) === g && o.ts <= e.ts && o.ts + o.dur >= e.ts + e.dur && o.dur > e.dur);
      if (!verschachtelt) summe[g] = (summe[g] ?? 0) + e.dur / 1000;
    }
    const skripte = innen
      .filter((e) => e.name === 'EvaluateScript' || e.name === 'FunctionCall' || e.name === 'TimerFire' || e.name === 'FireAnimationFrame' || e.name === 'EventDispatch')
      .sort((x, y) => y.dur - x.dur)
      .slice(0, 3)
      .map((e) => `${e.name} ${(e.dur / 1000).toFixed(0)} ms ${e.args?.data?.url?.split('/').pop() ?? e.args?.data?.functionName ?? e.args?.data?.type ?? ''}`);
    return {
      beginnMs: Math.round((t.ts - start) / 1000),
      dauerMs: Math.round(t.dur / 1000),
      blockiertMs: Math.round(t.dur / 1000 - 50),
      nachFcp: t.ts >= fcp,
      anteile: Object.fromEntries(Object.entries(summe).map(([k, v]) => [k, Math.round(v)])),
      skripte,
    };
  });

  return {
    fcpMs: Math.round((fcp - start) / 1000),
    blockierzeitNachFcpMs: lang.filter((x) => x.nachFcp).reduce((s, x) => s + x.blockiertMs, 0),
    langeAufgaben: lang,
  };
}
