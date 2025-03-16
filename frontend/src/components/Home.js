import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css'; // CSS dosyasını içe aktarıyoruz

const Home = () => {
  return (
    <div className="home-container">
      {/* Başlık ve Giriş */}
      <header className="hero-section">
        <h1 className="main-title">⚽ Halısahacım'a Hoş Geldiniz! 🎉</h1>
        <p className="intro-text">
          Halısahacım, kullanıcılar ve işletmeler için özel olarak tasarlanmış en iyi futbol sahası rezervasyon platformudur.
          Artık saatlerce halısaha aramak zorunda kalmadan, tek tıkla maçınızı organize edin! 💪🔥
        </p>
        <div className="cta-buttons">
          <Link to="/register-user">
            <button className="cta-button primary">🧑‍🎓 Kullanıcı Olarak Katıl</button>
          </Link>
          <Link to="/register-business">
            <button className="cta-button secondary">🏢 İşletme Sahibi Olarak Katıl</button>
          </Link>
        </div>
      </header>

      {/* Tanıtım Videosu Bölümü */}
      <section className="video-section">
        <h2 className="section-title">📽️ Halısahacım Nasıl Çalışır?</h2>
        <p className="video-description">Kısa tanıtım videomuzu izleyerek platformumuzu keşfedin! 👀</p>
        <div className="video-container">
          <iframe 
            width="100%" 
            height="400" 
            src="https://www.youtube.com/watch?v=OLrG9HG6a40" // YouTube video linki buraya eklenmeli
            title="Tanıtım Videosu" 
            frameBorder="0" 
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Kullanıcılar İçin Avantajlar */}
      <section className="features-section">
        <h2 className="section-title">🎯 Kullanıcılar İçin Halısahacım Neler Sunar?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🏟️ Halısaha Rezervasyonu</h3>
            <p>Şehrinizdeki boş saatleri anında görün, kolayca rezervasyon yapın.</p>
          </div>
          <div className="feature-card">
            <h3>👥 Rakip Takım & Oyuncu Bulma</h3>
            <p>Eksik oyuncu veya rakip takım arıyorsanız, hemen ilan oluşturun!</p>
          </div>
          <div className="feature-card">
            <h3>🏆 Turnuva Kayıtları</h3>
            <p>Şehrinizdeki turnuvalara katılın ve ekibinizle rekabet edin!</p>
          </div>
          <div className="feature-card">
            <h3>📍 Konum Bazlı Arama</h3>
            <p>Size en yakın halısahaları otomatik listeleyelim!</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Yorum & Puanlama</h3>
            <p>Diğer kullanıcıların yorumlarını okuyun ve kendi deneyiminizi paylaşın!</p>
          </div>
        </div>
      </section>

      {/* İşletmeler İçin Avantajlar */}
      <section className="business-section">
        <h2 className="section-title">💼 İşletme Sahipleri İçin Avantajlar</h2>
        <ul className="business-features">
          <li>📅 Rezervasyon Yönetimi : Kullanıcıların rezervasyonlarını yönetin.</li>
          <li>📸 İşletme Sayfanız : Halısahanızın fotoğraflarını ve detaylarını paylaşın.</li>
          <li>💰 Gelir Takibi : Günlük & aylık kazancınızı anlık olarak takip edin.</li>
          <li>🔔 Anlık Bildirimler : Yeni rezervasyonları ve yorumları anında görün.</li>
          <li>⭐ Rekabetçi Puan Sistemi : En iyi işletmeler arasında yerinizi alın!</li>
        </ul>
      </section>

      {/* Neden Halısahacım? */}
      <section className="why-choose-section">
        <h2 className="section-title">✨ Neden Halısahacım?</h2>
        <div className="why-choose-grid">
          <div className="why-card">
            <h3>✅ Kullanıcı Dostu Arayüz</h3>
            <p>Kolay ve hızlı kullanım ile futbol keyfinizi ikiye katlayın!</p>
          </div>
          <div className="why-card">
            <h3>✅ Gerçek Zamanlı Rezervasyon</h3>
            <p>Boş saatleri anında görüntüleyin ve rezervasyonunuzu tamamlayın.</p>
          </div>
          <div className="why-card">
            <h3>✅ %100 Güvenli Ödeme</h3>
            <p>Ödeme işlemleriniz tamamen güvenli şekilde gerçekleşir.</p>
          </div>
          <div className="why-card">
            <h3>✅ İlk Ay Ücretsiz!</h3>
            <p>İşletmeler için deneme fırsatı! İlk ay tamamen ücretsiz. 🎉</p>
          </div>
        </div>
      </section>

      {/* Kayıt Olma Çağrısı */}
      <section className="cta-section">
        <h3 className="cta-title">🔥 Şimdi Kayıt Ol ve Futbolun Keyfini Çıkar!</h3>
        <div className="cta-buttons">
          <Link to="/register-user">
            <button className="cta-button primary">🧑‍🎓 Kullanıcı Olarak Katıl</button>
          </Link>
          <Link to="/register-business">
            <button className="cta-button secondary">🏢 İşletme Sahibi Olarak Katıl</button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
