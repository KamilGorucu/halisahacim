const cron = require('node-cron');
const Business = require('../models/Business');

// Abonelik kontrolünü günlük kontrol eden cron job
cron.schedule('0 0 * * *', async () => {
  console.log('Abonelik kontrolü başlatıldı.');

  try {
    const now = new Date();
    const expiredBusinesses = await Business.find({
      isActive: true,
      lastPaymentDate: { $lt: new Date(now.setMonth(now.getMonth() - 1)) }, // 1 aydan eski ödemeler
    });

    for (const business of expiredBusinesses) {
      business.isActive = false;
      await business.save();
      console.log(`İşletme pasif hale getirildi: ${business.businessName}`);
    }
  } catch (error) {
    console.error('Abonelik kontrolü sırasında bir hata oluştu:', error);
  }
});
