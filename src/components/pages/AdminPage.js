import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import AdminDashboard from '../Admin/AdminDashboard';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../Intervenant/Navbar';
import RecentActivities from '../Admin/RecentActivities';
import { getAuth } from "firebase/auth";
import '../css/AdminPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// const BACKGROUND_IMAGES = [
//   'https://static.nationalgeographic.fr/files/styles/image_3200/public/femelle-decharnee-forets-ng272.webp?w=760&h=507',
//   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ7-v5Zw2NlWywN37QVAQV_NuRhP5VpbOTHQ&s',
//   'https://i0.wp.com/gabonmailinfos.com/wp-content/uploads/2022/05/Gabonmailinfos_Panthere_Iboundji-1.jpg?resize=727%2C375&ssl=1',
//   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhyaLBAhTtkZedSh8nLYZX84ZOedJREYVf6A&s',
//   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzZvukI1xuwzEamdIMVERANhK-OXZ-pIGSlg&s',
//   'URL_DE_L_IMAGE_6',
//   'URL_DE_L_IMAGE_7',
//   'URL_DE_L_IMAGE_8',
//   'URL_DE_L_IMAGE_9',
//   'URL_DE_L_IMAGE_10',
// ];
function AdminPage() {
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    company_name: '',
    profile_picture: ''
  });
  const [showRecentActivities, setShowRecentActivities] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  // const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  // const [backgroundStyle, setBackgroundStyle] = useState({
  //   backgroundImage: `url(${BACKGROUND_IMAGES[0]})`,
  // });


  useEffect(() => {
    const fetchAdminData = async () => {
      if (auth.currentUser) {
        try {
          const adminUID = auth.currentUser.uid;
          const response = await axios.get(`https://gesworkerback.onrender.com/users/getUser/${adminUID}`);
          
          if (response.data) {
            setAdminData({
              name: response.data.name || 'Administrateur',
              email: response.data.email,
              company_name: response.data.company_name || 'Votre entreprise',
              profile_picture: response.data.profile_picture
            });
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des données:", err);
          toast.error(err.response?.data?.error || "Erreur lors du chargement des données");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
  }, [auth.currentUser]);
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
  //   }, 5000); // Change toutes les 5 secondes

  //   return () => clearInterval(intervalId); // Nettoyer l'intervalle au démontage du composant
  // }, []);

  // useEffect(() => {
  //   // Appliquer la transition en douceur
  //   setBackgroundStyle({
  //     backgroundImage: `url(${BACKGROUND_IMAGES[currentBackgroundIndex]})`,
  //     transform: 'scale(1)', // Initial scale
  //     transition: 'background-image 0.5s ease-in-out, transform 0.5s ease-in-out', // Durée de la transition et type d'animation
  //     backgroundRepeat: 'no-repeat',
  //       backgroundSize: 'cover',
  //   });
  // }, [currentBackgroundIndex]);


  const toggleRecentActivities = () => {
    setShowRecentActivities(prev => !prev);
  };

  if (loading) {
    return (
      <div className="AdminPage">
        <div className="divnav">
          <Navbar />
        </div>
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    // style={backgroundStyle}
    <div className="AdminPage" >
      <div className="divnav">
        <Navbar profilePicture={adminData.profile_picture} />
      </div>
      <div className="AdminPagemain">
        <header className="admin-header">
        <h2 className='adtexthead'>Admin Dashboard</h2>
          <p className="company-name">{adminData.company_name}</p>
        </header>

        <AdminDashboard adminEmail={adminData.email} />
      </div>
    </div>
  );
}

export default AdminPage;