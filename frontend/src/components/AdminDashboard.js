import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import axios from "axios";
import '../css/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Eğer admin değilse giriş sayfasına yönlendir
  useEffect(() => {
    if (!admin) {
      navigate("/admin-login");
    }
  }, [admin, navigate]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/admin/pending-businesses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBusinesses(response.data);
      } catch (error) {
        console.error("İşletmeler alınırken hata oluştu:", error);
      }
    };
    fetchBusinesses();
  }, []);

  const approveBusiness = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/admin/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(businesses.filter((b) => b._id !== id));
    } catch (error) {
      console.error("İşletme onaylanırken hata oluştu:", error);
    }
  };

const rejectBusiness = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(businesses.filter((b) => b._id !== id));
    } catch (error) {
      console.error("İşletme reddedilirken hata oluştu:", error);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2 className="admin-title">Admin Paneli</h2>
        <button className="admin-logout-button" onClick={logout}>Çıkış Yap</button>
      </div>

      <h3 className="pending-title">Onay Bekleyen İşletmeler</h3>
      {businesses.length === 0 ? (
        <p className="no-business-message">Bekleyen işletme yok.</p>
      ) : (
        businesses.map((business) => (
          <div key={business._id} className="admin-business-card">
            <h3><strong>İşletme Adı:</strong>{business.businessName}</h3>
            <p><strong>İşletme Sahibi:</strong> {business.ownerName}</p>
            <p><strong>E-posta:</strong> {business.email}</p>
            <p><strong>Telefon:</strong> {business.phone || "Belirtilmemiş"}</p> {/* ✅ Telefon bilgisi */}
            <p><strong>Şehir:</strong> {business.location.city}</p>
            <p><strong>Adres:</strong> {business.address || "Belirtilmemiş"}</p> {/* ✅ Adres bilgisi */}
            <p><strong>Koordinatlar:</strong> {business.location.coordinates?.join(", ")}</p>
            <p><strong>Ekipmanlar:</strong> {business.equipment}</p>
            <p><strong>Ortalama Puan:</strong> {business.averageRating || "Henüz yok"}</p>
            <p><strong>Durum:</strong> {business.isActive ? "Aktif" : "Pasif"}</p>

            <h4 className="section-subtitle">Sahalar</h4>
            {business.fields.length > 0 ? (
              business.fields.map((field, index) => (
                <div key={index} className="field-info">
                  <p><strong>Adı:</strong> {field.name}</p>
                  <p><strong>Kapasite:</strong> {field.capacity} Kişi</p>
                  <p><strong>Fiyat:</strong> {field.price} TL</p>
                  <div className="working-hours">
                    <h5>Çalışma Saatleri</h5>
                    {field.workingHours.map((hour, idx) => (
                      <p key={idx}>{hour.start} - {hour.end}</p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>Saha bilgisi girilmemiş.</p>
            )}

            <h4 className="section-subtitle">Fotoğraflar</h4>
            <div className="image-gallery">
              {business.photos.map((photo, index) => (
                <img key={index} src={`${API_URL}/${photo}`} alt="İşletme Fotoğrafı" className="business-photo" />
              ))}
            </div>

            <button onClick={() => approveBusiness(business._id)} className="approve-button">✅ Onayla</button>
	          <button onClick={() => rejectBusiness(business._id)} className="reject-button">❌ Reddet</button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
