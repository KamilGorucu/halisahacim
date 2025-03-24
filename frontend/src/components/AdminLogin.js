import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import axios from "axios";
import '../css/AdminLogin.css';
const API_URL = process.env.REACT_APP_API_URL;
const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { email, password });
      login(response.data.token);
      navigate("/admin");
    } catch (err) {
      setError("Hatalı giriş! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="admin-login-container">
      <h2 className="admin-login-title">Admin Girişi</h2>
      {error && <p className="admin-login-error">{error}</p>}
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          className="admin-login-input"
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="admin-login-input"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="admin-login-button">Giriş Yap</button>
      </form>
    </div>
  );
};

export default AdminLogin;
