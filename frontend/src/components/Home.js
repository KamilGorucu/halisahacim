import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/Home.css';
import videoSrc from '../image/KAMİL_SİTE_2.mp4';
const Home = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const isAuthenticated = localStorage.getItem('token') !== null; // Kullanıcı giriş durumu

  const handleNavigation = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login-user'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    }
  };

const sections = [
  {
    id: 'hero',
    title: '⚽ Halısahacım\'a Hoş Geldiniz!',
    content: (
      <>
        <p>Futbol sahası rezervasyonunuzu hızla yapın, rakip takım ve oyuncu bulun, turnuvalara katılın. Her şey tek bir platformda!</p>
        <div className="cta-buttons">
          <button onClick={() => navigate('/register-user')} className="cta-button primary">🧑‍🎓 Kullanıcı Kayıt</button>
          <button onClick={() => navigate('/register-business')} className="cta-button secondary">🏢 İşletme Kayıt</button>
        </div>
      </>
    )
  },
  {
    id: 'video',
    title: '🎬 Halısahacım Nasıl Çalışır?',
    content: (
      <div className="video-wrapper">
        <video controls className="promo-video">
          <source src={videoSrc} type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
      </div>
    )
  },
  {
    id: 'features',
    title: '🎯 Kullanıcılar İçin Avantajlar',
    content: (
      <div className="features-grid">
        {[
          { title: "Halısaha Rezervasyonu", desc: "Boş saatleri anında gör, hemen rezervasyon yap.", path: "/search" },
          { title: "Rakip Takım Bul", desc: "Oynamaya hazır mısın? Rakip takım bul ve maça başla!", path: "/requests/opponent" },
          { title: "Oyuncu Bul", desc: "Takımında eksik oyuncu mu var? Hemen oyuncu bul!", path: "/team-requests" },
          { title: "Takım Bul", desc: "Takımın mı yok? Takım bul ve oyuna katıl!", path: "/requests/player" }
        ].map((feature, index) => (
          <motion.div key={index} className="feature-card" whileHover={{ scale: 1.05 }}>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
            <button onClick={() => handleNavigation(feature.path)} className="action-button">{feature.title}</button>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: 'business',
    title: '💼 İşletmeler İçin Avantajlar',
    content: (
      <div className="business-grid">
        {[
          "📅 Rezervasyon Yönetimi : Kullanıcıların rezervasyonlarını yönetin.",
          "📸 İşletme Sayfanız : Halısahanızın fotoğraflarını ve detaylarını paylaşın.",
          "💰 Gelir Takibi : Haftalık & aylık kazancınızı anlık olarak takip edin.",
          "🔔 Anlık Bildirimler : Yeni rezervasyonları ve yorumları anında görün.",
          "⭐ Rekabetçi Puan Sistemi : En iyi işletmeler arasında yerinizi alın!",
          "🛠️ Teknik Destek : İşletmenize özel 7/24 destek ekibimizle yanınızdayız!"
        ].map((item, index) => (
          <motion.div key={index} className="business-card" whileHover={{ scale: 1.05 }}>
            <p>{item}</p>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: 'why-choose',
    title: '✨ Neden Halısahacım?',
    content: (
      <div className="why-choose-grid">
        {[
          { title: "✅ Kullanıcı Dostu Arayüz", desc: "Kolay ve hızlı kullanım ile futbol keyfinizi ikiye katlayın!" },
          { title: "✅ Gerçek Zamanlı Rezervasyon", desc: "Boş saatleri anında görüntüleyin ve rezervasyonunuzu tamamlayın." },
          { title: "✅ %100 Güvenli Ödeme", desc: "Ödeme işlemleriniz tamamen güvenli şekilde gerçekleşir." },
          { title: "✅ İlk Ay Ücretsiz!", desc: "İşletmeler için deneme fırsatı! İlk ay tamamen ücretsiz." },
          { title: "🚀 Yenilikçi Özellikler", desc: "Sürekli güncellenen sistemimizle en iyi hizmeti alın." },
          { title: "💬 Kullanıcı Destek Hattı", desc: "7/24 destek ekibimizle her an yanınızdayız." }
        ].map((item, index) => (
          <motion.div key={index} className="why-card" whileHover={{ scale: 1.05 }}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    )
  }
];


  useEffect(() => {
    const handleScroll = () => {
      const newSection = Math.min(
        sections.length - 1,
        Math.max(0, Math.floor(window.scrollY / 700))
      );
      setCurrentSection(newSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      <div className="fixed-section">
        <AnimatePresence mode="wait">
          <motion.div
            key={sections[currentSection].id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="content-box"
          >
            <h2 className="section-title">{sections[currentSection].title}</h2>
            {sections[currentSection].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
