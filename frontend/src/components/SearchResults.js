import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];

  const handleSelect = (business) => {
    navigate('/available-slots', { state: { business } });
  };

  if (results.length === 0) {
    return <p>Sonuç bulunamadı.</p>;
  }

  return (
    <div>
      <h2>Arama Sonuçları</h2>
      <ul>
        {results.map((business) => (
          <li key={business._id}>
            <h3>{business.businessName}</h3>
            <p>Şehir: {business.location.city}</p>
            <p>Adres: {business.location.coordinates[1]}, {business.location.coordinates[0]}</p>
            <button onClick={() => handleSelect(business)}>Saatleri Gör</button>
          </li>
        ))}
      </ul>
      <LoadScript googleMapsApiKey="AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{
            lat: results[0].location.coordinates[1],
            lng: results[0].location.coordinates[0],
          }}
          zoom={12}
        >
          {results.map((business) => (
            <Marker
              key={business._id}
              position={{
                lat: business.location.coordinates[1],
                lng: business.location.coordinates[0],
              }}
              onClick={() => handleSelect(business)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default SearchResults;
