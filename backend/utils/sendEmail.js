const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`📩 E-posta gönderildi: ${to}`);
  } catch (error) {
    console.error(`❌ E-posta gönderme hatası: ${error.message}`);
  }
};

module.exports = sendEmail;
