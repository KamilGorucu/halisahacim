import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Hoş Geldiniz! Halısahacım Platformu</h1>
      <p>
        Halısahacım, kullanıcıların ve işletme sahiplerinin ihtiyaçlarını en kolay şekilde
        karşılamak için tasarlanmış bir platformdur. İşte platformumuzun öne çıkan
        özellikleri:
      </p>
      
      <h2>Kullanıcılar İçin</h2>
      <ul>
        <li>
          Şehir bazlı halısahaları görüntüleyebilir ve boş olan saatlere kolayca
          rezervasyon isteği gönderebilirsiniz.
        </li>
        <li>
          Takımınız için rakip bulabilir veya eksik oyuncu ihtiyacınızı hızlıca
          karşılayabilirsiniz.
        </li>
        <li>
          Şehrinizdeki turnuvaları keşfedip takımınızla kayıt olabilirsiniz.
        </li>
      </ul>
      
      <h2>İşletme Sahipleri İçin</h2>
      <ul>
        <li>
          İşletmenizin tüm rezervasyonlarını kolayca yönetin ve boş/dolu saatlerinizi
          belirleyin.
        </li>
        <li>
          İşletmenize yapılan puan ve yorumları görüntüleyerek müşteri memnuniyetini
          artırın.
        </li>
        <li>
          Otomatik ödeme sistemiyle gelirlerinizi kolayca takip edin.
        </li>
      </ul>
      
      <h2>Avantajlarımız</h2>
      <p>
        - Kullanıcı dostu arayüz: İhtiyacınız olan her şey tek bir tıkla elinizin
        altında! <br />
        - Hızlı rezervasyon: Sadece boş saatleri görerek işlem yapabilirsiniz. <br />
        - Güvenli ödeme: Otomatik ödeme sistemiyle hiçbir detay unutulmaz(İLK AY ÜCRETSİZ!!).
      </p>
      
      <h3>Hemen Başlayın!</h3>
      <div>
        <Link to="/register-user">
          <button>Kullanıcı Kayıt</button>
        </Link>
        <Link to="/register-business">
          <button>İşletme Sahibi Kayıt</button>
        </Link>
        <Link to="/login">
          <button>Giriş Yap</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
