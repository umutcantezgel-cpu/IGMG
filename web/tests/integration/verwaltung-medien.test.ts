import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C11 (ADR 0007, K-05, K-10, G-07): Typ nur über Magic Bytes, SVG abgelehnt, Bilder neu kodiert ohne EXIF/GPS und auf
 * 2560 px begrenzt; Alt-Text Pflicht; Auslieferung nur außerhalb des Papierkorbs; genutzte Medien nie löschbar.
 */
const verzeichnis = mkdtempSync(join(tmpdir(), 'igmg-medien-'));
process.env.MEDIEN_VERZEICHNIS = verzeichnis;
const { client, db } = await verwaltungsUmgebung();
const { erkenneTyp, verarbeiteDatei } = await import('@/lib/medien/verarbeiten');
const actions = await import('@/server/actions/medien');
const { GET } = await import('@/app/medien/[...schluessel]/route');
const { loescheAbgelaufene } = await import('@/lib/eingaenge/loeschlauf');
afterAll(async () => {
  await client.close();
  await rm(verzeichnis, { recursive: true, force: true });
});

const jpegMitExif = (breite = 40, hoehe = 30) =>
  sharp({ create: { width: breite, height: hoehe, channels: 3, background: '#2a7' } })
    .jpeg()
    .withExif({ IFD0: { Artist: 'Testperson Eins', Copyright: 'Test' } })
    .toBuffer();
const upload = (datei: Buffer | string, name: string, felder: Record<string, string> = { altDe: 'Testbild mit grüner Fläche' }) => {
  const fd = formular(felder);
  fd.append('datei', new File([typeof datei === 'string' ? datei : new Uint8Array(datei)], name));
  return fd;
};
/** Hochladen leitet bei Erfolg zur Detailseite weiter → ID aus dem Ziel */
async function hochladenId(fd: FormData): Promise<string> {
  const e = await actions.hochladen({}, fd).then(
    () => null,
    (f: { ziel?: string }) => f,
  );
  const id = e?.ziel?.match(/\/verwaltung\/medien\/([0-9a-f-]{36})\?meldung=hochgeladen$/)?.[1];
  if (!id) throw new Error('keine Weiterleitung');
  return id;
}
const holen = (schluessel: string) =>
  GET(new Request(`http://localhost/medien/${schluessel}`), { params: Promise.resolve({ schluessel: schluessel.split('/') }) });
const vorhanden = (pfad: string) =>
  access(pfad).then(
    () => true,
    () => false,
  );

describe('Pipeline', () => {
  it('erkennt Typen nur an den Bytes; SVG und Text abgelehnt', async () => {
    expect(erkenneTyp(await jpegMitExif())).toBe('image/jpeg');
    expect(
      erkenneTyp(
        await sharp({ create: { width: 4, height: 4, channels: 4, background: '#fff' } })
          .png()
          .toBuffer(),
      ),
    ).toBe('image/png');
    expect(
      erkenneTyp(
        await sharp({ create: { width: 4, height: 4, channels: 3, background: '#fff' } })
          .webp()
          .toBuffer(),
      ),
    ).toBe('image/webp');
    expect(erkenneTyp(Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj'))).toBe('application/pdf');
    expect(erkenneTyp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>x</script></svg>'))).toBeNull();
    expect(erkenneTyp(Buffer.from('GIF89a…………………'))).toBeNull();
  });

  it('entfernt EXIF, behält die Ausrichtung, begrenzt auf 2560 px; Name aus der Datei im Schlüssel', async () => {
    const roh = await jpegMitExif(4000, 1000);
    expect((await sharp(roh).metadata()).exif).toBeDefined();
    const v = await verarbeiteDatei(roh, 'Grüner Saal.JPG');
    expect(v.typ).toBe('image/jpeg');
    expect([v.breite, v.hoehe]).toEqual([2560, 640]);
    expect((await sharp(v.daten).metadata()).exif).toBeUndefined();
    expect(v.schluessel).toMatch(/^[0-9a-f]{16}\/gruner-saal\.jpg$/);
  });
});

describe('Hochladen, Ändern, Ausliefern', () => {
  let schluessel = '';
  let id = '';

  it('nur mit medium.hochladen; Alt-Text Pflicht; falscher Typ am Feld', async () => {
    await angemeldetAls([{ rolle: 'mitgliederverwaltung' }]);
    await expect(actions.hochladen({}, upload(await jpegMitExif(), 'a.jpg'))).rejects.toThrow('KEIN_RECHT');
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect((await actions.hochladen({}, upload(await jpegMitExif(), 'a.jpg', { altDe: '' }))).feldFehler).toMatchObject({
      altDe: 'altKurz',
    });
    expect((await actions.hochladen({}, upload('<svg/>xxxxxxxxxxxx', 'bild.png'))).feldFehler).toMatchObject({ datei: 'datei_typ' });
    expect((await actions.hochladen({}, formular({ altDe: 'Testbild' }))).feldFehler).toMatchObject({ datei: 'dateiFehlt' });
  });

  it('Erfolg: Datei im Speicher, Eintrag mit Maßen, Audit; gleicher Inhalt → derselbe Eintrag', async () => {
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    const bild = await jpegMitExif();
    const neuId = await hochladenId(
      upload(bild, 'saal.jpg', { altDe: 'Testbild mit grüner Fläche', altTr: 'Yeşil alan', bildrechte: 'Foto: [Name], mit Erlaubnis' }),
    );
    const [m] = await db.select().from(schema.medium).where(eq(schema.medium.id, neuId));
    expect(m).toMatchObject({
      typ: 'image/jpeg',
      breite: 40,
      hoehe: 30,
      alt: { de: 'Testbild mit grüner Fläche', tr: 'Yeşil alan' },
      erstelltVon: ich,
    });
    expect(await vorhanden(join(verzeichnis, m.schluessel))).toBe(true);
    const [a] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, m.id));
    expect(a).toMatchObject({ aktion: 'medium.hochgeladen', details: { typ: 'image/jpeg' } });
    expect(await hochladenId(upload(bild, 'nochmal.jpg'))).toBe(m.id);
    schluessel = m.schluessel;
    id = m.id;
  });

  it('Auslieferung: Typ aus der Datenbank, 1 Tag gecacht (nicht immutable, K-05), nosniff; Pfadausbruch und Unbekanntes 404', async () => {
    const r = await holen(schluessel);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('image/jpeg');
    expect(r.headers.get('cache-control')).toBe('public, max-age=86400');
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
    expect(Buffer.from(await r.arrayBuffer()).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
    expect((await holen('../../etc/passwd')).status).toBe(404);
    expect((await holen('0000000000000000/gibt-es-nicht.jpg')).status).toBe(404);
  });

  it('Bildvarianten (ADR 0020): WebP unterhalb der Originalbreite, Auslieferung mit Rückfall aufs Original, Papierkorb sperrt auch Varianten', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const breitesId = await hochladenId(upload(await jpegMitExif(1200, 600), 'breit.jpg'));
    const [m] = await db.select().from(schema.medium).where(eq(schema.medium.id, breitesId));
    for (const w of [480, 960]) expect(await vorhanden(join(verzeichnis, `${m.schluessel}.w${w}.webp`))).toBe(true);
    expect(await vorhanden(join(verzeichnis, `${m.schluessel}.w1600.webp`))).toBe(false);
    const v = await holen(`${m.schluessel}.w480.webp`);
    expect(v.status).toBe(200);
    expect(v.headers.get('content-type')).toBe('image/webp');
    expect((await sharp(Buffer.from(await v.arrayBuffer())).metadata()).width).toBe(480);
    // Medium von vor ADR 0020 (ohne Varianten): die Variantenadresse liefert das Original
    const alt = await holen(`${schluessel}.w480.webp`);
    expect(alt.status).toBe(200);
    expect(alt.headers.get('content-type')).toBe('image/jpeg');
    // Unbekanntes Original: auch die Variante 404
    expect((await holen('0000000000000000/gibt-es-nicht.jpg.w480.webp')).status).toBe(404);
    await angemeldetAls([{ rolle: 'administration' }]);
    await actions.inPapierkorb(formular({ id: breitesId })).catch(() => undefined);
    expect((await holen(`${m.schluessel}.w480.webp`)).status).toBe(404);
  });

  it('Alt-Text ändern mit Audit', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await actions.aendern({}, formular({ id, altDe: 'Gebetsraum, Testbild', bildrechte: '' }))).toEqual({ ok: true, id });
    const [m] = await db.select().from(schema.medium).where(eq(schema.medium.id, id));
    expect(m.alt).toEqual({ de: 'Gebetsraum, Testbild' });
  });

  it('verwendet → kein Papierkorb; ungenutzt → Papierkorb (nicht ausgeliefert), wiederherstellen, löschen nur aus dem Papierkorb', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const [n] = await db
      .insert(schema.nachricht)
      .values({ slug: 'mit-bild', titel: { de: 'Mit Bild' }, bildId: id })
      .returning({ id: schema.nachricht.id });
    await expect(actions.inPapierkorb(formular({ id }))).rejects.toMatchObject({ ziel: `/verwaltung/medien/${id}?fehler=verwendet` });
    await db.delete(schema.nachricht).where(eq(schema.nachricht.id, n.id));
    await expect(actions.endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    await expect(actions.inPapierkorb(formular({ id }))).rejects.toMatchObject({ ziel: '/verwaltung/medien?meldung=papierkorb' });
    expect((await holen(schluessel)).status).toBe(404);
    await expect(actions.wiederherstellen(formular({ id }))).rejects.toMatchObject({
      ziel: '/verwaltung/medien?ansicht=papierkorb&meldung=wiederhergestellt',
    });
    expect((await holen(schluessel)).status).toBe(200);
    await expect(actions.inPapierkorb(formular({ id }))).rejects.toMatchObject({ ziel: '/verwaltung/medien?meldung=papierkorb' });
    await expect(actions.endgueltigLoeschen(formular({ id }))).rejects.toMatchObject({
      ziel: '/verwaltung/medien?ansicht=papierkorb&meldung=geloescht',
    });
    expect(await db.select().from(schema.medium).where(eq(schema.medium.id, id))).toHaveLength(0);
    expect(await vorhanden(join(verzeichnis, schluessel))).toBe(false);
  });

  it('Bildknoten im Rich-Text zählen als Verwendung (jede Sprache, jede Tiefe; Tor B/C SP-C2 B1)', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const { verwendungVon } = await import('@/server/queries/verwaltung/medien');
    const imText = await hochladenId(upload(await jpegMitExif(14, 14), 'im-text.jpg'));
    const anderes = await hochladenId(upload(await jpegMitExif(16, 16), 'anderes.jpg'));
    const dok = (mediumId: string) => ({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Testabsatz' }] },
        { type: 'image', attrs: { mediumId } },
      ],
    });
    const [n] = await db
      .insert(schema.nachricht)
      .values({ slug: 'bild-im-text', titel: { de: 'Bild im Text' }, inhalt: { de: dok(anderes), tr: dok(imText) } })
      .returning({ id: schema.nachricht.id });
    expect((await verwendungVon(imText)).map((v) => [v.art, v.id])).toEqual([['nachricht', n.id]]);
    await expect(actions.inPapierkorb(formular({ id: imText }))).rejects.toMatchObject({
      ziel: `/verwaltung/medien/${imText}?fehler=verwendet`,
    });
    // Ein Text, der die ID nur erwähnt, ist keine Verwendung
    await db
      .update(schema.nachricht)
      .set({
        inhalt: { de: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `"mediumId": "${imText}"` }] }] } },
      })
      .where(eq(schema.nachricht.id, n.id));
    expect(await verwendungVon(imText)).toEqual([]);
    expect(await verwendungVon(anderes)).toEqual([]);
    const [v] = await db
      .insert(schema.veranstaltung)
      .values({
        slug: 'bild-in-beschreibung',
        titel: { de: 'Bild in Beschreibung' },
        beschreibung: { de: dok(anderes) },
        kategorie: 'bildung',
        beginn: new Date(),
      })
      .returning({ id: schema.veranstaltung.id });
    expect((await verwendungVon(anderes)).map((x) => [x.art, x.id])).toEqual([['veranstaltung', v.id]]);
    await db.delete(schema.veranstaltung).where(eq(schema.veranstaltung.id, v.id));
    await db.delete(schema.nachricht).where(eq(schema.nachricht.id, n.id));
  });

  it('Papierkorb: gleiche Datei erneut hochladen meldet den Papierkorb, Ändern dort gesperrt (SP-C2 H2/H3)', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const datei = await jpegMitExif(18, 18);
    const id = await hochladenId(upload(datei, 'korb.jpg'));
    await expect(actions.inPapierkorb(formular({ id }))).rejects.toMatchObject({ ziel: '/verwaltung/medien?meldung=papierkorb' });
    expect((await actions.hochladen({}, upload(datei, 'korb-nochmal.jpg'))).feldFehler).toEqual({ datei: 'datei_imPapierkorb' });
    expect(await actions.aendern({}, formular({ id, altDe: 'Neuer Alt-Text im Papierkorb', bildrechte: '' }))).toMatchObject({
      fehler: 'imPapierkorb',
    });
    const [m] = await db.select().from(schema.medium).where(eq(schema.medium.id, id));
    expect(m.alt).toEqual({ de: 'Testbild mit grüner Fläche' });
  });

  it('Löschlauf: Medien-Papierkorb nach 30 Tagen, genutzte bleiben', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const frei = await hochladenId(upload(await jpegMitExif(10, 10), 'frei.jpg'));
    const genutzt = await hochladenId(upload(await jpegMitExif(12, 12), 'genutzt.jpg'));
    const alt = new Date(Date.now() - 31 * 86_400_000);
    await db.update(schema.medium).set({ imPapierkorbSeit: alt }).where(eq(schema.medium.id, frei));
    await db.update(schema.medium).set({ imPapierkorbSeit: alt }).where(eq(schema.medium.id, genutzt));
    await db.insert(schema.kurs).values({ slug: 'kurs-mit-bild', titel: { de: 'Kurs' }, bildId: genutzt });
    await loescheAbgelaufene();
    expect(await db.select().from(schema.medium).where(eq(schema.medium.id, frei))).toHaveLength(0);
    expect(await db.select().from(schema.medium).where(eq(schema.medium.id, genutzt))).toHaveLength(1);
  });
});

describe('Direkt-Upload großer PDF-Dateien (ADR 0020, V-05)', () => {
  const pdf = (groesse: number) => Buffer.concat([Buffer.from(`%PDF-1.4\n% ${randomUUID()}\n`), Buffer.alloc(groesse, 0x20)]);
  const fehlerVon = (z: Awaited<ReturnType<typeof actions.hochladen>>) => z.feldFehler?.datei;

  it('übernimmt den Eingang nur mit Vercel Blob: geprüft, gespeichert, Eingang entfernt, Dateiname übernommen', async () => {
    const { speicher } = await import('@/lib/storage');
    const s = speicher(); // Dateisystem-Speicher der Tests (vor dem Umschalten der Umgebung angelegt)
    const schluessel = `eingang/${randomUUID()}.pdf`;
    await s.schreibe(schluessel, pdf(6_000_000), 'application/pdf');
    vi.stubEnv('SPEICHER', 'blob');
    try {
      await angemeldetAls([{ rolle: 'redaktion' }]);
      const id = await hochladenId(formular({ altDe: 'Aushang Gemeindefest groß', eingang: schluessel, eingangName: 'Aushang Gemeindefest.pdf' }));
      const [zeile] = await db.select().from(schema.medium).where(eq(schema.medium.id, id));
      expect(zeile).toMatchObject({ typ: 'application/pdf', dateiname: 'Aushang Gemeindefest.pdf' });
      expect(zeile.groesse).toBeGreaterThan(6_000_000);
      expect(await s.existiert(schluessel)).toBe(false);
      expect(await s.existiert(zeile.schluessel)).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('ohne Vercel Blob, mit fremdem Schlüssel oder fehlendem Eingang: Datei fehlt', async () => {
    const { speicher } = await import('@/lib/storage');
    const s = speicher();
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const schluessel = `eingang/${randomUUID()}.pdf`;
    await s.schreibe(schluessel, pdf(10), 'application/pdf');
    const felder = (eingang: string) => formular({ altDe: 'Aushang ohne Datei', eingang, eingangName: 'x.pdf' });
    expect(fehlerVon(await actions.hochladen({}, felder(schluessel)))).toBe('dateiFehlt');
    vi.stubEnv('SPEICHER', 'blob');
    try {
      for (const fremd of ['medien/geheim.pdf', 'eingang/../geheim.pdf', `eingang/${randomUUID().toUpperCase()}.pdf`])
        expect(fehlerVon(await actions.hochladen({}, felder(fremd)))).toBe('dateiFehlt');
      expect(fehlerVon(await actions.hochladen({}, felder(`eingang/${randomUUID()}.pdf`)))).toBe('dateiFehlt');
      expect(await s.existiert(schluessel)).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('Eingang ohne PDF-Inhalt: abgelehnt wie jeder Upload, Eingang entfernt', async () => {
    const { speicher } = await import('@/lib/storage');
    const s = speicher();
    const schluessel = `eingang/${randomUUID()}.pdf`;
    await s.schreibe(schluessel, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'application/pdf');
    vi.stubEnv('SPEICHER', 'blob');
    try {
      await angemeldetAls([{ rolle: 'redaktion' }]);
      const z = await actions.hochladen({}, formular({ altDe: 'Aushang mit falschem Inhalt', eingang: schluessel, eingangName: 'falsch.pdf' }));
      expect(fehlerVon(z)).toMatch(/^datei_/);
      expect(await s.existiert(schluessel)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('Token-Route: nur mit Vercel Blob, nur Token-Anfragen, nur mit Recht, nur für Eingangsschlüssel', async () => {
    const { POST } = await import('@/app/[locale]/verwaltung/(geschuetzt)/medien/direkt/route');
    const anfrage = (pathname: string, type = 'blob.generate-client-token') =>
      new Request('http://localhost/verwaltung/medien/direkt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, payload: { pathname, clientPayload: null, multipart: false } }),
      });
    const gut = `eingang/${randomUUID()}.pdf`;
    expect((await POST(anfrage(gut))).status).toBe(404);
    vi.stubEnv('SPEICHER', 'blob');
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_teststore_nurzumpruefen');
    try {
      await angemeldetAls(null);
      expect((await POST(anfrage(gut))).status).toBe(403);
      await angemeldetAls([{ rolle: 'mitgliederverwaltung' }]);
      expect((await POST(anfrage(gut))).status).toBe(403);
      await angemeldetAls([{ rolle: 'redaktion' }]);
      expect((await POST(anfrage(gut, 'blob.upload-completed'))).status).toBe(400);
      expect((await POST(anfrage('medien/geheim.pdf'))).status).toBe(400);
      const ok = await POST(anfrage(gut));
      expect(ok.status).toBe(200);
      expect(await ok.json()).toMatchObject({ type: 'blob.generate-client-token', clientToken: expect.any(String) });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
