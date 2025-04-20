import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import axios from 'axios';
import '../css/Auth.css';

function Auth({ onLoginSuccess, errorMessage: propErrorMessage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [localErrorMessage, setLocalErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "0832@gesWORker";

  const errorMessage = propErrorMessage || localErrorMessage;

  const validateFields = () => {
    if (!email || !password) {
      setLocalErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return false;
    }
    if (isSignup && password !== confirmPassword) {
      setLocalErrorMessage("Les mots de passe ne correspondent pas.");
      return false;
    }
    if (isAdmin && adminPassword !== ADMIN_PASSWORD) {
      setLocalErrorMessage("Mot de passe administrateur incorrect.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErrorMessage("");

    if (!validateFields()) return;

    setLoading(true);

    try {
      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setLocalErrorMessage(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name && !email) {
      throw new Error("Un nom d'utilisateur ou email est requis");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      id: user.uid,
      name: name || email.split('@')[0],
      email: email,
      password: password,
      is_admin: isAdmin ? 1 : 0,
      company_name: isAdmin ? companyName : null
    };

    const response = await axios.post("https://gesworkerback.onrender.com/users/addUser", userData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de l'inscription");
    }

    // Nettoyage du formulaire après succès
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsAdmin(false);
    setAdminPassword("");
    setCompanyName("");

    onLoginSuccess(userData);
  };

  const handleLogin = async () => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Vérifier d'abord dans la table users
    try {
      const userResponse = await axios.get(`https://gesworkerback.onrender.com/users/getUser/${user.uid}`);
      if (userResponse.data) {
        onLoginSuccess(userResponse.data);
        return;
      }
    } catch (userError) {
      if (userError.response?.status !== 404) throw userError;
    }

    // Si pas trouvé dans users, vérifier dans intervenants
    try {
      const intervenantResponse = await axios.get(`https://gesworkerback.onrender.com/intervenants/recupererun/${user.uid}`);
      if (intervenantResponse.data) {
        onLoginSuccess({ ...intervenantResponse.data, is_admin: false });
        return;
      }
    } catch (intervenantError) {
      if (intervenantError.response?.status !== 404) throw intervenantError;
    }

    throw new Error("Compte non enregistré. Contactez un administrateur.");
  };

  // ... (le reste du JSX reste inchangé)
  
  return (
    <div className="auth-container">
      {/* Partie Gauche - Branding */}
      <div className="auth-hero">
        <div className="logo-wrapper">
          <img 
            src="/logo.png" 
            alt="RobiPona Logo" 
            className="logo-pulse"
          />
        </div>
        
        <div>
          <h1>ROPONA<span> & RODIANDJA</span></h1>
          <p className="tagline">Voir loin, travailler mieux</p>
        </div>

        <div className="features">
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
      <div className="auth-form-container">
        <div className="form-header">
          <h2>{isSignup ? 'Créer un compte' : 'Connectez-vous'}</h2>
          <p>
            {isSignup 
              ? 'Rejoignez notre plateforme en 1 minute' 
              : 'Accédez à votre tableau de bord'}
          </p>
        </div>

        {isSignup && (
          <div className="input-group">
            <label>Nom d'utilisateur</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div className="error-message">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="auth-switch">
          <p>
            {isSignup 
              ? 'Déjà un compte ?' 
              : 'Nouveau sur RobiPona ?'}
            <button 
              onClick={() => {
                setIsSignup(!isSignup);
                setLocalErrorMessage("");
              }}
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