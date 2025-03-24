import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/BusinessProfile.css';
const API_URL = process.env.REACT_APP_API_URL;
const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    fields: [],
  });
  const [reservations, setReservations] = useState([]); // Rezervasyonları tutar.
  const [weeklySlots, setWeeklySlots] = useState([]); // Haftalık görünüm için saat aralıkları
  const [weekOffset, setWeekOffset] = useState(0); // Geçmiş/gelecek haftalar için kaydırma
  const [isUpdating, setIsUpdating] = useState(false); // Güncelleme alanını aç/kapat
  // const [isActive, setIsActive] = useState(false); // İşletme aktif durumu
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_URL}/api/profile/business`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profil alınamadı.');
      // setIsActive(data.isActive); // İşletme aktiflik durumunu kaydet
      setFormData({
        businessName: data.businessName || '',
        // location: data.location || { city: '', coordinates: [] },
        // workingHours: data.workingHours || [],
        // equipment: data.equipment || '',
        // price: data.price || '',
        // fieldCount: data.fieldCount || 0,
        fields: data.fields || [],
      });
    } catch (error) {
      console.error('Profil alınamadı:', error);
    }
  },[navigate]);

  const toggleUpdateSection = () => {
    setIsUpdating(!isUpdating);
  };

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...formData.fields];
    updatedFields[index][key] = value;
    setFormData({ ...formData, fields: updatedFields });
  };


  const handleWorkingHoursChange = (fieldIndex, hourIndex, key, value) => {
    const updatedFields = [...formData.fields];
    if (!updatedFields[fieldIndex].workingHours) {
      updatedFields[fieldIndex].workingHours = [];
    }
    if (!updatedFields[fieldIndex].workingHours[hourIndex]) {
      updatedFields[fieldIndex].workingHours[hourIndex] = { start: '', end: '' };
    }
    updatedFields[fieldIndex].workingHours[hourIndex][key] = value;
    setFormData({ ...formData, fields: updatedFields });
  };

  const addWorkingHour = (fieldIndex) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].workingHours = updatedFields[fieldIndex].workingHours || [];
    updatedFields[fieldIndex].workingHours.push({ start: '', end: '' });
    setFormData({ ...formData, fields: updatedFields });
  };

  const removeWorkingHour = (fieldIndex, hourIndex) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].workingHours.splice(hourIndex, 1);
    setFormData({ ...formData, fields: updatedFields });
  };

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_URL}/reservations/business-reservations?businessId=${localStorage.getItem('businessId')}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (response.ok) {
        setReservations(data.reservations);
      } else {
        console.error('Rezervasyonlar alınamadı:', data.message);
      }
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    }
  },[navigate]);


  const fetchWeeklySlots = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const businessId = localStorage.getItem('businessId');
      if (!token || !businessId) {
        navigate('/login');
        return;
      }
      const startDate = getStartOfWeek(weekOffset);
      const endDate = getEndOfWeek(weekOffset);
      console.log("Start Date:", startDate); // Haftanın başlangıç tarihi
      console.log("End Date:", endDate);     // Haftanın bitiş tarihi
      const response = await fetch(
        `${API_URL}/reservations/weekly?businessId=${businessId}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Güncellenmiş WeeklySlots:", data.weeklyData);
        setWeeklySlots(data.weeklyData || []);
      } else {
        console.error('Haftalık veriler alınamadı:', data.message);
      }
    } catch (error) {
      console.error('Haftalık veriler alınamadı:', error);
    }
  },[weekOffset, navigate]);
  
  useEffect(() => {
    if (!localStorage.getItem('businessId')) {
      console.error('Business ID bulunamadı. Lütfen giriş yaptığınızdan emin olun.');
      navigate('/login'); // Giriş yapılmamışsa yönlendirme
      return;
    }
    fetchProfile();
    fetchReservations();
    fetchWeeklySlots();
  }, [fetchProfile,fetchReservations,fetchWeeklySlots]);

  const getStartOfWeek = (offset = 0) => {
    const now = new Date();
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 2 + offset * 7));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  };
  
  const getEndOfWeek = (offset = 0) => {
    const monday = new Date(getStartOfWeek(offset));
    const sunday = new Date(monday.setDate(monday.getDate() + 6));
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString().split('T')[0];
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Geçersiz Tarih';
    const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', options); // Türkçe formatta döndür
  };

  const handleWeekChange = (direction) => {
    setWeekOffset((prev) => prev + direction);
  };

  const handleApprove = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_URL}/reservations/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId }),
      });
      if (response.ok) {
        alert('Rezervasyon onaylandı!');
        fetchReservations(); // Listeyi güncelle
        fetchWeeklySlots();  // ✅ **Haftalık görünümü de güncelle**
      } else {
        const data = await response.json();
        alert(data.message || 'Rezervasyon onaylanamadı.');
      }
    } catch (error) {
      console.error('Rezervasyon onaylanamadı:', error);
    }
  };

  const handleReject = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_URL}/reservations/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId }),
      });
  
      if (response.ok) {
        alert('Rezervasyon reddedildi!');
        fetchReservations(); // Listeyi güncelle
        fetchWeeklySlots();  // ✅ **Haftalık görünümü de güncelle**
      } else {
        const data = await response.json();
        alert(data.message || 'Rezervasyon reddedilemedi.');
      }
    } catch (error) {
      console.error('Rezervasyon reddedilemedi:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/business/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Profil başarıyla güncellendi!');
      } else {
        console.error('Profil güncellenemedi.');
      }
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
    }
  };

  const calculateWeeklyEarnings = () => {
    let totalEarnings = 0;
  
    weeklySlots.forEach(field => {
      field.weeklyData.forEach(day => {
        day.daySlots.forEach(slot => {
          if (slot.status === 'approved') {  // ✅ Sadece onaylı rezervasyonları hesapla
            const fieldData = formData.fields.find(f => f.name === field.fieldName);
            if (fieldData) {
              totalEarnings += fieldData.price;
            }
          }
        });
      });
    });
  
    return totalEarnings;
  };
  
  
  return (
    <div className="business-profile-container">
      <div className="profile-header">
        <h2>İşletme Profilimi Güncelle</h2>
        <button className="toggle-button" onClick={toggleUpdateSection}>
            {isUpdating ? '▲' : '▼'}
        </button>
      </div>

      {isUpdating && (
      <form className="update-form" onSubmit={handleSubmit}>
        {formData.fields.map((field, index) => (
          <div key={index} className="field-group">
            <label className="field-label">
              Saha Adı:
              <input
                type="text"
                className="field-input"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              />
            </label>
            <label className="field-label">
              Kapasite:
              <input
                type="text"
                className="field-input"
                value={field.capacity}
                onChange={(e) => handleFieldChange(index, 'capacity', e.target.value)}
              />
            </label>
            <label className="field-label">
              Fiyat:
              <input
                type="number"
                className="field-input"
                value={field.price}
                onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
              />
            </label>
      
            <div className="working-hours">
              {field.workingHours.map((hour, hourIndex) => (
                <div key={hourIndex} className="working-hour-group">
                  <label className="working-hour-label">
                    Başlangıç Saati:
                    <input
                      type="text"
                      className="working-hour-input"
                      value={hour.start || ''}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, hourIndex, 'start', e.target.value)
                      }
                    />
                  </label>
                  <label className="working-hour-label">
                    Bitiş Saati:
                    <input
                      type="text"
                      className="working-hour-input"
                      value={hour.end || ''}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, hourIndex, 'end', e.target.value)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="remove-hour-button"
                    onClick={() => removeWorkingHour(index, hourIndex)}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
      
            <button
              type="button"
              className="add-hour-button"
              onClick={() => addWorkingHour(index)}
            >
              Ekle
            </button>
          </div>
        ))}
        <button type="submit" className="update-submit-button">
          Güncelle
        </button>
      </form>    
      )}

      <h2 className="weekly-reservations-title">Haftalık Rezervasyon Tabloları</h2>
      <h2 className="weekly-earnings">Haftalık Kazanç: {calculateWeeklyEarnings()} TL</h2>
      <div className="week-navigation">
        <button className="week-button" onClick={() => handleWeekChange(-1)}>Önceki Hafta</button>
        <button className="week-button" onClick={() => handleWeekChange(1)}>Sonraki Hafta</button>
      </div>

      {weeklySlots.length > 0 ? (
        weeklySlots.map((field, fieldIndex) => (
          <div key={fieldIndex} className="weekly-reservations-container">
            <h3 className="field-title">{field.fieldName} - Kapasite: {field.capacity}</h3>
            <div className="table-responsive"> {/* ✅ Yeni bir div ekledik */}
              <table className="weekly-table">
                <thead>
                  <tr>
                    <th className="weekly-header">Tarih</th>
                    {field.weeklyData[0]?.daySlots?.map((slot, index) => (
                      <th key={index} className="weekly-header">{slot.timeSlot || "Saat Yok"}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {field.weeklyData.map((day, index) => (
                    <tr key={index} className="weekly-row">
                      <td className="weekly-date">{formatDate(day.date)}</td>
                      {day.daySlots?.map((slot, slotIndex) => (
                        <td key={slotIndex} className={`weekly-cell ${slot.status}`}>
                          {slot.status === 'approved' && slot.user?.fullName ? (
                            <span className="approved-user">{slot.user.fullName}</span>
                          ) : slot.status === 'pending' ? (
                            <span className="pending-text">Bekliyor</span>
                          ) : (
                            <span className="empty-slot">Boş</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="no-reservations">Henüz veri bulunmamaktadır.</p>
      )}

      <div className="reservation-requests-container">
        <h2 className="reservation-requests-title">Rezervasyon İstekleri</h2>
        {reservations.length === 0 ? (
          <p className="no-requests">Henüz rezervasyon isteği yok.</p>
        ) : (
          <ul className="reservation-list">
            {reservations.map((res) => (
              <li key={res._id} className="reservation-item">
                <p className="reservation-info">
                  <strong>Kullanıcı:</strong> {res.user.fullName} ({res.user.email})
                </p>
                <p className="reservation-info">
                  <strong>Halı Saha:</strong> {res.fieldName}
                </p>
                <p className="reservation-info">
                  <strong>Tarih:</strong> {formatDate(res.date)}
                </p>
                <p className="reservation-info">
                  <strong>Saat:</strong> {res.timeSlot}
                </p>
                <p className={`reservation-status ${res.status}`}>
                  <strong>Durum:</strong> {res.status}
                </p>
                {res.status === 'pending' && (
                  <div className="reservation-buttons">
                    <button className="approve-button" onClick={() => handleApprove(res._id)}>Onayla</button>
                    <button className="reject-button" onClick={() => handleReject(res._id)}>Reddet</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
