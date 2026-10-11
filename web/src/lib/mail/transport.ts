import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Mail-Transport (ADR 0011): SMTP (Mailpit lokal, echter Dienst im Betrieb) oder Datei (.eml in .mail/).
 * Keine echten E-Mails in der Entwicklung (G-02): ohne SMTP_HOST greift der Datei-Transport.
 */
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
  if (process.env.MAIL_TRANSPORT === 'datei' || !process.env.SMTP_HOST) {
    const strom = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
    const info = await strom.sendMail({ from: absender, to: mail.an, subject: mail.betreff, html: mail.html, text: mail.text });
    const ordner = join(process.cwd(), '.mail');
    await mkdir(ordner, { recursive: true });
    await writeFile(join(ordner, `${Date.now()}-${info.messageId.replace(/[^a-z0-9]/gi, '')}.eml`), info.message as Buffer);
    return;
  }
  await smtp().sendMail({ from: absender, to: mail.an, subject: mail.betreff, html: mail.html, text: mail.text });
}
