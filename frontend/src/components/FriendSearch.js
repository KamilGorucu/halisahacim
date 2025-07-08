import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySelector from './CitySelector';
import FifaCard from './FifaCard';
import '../css/FriendSearch.css';

const API_URL = process.env.REACT_APP_API_URL;

const FriendSearch = () => {
  const [city, setCity] = useState('');
  const [searchName, setSearchName] = useState('');
  const [users, setUsers] = useState([]);
  const [searched, setSearched] = useState(false); //
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!city) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/search?city=${city}&name=${searchName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Arama başarısız:', data.message);
      }
    } catch (error) {
      console.error('Sunucu hatası:', error);
    } finally {
        setSearched(true); // 
    }
  };

  useEffect(() => {
    handleSearch();
  }, [city]);

  const normalize = (str) => {
    return str
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
      .replace(/â/g, 'a') // varsa destek için
      .replace(/î/g, 'i')
      .replace(/û/g, 'u');
  };

  const filteredUsers = users
    .filter((user) => user.fullName.toLowerCase() !== 'admin kullanıcı')
    .filter((user) => normalize(user.fullName).startsWith(normalize(searchName)));

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Arkadaş Ara</h2>

      {/* Şehir Seçici */}
      <div className="mb-4">
        <CitySelector selectedCity={city} setSelectedCity={setCity} />
      </div>

      {/* İsimle Arama */}
      <div className="mb-4 d-flex justify-content-center">
        <input
          type="text"
          placeholder="İsim girin"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="form-control w-50"
        />
      </div>

      {/* Sonuçlar */}
      <div className="row g-4">
        {searched && filteredUsers.length === 0 ? (
          <div className="col-12 text-center">
            <p className="text-muted">Aradığınız kriterlere uygun kullanıcı bulunamadı.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="col-md-2"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/user/${user._id}`)}
            >
              <div className="card justify-content-center align-items-center text-center shadow h-100">
                <div className="card-body">
                  <h5 className="card-title">{user.fullName}</h5>
                  <FifaCard
                    user={{
                      ...user,
                      imageUrl: user.photo
                        ? `${API_URL}/${user.photo.startsWith('uploads/') ? user.photo : 'uploads/' + user.photo}`
                        : undefined,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendSearch;
