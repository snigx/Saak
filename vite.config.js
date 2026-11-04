import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import nodemailer from 'nodemailer'
import fs from 'node:fs'
import path from 'node:path'

// Helper for local server patrons persistence
const PATRONS_FILE = path.resolve(process.cwd(), 'scratch/server_patrons_db.json')
function getServerPatrons() {
  try {
    if (fs.existsSync(PATRONS_FILE)) {
      return JSON.parse(fs.readFileSync(PATRONS_FILE, 'utf-8'))
    }
  } catch {}
  return []
}
function saveServerPatrons(patrons) {
  try {
    const dir = path.dirname(PATRONS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(PATRONS_FILE, JSON.stringify(patrons, null, 2), 'utf-8')
  } catch (e) {
    console.error('[ServerPatrons save error]:', e)
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const otpStore = new Map()

  return {
    plugins: [
      react(),
      {
        name: 'api-auth-and-email-middleware',
        configureServer(server) {
          // 1. Transactional Email Endpoint
          server.middlewares.use('/api/send-email', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}')
                const { to, cc, subject, html, text, from } = parsed
                if (!to || !subject || !html) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Missing required parameters: to, subject, and html are required.' }))
                  return
                }

                const user = env.GMAIL_USER || 'Saakbyaprajita@gmail.com'
                const pass = env.GMAIL_APP_PASSWORD

                if (!pass) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'GMAIL_APP_PASSWORD is not configured in .env file.' }))
                  return
                }

                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: { user, pass }
                })

                const mailOptions = {
                  from: from || `Saak by Aprajita <${user}>`,
                  to,
                  subject,
                  html,
                  text
                }
                if (cc) {
                  mailOptions.cc = cc
                }

                const info = await transporter.sendMail(mailOptions)

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, messageId: info.messageId }))
              } catch (err) {
                console.error('[DevServer Email Error]:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message || 'Failed to send email' }))
              }
            })
          })

          // 2. Auth Send OTP Endpoint
          server.middlewares.use('/api/auth/send-otp', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}')
                const { email, fullName, type, password, confirmPassword } = parsed
                if (!email || !email.includes('@')) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Please enter a valid email address.' }))
                  return
                }

                if (type === 'signup') {
                  if (password && confirmPassword && password !== confirmPassword) {
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'Passwords do not match. Please ensure both passwords are identical.' }))
                    return
                  }
                  if (password && password.length < 6) {
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'Password must be at least 6 characters long.' }))
                    return
                  }
                }

                const user = env.GMAIL_USER || 'Saakbyaprajita@gmail.com'
                const pass = env.GMAIL_APP_PASSWORD

                if (!pass) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'GMAIL_APP_PASSWORD is not configured.' }))
                  return
                }

                const normalizedEmail = email.trim().toLowerCase()
                const otp = Math.floor(100000 + Math.random() * 900000).toString()

                // Store code with 10-minute expiry
                otpStore.set(normalizedEmail, {
                  otp,
                  fullName: fullName || normalizedEmail.split('@')[0],
                  password: password ? password.trim() : undefined,
                  expiresAt: Date.now() + 10 * 60 * 1000,
                  attempts: 0
                })

                const recipientName = fullName || 'Patron'
                const otpHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Saak Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 560px; width: 100%;">
          
          <!-- Atelier Header -->
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

          <!-- OTP Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 12px;">✨🔑</div>
              <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1F1A17; margin: 0 0 10px 0; font-weight: 400;">
                Your Verification Code
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #5C524B; margin: 0 auto 24px auto; max-width: 440px;">
                Dear ${recipientName}, use the 6-digit one-time verification code below to complete your registration and join the Saak Patron circle.
              </p>

              <!-- Luxury OTP Display Box -->
              <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td style="background: #FFFFFF; border: 2px solid #C5A059; border-radius: 8px; padding: 18px 36px; text-align: center; box-shadow: 0 6px 20px rgba(197, 160, 89, 0.15);">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A817A; font-weight: 600; margin-bottom: 6px;">
                      ONE-TIME PASSCODE
                    </div>
                    <div style="font-size: 38px; font-weight: 700; color: #A34835; letter-spacing: 0.25em; font-family: monospace; line-height: 1.2;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
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

          <!-- Footer -->
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
`

                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: { user, pass }
                })

                await transporter.sendMail({
                  from: `Saak by Aprajita <${user}>`,
                  to: normalizedEmail,
                  subject: `✨ Your Saak Verification Code: ${otp}`,
                  html: otpHtml,
                  text: `Your Saak verification code is: ${otp}. It is valid for 10 minutes.`
                })

                console.info(`[DevServer OTP] Sent code ${otp} to ${normalizedEmail}`)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, message: 'Verification code sent to your email.' }))
              } catch (err) {
                console.error('[DevServer OTP Error]:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message || 'Failed to dispatch verification code.' }))
              }
            })
          })

          // 3. Auth Verify OTP Endpoint
          server.middlewares.use('/api/auth/verify-otp', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}')
                const { email, otp, fullName, password, confirmPassword } = parsed
                if (!email || !otp) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Email and 6-digit verification code are required.' }))
                  return
                }

                const normalizedEmail = email.trim().toLowerCase()
                const record = otpStore.get(normalizedEmail)

                if (!record) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'No active verification code found for this email. Please request a new code.' }))
                  return
                }

                if (Date.now() > record.expiresAt) {
                  otpStore.delete(normalizedEmail)
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Verification code has expired. Please request a new code.' }))
                  return
                }

                if (record.otp !== otp.trim()) {
                  record.attempts += 1
                  if (record.attempts >= 5) {
                    otpStore.delete(normalizedEmail)
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'Too many incorrect attempts. Please request a new code.' }))
                    return
                  }
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Incorrect verification code. Please check your email and try again.' }))
                  return
                }

                const effectivePass = (password || record.password || '').trim()
                const effectiveConfirm = (confirmPassword || '').trim()
                if (effectivePass && effectiveConfirm && effectivePass !== effectiveConfirm) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Passwords do not match. Please ensure both passwords are identical.' }))
                  return
                }

                // Update server patrons database
                const patrons = getServerPatrons()
                const existingIdx = patrons.findIndex(p => p.email.toLowerCase() === normalizedEmail)
                const patronRecord = {
                  id: existingIdx >= 0 ? patrons[existingIdx].id : `patron_${Date.now()}`,
                  email: normalizedEmail,
                  fullName: record.fullName || fullName || (existingIdx >= 0 ? patrons[existingIdx].fullName : normalizedEmail.split('@')[0]),
                  password: effectivePass || (existingIdx >= 0 ? patrons[existingIdx].password : undefined),
                  provider: 'email',
                  verified: true,
                  createdAt: existingIdx >= 0 ? patrons[existingIdx].createdAt : new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                if (existingIdx >= 0) {
                  patrons[existingIdx] = patronRecord
                } else {
                  patrons.push(patronRecord)
                }
                saveServerPatrons(patrons)

                // Code is correct! Clean up store and build authenticated patron
                otpStore.delete(normalizedEmail)
                const user = {
                  id: patronRecord.id,
                  email: normalizedEmail,
                  fullName: patronRecord.fullName,
                  provider: 'email',
                  verified: true,
                  createdAt: patronRecord.createdAt
                }

                console.info(`[DevServer OTP] Successfully verified patron: ${normalizedEmail}`)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, user }))
              } catch (err) {
                console.error('[DevServer Verify Error]:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message || 'Verification failed.' }))
              }
            })
          })

          // 4. Auth Password Login Endpoint
          server.middlewares.use('/api/auth/login', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}')
                const { email, password } = parsed
                if (!email || !password) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Email and password are required.' }))
                  return
                }

                const normalizedEmail = email.trim().toLowerCase()
                const cleanEnteredPass = password.trim()
                const patrons = getServerPatrons()
                const found = patrons.find(p => p.email.toLowerCase() === normalizedEmail)

                if (found && found.password) {
                  const storedPass = (found.password || '').trim()
                  if (found.password === password || storedPass === cleanEnteredPass) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({
                      success: true,
                      user: {
                        id: found.id,
                        email: found.email,
                        fullName: found.fullName,
                        provider: 'email',
                        createdAt: found.createdAt
                      }
                    }))
                    return
                  }
                }

                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Invalid password. Please check your credentials or sign in with an OTP code.' }))
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message }))
              }
            })
          })

          // 4. Development-only OTP Query (for automated end-to-end verification)
          server.middlewares.use('/api/auth/dev-get-otp', (req, res) => {
            const url = new URL(req.url, 'http://localhost:5173')
            const email = (url.searchParams.get('email') || '').trim().toLowerCase()
            const record = otpStore.get(email)
            res.setHeader('Content-Type', 'application/json')
            if (record) {
              res.statusCode = 200
              res.end(JSON.stringify({ found: true, otp: record.otp, email }))
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ found: false, error: 'No active OTP found' }))
            }
          })
        }
      }
    ]
  }
})

