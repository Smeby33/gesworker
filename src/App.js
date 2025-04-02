import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import Auth from "./components/pages/Auth";
import AdminPage from "./components/pages/AdminPage";
import IntervenantPage from "./components/pages/IntervenantPage";
import LoadingScreen from "./components/pages/LoadingScreen";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setErrorMessage] = useState("");
  const [minimumLoadingDone, setMinimumLoadingDone] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 3000); // 3 secondes

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);
          
          // 1. Check users table
          try {
            const userResponse = await axios.get(`https://gesworkerback.onrender.com/users/getUser/${user.uid}`);
            const userData = userResponse.data;
    
            if (userData && userData.is_admin !== undefined) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (userError) {
            if (userError.response?.status !== 404) throw userError;
          }
    
          // 2. Check intervenants table
          try {
            const intervenantResponse = await axios.get(`https://gesworkerback.onrender.com/intervenants/recupererun/${user.uid}`);
            const intervenantData = intervenantResponse.data;
    
            if (intervenantData) {
              setCurrentUser({...intervenantData, is_admin: false});
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (intervenantError) {
            if (intervenantError.response?.status === 404) {
              setErrorMessage("Votre compte n'est pas enregistré. Contactez un administrateur.");
            } else {
              throw intervenantError;
            }
          }
    
          setIsAuthenticated(false);
          setCurrentUser(null);
          
        } catch (error) {
          console.error("Erreur:", error);
          setErrorMessage("Erreur lors de la vérification du compte.");
          setIsAuthenticated(false);
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const Navbar = ({ onLogout }) => (
    <nav>
      <button onClick={onLogout}>Déconnexion</button>
    </nav>
  );

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };
  if (loading || !minimumLoadingDone) return <LoadingScreen />;

  return (
    <Router>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <AppRoutes 
        isAuthenticated={isAuthenticated} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
    </Router>
  );
};

const AppRoutes = ({ isAuthenticated, currentUser, onLogout }) => {
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
      <Route 
        path="/" 
        element={!isAuthenticated ? <Auth /> : <Navigate to={currentUser?.is_admin ? "/admin" : "/intervenant"} />} 
      />
      <Route 
        path="/admin" 
        element={isAuthenticated && currentUser?.is_admin ? 
          <AdminPage onLogout={onLogout} /> : 
          <Navigate to="/" />} 
      />
      <Route 
        path="/intervenant" 
        element={isAuthenticated && currentUser && !currentUser.is_admin ? 
          <IntervenantPage onLogout={onLogout} /> : 
          <Navigate to="/" />} 
      />
    </Routes>
  );
};

export default App;