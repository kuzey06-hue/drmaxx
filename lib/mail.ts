import nodemailer from "nodemailer";

type SendMailInput = {
  to: string[];
  subject: string;
  html: string;
  text: string;
};

const getTransport = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export async function sendMail({ to, subject, html, text }: SendMailInput) {
  const recipients = [...new Set(to.map((item) => item.trim()).filter(Boolean))];
  if (recipients.length === 0) return { skipped: "no_recipients" };

  const transport = getTransport();
  if (!transport) return { skipped: "smtp_not_configured" };

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: recipients,
    subject,
    html,
    text,
  });

  return { ok: true };
}
