import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import nodemailer from 'nodemailer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-send-email-middleware',
        configureServer(server) {
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
                const { to, subject, html, text, from } = parsed
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

                const info = await transporter.sendMail({
                  from: from || `Saak by Aprajita Atelier <${user}>`,
                  to,
                  subject,
                  html,
                  text
                })

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
        }
      }
    ]
  }
})

