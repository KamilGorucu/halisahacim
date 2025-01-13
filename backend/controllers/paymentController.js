const Iyzipay = require('iyzipay');
const Business = require('../models/Business');

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY, // İyzico API anahtarı
  secretKey: process.env.IYZIPAY_SECRET_KEY, // İyzico gizli anahtarı
  uri: 'https://sandbox-api.iyzipay.com', // Sandbox ortamı
});

exports.createPayment = async (req, res) => {
  const { email, fullName, cardNumber, expireMonth, expireYear, cvc, amount, businessId } = req.body;

  // Giriş verilerinin doğruluğunu kontrol et
  if (!email || !fullName || !cardNumber || !expireMonth || !expireYear || !cvc || !amount || !businessId) {
    return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır.' });
  }

  try {
    // İşletme kimliğini doğrula
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    // Ödeme talebi oluştur
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: '123456789', // Örnek bir ID
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
        name: fullName.split(' ')[0],
        surname: fullName.split(' ')[1] || '',
        email,
        identityNumber: '12345678901', // Örnek TC kimlik numarası
        registrationAddress: 'Test Address',
        ip: req.ip || '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
      },
      billingAddress: {
        contactName: fullName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Test Fatura Adresi',
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
        console.error('Ödeme hatası:', err || result);
        return res.status(500).json({
          message: 'Ödeme başarısız oldu.',
          error: result?.errorMessage || err.message,
        });
      }

      // İşletmeyi aktif hale getir
      try {
        await Business.findByIdAndUpdate(businessId, { isActive: true });
        res.status(200).json({ message: 'Ödeme başarılı!', paymentId: result.paymentId });
      } catch (updateError) {
        console.error('İşletme güncelleme hatası:', updateError);
        res.status(500).json({
          message: 'Ödeme başarılı ancak işletme aktif hale getirilemedi.',
          paymentId: result.paymentId,
        });
      }
    });
  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};
