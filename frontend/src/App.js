import React, { useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AuthContext, { AuthProvider } from './contexts/AuthContext';
import axios from 'axios';
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
import UserView from './components/UserView';
import TeamRequests from './components/TeamRequests';

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
          <Route path="/search" element={<SearchForm />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/user/:userId" element={<UserView />} /> {/* Kullanıcı profili görüntüleme */}

          {/* İşletme Rotaları */}
          <Route path="/register-business" element={<BusinessRegister />} />
          <Route path="/login-business" element={<BusinessLogin />} />
          <Route path="/profile/business" element={<BusinessProfile />} />
          <Route path="/available-slots" element={<AvailableSlotsTable />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournament-create" element={<TournamentCreate />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="/challenges" element={<ChallengeList />} />
          <Route path="/challenge-create" element={<ChallengeCreate />} />
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/chat" element={<Chat />} /> {/* Yeni chat rotası */}
          <Route path="/team-requests" element={<TeamRequests />} />
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
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isBusiness = !!business;
  const menuRef = useRef(null);
  const location = useLocation(); // Sayfa yönlendirmesini takip eder

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const endpoint = isBusiness
          ? 'http://localhost:5002/api/messages/unread-business'
          : 'http://localhost:5002/api/messages/unread';

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setUnreadCount(response.data.length);
      } catch (error) {
        console.error('Okunmamış mesajlar alınamadı:', error);
      }
    };

    if (user || business) fetchUnreadMessages();
  }, [user, business]);

  // Sayfa değiştiğinde menüyü otomatik kapat
  useEffect(() => {
    setShowMenu(false);
    setShowRegisterDropdown(false);
    setShowLoginDropdown(false);
  }, [location]);

  // Menü dışına tıklanınca kapanmasını sağla
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowRegisterDropdown(false);
        setShowLoginDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
          <Link to="/" className="navbar-logo">Anasayfa</Link>
          <button className="menu-toggle" onClick={() => setShowMenu(!showMenu)}>
            ☰
          </button>

        <ul ref={menuRef} className={`menu ${showMenu ? 'menu-active' : ''}`}>
          {!user && !business && (
            <>
              <li className="menu-item dropdown">
                <span onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}>Kayıt Ol</span>
                {showRegisterDropdown && (
                  <ul className="dropdown-menu">
                    <li><Link to="/register-user" onClick={() => setShowRegisterDropdown(false)}>Kullanıcı Kayıt</Link></li>
                    <li><Link to="/register-business" onClick={() => setShowRegisterDropdown(false)}>İşletme Kayıt</Link></li>
                  </ul>
                )}
              </li>

              <li className="menu-item dropdown">
                <span onClick={() => setShowLoginDropdown(!showLoginDropdown)}>Giriş Yap</span>
                {showLoginDropdown && (
                  <ul className="dropdown-menu">
                    <li><Link to="/login-user" onClick={() => setShowLoginDropdown(false)}>Kullanıcı Giriş</Link></li>
                    <li><Link to="/login-business" onClick={() => setShowLoginDropdown(false)}>İşletme Giriş</Link></li>
                  </ul>
                )}
              </li>
            </>
          )}

          {user && (
            <>
              <li className="menu-item"><Link to="/search">Halısahalar</Link></li>
              <li className="menu-item"><Link to="/profile/user">Profilim</Link></li>
              <li className="menu-item">
                <Link to="/chat">Sohbet {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</Link></li>
              <li className="menu-item"><Link to="/requests/opponent">Rakip Bul</Link></li>
              <li className="menu-item"><Link to="/requests/player">Oyuncu Bul</Link></li>
              <li className="menu-item"><Link to="/team-requests">Takım Bul</Link></li>
              <li className="menu-item"><Link to="/requests/create">Talep Oluştur</Link></li>
              <li className="menu-item logout" onClick={logout}>Çıkış Yap</li>
            </>
          )}

          {business && (
            <>
              {business.isActive ? (
                <>
                  <li className="menu-item"><Link to="/profile/business">Profilim</Link></li>
                  <li className="menu-item">
                    <Link to="/chat">Sohbet {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</Link></li>
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
        <a href="https://www.instagram.com/kamilgorucu7/" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
        <a href="https://x.com/kmlgrc07" target="_blank" rel="noopener noreferrer">🐦 X (Twitter)</a>
      </div>
    </footer>
  );
};

export default App;
