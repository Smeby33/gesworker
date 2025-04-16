import React, { useState, useEffect } from 'react';
import TaskCreation from './TaskCreation';
import CreateCompany from './CreateCompany';
import CreateIntervenant from './CreateIntervenant';
import Dashboard from './Dashbord';
import PresenceChecker from './PresenceChecker';
import PresenceList from './PresenceList';
import '../css/AdminDashboard.css';

const BACKGROUND_IMAGES = [
  'https://static.nationalgeographic.fr/files/styles/image_3200/public/femelle-decharnee-forets-ng272.webp?w=760&h=507',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ7-v5Zw2NlWywN37QVAQV_NuRhP5VpbOTHQ&s',
  'https://i0.wp.com/gabonmailinfos.com/wp-content/uploads/2022/05/Gabonmailinfos_Panthere_Iboundji-1.jpg?resize=727%2C375&ssl=1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhyaLBAhTtkZedSh8nLYZX84ZOedJREYVf6A&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzZvukI1xuwzEamdIMVERANhK-OXZ-pIGSlg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKRurrC5anfa1UDBJqFoB4UVIjwvBMAEKrhQ&s',
  'https://www.miboue.com/wp-content/uploads/2024/09/image-239.png',
  'https://www.amazinggabon.com/wp-content/uploads/2017/10/vallee-du-gabon-560x420.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiV9XqfkYGtEpqooLsU0tbtnOY23rYInKo-weaZbI8T1ulAyEHrgwMsynZAuOlRNcSWAw&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxqESL2qWnZvPQrq5DkEFS3PwYtF8Cmku5sQ&s',
];
function AdminDashboard() {

    const handlePositionMatch = () => {
      console.log("Position correspondante !");
      alert("Votre présence a été marquée.");
    };
    const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
      const [backgroundStyle, setBackgroundStyle] = useState({
        backgroundImage: `url(${BACKGROUND_IMAGES[0]})`,
      });
      useEffect(() => {
        const intervalId = setInterval(() => {
          setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
        }, 5000); // Change toutes les 5 secondes
    
        return () => clearInterval(intervalId); // Nettoyer l'intervalle au démontage du composant
      }, []);
    
      useEffect(() => {
        // Appliquer la transition en douceur
        setBackgroundStyle({
          backgroundImage: `url(${BACKGROUND_IMAGES[currentBackgroundIndex]})`,
          transform: 'scale(1)', // Initial scale
          transition: 'background-image 0.5s ease-in-out, transform 0.5s ease-in-out', // Durée de la transition et type d'animation
          backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
        });
      }, [currentBackgroundIndex]);
  
  return (
    <div className='AdminDashboard' style={backgroundStyle}>
      <div className='AdminDashbo'>
      <div className="divh2">
        <h2>Admin Dashboard</h2>
        <Dashboard/>
      </div>
      <div className="AD-cintenu">
        {/* <TaskManagement /> */}
      </div>
      {/* <div className="AD-cintenu1">
      <h2 className="calendar-containerh3" >Calendrier des Tâches</h2>
        <PresenceChecker
        targetLatitude={-0.7268689} // Exemple de coordonnées cibles
        targetLongitude={8.7811752}
        onPositionMatched={handlePositionMatch}
        />
      </div>
      <PresenceList/>
      */}
    </div>
    </div>
  );
}

export default AdminDashboard;
