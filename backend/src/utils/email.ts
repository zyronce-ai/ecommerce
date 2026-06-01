import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    const test = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: test.user, pass: test.pass },
    });
    console.log(`[EMAIL] Using Ethereal (${test.user}) — view at https://ethereal.email/login`);
  }
  return transporter;
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${process.env.VENDOR_URL || 'http://localhost:3002'}/verify?token=${token}`;

  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || `"ShopHub" <${process.env.SMTP_USER || 'noreply@shophub.com'}>`,
      to: email,
      subject: 'Verify your ShopHub Vendor account',
      html: `<h2>Welcome to ShopHub!</h2><p>Click <a href="${link}">here</a> to verify your email.<br><br>Link: ${link}</p>`,
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log(`[EMAIL] Preview (Ethereal): ${preview}`);
    } else {
      console.log(`[EMAIL] Sent to ${email}`);
    }
    return link;
  } catch (err: any) {
    console.error(`[EMAIL] Failed: ${err.message}`);
  }
}
