const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body.recaptchaToken;

  if (!recaptchaToken) {
    return res.status(400).json({ message: "reCAPTCHA doğrulaması gereklidir!" });
  }

  try {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      },
    });

    if (!response.data.success || response.data.score < 0.5) {
      return res.status(400).json({ message: "Bot tespit edildi! reCAPTCHA başarısız." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "reCAPTCHA doğrulama hatası!", error: error.message });
  }
};

module.exports = verifyRecaptcha;
