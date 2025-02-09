const Iyzipay = require('iyzipay');
const Business = require('../models/Business');

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

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const [name, ...surnameParts] = fullName.split(' ');
    const surname = surnameParts.join(' ') || 'Soyadı Yok';

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: '123456789',
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
        identityNumber: '12345678901',
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
        return res.status(500).json({ message: 'Ödeme başarısız oldu.' });
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
