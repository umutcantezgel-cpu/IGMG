import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MailUnzustellbar } from '@/lib/mail/adresse';
import { versende } from '@/lib/mail/transport';
import { kontoMail } from '@/lib/mail/vorlagen';

/**
 * ADR 0026: Der Mail-Transport weist `.invalid`-Empfänger (Kinder- und Beispielkonten) hart ab – noch bevor eine Datei
 * oder eine SMTP-Verbindung entsteht. Konto-Mails enthalten nur Betreff, einen Satz, den Link und den Fußhinweis.
 */
describe('Mail-Ausgang und `.invalid`', () => {
  it('versende() wirft MailUnzustellbar und schreibt nichts', async () => {
    process.env.MAIL_TRANSPORT = 'datei';
    const ordner = join(process.cwd(), '.mail');
    const vorher = existsSync(ordner) ? readdirSync(ordner).length : 0;
    await expect(versende({ an: 'k-0123456789abcdef@konto.invalid', betreff: 'x', html: '<p>x</p>', text: 'x' })).rejects.toBeInstanceOf(
      MailUnzustellbar,
    );
    await expect(versende({ an: 'Beispiel <gemeinde@beispiel.invalid>', betreff: 'x', html: 'x', text: 'x' })).rejects.toThrow(
      'MAIL_UNZUSTELLBAR',
    );
    expect(existsSync(ordner) ? readdirSync(ordner).length : 0).toBe(vorher);
  });

  it('Konto-Mail: Sprache, Link als Knopf und Text, keine weiteren Inhalte', async () => {
    const mail = await kontoMail('tr', {
      betreff: 'Lütfen e-posta adresinizi onaylayın',
      text: 'Bir cümle.',
      knopf: 'Adresi onayla',
      hinweis: 'Fuß',
      link: 'http://localhost:3000/tr/hesap/onayla?token=abc',
    });
    expect(mail.betreff).toBe('Lütfen e-posta adresinizi onaylayın');
    expect(mail.html).toContain('lang="tr"');
    expect(mail.html).toContain('href="http://localhost:3000/tr/hesap/onayla?token=abc"');
    expect(mail.text).toContain('Adresi onayla');
    expect(mail.text).toContain('http://localhost:3000/tr/hesap/onayla?token=abc');
  });
});
