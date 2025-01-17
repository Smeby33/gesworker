import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Auth.css';

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const ADMIN_PASSWORD = '0832@gesWORker';

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/';

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const savedIntervenants = JSON.parse(localStorage.getItem('intervenants')) || [];
    localStorage.setItem('users', JSON.stringify(savedUsers));
    localStorage.setItem('intervenants', JSON.stringify(savedIntervenants));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const handleSignup = () => {
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (isAdmin) {
      if (adminPassword !== ADMIN_PASSWORD) {
        alert('Mot de passe administrateur incorrect');
        return;
      }
      if (!companyName) {
        alert("Le nom de l'entreprise est requis pour l'inscription en tant qu'admin");
        return;
      }
    }

    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const savedIntervenants = JSON.parse(localStorage.getItem('intervenants')) || [];
    const existingUser = savedUsers.find((user) => user.username === username);

    if (existingUser) {
      alert("Nom d'utilisateur déjà pris");
      return;
    }

    const newUser = { username, password, isAdmin, companyName };
    if (isAdmin) {
      savedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(savedUsers));
    } else {
      const newIntervenant = { username, password, isAdmin, name: username, id: `INT-${Date.now()}` };
      savedIntervenants.push(newIntervenant);
      localStorage.setItem('intervenants', JSON.stringify(savedIntervenants));
    }

    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    setIsSignup(false);
  };

  const handleLogin = () => {
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const savedIntervenant = JSON.parse(localStorage.getItem('intervenant')) || [];
  
    // Combine admins et intervenants
    const allUsers = [
      ...savedUsers.map((user) => ({ ...user, type: 'admin' })),
      ...savedIntervenant.map((intervenant) => ({
        username: intervenant.name,  // Utiliser 'name' comme username pour les intervenants
        password: intervenant.password,
        type: 'intervenant',
        ...intervenant,
      })),
    ];
  
    // Normalise le nom d'utilisateur saisi (en enlevant les espaces)
    const normalizedUsername = username.trim().toLowerCase();
  
    // Recherche utilisateur en utilisant 'username' et 'password'
    const user = allUsers.find(
      (user) => user.username.toLowerCase().trim() === normalizedUsername && user.password === password
    );
  
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLoginSuccess(user);
  
      // Redirige en fonction du type d'utilisateur
      if (user.type === 'admin') {
        navigate('/admin');
      } else if (user.type === 'intervenant') {
        navigate('/intervenant');
      }
    } else {
      alert("Nom d'utilisateur ou mot de passe incorrect");
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
          Gesworker est une application simple et intuitive conçue pour optimiser  la gestion et le suivi<br /> 
           des tâches en entreprise. Elle permet aux administrateurs de créer, assigner et suivre des tâches <br /> 
           variées (TVA, rapprochement bancaire, reporting, etc.), tout en offrant aux
            intervenants une <br /> interface dédiée pour mettre à jour les statuts, ajouter des 
            commentaires et collaborer <br /> efficacement.
          
           Grâce à son design épuré, ses notifications intelligentes et sa sécurité <br /> 
           renforcée, Gesworker centralise les informations et améliore la productivité. Une solution  <br />fiable pour coordonner vos équipes et simplifier vos processus internes.
          </p>
        </div>
      </div>
      <div className="auth2">
      <img src="/logo513.png" alt="" height={400} width={500}/>
        <div className="auth">
          <h1>{isSignup ? 'Inscription' : 'Connexion'}</h1>
          <form onSubmit={handleSubmit} className="form1">
            <div className="utilisateur">
              <label>Nom d'utilisateur:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="utilisateur">
              <label>Mot de passe:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isSignup && (
              <>
                <div className="utilisateur">
                  <label>Confirmer le mot de passe:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="utilisateur">
                  <label>
                    <input
                      type="checkbox"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                    />
                    Inscription en tant qu'admin
                  </label>
                </div>
                {isAdmin && (
                  <>
                    <div className="utilisateur">
                      <label>Mot de passe administrateur:</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="utilisateur">
                      <label>Nom de l'entreprise:</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}
            <button className="boutonauth1" type="submit">
              {isSignup ? 'S\'inscrire' : 'Se connecter'}
            </button>
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
