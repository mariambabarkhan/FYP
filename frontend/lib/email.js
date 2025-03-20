import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports (e.g., 587)
  auth: {
    user: process.env.SMTP_USER, // your SMTP username
    pass: process.env.SMTP_PASS, // your SMTP password
  },
});

export async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'LLAMAR Support <support@llamar.com>',
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>It is valid for 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}
