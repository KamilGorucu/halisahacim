import React from 'react';
import '../css/FifaCard.css'; // Stil dosyasını ayrıca oluşturacağız

const ratingWeights = {
    "Kaleci":     { speed: 0.1, shooting: 0.05, passing: 0.1, dribbling: 0.05, defense: 0.35, physical: 0.35 },
    "Stoper":     { speed: 0.1, shooting: 0.05, passing: 0.1, dribbling: 0.1,  defense: 0.4,  physical: 0.25 },
    "Bek":        { speed: 0.15, shooting: 0.05, passing: 0.15, dribbling: 0.1, defense: 0.3,  physical: 0.25 },
    "Orta Saha":  { speed: 0.15, shooting: 0.15, passing: 0.25, dribbling: 0.2, defense: 0.15, physical: 0.1 },
    "Ofansif Orta Saha": { speed: 0.2, shooting: 0.25, passing: 0.25, dribbling: 0.2, defense: 0.05, physical: 0.05 },
    "Kanat":      { speed: 0.3, shooting: 0.2, passing: 0.15, dribbling: 0.2, defense: 0.05, physical: 0.1 },
    "Forvet":     { speed: 0.25, shooting: 0.35, passing: 0.1, dribbling: 0.2, defense: 0.05, physical: 0.05 }
  };
  
  const calculateRating = (position, stats) => {
    const weights = ratingWeights[position] || {};
    let total = 0;
    for (const stat in weights) {
      total += (stats[stat] || 0) * weights[stat];
    }
    return Math.round(total);
  };
  
  const FifaCard = ({ user, positionName, variant = 'default' }) => {
    const {
      fullName,
      position,
      foot,
      fifaStats = {},
      imageUrl,
    } = user;
    const {
        speed = 50,
        shooting = 50,
        passing = 50,
        dribbling = 50,
        defense = 50,
        physical = 50
      } = fifaStats;
  
    const averageRating = calculateRating(positionName || position, {
      speed, shooting, passing, dribbling, defense, physical,
    });  

  return (
    <div className={`fifa-card ${variant === 'lineup' ? 'fifa-card-lineup' : 'fifa-card-default'}`}>
      <div className="fifa-header">
        <div className="fifa-rating">{averageRating}</div>
        <div className="fifa-position">{(positionName || position)?.toUpperCase() || 'POS'}</div>
      </div>
      <div className="fifa-photo">
        {imageUrl ? (
          <img src={imageUrl} alt="Oyuncu" />
        ) : (
          <div className="placeholder">📷</div>
        )}
      </div>
      <div className="fifa-name">{fullName?.toUpperCase()}</div>
      <div className="fifa-stats">
        <div><strong>SPD</strong> {speed}</div>
        <div><strong>SHT</strong> {shooting}</div>
        <div><strong>PAS</strong> {passing}</div>
        <div><strong>DRI</strong> {dribbling}</div>
        <div><strong>DEF</strong> {defense}</div>
        <div><strong>PHY</strong> {physical}</div>
        <div><strong>{foot} Ayak</strong></div>
      </div>
    </div>
  );
};

export default FifaCard;
