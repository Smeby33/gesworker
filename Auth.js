import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { motion } from 'framer-motion';
import axios from 'axios';
import '../css/Auth.css';

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "0832@gesWORker";
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.is_admin === 1) {
        navigate("/admin");
      } else {
        navigate("/intervenant");
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const validateFields = () => {
    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return false;
    }
    if (isSignup && password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return false;
    }
    if (isAdmin && adminPassword !== ADMIN_PASSWORD) {
      setErrorMessage("Mot de passe administrateur incorrect.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    if (!validateFields()) return;

    setLoading(true);

    try {
      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (error) {
      setErrorMessage(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const newUser = {
        id: user.uid,
        name: username,  // Changé de 'username' à 'name' pour correspondre au backend
        email: email,
        password: password, // Ajouté car le backend le vérifie pour les admins
        is_admin: isAdmin ? 1 : 0,
        company_name: isAdmin && companyName ? companyName : null,
        profile_picture: null // Ajouté car présent dans la requête SQL
      };
  
      console.log("Données envoyées au backend:", newUser); // Pour le débogage
  
      const response = await axios.post("https://gesworkerback.onrender.com/users/addUser", newUser);
  
      if (!response.ok) {
        const errorData = await response.json(); // Essayez de lire la réponse d'erreur
        console.error("Détails de l'erreur:", errorData);
        throw new Error(errorData.error || "Erreur lors de l'inscription.");
      }
  
      alert("Inscription réussie !");
      setIsAuthenticated(true);
      setCurrentUser(newUser);
      e.preventDefault()
    } catch (error) {
      console.error("Erreur complète:", error);
      setErrorMessage(error.message || "Une erreur est survenue.");
    }
  };

  const handleLogin = async () => {
    try {
      await auth.signOut();  // Déconnexion pour éviter les conflits
  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Vérifier si l'utilisateur est enregistré dans `users`
      const response = await fetch(`https://gesworkerback.onrender.com/users/getUser/${user.uid}`);
      const userData = response.ok ? await response.json() : null;
  
      // Si pas dans `users`, chercher dans `intervenants`
      if (!userData) {
        const intervenantResponse = await fetch(`https://gesworkerback.onrender.com/intervenants/recupererun/${user.uid}`);
        const intervenantData = intervenantResponse.ok ? await intervenantResponse.json() : null;
  
        if (intervenantData) {
          setIsAuthenticated(true);
          setCurrentUser(intervenantData);
          navigate("/intervenant");
          return;
        } else {
          setErrorMessage("Votre compte n'est pas encore enregistré. Veuillez contacter un administrateur.");
          return;
        }
      }
  
      setIsAuthenticated(true);
      setCurrentUser(userData);
  
      if (userData.is_admin !== 1) {  
        navigate("/intervenant");
      } else {
        onLoginSuccess(userData);
        navigate("/admin");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMessage(error.message || "Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div className="auth-container">
      {/* Partie Gauche - Branding */}
      <div className="auth-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="logo-wrapper">
          <img 
            src="/logo.png" 
            alt="RobiPona Logo" 
            className="logo-pulse"
          />
        </div>
        
        <div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1>ROPONA<span> & ROBIANDJA</span></h1>
          <p className="tagline">
          Voir loin,travailler mieux 
          </p>
        </div>

        <div 
          className="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="feature-item">
            <span className="icon">✓</span>
            <span>Gestion centralisée des tâches</span>
          </div>
          <div className="feature-item">
            <span className="icon">✓</span>
            <span>Suivi en temps réel</span>
          </div>
          <div className="feature-item">
            <span className="icon">✓</span>
            <span>Interface intuitive</span>
          </div>
        </div>
      </div>

      {/* Partie Droite - Formulaire */}
      <div 
        className="auth-form-container"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="form-header">
          <h2>{isSignup ? 'Créer un compte' : 'Connectez-vous'}</h2>
          <p>
            {isSignup 
              ? 'Rejoignez notre plateforme en 1 minute' 
              : 'Accédez à votre tableau de bord'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="input-group">
              <label>Nom d'utilisateur</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom complet"
                className="input-field"
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@votreentreprise.com"
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Créez un mot de passe" : "Entrez votre mot de passe"}
              className="input-field"
              required
            />
          </div>

          {isSignup && (
            <>
              <div className="input-group">
                <label>Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre mot de passe"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={isAdmin} 
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <span>Inscription en tant qu'admin</span>
                </label>
              </div>

              {isAdmin && (
                <div className="input-group">
                  <label>Mot de passe administrateur</label>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Mot de passe admin requis"
                    className="input-field"
                    required
                  />
                </div>
              )}

              {isAdmin && (
                <div className="input-group">
                  <label>Nom de l'entreprise</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nom de votre société"
                    className="input-field"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              isSignup ? "S'inscrire gratuitement" : "Se connecter"
            )}
          </button>

          {errorMessage && (
            <div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {errorMessage}
            </div>
          )}
        </form>

        <div className="auth-switch">
          <p>
            {isSignup 
              ? 'Déjà un compte ?' 
              : 'Nouveau sur RobiPona ?'}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="switch-btn"
            >
              {isSignup ? 'Connectez-vous' : 'Créer un compte'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
