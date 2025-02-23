const Iyzipay = require('iyzipay');
const Business = require('../models/Business');
const mongoose = require('mongoose');

if (!process.env.IYZIPAY_API_KEY || !process.env.IYZIPAY_SECRET_KEY) {
  throw new Error('Iyzico API anahtarları eksik! Lütfen .env dosyanızı kontrol edin.');
}

// İyzico yapılandırması
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY, 
  secretKey: process.env.IYZIPAY_SECRET_KEY, 
  uri: 'https://sandbox-api.iyzipay.com', 
});

exports.createPayment = async (req, res) => {
  const { email, fullName, cardNumber, expireMonth, expireYear, cvc, amount, businessId } = req.body;

  if (!email || !fullName || !cardNumber || !expireMonth || !expireYear || !cvc || !amount || !businessId) {
    return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır.' });
  }
  console.log('📩 Gelen Ödeme Request:', req.body);
  if (!businessId) {
    console.error('❌ HATA: businessId GELMEDİ!');
    return res.status(400).json({ message: 'İşletme ID eksik. Lütfen tekrar giriş yapın.' });
  }

  console.log('📌 İşletme ID:', businessId);

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    console.error('❌ Geçersiz İşletme ID:', businessId);
    return res.status(400).json({ message: 'Geçersiz işletme ID.' });
  }

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const [name, ...surnameParts] = fullName.split(' ');
    const surname = surnameParts.join(' ') || 'Soyadı Yok';

    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `PAY-${Date.now()}`,
      price: amount,
      paidPrice: amount,
      currency: Iyzipay.CURRENCY.TRY,
      paymentCard: {
        cardHolderName: fullName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc,
      },
      buyer: {
        id: `BY${businessId}`,
        name,
        surname,
        email,
        identityNumber: business.identityNumber || '12345678901',
        registrationAddress: business.address || 'Test Address',
        ip: clientIp,
        city: business.city || 'Istanbul',
        country: 'Turkey',
      },
      billingAddress: {
        contactName: fullName,
        city: business.city || 'Istanbul',
        country: 'Turkey',
        address: business.address || 'Test Fatura Adresi',
      },
      basketItems: [
        {
          id: 'B67832',
          name: 'Halısaha Abonelik',
          category1: 'Abonelik',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount,
        },
      ],
    };

    iyzipay.payment.create(request, async (err, result) => {
      if (err || result.status !== 'success') {
        console.error('Ödeme Hatası:', err || result);
        return res.status(500).json({ message: 'Ödeme başarısız oldu.', error: err || result });
      }
  
      await Business.findByIdAndUpdate(businessId, {
        isActive: true,
        nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 gün ileri
      });
  
      res.status(200).json({ message: 'Ödeme başarılı!' });
    });
  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};
