import React, { useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from "./components/AdminLogin";
// import TermsOfService from './components/TermsOfService';
// import PrivacyPolicy from './components/PrivacyPolicy';
// import BusinessServicePage from './components/BusinessServicePage';
// import ServiceInfo from './components/ServiceInfo';
// import PaymentSuccess from './components/PaymentSuccess';
// import visaMastercard from './image/visa-mastercard.png';
// import MesafeliSatisSozlesmesi from './components/MesafeliSatisSozlesmesi';
// import TeslimatVeIade from './components/TeslimatVeIade';
import SubscriptionRequests from './components/SubscriptionRequests';
import RatingPage from './components/RatingPage';
import FriendList from './components/FriendList'; 
import FriendSearch from './components/FriendSearch'; 
import LineupManager from './components/LineupManager';
import CreateLineupOnField from './components/CreateLineupOnField';

const API_URL = process.env.REACT_APP_API_URL;
function App() {
  const { user, business, admin, logout } = useContext(AuthContext);

  return (
    <AuthProvider>
      <Router>
        <Navigation user={user} business={business} admin={admin} logout={logout} />
        <Routes>
          {/* Kullanıcı Rotaları */}
          <Route path="/" element={<Home />} />
          <Route path="/register-user" element={<UserRegister />} />
          <Route path="/login-user" element={<UserLogin />} />
          <Route path="/profile/user" element={<UserProfile />} />
          <Route path="/search" element={<SearchForm />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/user/:userId" element={<UserView />} /> {/* Kullanıcı profili görüntüleme */}

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />

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
          <Route path="/rate" element={<RatingPage />} />
          <Route path="/friends" element={<FriendList />} /> 
          <Route path="/friend-search" element={<FriendSearch />} /> 
          <Route path="/lineups" element={<LineupManager />} />
          <Route path="/lineups/create" element={<CreateLineupOnField />} />

	  {/* Yasal Sayfalar */}
	        {/* <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/business-service" element={<BusinessServicePage />} />
          <Route path="/service-info" element={<ServiceInfo />} />
          <Route path="/mesafeli-satis-sozlesmesi" element={<MesafeliSatisSozlesmesi />} />
          <Route path="/delivery-return" element={<TeslimatVeIade />} /> */}

          {/* Abonelik */}
          <Route path="/subscription/requests" element={<SubscriptionRequests />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const Navigation = () => {
  const { user, business, admin, logout } = useContext(AuthContext);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRateLink, setShowRateLink] = useState(false);
  const isBusiness = !!business;
  const menuRef = useRef(null);
  const location = useLocation(); // Sayfa yönlendirmesini takip eder
  const navigate = useNavigate();
  
  const closeOffcanvas = () => {
    setTimeout(() => {
      document.querySelector('#mobileMenu .btn-close')?.click();
    }, 100);
  };

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const endpoint = isBusiness
          ? `${API_URL}/api/messages/unread-business`
          : `${API_URL}/api/messages/unread`;

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

  useEffect(() => {
    const checkIfRatingAvailable = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/matches/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const now = new Date();
        const hasMatchToRate = res.data.some(match =>
          new Date(match.matchDate) < now &&
          !match.ratingGiven.includes(user.id)
        );
        setShowRateLink(hasMatchToRate);
      } catch (err) {
        console.error("Puanlama kontrolü başarısız:", err);
      }
    };
  
    if (user) checkIfRatingAvailable();
  }, [user]);

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
      <nav className="navbar navbar-expand-lg navbar-dark bg-success px-3">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand fw-bold text-white">Halısahacım</Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Masaüstü Menü */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {!user && !business && !admin && (
                <>
                  <li className="nav-item dropdown">
                    <span className="nav-link dropdown-toggle text-white" role="button" data-bs-toggle="dropdown">
                      Kayıt Ol
                    </span>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link to="/register-user" className="dropdown-item custom-dropdown">
                          Kullanıcı Kayıt
                        </Link>
                      </li>
                      <li>
                        <Link to="/register-business" className="dropdown-item custom-dropdown">
                          İşletme Kayıt
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item dropdown">
                    <span className="nav-link dropdown-toggle text-white" role="button" data-bs-toggle="dropdown">
                      Giriş Yap
                    </span>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link to="/login-user" className="dropdown-item custom-dropdown">
                          Kullanıcı Giriş
                        </Link>
                      </li>
                      <li>
                        <Link to="/login-business" className="dropdown-item custom-dropdown">
                          İşletme Giriş
                        </Link>
                      </li>
                    </ul>
                  </li>

                  {admin && (
                    <>
                      <li className="nav-item"><Link className="nav-link text-white" to="/admin">Admin Paneli</Link></li>
                      <li className="nav-item"><span className="nav-link text-danger" onClick={logout}>Çıkış Yap</span></li>
                    </>
                  )}
                </>
              )}

              {user && (
                <>
                  <li className="nav-item"><Link className="nav-link text-white" to="/search">Halısahalar</Link></li>
                  <li className="nav-item"><Link className="nav-link text-white" to="/profile/user">Profilim</Link></li>
                  <li className="nav-item"><Link className="nav-link text-white" to="/friends">Arkadaşlar</Link></li>
                  <li className="nav-item"><Link className="nav-link text-white" to="/lineups">Kadro Yönetimi</Link></li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/chat">
                      Sohbet {unreadCount > 0 && <span className="badge bg-warning ms-1">{unreadCount}</span>}
                    </Link>
                  </li>
                  {showRateLink && (
                    <li className="nav-item"><Link className="nav-link text-white" to="/rate">Puanla</Link></li>
                  )}
                  <li className="nav-item"><Link className="nav-link text-white" to="/requests/opponent">Rakip Bul</Link></li>
                  <li className="nav-item"><Link className="nav-link text-white" to="/requests/player">Oyuncu Bul</Link></li>
                  <li className="nav-item"><Link className="nav-link text-white" to="/team-requests">Takım Bul</Link></li>
                  <li className="nav-item"><Link className="nav-link text-white" to="/requests/create">Talep Oluştur</Link></li>
                  <li className="nav-item"><span className="nav-link text-danger" onClick={logout}>Çıkış Yap</span></li>
                </>
              )}

              {business && (
                <>
                  {business.isActive ? (
                    <>
                      <li className="nav-item"><Link className="nav-link text-white" to="/profile/business">Profilim</Link></li>
                      <li className="nav-item"><Link className="nav-link text-white" to="/subscription/requests">Abonelik Talepleri</Link></li>
                      <li className="nav-item">
                        <Link className="nav-link text-white" to="/chat">
                          Sohbet {unreadCount > 0 && <span className="badge bg-warning ms-1">{unreadCount}</span>}
                        </Link>
                      </li>
                      <li className="nav-item"><span className="nav-link text-danger" onClick={logout}>Çıkış Yap</span></li>
                    </>
                  ) : (
                    <>
                      <li className="nav-item"><Link className="nav-link text-warning" to="/payment">Ödeme Yap</Link></li>
                      <li className="nav-item"><span className="nav-link text-light small">Ödemeniz gerçekleşmeden işletmeniz aktif edilemez!</span></li>
                      <li className="nav-item"><span className="nav-link text-danger" onClick={logout}>Çıkış Yap</span></li>
                    </>
                  )}
                </>
              )}

              {user && user.role === "admin" && (
                <li className="nav-item"><Link className="nav-link text-white" to="/admin">Admin Paneli</Link></li>
              )}
            </ul>
          </div>
        </div>
      </nav>


      <div className="offcanvas offcanvas-end bg-success text-white" tabIndex="-1" id="mobileMenu">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menü</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav w-100 d-flex flex-column align-items-center">

            {/* Giriş Yapmamış Kullanıcılar */}
            {!user && !business && !admin && (
              <>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/register-user" onClick={closeOffcanvas}>Kullanıcı Kayıt</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/register-business" onClick={closeOffcanvas}>İşletme Kayıt</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/login-user" onClick={closeOffcanvas}>Kullanıcı Giriş</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/login-business" onClick={closeOffcanvas}>İşletme Giriş</Link>
                </li>
              </>
            )}

            {/* Kullanıcı Girişi Yapanlar */}
            {user && (
              <>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/search" onClick={closeOffcanvas}>Halısahalar</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/profile/user" onClick={closeOffcanvas}>Profilim</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/friends" onClick={closeOffcanvas}>Arkadaşlar</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/lineups" onClick={closeOffcanvas}>Kadro Yönetimi</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/chat" onClick={closeOffcanvas}>
                    Sohbet {unreadCount > 0 && <span className="badge bg-warning ms-1">{unreadCount}</span>}
                  </Link>
                </li>
                {showRateLink && (
                  <li className="nav-item w-100 my-1">
                    <Link className="custom-mobile-link" to="/rate" onClick={closeOffcanvas}>Puanla</Link>
                  </li>
                )}
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/requests/opponent" onClick={closeOffcanvas}>Rakip Bul</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/requests/player" onClick={closeOffcanvas}>Oyuncu Bul</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/team-requests" onClick={closeOffcanvas}>Takım Bul</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <Link className="custom-mobile-link" to="/requests/create" onClick={closeOffcanvas}>Talep Oluştur</Link>
                </li>
                <li className="nav-item w-100 my-1">
                  <span className="custom-mobile-link bg-danger text-white" onClick={logout} style={{ cursor: 'pointer' }}>Çıkış Yap</span>
                </li>
              </>
            )}

            {/* İşletme Girişi Yapanlar */}
            {business && (
              <>
                {business.isActive ? (
                  <>
                    <li className="nav-item w-100 my-1">
                      <Link className="custom-mobile-link" to="/profile/business" onClick={closeOffcanvas}>Profilim</Link>
                    </li>
                    <li className="nav-item w-100 my-1">
                      <Link className="custom-mobile-link" to="/subscription/requests" onClick={closeOffcanvas}>Abonelik Talepleri</Link>
                    </li>
                    <li className="nav-item w-100 my-1">
                      <Link className="custom-mobile-link" to="/chat" onClick={closeOffcanvas}>
                        Sohbet {unreadCount > 0 && <span className="badge bg-warning ms-1">{unreadCount}</span>}
                      </Link>
                    </li>
                    <li className="nav-item w-100 my-1">
                      <span className="custom-mobile-link bg-danger text-white" onClick={logout} style={{ cursor: 'pointer' }}>Çıkış Yap</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item w-100 my-1">
                      <Link className="custom-mobile-link text-warning" to="/payment" onClick={closeOffcanvas}>Ödeme Yap</Link>
                    </li>
                    <li className="nav-item w-100 my-1">
                      <span className="text-light small d-block text-center">Ödemeniz gerçekleşmeden işletmeniz aktif edilemez!</span>
                    </li>
                    <li className="nav-item w-100 my-1">
                      <span className="custom-mobile-link bg-danger text-white" onClick={logout} style={{ cursor: 'pointer' }}>Çıkış Yap</span>
                    </li>
                  </>
                )}
              </>
            )}

            {/* Admin Panel Linki */}
            {user && user.role === "admin" && (
              <li className="nav-item w-100 my-1">
                <Link className="custom-mobile-link" to="/admin" onClick={closeOffcanvas}>Admin Paneli</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

const Footer = () => {
  const [isTop, setIsTop] = useState(true);
  const { business } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsTop(scrollTop <= 10); // sadece en üstteyken görünür
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className={`footer-custom-bottom ${isTop ? 'visible' : 'hidden'}`}>
      <p>Site made by <strong>Kamil Görücü</strong></p>
      <div className="footer-links">
        {/* <Link to="/business-service">Hizmet Tanıtımı</Link>
        <Link to="/service-info">Fiyat Bilgisi</Link>
        <Link to="/terms-of-service">Kullanım Şartları</Link>
        <Link to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
        <Link to="/delivery-return">Teslimat ve İade</Link>
        <Link to="/privacy-policy">Gizlilik Politikası</Link>
        <img src={visaMastercard} alt="Visa ve Mastercard" style={{ maxWidth: '100px', marginTop: '10px' }} /> */}
        {business && business.isActive === false && (
          <Link to="/payment" className="text-warning">Ödeme</Link>
        )}
      </div>
      <div className="social-links mt-1">
        <a href="https://www.instagram.com/kamilgorucu7/" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i> Instagram</a>
        <a href="https://x.com/kmlgrc07" target="_blank" rel="noopener noreferrer"><i className="bi bi-twitter"></i> (Twitter)</a>
      </div>
    </footer>
  );
};

export default App;
