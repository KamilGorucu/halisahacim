import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../css/SearchResults.css';

const API_URL = process.env.REACT_APP_API_URL;

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (business) => {
    navigate('/available-slots', { state: { business } });
  };

  const submitRating = async (businessId) => {
    try {
      await axios.post(
        `${API_URL}/api/business/${businessId}/ratings`,
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

  const filteredResults = results.filter((business) => {
    const normalize = (str) =>
      str
        .toLocaleLowerCase('tr')
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'i')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'g')
        .replace(/â/g, 'a')
        .replace(/î/g, 'i')
        .replace(/û/g, 'u');
  
    return normalize(business.businessName).includes(normalize(searchQuery));
  });

  if (!results || results.length === 0) {
    return <p className="no-results">Sonuç bulunamadı.</p>;
  }

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Arama Sonuçları</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control rounded-pill"
          placeholder="İşletme adına göre ara"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="row g-4">
        {filteredResults.map((business) => (
          <div key={business._id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-success">{business.businessName}</h5>
                <p className="card-text"><strong>📍 Şehir:</strong> {business.location.city}</p>

                {business.photos?.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {business.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={`${API_URL}/${photo}`}
                        alt={`${business.businessName} Fotoğrafı`}
                        className="img-thumbnail"
                        style={{ maxWidth: '100px', cursor: 'pointer' }}
                        onClick={() => setSelectedPhoto(`${API_URL}/${photo}`)}
                      />
                    ))}
                  </div>
                )}

                <p className="mb-1"><strong>⚽ Sahalar:</strong></p>
                <ul className="list-unstyled">
                  {business.fields.map((field, i) => (
                    <li key={i}>• {field.name} ({field.capacity}) - {field.price} TL</li>
                  ))}
                </ul>

                <p><strong>🎒 Ekipmanlar:</strong> {business.equipment || 'Ekipman bilgisi bulunmuyor.'}</p>

                <p>
                  📌 <a href={`https://www.google.com/maps?q=${business.location.coordinates[1]},${business.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer">
                    Konuma Git
                  </a>
                </p>

                <p>⭐ Ortalama Puan: {renderStars(business.averageRating || 0)}</p>

                <div className="d-grid gap-2">
                  <button className="btn btn-success" onClick={() => handleSelect(business)}>
                    Saatleri Gör
                  </button>
                  <button className="btn btn-primary" onClick={() => setSelectedBusiness(business)}>
                    Yorum Yap
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => toggleComments(business._id)}
                  >
                    {showComments[business._id] ? 'Yorumları Gizle' : 'Yorumları Göster'}
                  </button>
                </div>

                {showComments[business._id] && (
                  <div className="mt-3">
                    <h6>Yorumlar</h6>
                    {business.ratings?.length > 0 ? (
                      business.ratings.map((rating, i) => (
                        <div key={i} className="border p-2 mb-2 rounded">
                          <p><strong>Kullanıcı:</strong> {rating.user?.fullName || 'Anonim'}</p>
                          <p><strong>Puan:</strong> {renderStars(rating.rating)}</p>
                          <p><strong>Yorum:</strong> {rating.comment || 'Yorum yapılmamış.'}</p>
                        </div>
                      ))
                    ) : (
                      <p>Henüz yorum yapılmamış.</p>
                    )}
                  </div>
                )}

                {selectedBusiness?._id === business._id && (
                  <div className="mt-3">
                    <h6>Yorum ve Puan Ver</h6>
                    <div className="mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} fs-4 me-1`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setRating(star)}
                        ></i>
                      ))}
                    </div>
                    <textarea
                      className="form-control mb-2"
                      placeholder="Yorumunuzu yazın"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      className="btn btn-success w-100"
                      onClick={() => submitRating(business._id)}
                    >
                      Gönder
                    </button>
                  </div>
                )}
              </div>

              {/* Harita */}
              <div className="card-footer p-0">
                <div style={{ height: '200px' }}>
                  <LoadScript googleMapsApiKey="AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fotoğraf Modal */}
      {selectedPhoto && (
        <div className="modal show d-block bg-dark bg-opacity-75" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-body p-0">
                <img src={selectedPhoto} alt="Büyük Fotoğraf" className="img-fluid rounded" />
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-danger" onClick={() => setSelectedPhoto(null)}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
