import nodemailer from 'nodemailer';

// Serverless store caches (in-memory across warm lambda invocations)
const otpStore = new Map();
const patronsStore = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, otp, fullName, password, confirmPassword, type } = req.body || {};
  const user = process.env.GMAIL_USER || 'Saakbyaprajita@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    return res.status(500).json({ error: 'GMAIL_APP_PASSWORD is not configured.' });
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // 1. ACTION: SEND OTP
  if (action === 'send') {
    if (type === 'signup') {
      if (password && confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match. Please ensure both passwords are identical.' });
      }
      if (password && password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
    }

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(normalizedEmail, {
        otp: generatedOtp,
        fullName: fullName || normalizedEmail.split('@')[0],
        password: password ? password.trim() : undefined,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      });

      const recipientName = fullName || 'Patron';
      const otpHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Saak Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 560px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #1F1A17 0%, #2A221E 100%); padding: 36px 32px; text-align: center; border-bottom: 2px solid #C5A059;">
              <div style="color: #C5A059; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">
                SAAK AUTHENTICATION
              </div>
              <h1 style="color: #FAF6EF; font-family: Georgia, serif; font-size: 26px; margin: 0 0 6px 0; font-weight: 400; letter-spacing: 0.04em;">
                Saak by Aprajita
              </h1>
              <div style="color: #D6CBC0; font-size: 12px; font-style: italic;">
                Fluid Drapes &amp; Sculpted Statements
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 12px;">✨🔑</div>
              <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1F1A17; margin: 0 0 10px 0; font-weight: 400;">
                Your Verification Code
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #5C524B; margin: 0 auto 24px auto; max-width: 440px;">
                Dear ${recipientName}, use the 6-digit one-time verification code below to complete your registration and join the Saak Patron circle.
              </p>
              <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td style="background: #FFFFFF; border: 2px solid #C5A059; border-radius: 8px; padding: 18px 36px; text-align: center; box-shadow: 0 6px 20px rgba(197, 160, 89, 0.15);">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A817A; font-weight: 600; margin-bottom: 6px;">
                      ONE-TIME PASSCODE
                    </div>
                    <div style="font-size: 38px; font-weight: 700; color: #A34835; letter-spacing: 0.25em; font-family: monospace; line-height: 1.2;">
                      ${generatedOtp}
                    </div>
                  </td>
                </tr>
              </table>
              <div style="background: #F4ECE1; border-left: 3px solid #C5A059; padding: 14px 18px; border-radius: 0 4px 4px 0; text-align: left; margin: 0 auto; max-width: 440px;">
                <div style="font-size: 12px; color: #1F1A17; font-weight: 600; margin-bottom: 3px;">
                  ⏳ Valid for 10 minutes
                </div>
                <div style="font-size: 12px; color: #7A726D; line-height: 1.4;">
                  If you did not request this verification code, please ignore this email.
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #F2ECE0; padding: 22px 32px; text-align: center; border-top: 1px solid #E5DDCF;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #4A423D; line-height: 1.5;">
                Need assistance? Contact our concierge at <strong style="color: #A34835;">Saakbyaprajita@gmail.com</strong>
              </p>
              <div style="font-size: 11px; color: #8A817A;">
                © ${new Date().getFullYear()} Saak by Aprajita. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `Saak by Aprajita <${user}>`,
        to: normalizedEmail,
        subject: `✨ Your Saak Verification Code: ${generatedOtp}`,
        html: otpHtml,
        text: `Your Saak verification code is: ${generatedOtp}. It is valid for 10 minutes.`
      });

      return res.status(200).json({ success: true, message: 'Verification code sent to your email.' });
    } catch (err) {
      console.error('Error sending OTP:', err);
      return res.status(500).json({ error: err.message || 'Failed to dispatch verification code.' });
    }
  }

  // 2. ACTION: VERIFY OTP
  if (action === 'verify') {
    if (!otp) {
      return res.status(400).json({ error: '6-digit verification code is required.' });
    }

    const record = otpStore.get(normalizedEmail);
    if (!record) {
      return res.status(400).json({ error: 'No active verification code found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new code.' });
      }
      return res.status(400).json({ error: 'Incorrect verification code. Please check your email and try again.' });
    }

    const effectivePass = (password || record.password || '').trim();
    const effectiveConfirm = (confirmPassword || '').trim();
    if (effectivePass && effectiveConfirm && effectivePass !== effectiveConfirm) {
      return res.status(400).json({ error: 'Passwords do not match. Please ensure both passwords are identical.' });
    }

    // Update patronsStore
    const existingPatron = patronsStore.get(normalizedEmail);
    const patronRecord = {
      id: existingPatron?.id || `patron_${Date.now()}`,
      email: normalizedEmail,
      fullName: record.fullName || fullName || existingPatron?.fullName || normalizedEmail.split('@')[0],
      password: effectivePass || existingPatron?.password,
      provider: 'email',
      verified: true,
      createdAt: existingPatron?.createdAt || new Date().toISOString()
    };
    patronsStore.set(normalizedEmail, patronRecord);

    otpStore.delete(normalizedEmail);

    const user = {
      id: patronRecord.id,
      email: normalizedEmail,
      fullName: patronRecord.fullName,
      provider: 'email',
      verified: true,
      createdAt: patronRecord.createdAt
    };

    return res.status(200).json({ success: true, user });
  }

  // 3. ACTION: LOGIN WITH PASSWORD
  if (action === 'login') {
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }
    const cleanEnteredPass = password.trim();
    const patron = patronsStore.get(normalizedEmail);

    if (patron && patron.password) {
      const storedPass = (patron.password || '').trim();
      if (patron.password === password || storedPass === cleanEnteredPass) {
        return res.status(200).json({
          success: true,
          user: {
            id: patron.id,
            email: patron.email,
            fullName: patron.fullName,
            provider: 'email',
            createdAt: patron.createdAt
          }
        });
      }
    }

    return res.status(401).json({ error: 'Invalid password. Please check your credentials or sign in with an OTP code.' });
  }

  return res.status(400).json({ error: 'Invalid action. Must be "send", "verify", or "login".' });
}
