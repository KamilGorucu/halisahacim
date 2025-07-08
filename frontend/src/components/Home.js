import React from 'react';
import { useNavigate } from 'react-router-dom';
import videoSrc from '../image/0319.mp4';
import heroBg from '../image/arka_plan.jpg';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleNavigation = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login-user');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* HERO SECTION */}
      <section className="bg-dark text-white text-center">
      <div
        className="text-white d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh'
        }}
      >
        <div className="container text-center">
          <h1 className="display-4 mb-3">Halısahacım'a Hoş Geldiniz</h1>
          <p className="lead">Futbol keyfini bir üst seviyeye taşıyın</p>
          <button className="btn btn-primary mt-3" onClick={() => handleNavigation('/search')}>
            Hemen Rezervasyon Yap
          </button>
        </div>
      </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">🎬 Kısa Tanıtım Videomuz</h2>
          <div className="ratio ratio-16x9">
            <video autoPlay muted controls className="w-100">
              <source src={videoSrc} type="video/mp4" />
              Tarayıcınız video etiketini desteklemiyor.
            </video>
          </div>
        </div>
      </section>

      {/* KULLANICI AVANTAJLARI */}
      <section className="py-5" style={{ backgroundColor: '#B2CD9C' }}>
        <div className="container">
          <h2 className="text-center mb-5">Kullanıcılar İçin Avantajlar</h2>
          <div className="row text-center">
            {[{
              title: 'Halısaha Rezervasyonu',
              desc: 'Tek tek sahaları arayıp boş saat sormaktan sıkıldınız mı? Artık buna gerek yok! Halısahacım ile tüm sahaların uygunluk durumuna anında erişin ve tek tıkla rezervasyonunuzu oluşturun.',
              path: '/search',
              img: 'news-2-3-368x287.jpg'
            }, {
              title: 'Rakip Takım Bul',
              desc: 'Hazırsınız ama rakip mi yok? Sorun değil! Size en yakın rakip takımları listeleyin, iletişime geçin ve futbol heyecanını dilediğiniz saatte yaşayın.',
              path: '/requests/opponent',
              img: 'rakip.jpg'
            }, {
              title: 'Oyuncu Bul',
              desc: 'Son dakika oyuncu iptalleri ya da eksik kadrolar artık sorun değil. Halısahacım, eksik oyuncu derdine kökten çözüm sunar. İlan verin ve anında takviye yapın.',
              path: '/team-requests',
              img: 'oyuncu_bul.jpg'
            }, {
              title: 'Takım Bul',
              desc: 'Kaleciler için ek gelir fırsatları! Takımsız mısın ya da kalecilik yaparak hem eğlenip hem kazanmak mı istiyorsun? Takım bul özelliğimiz tam sana göre!',
              path: '/requests/player',
              img: 'kaleci.jpg'
            }].map((feature, index) => (
              <div className="col-md-6 col-lg-3 mb-4" key={index}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={require(`../image/${feature.img}`)}
                    className="card-img-top"
                    alt={feature.title}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">{feature.title}</h5>
                    <p className="card-text">{feature.desc}</p>
                    <button
                      className="btn btn-outline-success mt-3"
                      style={{ transition: '0.3s' }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#198754')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                      onClick={() => handleNavigation(feature.path)}
                    >
                      {feature.title}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İŞLETMELER İÇİN AVANTAJLAR */}
      <section className="py-5 my-3" style={{ backgroundColor: '#B2CD9C' }}>
        <div className="container">
          <h2 className="text-center mb-5">İşletmeler İçin Avantajlar</h2>
          <div className="row text-center">
            {[{
              icon: "📅",
              title: "Rezervasyon Yönetimi",
              desc: "Sahanızın rezervasyonlarını kolayca yönetin. Tüm takvim yapısı elinizin altında, hem sizin hem kullanıcıların işi kolaylaşsın."
            }, {
              icon: "📸",
              title: "İşletme Sayfanız",
              desc: "Sahanızın fotoğraflarını, açıklamalarını ve konumunu profesyonelce sunabileceğiniz özel işletme sayfanız hazır!"
            }, {
              icon: "💰",
              title: "Gelir Takibi",
              desc: "Haftalık ve aylık kazançlarınızı tek panelden anlık takip edin. Şeffaf gelir analiziyle işletmenizi büyütün."
            }, {
              icon: "🔔",
              title: "Anlık Bildirimler",
              desc: "Yeni rezervasyonlar, yorumlar ve kullanıcı mesajları size anında bildirim olarak gelir. Hiçbir gelişmeyi kaçırmazsınız."
            }, {
              icon: "⭐",
              title: "Rekabetçi Puan Sistemi",
              desc: "Kullanıcılar tarafından yapılan değerlendirmelerle puan kazanın ve en çok tercih edilen işletmeler arasında yer alın!"
            }, {
              icon: "🛠️",
              title: "Teknik Destek",
              desc: "Size özel destek ekibimizle, tüm teknik sorunlarınıza hızlıca çözüm buluruz. 7/24 destek yanınızda!"
            }].map((item, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <div className="p-4 border rounded shadow-sm bg-white h-100 d-flex flex-column align-items-center text-center">
                  <div style={{ fontSize: "3rem" }}>{item.icon}</div>
                  <h5 className="mt-3">{item.title}</h5>
                  <p className="mt-2 text-muted" style={{ fontSize: '0.95rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEDEN HALISAHACIM */}
      <section className="py-5" style={{ backgroundColor: '#B2CD9C' }}>
        <div className="container">
          <h2 className="text-center mb-5">Neden Halısahacım?</h2>
          <div className="row text-center">
            {[{
              title: '✅ Kullanıcı Dostu Arayüz',
              desc: 'Modern ve sezgisel tasarımı sayesinde, teknik bilgiye ihtiyaç duymadan tüm işlemlerinizi kolayca gerçekleştirin. Sadece birkaç tıklamayla rezervasyon yapabilir, takımlar oluşturabilir veya oyuncu bulabilirsiniz.'
            }, {
              title: '✅ Gerçek Zamanlı Rezervasyon',
              desc: 'Saha uygunluk durumlarını anlık olarak görün, dolu-zamanlı telefon görüşmeleriyle vakit kaybetmeyin. Hızlıca boş saatleri yakalayın ve yerinizi garantileyin.'
            }, {
              title: '✅ %100 Güvenli Ödeme',
              desc: 'Tüm ödeme işlemleriniz SSL sertifikaları ve güçlü güvenlik altyapısıyla korunur. Kart bilgileriniz güvende, ödemeleriniz hızlı ve sorunsuz şekilde gerçekleşir.'
            }, {
              title: '✅ İlk Ay Ücretsiz!',
              desc: 'İşletmeler için özel tanıtım fırsatı: platformumuzu ilk ay tamamen ücretsiz kullanarak sistemimize alışın ve müşteri kitlenizi genişletin.'
            }, {
              title: '🚀 Yenilikçi Özellikler',
              desc: 'Halısahacım sürekli gelişen yapısıyla yeni özellikler sunar: oyuncu eşleşme sistemi, anlık bildirimler, yapay zekâ destekli öneriler ve daha fazlası her zaman cebinizde.'
            }, {
              title: '💬 Kullanıcı Destek Hattı',
              desc: 'Sorularınıza anında yanıt alabileceğiniz profesyonel destek ekibimiz 7 gün 24 saat hizmetinizde. Karşılaştığınız her sorunda yanınızdayız.'
            }].map((item, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <div className="card h-100 shadow">
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
