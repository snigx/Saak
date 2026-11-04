import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, cc, subject, html, text, from } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required parameters: to, subject, and html are required.' });
  }

  const user = process.env.GMAIL_USER || 'Saakbyaprajita@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    return res.status(500).json({
      error: 'Gmail App Password (GMAIL_APP_PASSWORD) is not configured in server environment.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: from || `Saak by Aprajita Atelier <${user}>`,
      to,
      subject,
      html,
      text: text || undefined
    };
    if (cc) {
      mailOptions.cc = cc;
    }

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      messageId: info.messageId
    });
  } catch (err) {
    console.error('Nodemailer error in /api/send-email:', err);
    return res.status(500).json({
      error: err.message || 'Failed to send transactional email'
    });
  }
}
