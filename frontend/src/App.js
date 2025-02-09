import React, { useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthContext, { AuthProvider } from './contexts/AuthContext';
import './css/NavigationFooter.css';
import Home from './components/Home';
import UserRegister from './components/UserRegister';
import BusinessRegister from './components/BusinessRegister';
import UserProfile from './components/UserProfile';
import BusinessProfile from './components/BusinessProfile';
import UserLogin from './components/UserLogin';
import BusinessLogin from './components/BusinessLogin';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import AvailableSlotsTable from './components/AvailableSlotsTable';
import BusinessReservationTable from './components/BusinessReservationTable';
import UserReservations from './components/UserReservations';
import TournamentList from './components/TournamentList';
import TournamentCreate from './components/TournamentCreate';
import TournamentDetails from './components/TournamentDetails';
import ChallengeList from './components/ChallengeList';
import ChallengeCreate from './components/ChallengeCreate';
import PaymentForm from './components/PaymentForm';
import Chat from './components/Chat'; // Yeni chat bileşeni eklendi
import OpponentRequests from './components/OpponentRequests';
import PlayerRequests from './components/PlayerRequests';
import CreateRequest from './components/CreateRequest';

function App() {
  const { user, business, logout } = useContext(AuthContext);

  return (
    <AuthProvider>
      <Router>
        <Navigation user={user} business={business} logout={logout} />
        <Routes>
          {/* Kullanıcı Rotaları */}
          <Route path="/" element={<Home />} />
          <Route path="/register-user" element={<UserRegister />} />
          <Route path="/login-user" element={<UserLogin />} />
          <Route path="/profile/user" element={<UserProfile />} />
          <Route path="/reservations/user" element={<UserReservations />} />
          <Route path="/search" element={<SearchForm />} />
          <Route path="/results" element={<SearchResults />} />

          {/* İşletme Rotaları */}
          <Route path="/register-business" element={<BusinessRegister />} />
          <Route path="/login-business" element={<BusinessLogin />} />
          <Route path="/profile/business" element={<BusinessProfile />} />
          <Route path="/reservations/business" element={<BusinessReservationTable />} />
          <Route path="/available-slots" element={<AvailableSlotsTable />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournament-create" element={<TournamentCreate />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="/challenges" element={<ChallengeList />} />
          <Route path="/challenge-create" element={<ChallengeCreate />} />
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/chat" element={<Chat />} /> {/* Yeni chat rotası */}
          <Route path="/requests/opponent" element={<OpponentRequests />} />
          <Route path="/requests/player" element={<PlayerRequests />} />
          <Route path="/requests/create" element={<CreateRequest />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const Navigation = () => {
  const { user, business, logout } = useContext(AuthContext);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  return (
    <>
      <nav className="navbar">
        <ul className="menu">
          <li className="menu-item left"><Link to="/">Anasayfa</Link></li>

          {!user && !business && (
            <>
              <li className="menu-item dropdown">
                <span onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}>Kayıt Ol</span>
                {showRegisterDropdown && (
                  <ul className="dropdown-menu">
                    <li><Link to="/register-user">Kullanıcı Kayıt</Link></li>
                    <li><Link to="/register-business">İşletme Kayıt</Link></li>
                  </ul>
                )}
              </li>
              <li className="menu-item dropdown">
                <span onClick={() => setShowLoginDropdown(!showLoginDropdown)}>Giriş Yap</span>
                {showLoginDropdown && (
                  <ul className="dropdown-menu">
                    <li><Link to="/login-user">Kullanıcı Giriş</Link></li>
                    <li><Link to="/login-business">İşletme Giriş</Link></li>
                  </ul>
                )}
              </li>
            </>
          )}

          {user && (
            <>
              <li className="menu-item"><Link to="/search">Halısahalar</Link></li>
              <li className="menu-item"><Link to="/profile/user">Profilim</Link></li>
              <li className="menu-item"><Link to="/chat">Sohbet</Link></li>
              <li className="menu-item"><Link to="/requests/opponent">Rakip Bul</Link></li>
              <li className="menu-item"><Link to="/requests/player">Oyuncu Bul</Link></li>
              <li className="menu-item"><Link to="/requests/create">Talep Oluştur</Link></li>
              <li className="menu-item logout" onClick={logout}>Çıkış Yap</li>
            </>
          )}

          {business && (
            <>
              {business.isActive ? (
                <>
                  <li className="menu-item"><Link to="/profile/business">Profilim</Link></li>
                  <li className="menu-item"><Link to="/chat">Sohbet</Link></li>
                  <li className="menu-item logout" onClick={logout}>Çıkış Yap</li>
                </>
              ) : (
                <>
                  <li className="menu-item"><Link to="/payment">Ödeme Yap</Link></li>
                  <li className="menu-item warning">Ödemeniz gerçekleşmeden işletmeniz aktif edilemez!</li>
                  <li className="menu-item logout" onClick={logout}>Çıkış Yap</li>
                </>
              )}
            </>
          )}
        </ul>
      </nav>
      <Footer />
    </>
  );
};

const Footer = () => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Sayfanın en altına ulaşıldı mı kontrol edilir
      if (scrollTop + windowHeight >= documentHeight - 10) {
        setIsHidden(true); // En alttaysa gizle
      } else {
        setIsHidden(false); // Diğer kısımlarda göster
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer className={isHidden ? 'hidden' : ''}>
      <p>Site made by <strong>Kamil Görücü</strong></p>
      <div className="social-links">
        <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
        <a href="https://x.com/yourprofile" target="_blank" rel="noopener noreferrer">🐦 X (Twitter)</a>
        <a href="mailto:kamilgorucu07@gmail.com">📧 Mail</a>
      </div>
    </footer>
  );
};

export default App;
