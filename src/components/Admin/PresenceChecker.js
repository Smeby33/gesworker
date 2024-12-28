import React, { useState, useEffect } from "react";
import "../css/PresenceChecker.css";

const PresenceChecker = ({ targetLatitude, targetLongitude, onPositionMatched }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Récupère l'objet currentUser du localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.username) {
      setUsername(currentUser.username);
    } else {
      console.error("Nom d'utilisateur non trouvé dans le currentUser du localStorage.");
    }

    getCurrentPosition();
  }, []);

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ latitude, longitude });

          const distance = calculateDistance(latitude, longitude, targetLatitude, targetLongitude);
          setIsWithinRange(distance <= 10);

          // Vérifie si on est dans la zone et appelle la fonction
          if (distance <= 10 && onPositionMatched) {
            onPositionMatched();
          }
        },
        (err) => {
          setError("Impossible de récupérer la position géographique.");
          console.error(err);
        }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  };

  const markPresence = () => {
    if (!username) {
      alert("Nom d'utilisateur non trouvé. Impossible de marquer la présence.");
      return;
    }

    const now = new Date();
    const presenceData = {
      username: username,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };

    // Récupère les données existantes
    const existingData = JSON.parse(localStorage.getItem("presences")) || [];

    // Ajoute la nouvelle entrée
    existingData.push(presenceData);

    // Sauvegarde dans le localStorage
    localStorage.setItem("presences", JSON.stringify(existingData));

    alert(`Présence de ${presenceData.username} marquée à ${presenceData.time} le ${presenceData.date} !`);
  };

  return (
    <div className="presence-checker">
      <h1>Pointer votre présence</h1>
      {error && <p className="error">{error}</p>}
      {currentPosition && (
        <p>
          Position actuelle : Latitude {currentPosition.latitude}, Longitude {currentPosition.longitude}
        </p>
      )}
      {isWithinRange ? (
        <button onClick={markPresence}>Pointer la présence</button>
      ) : (
        <p className="error">Vous n'êtes pas dans la zone définie.</p>
      )}
    </div>
  );
};

export default PresenceChecker;
