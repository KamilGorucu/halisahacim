import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          if (decoded.role === 'user') {
            setUser({ id: decoded.id, email: decoded.email, role: 'user' });
          } else if (decoded.role === 'business') {
            setBusiness({ id: decoded.id, email: decoded.email, role: 'business', isActive: decoded.isActive });
            localStorage.setItem('businessId', decoded.id); // Business ID'yi sakla
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
    window.location.href = '/'; // Ana sayfaya yönlendirme
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        setBusiness,
        login,
        logout,
        isLoggedIn: !!user || !!business,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
