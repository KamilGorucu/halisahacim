import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;
const ChallengeList = () => {
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('rakip-bul');
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch(`${API_URL}/challenges?type=${filter}`);
        const data = await response.json();
        if (response.ok) {
          setChallenges(data);
        } else {
          alert('İlanlar alınamadı.');
        }
      } catch (error) {
        console.error('İlanlar alınamadı:', error);
      }
    };

    fetchChallenges();
  }, [filter]);

  return (
    <div>
      <h2>İlanlar</h2>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="rakip-bul">Rakip Bul</option>
        <option value="eksik-oyuncu">Eksik Oyuncu</option>
      </select>
      <ul>
        {challenges.map((challenge) => (
          <li key={challenge._id}>
            <h3>{challenge.type === 'rakip-bul' ? 'Rakip Aranıyor' : 'Eksik Oyuncu Aranıyor'}</h3>
            <p>{challenge.details}</p>
            <p>İletişim: {challenge.contactInfo}</p>
            <p>Oluşturan: {challenge.creator.fullName}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeList;
