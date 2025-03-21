import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('📌 JWT Decode:', decoded); // Debugging için ekle
        if (decoded.exp * 1000 > Date.now()) {
          if (decoded.role === 'user') {
            setUser({ id: decoded.id, email: decoded.email, role: 'user' });
          } else if (decoded.role === 'business') {
            setBusiness({ id: decoded.id || decoded._id, email: decoded.email, role: 'business', isActive: decoded.isActive });
            localStorage.setItem('businessId', decoded.id || decoded._id); // Business ID'yi sakla
          } else if (decoded.role === 'admin') {
            setAdmin({ role: "admin" });
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('Geçersiz token:', error);
        logout();
      }
    }
  }, [token]);

  useEffect(() => {
    if (business?.role === 'business' && !business.isActive) {
      window.location.href = '/payment'; // Ödeme sayfasına yönlendirme
    }
  }, [business?.isActive,]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('businessId'); // İşletme ID'sini temizle
    setUser(null);
    setBusiness(null);
    setAdmin(null);
    window.location.href = '/'; // Ana sayfaya yönlendirme
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        admin,
        setUser,
        setBusiness,
        login,
        logout,
        isLoggedIn: !!user || !!business || !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
