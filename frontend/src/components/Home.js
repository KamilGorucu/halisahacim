import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css'; // CSS dosyasını içe aktarıyoruz

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="title">⚽ Halısahacım Platformuna Hoş Geldiniz!</h1>
      <p className="intro">
        Halısahacım, kullanıcılar ve işletmeler için özel olarak tasarlanmış bir futbol sahası rezervasyon platformudur.
        Halısahaları tek tek telefonla aramaktan yoruldunuz mu? Oynayacak rakip mi bulamıyorsunuz? İşte tam size göre bir çözüm!
      </p>

      <h2 className="section-title">🎯 Kullanıcılar İçin Halısahacım Neler Sunar?</h2>
      <ul className="features-list">
        <li>🏟️ <strong>Halısaha Rezervasyonu:</strong> Şehrinizdeki uygun halısahaları anında keşfedin ve hızlıca rezervasyon yapın.</li>
        <li>👥 <strong>Rakip Takım & Oyuncu Bulma:</strong> Eksik oyuncu veya rakip takım ihtiyacınızı kolayca karşılayın.</li>
        <li>🏆 <strong>Turnuva Kayıtları:</strong> Şehrinizde düzenlenen turnuvaları inceleyin ve takımınızla katılın.</li>
        <li>📍 <strong>Konum Bazlı Arama:</strong> Size en yakın halısahaları otomatik olarak listeleyerek en iyi seçeneği sunar.</li>
        <li>⭐ <strong>Yorum & Puanlama:</strong> Halısahalar hakkında diğer kullanıcıların yorumlarını okuyun ve kendi deneyimlerinizi paylaşın.</li>
      </ul>

      <h2 className="section-title">💼 İşletme Sahipleri İçin Avantajlar</h2>
      <ul className="features-list">
        <li>📅 <strong>Rezervasyon Yönetimi:</strong> Kullanıcıların rezervasyon taleplerini onaylayın veya reddedin.</li>
        <li>📸 <strong>Fotoğraf & Tanıtım:</strong> İşletmenize özel sayfada fotoğraflarınızı paylaşın ve detaylı açıklamalar ekleyin.</li>
        <li>💰 <strong>Gelir Takibi:</strong> İşletmeler için gelir yönetim paneli ile kazancınızı takip edin.</li>
        <li>🔔 <strong>Bildirim Sistemi:</strong> Yeni rezervasyon talepleri ve kullanıcı yorumları hakkında anında bildirim alın.</li>
        <li>⭐ <strong>Rekabetçi Puan Sistemi:</strong> İşletmenizi daha cazip hale getirmek için müşteri puanlarını yükseltin!</li>
      </ul>

      <h2 className="section-title">✨ Halısahacım Neden Tercih Edilmeli?</h2>
      <p className="advantages">
        ✅ <strong>Kullanıcı Dostu Arayüz:</strong> Kolay kullanım ve hızlı işlem yapma imkanı.<br />
        ✅ <strong>Gerçek Zamanlı Rezervasyon:</strong> Boş saatleri anında görerek zahmetsiz rezervasyon.<br />
        ✅ <strong>%100 Güvenli Ödeme:</strong> İşletmeler için güvenli ödeme sistemi.<br />
        ✅ <strong>İlk Ay Ücretsiz!</strong> İşletme sahipleri için deneme fırsatı!<br />
      </p>

      <h3 className="cta-title">🔥 Şimdi Kayıt Olun ve Futbolun Keyfini Çıkarın!</h3>
      <div className="button-container">
        <Link to="/register-user">
          <button className="register-button user-button">🧑‍🎓 Kullanıcı Olarak Katıl</button>
        </Link>
        <Link to="/register-business">
          <button className="register-button business-button">🏢 İşletme Sahibi Olarak Katıl</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
