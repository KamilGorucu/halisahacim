import React from 'react';
import { useLocation } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;
const TournamentDetails = () => {
  const location = useLocation();
  const tournament = location.state?.tournament;

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tournaments/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tournamentId: tournament._id }),
      });

      if (response.ok) {
        alert('Turnuvaya başarıyla kayıt oldunuz!');
      } else {
        alert('Kayıt işlemi sırasında bir hata oluştu.');
      }
    } catch (error) {
      console.error('Kayıt işlemi başarısız:', error);
    }
  };

  if (!tournament) return <p>Turnuva bilgisi bulunamadı.</p>;

  return (
    <div>
      <h2>{tournament.name}</h2>
      <p>Tarih: {new Date(tournament.date).toLocaleDateString()}</p>
      <p>Şehir: {tournament.location.city}</p>
      <p>Katılım Ücreti: {tournament.fee}₺</p>
      <h3>Katılımcılar:</h3>
      <ul>
        {tournament.participants.map((participant) => (
          <li key={participant._id}>{participant.fullName}</li>
        ))}
      </ul>
      <button onClick={handleRegister}>Turnuvaya Kayıt Ol</button>
    </div>
  );
};

export default TournamentDetails;
