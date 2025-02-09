import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    // location: { city: '', coordinates: [] },
    // workingHours: [],
    // equipment: '',
    // price: '',
    // fieldCount: 0, // Yeni eklenen saha sayısı
    fields: [],
  });
  const [reservations, setReservations] = useState([]); // Rezervasyonları tutar.
  const [weeklySlots, setWeeklySlots] = useState([]); // Haftalık görünüm için saat aralıkları
  const [weekOffset, setWeekOffset] = useState(0); // Geçmiş/gelecek haftalar için kaydırma
  // const [isActive, setIsActive] = useState(false); // İşletme aktif durumu
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5002/api/profile/business', {
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
      const response = await fetch(`http://localhost:5002/api/reservations/business-reservations?businessId=${localStorage.getItem('businessId')}`, {
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
        `http://localhost:5002/api/reservations/weekly?businessId=${businessId}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
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
      const response = await fetch('http://localhost:5002/api/reservations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId }),
      });
      if (response.ok) {
        alert('Rezervasyon onaylandı!');
        fetchReservations(); // Listeyi güncelle
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
      const response = await fetch('http://localhost:5002/api/reservations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId }),
      });
  
      if (response.ok) {
        alert('Rezervasyon reddedildi!');
        fetchReservations(); // Listeyi güncelle
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
      const response = await fetch('http://localhost:5002/api/business/update', {
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

  return (
    <div>
      <h2>İşletme Profilimi Güncelle</h2>
      <form onSubmit={handleSubmit}>
        {formData.fields.map((field, index) => (
          <div key={index}>
            <label>
              Saha Adı:
              <input
                type="text"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              />
            </label>
            <label>
              Kapasite:
              <input
                type="text"
                value={field.capacity}
                onChange={(e) => handleFieldChange(index, 'capacity', e.target.value)}
              />
            </label>
            <label>
              Fiyat:
              <input
                type="number"
                value={field.price}
                onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
              />
            </label>
            {field.workingHours.map((hour, hourIndex) => (
              <div key={hourIndex}>
                <label>
                  Başlangıç Saati:
                  <input
                    type="text"
                    value={hour.start || ''}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, hourIndex, 'start', e.target.value)
                    }
                  />
                </label>
                <label>
                  Bitiş Saati:
                  <input
                    type="text"
                    value={hour.end || ''}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, hourIndex, 'end', e.target.value)
                    }
                  />
                </label>
                <button type="button" onClick={() => removeWorkingHour(index, hourIndex)}>
                  Sil
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addWorkingHour(index)}>
              Ekle
            </button>
          </div>
        ))}
        <button type="submit">Güncelle</button>
      </form>

      <h2>Haftalık Rezervasyon Tabloları</h2>
        <div>
          <button onClick={() => handleWeekChange(-1)}>Önceki Hafta</button>
          <button onClick={() => handleWeekChange(1)}>Sonraki Hafta</button>
        </div>
        {weeklySlots.length > 0 ? (
          weeklySlots.map((field, fieldIndex) => (
            <div key={fieldIndex}>
              <h3>{field.fieldName} - Kapasite: {field.capacity}</h3>
              <table border="1" style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    {field.weeklyData[0]?.daySlots?.map((slot, index) => (
                      <th key={index}>{slot.timeSlot || "Saat Yok"}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {field.weeklyData.map((day, index) => (
                  <tr key={index}>
                    <td>{formatDate(day.date)}</td>
                    {day.daySlots?.map((slot, slotIndex) => (
                      <td
                        key={slotIndex}
                        style={{
                          backgroundColor:
                            slot.status === 'approved'
                              ? 'red' // Onaylananlar kırmızı
                              : slot.status === 'rejected'
                              ? 'white' // Reddedilenler beyaz
                              : slot.status === 'pending'
                              ? 'green' // Bekleyenler yeşil
                              : 'white', // Varsayılan beyaz
                        }}
                      >
                        {slot.status === 'approved' && slot.user ? (
                          <span>{slot.user.fullName}</span> // Kullanıcı adı
                        ) : slot.status === 'pending' ? (
                          'Bekliyor'
                        ) : (
                          'Boş'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>Henüz veri bulunmamaktadır.</p>
        )}
      <div>
        <h2>Rezervasyon İstekleri</h2>
        {reservations.length === 0 ? (
          <p>Henüz rezervasyon isteği yok.</p>
        ) : (
          <ul>
            {reservations.map((res) => (
              <li key={res._id}>
                <p>
                  <strong>Kullanıcı:</strong> {res.user.fullName} ({res.user.email})
                </p>
                <p>
                <strong>Halı Saha:</strong> {res.fieldName}
                </p>
                <p>
                  <strong>Tarih:</strong> {formatDate(res.date)}
                </p>
                <p>
                  <strong>Saat:</strong> {res.timeSlot}
                </p>
                <p>
                  <strong>Durum:</strong> {res.status}
                </p>
                {res.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(res._id)}>Onayla</button>
                    <button onClick={() => handleReject(res._id)}>Reddet</button>
                  </>
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
