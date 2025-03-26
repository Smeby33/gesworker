import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
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

  // Ajout des états pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "0832@gesWORker";
  const navigate = useNavigate();

  useEffect(() => {
    // Attendre que le chargement soit terminé avant de naviguer
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const newUser = {
        id: user.uid,
        username,
        email,
        is_admin: isAdmin ? 1 : 0,
        company_name: isAdmin && companyName ? companyName : null,
      };
  
      const response = await fetch("http://localhost:5000/users/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription.");
      }
  
      alert("Inscription réussie !");
      setIsAuthenticated(true);
      setCurrentUser(newUser);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Une erreur est survenue.");
    }
  };

  const handleLogin = async () => {
    try {
      await auth.signOut();  // 🔴 Déconnexion pour éviter les conflits
  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Nouvelle connexion - Firebase UID:", user.uid);
  
      // 1️⃣ Vérifier si l'utilisateur est enregistré dans `users`
      const response = await fetch(`http://localhost:5000/users/getUser/${user.uid}`);
      const userData = response.ok ? await response.json() : null;
  
      // 2️⃣ Si pas dans `users`, chercher dans `intervenants`
      if (!userData) {
        console.warn("Utilisateur non trouvé, recherche en tant qu'intervenant...");
  
        const intervenantResponse = await fetch(`http://localhost:5000/intervenants/recupererun/${user.uid}`);
        const intervenantData = intervenantResponse.ok ? await intervenantResponse.json() : null;
  
        if (intervenantData) {
          console.log("Intervenant trouvé:", intervenantData);
          setIsAuthenticated(true);
          setCurrentUser(intervenantData);
          navigate("/intervenant");
          return;
        } else {
          setErrorMessage("Votre compte n'est pas encore enregistré. Veuillez contacter un administrateur.");
          return;
        }
      }
  
      // ✅ Mettre à jour les états avec les nouvelles infos utilisateur
      setIsAuthenticated(true);
      setCurrentUser(userData);
  
      // ✅ Rediriger tout utilisateur NON ADMIN vers la page intervenant
      if (userData.is_admin !== 1) {  
        console.warn("Utilisateur non admin, redirection vers intervenant...");
        console.log(userData)
        navigate("/intervenant");
      } else {
        console.log("Admin détecté, redirection vers admin...");
        onLoginSuccess(userData);
        console.log(userData)
        navigate("/admin");
      }
    } catch (error) {
      
      console.error("Erreur lors de la connexion du nouveau connecté:", error);
      setErrorMessage(error.message || "Une erreur est survenue lors de la connexion.");
    }
  };
  
  
  

  return (
    <div className="divauth">
      <div className="auth1">
        <div className="auth1part1">
          <h1>GESWOKER</h1>
          <h6 className='animationh3'>Organisez , maximisez et gérez votre équipe</h6>
        </div>
        <div className="auth1part2">
          <p className='animationh4'>
            Gesworker est une application simple et intuitive conçue pour optimiser la gestion et le suivi<br /> 
            des tâches en entreprise.
          </p>
        </div>
      </div>
      <div className="auth2">
        <img src="/logo513.png" alt="" height={400} width={500}/>
        <div className="auth">
          <h1>{isSignup ? 'Inscription' : 'Connexion'}</h1>
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div>
                <label>Nom d'utilisateur:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            )}
            <div>
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Mot de passe:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {isSignup && (
              <div>
                <label>Confirmer le mot de passe:</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            )}
            {isSignup && (
              <div>
                <label>
                  <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                  Inscription en tant qu'admin
                </label>
              </div>
            )}
            {isAdmin && isSignup && (
              <div>
                <label>Mot de passe administrateur:</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              </div>
            )}
            <button type="submit">{isSignup ? "S'inscrire" : "Se connecter"}</button>
          </form>
          <button className="boutonauth2" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Déjà inscrit ? Connectez-vous' : 'Pas encore de compte ? Inscrivez-vous'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
