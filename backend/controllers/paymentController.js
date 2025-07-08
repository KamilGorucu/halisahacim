// ✅ Güncellenmiş ödeme controller - 3D Secure + Checkout Form
const Iyzipay = require('iyzipay');
const Business = require('../models/Business');
const mongoose = require('mongoose');

if (!process.env.IYZIPAY_API_KEY || !process.env.IYZIPAY_SECRET_KEY) {
  throw new Error('Iyzico API anahtarları eksik!');
}

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY,
  secretKey: process.env.IYZIPAY_SECRET_KEY,
  uri: 'https://api.iyzipay.com',
});

exports.initializeCheckoutForm = async (req, res) => {
  const { fullName, email, amount, businessId } = req.body;

  try {
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'İşletme bulunamadı.' });

    const [name, ...surnameParts] = fullName.split(' ');
    const surname = surnameParts.join(' ') || 'Soyadı Yok';
    const formattedAmount = Number(amount).toFixed(2);

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `CONV-${Date.now()}`,
      price: formattedAmount,
      paidPrice: formattedAmount,
      currency: Iyzipay.CURRENCY.TRY,
      callbackUrl: `${process.env.API_URL}/api/payments/callback?businessId=${businessId}`,
      buyer: {
        id: `BY-${businessId}`,
        name,
        surname,
        email,
        identityNumber: '12345678901',
        registrationAddress: business.address,
        ip: req.ip || req.connection.remoteAddress || '85.34.78.112',
        city: business.location.city,
        country: 'Turkey',
        phoneNumber: business.phone,
      },
      billingAddress: {
        contactName: fullName,
        city: business.location.city,
        country: 'Turkey',
        address: business.address,
      },
      basketItems: [
        {
          id: 'B67832',
          name: 'Halısaha Görünürlük Hizmeti',
          category1: 'Abonelik',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: formattedAmount,
        },
      ],
    };
    console.log('İyzico Request:', request);

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) return res.status(500).json({ message: 'İyzico hata verdi', err });
      if (result.status !== 'success') return res.status(400).json({ message: 'Başlatılamadı', result });

      return res.json({ token: result.token, htmlContent: result.checkoutFormContent });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

exports.paymentCallback = async (req, res) => {
  console.log("✅ İyzico callback isteği geldi:", req.method, req.originalUrl);
  const { businessId } = req.query;

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      console.log("❌ İşletme bulunamadı:", businessId);
      return res.status(404).send('İşletme bulunamadı');
    }

    business.isActive = true;
    business.nextPaymentDate = new Date(new Date().setDate(new Date().getDate() + 30));
    await business.save();

    console.log("✅ İşletme başarıyla aktif edildi:", business.businessName);

    res.send(`
      <html>
        <head><title>Ödeme Başarılı</title></head>
        <body style="text-align:center; font-family:sans-serif; padding-top:50px;">
          <h1>✅ Ödeme Başarılı</h1>
          <p>Ödemeniz alındı. Sayfayı kapatabilir ya da <a href="${process.env.CLIENT_URL}">anasayfaya dönebilirsiniz</a>.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ Güncelleme hatası:', err);
    res.status(500).send('Güncelleme sırasında hata');
  }
};
