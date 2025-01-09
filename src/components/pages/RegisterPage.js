// src/components/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register-admin', {
        nom,
        email,
        password,
      });
      alert(response.data); // Affiche un message de succès
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <div>
      <h2>S'inscrire</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Nom:</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default RegisterPage;
