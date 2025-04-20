import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import axios from 'axios';
import '../css/Auth.css';

function Auth({ onLoginSuccess }) {
  const [name, setname] = useState("");
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

  const handleSignup = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
  
      // Validation obligatoire
      if (!name && !email) {
        throw new Error("Un nom d'utilisateur ou email est requis");
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userData = {
        id: user.uid,
        name:name, // Fallback si username vide
        email: email,
        password: password,
        is_admin: isAdmin ? 1 : 0,
        company_name: isAdmin ? companyName : null
      };
      console.log("les donnes envoyee sont", userData);
      const response = await axios.post("https://gesworkerback.onrender.com/users/addUser", userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Erreur lors de l'inscription");
      }
  
      setIsAuthenticated(true);
      setCurrentUser(userData);
      navigate(userData.is_admin ? "/admin" : "/intervenant");
  
    } catch (error) {
      console.error("Erreur inscription:", error);
      let errorMessage = "Erreur lors de l'inscription";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setErrorMessage(errorMessage);
      
      // Nettoyage
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error("Erreur suppression compte:", deleteError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Vérifier d'abord dans la table users
      try {
        const userResponse = await axios.get(`https://gesworkerback.onrender.com/users/getUser/${user.uid}`);
        if (userResponse.data) {
          setIsAuthenticated(true);
          setCurrentUser(userResponse.data);
          if (userResponse.data.is_admin === 1) {
            navigate("/admin");
          } else {
            navigate("/intervenant");
          }
          return;
        }
      } catch (userError) {
        if (userError.response?.status !== 404) throw userError;
      }
  
      // Si pas trouvé dans users, vérifier dans intervenants
      try {
        const intervenantResponse = await axios.get(`https://gesworkerback.onrender.com/intervenants/recupererun/${user.uid}`);
        if (intervenantResponse.data) {
          setIsAuthenticated(true);
          setCurrentUser({ ...intervenantResponse.data, is_admin: false });
          navigate("/intervenant");
          return;
        }
      } catch (intervenantError) {
        if (intervenantError.response?.status === 404) {
          setErrorMessage("Compte non enregistré. Contactez un administrateur.");
        } else {
          throw intervenantError;
        }
      }
  
      // Si aucun compte trouvé
      setErrorMessage("Identifiants incorrects ou compte non enregistré");
      await auth.signOut();
    } catch (error) {
      console.error("Erreur connexion:", error);
      let errorMessage = "Erreur de connexion";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives. Réessayez plus tard";
      }
      setErrorMessage(errorMessage);
      await auth.signOut();
    } finally {
      setLoading(false);
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
          <h1>ROPONA<span> & RODIANDJA</span></h1>
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

        {/* <form  className="auth-form"> */}
          {isSignup && (
            <div className="input-group">
              <label>Nom d'utilisateur</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setname(e.target.value)}
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
            // type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="submit-btn"
            disabled={loading}
            onClick={handleSubmit}
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
        {/* </form> */}

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
