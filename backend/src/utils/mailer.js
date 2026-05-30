const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  await transporter.sendMail({
    from:    `"TrustVault Security" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: "TrustVault — Password Reset Request",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#0b0f1a;color:#f9fafb;padding:40px;border-radius:16px;">
        <h2 style="color:#818cf8;margin-bottom:8px;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your TrustVault account.</p>
        <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:13px;">If you didn't request this, ignore this email. Your password won't change.</p>
        <p style="color:#64748b;font-size:12px;margin-top:24px;">TrustVault Security System</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };