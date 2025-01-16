import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthContext, { AuthProvider } from './contexts/AuthContext';
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
import PaymentForm from './components/PaymentForm'; // Ödeme formunu ekleyin

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
          <Route path="/payment" element={<PaymentForm />} /> {/* Ödeme rotasını ekleyin */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const Navigation = () => {
  const { user, business, logout } = useContext(AuthContext);

  return (
    <nav>
      <ul>
        <li><Link to="/">Anasayfa</Link></li>
        
        {!user && !business && (
          <>
            <li><Link to="/register-user">Kullanıcı Kayıt</Link></li>
            <li><Link to="/register-business">İşletme Kayıt</Link></li>
            <li><Link to="/login-user">Kullanıcı Giriş</Link></li>
            <li><Link to="/login-business">İşletme Giriş</Link></li>
          </>
        )}

        {user && (
          <>
            <li><Link to="/search">Halısahalar</Link></li>
            <li><Link to="/profile/user">Profilim</Link></li>
            <li style={{ cursor: 'pointer' }} onClick={logout}>Çıkış Yap</li>
          </>
        )}

        {business && business.isActive && (
          <>
            <li><Link to="/profile/business">Profilim</Link></li>
            <li style={{ cursor: 'pointer' }} onClick={logout}>Çıkış Yap</li>
          </>
        )}

        {business && !business.isActive && (
          <>
            <li><Link to="/payment">Ödeme Yap</Link></li>
            <li style={{ color: 'red' }}>Ödemeniz gerçekleşmeden işletmeniz aktif edilemez!</li>
            <li style={{ cursor: 'pointer' }} onClick={logout}>Çıkış Yap</li>
          </>
        )}
      </ul>
    </nav>
  );
};


export default App;
