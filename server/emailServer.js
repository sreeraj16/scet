import http from 'http';
import nodemailer from 'nodemailer';

// ============================================================
// WASTELOOP NODEMAILER SMTP BACKEND SERVER
// Mail: u638126@gmail.com
// App Password: tlor macq ceek rdsl
// ============================================================

const PORT = 8000;
const SMTP_EMAIL = process.env.SMTP_USER || process.env.VITE_MAIL_USER || 'u638126@gmail.com';
const SMTP_PASS = process.env.SMTP_APP_PASSWORD || process.env.VITE_MAIL_APP_PASSWORD || 'tlormacqceekrdsl';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('[NODEMAILER WARNING] Gmail SMTP Connection Warning:', error.message);
  } else {
    console.log('[NODEMAILER READY] Connected to Gmail SMTP server (u638126@gmail.com)');
  }
});

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/v1/send-email') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { to, subject, html, eventType } = data;

        const mailOptions = {
          from: `"WasteLoop Operations" <${SMTP_EMAIL}>`,
          to: to || SMTP_EMAIL,
          subject: subject || 'WasteLoop Notification',
          html: html,
        };

        console.log(`[SMTP EMAIL SEND] Sending ${eventType || 'notification'} email to ${mailOptions.to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP EMAIL SENT] Message ID: ${info.messageId}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: info.messageId }));
      } catch (err) {
        console.error('[SMTP EMAIL ERROR]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'online', service: 'WasteLoop Nodemailer Server', email: SMTP_EMAIL }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 WasteLoop Nodemailer Server listening at http://localhost:${PORT}/`);
});
