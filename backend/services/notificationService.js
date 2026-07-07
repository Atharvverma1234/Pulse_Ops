// backend/services/notificationService.js
const nodemailer = require('nodemailer');
const axios      = require('axios');

const ENABLED = process.env.NOTIFICATIONS_ENABLED !== 'false';

// ── Severity → emoji map ──────────────────────
const SEVERITY_EMOJI = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🟢',
};

// ─────────────────────────────────────────────
// SLACK
// ─────────────────────────────────────────────
const sendSlackNotification = async ({ alert, incident, message, rule }) => {
  if (!ENABLED || !process.env.SLACK_WEBHOOK_URL) {
    console.log('[Slack] Skipped (disabled or no webhook URL)');
    return;
  }

  const emoji    = SEVERITY_EMOJI[alert.severity] || '⚠';
  const incLink  = incident
    ? `\n*Incident auto-created:* ${incident._id}`
    : '';

  const payload = {
    text: `${emoji} *PulseOps Alert*`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${alert.severity.toUpperCase()} Alert — ${alert.host}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Metric:*\n${alert.metricType}` },
          { type: 'mrkdwn', text: `*Value:*\n${alert.triggeredValue.toFixed(1)}%` },
          { type: 'mrkdwn', text: `*Threshold:*\n${alert.threshold}%` },
          { type: 'mrkdwn', text: `*Host:*\n${alert.host}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message + incLink,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `PulseOps · ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };

  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
    console.log('[Slack] Notification sent');
  } catch (err) {
    console.error('[Slack] Failed:', err.message);
  }
};

// ─────────────────────────────────────────────
// EMAIL
// ─────────────────────────────────────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

const sendEmailNotification = async ({ alert, incident, message, rule }) => {
  if (!ENABLED || !process.env.EMAIL_USER || !process.env.EMAIL_TO) {
    console.log('[Email] Skipped (disabled or no config)');
    return;
  }

  const emoji   = SEVERITY_EMOJI[alert.severity] || '⚠';
  const subject = `${emoji} [PulseOps] ${alert.severity.toUpperCase()}: ${alert.host} — ${alert.metricType}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0f1629;padding:24px;border-radius:12px;">
        <h2 style="color:#6366f1;margin:0 0 16px;">
          ${emoji} PulseOps Alert
        </h2>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#94a3b8;padding:6px 0;width:120px;">Host</td>
            <td style="color:#ffffff;padding:6px 0;">${alert.host}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Metric</td>
            <td style="color:#ffffff;padding:6px 0;">${alert.metricType}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Value</td>
            <td style="color:#ef4444;padding:6px 0;font-weight:bold;">
              ${alert.triggeredValue.toFixed(1)}%
            </td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Threshold</td>
            <td style="color:#ffffff;padding:6px 0;">${alert.threshold}%</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Severity</td>
            <td style="color:#ffffff;padding:6px 0;">${alert.severity.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Time</td>
            <td style="color:#ffffff;padding:6px 0;">${new Date().toLocaleString()}</td>
          </tr>
          ${incident ? `
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Incident ID</td>
            <td style="color:#6366f1;padding:6px 0;">${incident._id}</td>
          </tr>` : ''}
        </table>

        <div style="margin-top:20px;padding:12px;background:#1a2040;border-radius:8px;">
          <p style="color:#cbd5e1;margin:0;font-size:14px;">${message}</p>
        </div>

        <p style="color:#475569;font-size:12px;margin-top:20px;">
          This is an automated alert from PulseOps monitoring platform.
        </p>
      </div>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from:    process.env.EMAIL_FROM,
      to:      process.env.EMAIL_TO,
      subject,
      html,
    });
    console.log('[Email] Notification sent');
  } catch (err) {
    console.error('[Email] Failed:', err.message);
  }
};

module.exports = { sendSlackNotification, sendEmailNotification };