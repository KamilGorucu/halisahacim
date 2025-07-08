import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import axios from 'axios';
import '../css/CreateLineupOnField.css';
import FifaCard from './FifaCard';
import saha from '../image/saha2.png';

const POSITIONS = [
    { name: 'Kaleci', x: 10, y: 40 },
    { name: 'Bek', x: 37.5, y: 10 },
    { name: 'Stoper', x: 25, y: 25 },
    { name: 'Stoper', x: 25, y: 63 },
    { name: 'Bek', x: 37.5, y: 72 },
    { name: 'Orta Saha', x: 51, y: 30 },
    { name: 'Orta Saha', x: 51, y: 70 },
    { name: 'Ofansif Orta Saha', x: 65, y: 40 },
    { name: 'Kanat', x: 78, y: 10 },
    { name: 'Kanat', x: 78, y: 72 },
    { name: 'Forvet', x: 90, y: 40 }
];

const CreateLineupOnField = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchFriends();
  }, [user]);

  useEffect(() => {
    const field = document.querySelector('.field-wrapper');
    const updateScale = () => {
        if (!field) return;
        const scale = Math.min(field.offsetWidth / 1240, 1); // max 1, küçüldükçe küçülür
        document.documentElement.style.setProperty('--scale', scale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
}, []);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/friends/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const friendList = res.data.map((f) => {
        const u = f.otherUser;
        return {
          ...u,
          imageUrl: u.photo ? `${process.env.REACT_APP_API_URL}/${u.photo.replace(/^\/+/, '')}` : undefined,
        };
      });
      // ✅ Kendini de ekle
      const currentUserData = {
        ...user,
        fullName: user.fullName || 'Ben',
        imageUrl: user.photo ? `${process.env.REACT_APP_API_URL}/${user.photo.replace(/^\/+/, '')}` : undefined,
    };
    setFriends([currentUserData, ...friendList]);
    } catch (err) {
      console.error('Arkadaşlar getirilemedi:', err);
    }
  };

  const handleSelectPlayer = (slotIndex, playerId) => {
    if (!playerId) {
        // Seçimi kaldır
        setSelectedPlayers(prev => {
            const updated = { ...prev };
            delete updated[slotIndex];
            return updated;
        });
        return;
    }
    const selected = friends.find(f => f._id === playerId);
    const isAlreadySelected = Object.values(selectedPlayers).some(
        (p) => p._id === selected._id
    );
    if (isAlreadySelected) {
        alert('Bu oyuncu zaten başka bir pozisyonda seçilmiş!');
        return;
    }
    setSelectedPlayers(prev => ({
        ...prev,
        [slotIndex]: {
            ...selected,
            dynamicPosition: POSITIONS[slotIndex].name
        }
    }));
};

const handleRemove = (slotIndex) => {
    setSelectedPlayers(prev => {
        const updated = { ...prev };
        delete updated[slotIndex];
        return updated;
    });
};

const handleCreate = async () => {
    const lineupPlayers = Object.entries(selectedPlayers).map(([slotIndex, player]) => ({
        player: player._id,
        position: POSITIONS[slotIndex].name,
        x: POSITIONS[slotIndex].x,
        y: POSITIONS[slotIndex].y,
    }));

    if (!name.trim() || lineupPlayers.length < 5) {
        alert('En az 5 oyuncu seçin ve kadroya isim verin.');
        return;
    }

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/lineups`, {
            name,
            players: lineupPlayers,
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        alert('Kadro oluşturuldu.');
    } catch (err) {
        console.error(err);
        alert('Hata oluştu.');
    }
};

return (
    <div className="create-lineup-container">
        <input
            type="text"
            placeholder="Kadro İsmi"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
            <div className="lineup-note">
                💡 <strong>Not:</strong> Kadro oluşturmak için 11 oyuncu eklemeniz zorunlu değildir. En az 5 oyuncu yeterlidir.
            </div>
        <div className="field-wrapper">
            <img src={saha} alt="Saha" className="field-bg" />
            {POSITIONS.map((pos, index) => {
                const player = selectedPlayers[index];
                return (
                    <div
                        key={index}
                        className="position-slot"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                        {player ? (
                            <div>
                                <div className="remove-button" onClick={() => handleRemove(index)}>❌</div>
                                <FifaCard user={player} positionName={player.dynamicPosition} variant="lineup" />
                            </div>
                        ) : (
                            <select
                                defaultValue=""
                                onChange={(e) => handleSelectPlayer(index, e.target.value)}
                            >
                                <option value="">➕ {pos.name} Seç</option>
                                {friends.map((f) => (
                                    <option key={f._id} value={f._id}>{f.fullName}</option>
                                ))}
                            </select>
                        )}
                    </div>
                );
            })}
        </div>
        <button onClick={handleCreate}>✅ Kadroyu Oluştur</button>
    </div>
);
};

export default CreateLineupOnField;