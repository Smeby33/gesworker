import React, { useState, useEffect } from "react";

const PresenceList = () => {
    const [presences, setPresences] = useState([]);
  
    useEffect(() => {
      const storedPresences = JSON.parse(localStorage.getItem("presences")) || [];
      setPresences(storedPresences);
    }, []);
  
    return (
      <div>
        <h2>Historique des présences</h2>
        {presences.length === 0 ? (
          <p>Aucune présence enregistrée.</p>
        ) : (
          <ul>
            {presences.map((presence, index) => (
              <li key={index}>
                Utilisateur : {presence.username}, Date : {presence.date}, Heure : {presence.time}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  

export default PresenceList;
