import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Düzeltildi: Doğru import.

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Kullanıcı bilgilerini tutar.
  const [business, setBusiness] = useState(null); // İşletme bilgilerini tutar.
  const [token, setToken] = useState(localStorage.getItem('token')); // Token bilgisini saklar.
  const [refreshTrigger, setRefreshTrigger] = useState(false); // Render tetikleyici.

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token); // JWT token'ı çözümle.
        if (decoded.exp * 1000 > Date.now()) { // Token süresi kontrolü.
          if (decoded.role === 'user') {
            setUser({ id: decoded.id, email: decoded.email, role: 'user' });
          } else if (decoded.role === 'business') {
            setBusiness({
              id: decoded.id,
              email: decoded.email,
              role: 'business',
              isActive: decoded.isActive, // İşletmenin aktif olup olmadığını kontrol et.
            });
          }
        } else {
          logout(); // Token süresi dolmuşsa çıkış yap.
        }
      } catch (error) {
        console.error('Token doğrulanamadı:', error); // Token hatası logla.
        logout(); // Geçersiz token varsa çıkış yap.
      }
    }
  }, [token, refreshTrigger]); // `refreshTrigger` eklenerek tetikleniyor.

  const login = (newToken, userEmail) => {
    const decoded = jwtDecode(newToken); // Yeni token'ı çözümle.
    if (decoded.role === 'user') {
      setUser({ id: decoded.id, email: decoded.email, role: 'user' });
    } else if (decoded.role === 'business') {
      setBusiness({
        id: decoded.id,
        email: decoded.email,
        role: 'business',
        isActive: decoded.isActive, // İşletmenin aktiflik durumunu kontrol et.
      });
    }
    setToken(newToken);
    localStorage.setItem('token', newToken); // Token'ı localStorage'da sakla.
    localStorage.setItem('email', userEmail); // E-posta saklanıyor
    setRefreshTrigger((prev) => !prev); // Refresh tetikleniyor.
  };

  const logout = () => {
    localStorage.removeItem('token'); // Token'ı kaldır.
    setToken(null); // Token'ı sıfırla.
    setUser(null); // Kullanıcı bilgisini sıfırla.
    setBusiness(null); // İşletme bilgisini sıfırla.
    setRefreshTrigger((prev) => !prev); // Refresh tetikleniyor.
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        login,
        logout,
        isLoggedIn: !!user || !!business, // Kullanıcı veya işletme giriş yapmış mı?
        isUserLoggedIn: !!user, // Kullanıcı giriş yapmış mı?
        isBusinessLoggedIn: !!business, // İşletme giriş yapmış mı?
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
