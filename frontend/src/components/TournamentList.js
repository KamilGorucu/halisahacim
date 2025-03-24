import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;
const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${API_URL}/tournaments?city=${city}`);
        const data = await response.json();
        setTournaments(data);
      } catch (error) {
        console.error('Turnuvalar alınamadı:', error);
      }
    };

    fetchTournaments();
  }, [city]);

  const handleViewDetails = (tournament) => {
    navigate(`/tournament/${tournament._id}`, { state: { tournament } });
  };

  return (
    <div>
      <h2>Turnuvalar</h2>
      <input
        type="text"
        placeholder="Şehir Adı (Baş Harfi Büyük)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <ul>
        {tournaments.map((tournament) => (
          <li key={tournament._id}>
            <h3>{tournament.name}</h3>
            <p>Tarih: {new Date(tournament.date).toLocaleDateString()}</p>
            <p>Şehir: {tournament.location.city}</p>
            <p>Katılım Ücreti: {tournament.fee}₺</p>
            <p>Organizatör: {tournament.organizer.fullName}</p>
            <button onClick={() => handleViewDetails(tournament)}>Detayları Gör</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TournamentList;
