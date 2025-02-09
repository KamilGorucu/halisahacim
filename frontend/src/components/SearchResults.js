import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../css/SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleSelect = (business) => {
    navigate('/available-slots', { state: { business } });
  };

  const submitRating = async (businessId) => {
    try {
      await axios.post(
        `http://localhost:5002/api/business/${businessId}/ratings`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Yorum ve puan başarıyla eklendi!');
      setSelectedBusiness(null); // Formu kapat
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Yorum ve puan eklenemedi:', error);
      alert('Bir hata oluştu!');
    }
  };

  const renderStars = (averageRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= averageRating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };
  
  const toggleComments = (businessId) => {
    setShowComments((prev) => ({
      ...prev,
      [businessId]: !prev[businessId],
    }));
  };

  if (!results || results.length === 0) {
    return <p className="no-results">Sonuç bulunamadı.</p>;
  }

  return (
    <div className="search-results-container">
      <h2 className="search-results-title">Arama Sonuçları</h2>
      <ul className="business-list">
        {results.map((business) => (
          <li key={business._id} className="business-item">
            <div className="business-info">
              <h3 className="business-name">{business.businessName}</h3>
              <p className="business-city">📍 Şehir: {business.location.city}</p>
              {business.photos && business.photos.length > 0 && (
                <div className="business-photos">
                  {business.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5002/${photo}`}
                      alt={`${business.businessName} Fotoğrafı`}
                      className="business-photo"
                      onClick={() => setSelectedPhoto(`http://localhost:5002/${photo}`)}
                    />
                  ))}
                </div>
              )}
              <p className="business-fields-title">⚽ Sahalar ve Fiyatlar:</p>
              <ul className="business-fields-list">
                {business.fields.map((field, index) => (
                  <li key={index} className="business-field-item">
                    ⚡ {field.name} ({field.capacity}): {field.price} TL
                  </li>
                ))}
              </ul>
              <p className="business-equipment">
                <strong>🎒 Ekipmanlar:</strong> {business.equipment || 'Ekipman bilgisi bulunmuyor.'}
              </p>
              <p className="business-address">
                📌 Adres: {business.location.coordinates[1]}, {business.location.coordinates[0]}
                (Haritalara koordinatları kopyalayıp yol tarifi alabilirsiniz)
              </p>
              <p className="business-rating">
                ⭐ Ortalama Puan: {renderStars(business.averageRating || 0)}
              </p>
              <button className="view-slots-button" onClick={() => handleSelect(business)}>
                Saatleri Gör
              </button>
              <button
                className="add-comment-button"
                onClick={() => setSelectedBusiness(business)}
              >
                Yorum Yap
              </button>
              <button
                className="toggle-comments-button"
                onClick={() => toggleComments(business._id)}
              >
                {showComments[business._id] ? 'Yorumları Gizle' : 'Yorumları Göster'}
              </button>
              {showComments[business._id] && (
                <div className="business-comments">
                  <h4>Yorumlar</h4>
                  {business.ratings && business.ratings.length > 0 ? (
                    business.ratings.map((rating, index) => (
                      <li key={index} className="business-comment-item">
                        <p>
                          <strong>Kullanıcı:</strong> {rating.user?.fullName || 'Anonim'}
                        </p>
                        <p>
                          <strong>Puan:</strong> {renderStars(rating.rating)}
                        </p>
                        <p>
                          <strong>Yorum:</strong> {rating.comment || 'Yorum yapılmamış.'}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p>Henüz yorum yapılmamış.</p>
                  )}
                </div>
              )}
              {selectedBusiness && selectedBusiness._id === business._id && (
                <div className="add-rating-form">
                  <h4>Yorum ve Puan Ver</h4>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    placeholder="1-5 arası puan"
                    className="rating-input"
                  />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Yorumunuzu yazın"
                    className="comment-textarea"
                  />
                  <button
                    className="submit-rating-button"
                    onClick={() => submitRating(business._id)}
                  >
                    Gönder
                  </button>
                </div>
              )}
            </div>
            <div className="map-container">
              <LoadScript googleMapsApiKey="AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk">
                <GoogleMap
                  mapContainerStyle={{
                    width: '100%',
                    height: '100%',
                  }}
                  center={{
                    lat: business.location.coordinates[1],
                    lng: business.location.coordinates[0],
                  }}
                  zoom={14}
                >
                  <Marker
                    position={{
                      lat: business.location.coordinates[1],
                      lng: business.location.coordinates[0],
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
          </li>
        ))}
      </ul>

      {selectedPhoto && (
        <div className="photo-modal">
          <div className="photo-modal-content">
            <span className="close-modal" onClick={() => setSelectedPhoto(null)}>
              &times;
            </span>
            <img src={selectedPhoto} alt="Büyük Fotoğraf" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
