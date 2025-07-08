import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBox from './ChatBox';
import '../css/BusinessProfile.css';

const API_URL = process.env.REACT_APP_API_URL;

const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    fields: [],
  });
  const [reservations, setReservations] = useState([]); // Rezervasyonları tutar.
  const [dailySlots, setDailySlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false); // Güncelleme alanını aç/kapat
  const [isActive, setIsActive] = useState(true); // İşletme aktif durumu
  const [showChatBox, setShowChatBox] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverModel, setReceiverModel] = useState('User');
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
      setIsActive(data.isActive); // İşletme aktiflik durumunu kaydet
     /* if (!data.isActive) {
        navigate('/payment'); // ❌ Aktif değilse ödeme sayfasına yönlendir
        return;
      }*/
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
      const response = await fetch(`${API_URL}/api/reservations/business-reservations?businessId=${localStorage.getItem('businessId')}`, {
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


  const fetchDailySlots = useCallback(async () => {
    const token = localStorage.getItem('token');
    const businessId = localStorage.getItem('businessId');
    if (!token || !businessId) return navigate('/login');
    const isoDate = currentDate.toISOString().split('T')[0];
    const res = await fetch(`${API_URL}/api/reservations/daily?businessId=${businessId}&date=${isoDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setDailySlots(data.dailyData || []);
  }, [currentDate, navigate]);
  
  useEffect(() => {
    if (!localStorage.getItem('businessId')) {
      console.error('Business ID bulunamadı. Lütfen giriş yaptığınızdan emin olun.');
      navigate('/login'); // Giriş yapılmamışsa yönlendirme
      return;
    }
    fetchProfile();
    fetchReservations();
    fetchDailySlots();
  }, [fetchProfile,fetchReservations,fetchDailySlots]);

  const getStartOfWeek = (offset = 0) => {
    const today = new Date();
    const day = today.getDay(); // 0-Pazar, 1-Pazartesi, ...
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
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

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleApprove = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_URL}/api/reservations/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId }),
      });
      if (response.ok) {
        alert('Rezervasyon onaylandı!');
        fetchReservations(); // Listeyi güncelle
        fetchDailySlots();  // ✅ **Haftalık görünümü de güncelle**
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
      const response = await fetch(`${API_URL}/api/reservations/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId }),
      });
  
      if (response.ok) {
        alert('Rezervasyon reddedildi!');
        fetchReservations(); // Listeyi güncelle
        fetchDailySlots();  // ✅ **Haftalık görünümü de güncelle**
      } else {
        const data = await response.json();
        alert(data.message || 'Rezervasyon reddedilemedi.');
      }
    } catch (error) {
      console.error('Rezervasyon reddedilemedi:', error);
    }
  };

  const handleDelete = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        alert('Rezervasyon silindi ve saat tekrar kullanılabilir hale getirildi.');
        fetchReservations(); // Listeyi güncelle
        fetchDailySlots();  // Slotları güncelle
      } else {
        const data = await response.json();
        alert(data.message || 'Silme işlemi başarısız.');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/business/update`, {
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

  // const calculateWeeklyEarnings = () => {
  //   let totalEarnings = 0;
  
  //   dailySlots.forEach(field => {
  //     field.weeklyData.forEach(day => {
  //       day.daySlots.forEach(slot => {
  //         if (slot.status === 'approved') {  // ✅ Sadece onaylı rezervasyonları hesapla
  //           const fieldData = formData.fields.find(f => f.name === field.fieldName);
  //           if (fieldData) {
  //             totalEarnings += fieldData.price;
  //           }
  //         }
  //       });
  //     });
  //   });
  
  //   return totalEarnings;
  // };
  
  
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

      {/* <h2 className="weekly-earnings">Haftalık Kazanç: {calculateWeeklyEarnings()} TL</h2> */}
      <h2 className="text-center my-4 text-success">Günlük Rezervasyonlar</h2>
      <div className="d-flex justify-content-center align-items-center mb-3 gap-2">
        <button className="btn btn-success" onClick={() => handleDateChange(-1)}>
          Önceki Gün
        </button>
        <span className="fw-bold">{formatDate(currentDate.toISOString())}</span>
        <button className="btn btn-success" onClick={() => handleDateChange(1)}>
          Sonraki Gün
        </button>
      </div>

      {dailySlots.length > 0 ? (
        dailySlots.map((field, fieldIndex) => (
          <div key={fieldIndex} className="card mb-4 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">{field.fieldName} - Kapasite: {field.capacity}</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Saat</th>
                    <th scope="col">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {field.daySlots.map((slot, slotIndex) => (
                    <tr key={slotIndex} className={slot.status === 'approved' ? 'table-success' : slot.status === 'pending' ? 'table-warning' : ''}>
                      <td>{slot.timeSlot}</td>
                      <td>
                        {slot.status === 'approved' && slot.user?.fullName ? (
                          <>
                            <strong>{slot.user.fullName}</strong>
                            {slot.reservationId && (
                              <button
                                className="btn btn-sm btn-danger ms-2"
                                onClick={() => handleDelete(slot.reservationId)}
                              >
                                🗑️ Sil
                              </button>
                            )}
                          </>
                        ) : slot.status === 'pending' ? (
                          <span className="text-warning fw-bold">Bekliyor</span>
                        ) : (
                          <span className="text-muted">Boş</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted">Bugün için veri yok.</p>
      )}

      <div className="reservation-requests-container">
        <h2 className="reservation-requests-title">Rezervasyon İstekleri</h2>
	      <p style = {{textAlign: 'center'}}>7 günü geçmiş istekler otomatik olarak silinir</p>
        {reservations.length === 0 ? (
          <p className="no-requests">Henüz rezervasyon isteği yok.</p>
        ) : (
          <ul className="list-group">
            {reservations
            .filter((res) => {
              const resDate = new Date(res.date).toISOString().split('T')[0];
              const currentISO = currentDate.toISOString().split('T')[0];
              return resDate === currentISO;
            })
            .map((res) => (
              <li key={res._id} className="list-group-item mb-3 shadow-sm rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 text-success">
                    <i className="bi bi-person-fill me-1"></i>
                    {res.user?.fullName || 'Kullanıcı yok'} ({res.user?.email || 'Email yok'})
                  </h6>
                </div>

                <p className="mb-1"><strong>📞 Telefon:</strong> {res.user?.phone || 'Belirtilmemiş'}</p>
                <p className="mb-1"><strong>🏟 Halı Saha:</strong> {res.fieldName}</p>
                <p className="mb-1"><strong>📅 Tarih:</strong> {formatDate(res.date)}</p>
                <p className="mb-1"><strong>🕒 Saat:</strong> {res.timeSlot}</p>
                <p className="mb-2">
                  <strong>📌 Durum:</strong>{' '}
                  <span className={`badge ${res.status === 'approved' ? 'bg-success' : res.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {res.status}
                  </span>
                </p>

                <div className="d-flex flex-wrap gap-2">
                  {res.status === 'pending' && (
                    <>
                      <button className="btn btn-sm btn-outline-success" onClick={() => handleApprove(res._id)}>
                        ✅ Onayla
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleReject(res._id)}>
                        ❌ Reddet
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setReceiverId(res.user._id);
                      setReceiverModel('User');
                      setShowChatBox(true);
                    }}
                  >
                    💬 Mesaj Gönder
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showChatBox && (
        <ChatBox
          receiverId={receiverId}
          receiverModel={receiverModel}
          onClose={() => setShowChatBox(false)}
        />
      )}
    </div>
  );
};

export default BusinessProfile;
