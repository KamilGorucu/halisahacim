const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail kullanıyoruz (kendi SMTP sağlayıcını da kullanabilirsin)
  auth: {
    user: 'kamilgorucu07@gmail.com', // Gönderici e-posta adresi
    pass: 'duvn kype eeyv hahz', // E-posta şifresi veya uygulama şifresi
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    if (!to) {
        throw new Error('Alıcı e-posta adresi tanımlanmadı.');
    }
    await transporter.sendMail({
      from: 'kamilgorucu07@gmail.com',
      to,
      subject,
      text,
    });
    console.log(`E-posta gönderildi: ${to}`);
  } catch (error) {
    console.error('E-posta gönderim hatası:', error);
  }
};

module.exports = { sendEmail };
