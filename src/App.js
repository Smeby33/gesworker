import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import Auth from "./components/pages/Auth";
import AdminPage from "./components/pages/AdminPage";
import IntervenantPage from "./components/pages/IntervenantPage";
import LoadingScreen from "./components/pages/LoadingScreen";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [message,setErrorMessage]= useState(false)

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:5000/users/getUser/${user.uid}`);
          const userData = response.data;
  
          if (userData && userData.is_admin !== undefined) {
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else {
            setErrorMessage("Votre compte n'est pas encore enregistré. Veuillez contacter un administrateur.");
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  


  // if (loading) return <LoadingScreen />;

  return (
    <Router>
      <AppRoutes isAuthenticated={isAuthenticated} currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </Router>
  );
};

const AppRoutes = ({ isAuthenticated, currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.is_admin) {
        navigate("/admin");
      } else {
        navigate("/intervenant");
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Auth onLoginSuccess={setCurrentUser} />} />
      <Route path="/admin" element={isAuthenticated && currentUser?.is_admin ? <AdminPage /> : <Navigate to="/" />} />
      <Route path="/intervenant" element={isAuthenticated && !currentUser?.is_admin ? <IntervenantPage /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default App;
