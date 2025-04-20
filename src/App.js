import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [minimumLoadingDone, setMinimumLoadingDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 1500); // Réduit à 1.5s pour une meilleure UX

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);
          
          // 1. Vérifier la table users
          try {
            const userResponse = await axios.get(`https://gesworkerback.onrender.com/users/getUser/${user.uid}`);
            if (userResponse.data) {
              setCurrentUser(userResponse.data);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (userError) {
            if (userError.response?.status !== 404) console.error("Erreur users:", userError);
          }
    
          // 2. Vérifier la table intervenants
          try {
            const intervenantResponse = await axios.get(`https://gesworkerback.onrender.com/intervenants/recupererun/${user.uid}`);
            if (intervenantResponse.data) {
              setCurrentUser({...intervenantResponse.data, is_admin: false});
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (intervenantError) {
            if (intervenantError.response?.status !== 404) {
              console.error("Erreur intervenants:", intervenantError);
            }
          }
          
          // Si aucun compte trouvé
          setErrorMessage("Compte non enregistré. Contactez un administrateur.");
          await signOut(auth);
        } catch (error) {
          console.error("Erreur vérification:", error);
          setErrorMessage("Erreur système. Réessayez plus tard.");
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

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setErrorMessage("");
    } catch (error) {
      console.error("Déconnexion échouée:", error);
      setErrorMessage("Erreur lors de la déconnexion");
    }
  };

  if (loading || !minimumLoadingDone) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <Auth 
                onLoginSuccess={handleLoginSuccess} 
                errorMessage={errorMessage}
              />
            ) : (
              <Navigate to={currentUser?.is_admin ? "/admin" : "/intervenant"} replace />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated && currentUser?.is_admin ? (
              <AdminPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/intervenant" 
          element={
            isAuthenticated && currentUser && !currentUser.is_admin ? (
              <IntervenantPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;