import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Mail-Transport (ADR 0011): SMTP (Mailpit lokal, echter Dienst im Betrieb) oder Datei (.eml in .mail/).
 * Keine echten E-Mails in der Entwicklung (G-02): ohne SMTP_HOST greift der Datei-Transport – aber nie im Betrieb
 * (Tor A SP-A-06): Dort fehlt sonst still jede Mail, und Klartext-Adressen lägen auf der Platte. Fehlt SMTP_HOST in
 * Produktion, wirft `versende` – die Mail bleibt im Ausgang und wird erneut versucht.
 */
function dateiTransport(): boolean {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST fehlt: Im Betrieb ist kein Datei-Transport erlaubt (BETRIEB.md 3).');
    return false;
  }
  return process.env.MAIL_TRANSPORT === 'datei' || !process.env.SMTP_HOST;
}
export type Mail = { an: string; betreff: string; html: string; text: string };

let transporter: Transporter | null = null;

function smtp(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' } : undefined,
  });
  return transporter;
}

export async function versende(mail: Mail): Promise<void> {
  const absender = process.env.MAIL_ABSENDER ?? 'IGMG Wetzlar <noreply@example.test>';
  if (dateiTransport()) {
    const strom = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
    const info = await strom.sendMail({ from: absender, to: mail.an, subject: mail.betreff, html: mail.html, text: mail.text });
    const ordner = join(process.cwd(), '.mail');
    await mkdir(ordner, { recursive: true });
    await writeFile(join(ordner, `${Date.now()}-${info.messageId.replace(/[^a-z0-9]/gi, '')}.eml`), info.message as Buffer);
    return;
  }
  await smtp().sendMail({ from: absender, to: mail.an, subject: mail.betreff, html: mail.html, text: mail.text });
}
