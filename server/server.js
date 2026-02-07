require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
const RECIPIENT = process.env.CONTACT_RECIPIENT || 'spbluecorp@gmail.com';

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('Warning: SMTP credentials are not fully configured. See .env.example');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: (process.env.SMTP_SECURE === 'true'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message' });
  }

  const mail = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: RECIPIENT,
    subject: `[Website Contact] ${subject || 'Website inquiry'}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mail);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error sending contact email:', err && err.stack || err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact server listening on http://localhost:${PORT}`);
});
