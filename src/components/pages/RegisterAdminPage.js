import React, { useState } from 'react';

function RegisterAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (adminCode === 'SPECIAL_CODE') { // Le code d'accès pour les admins
      fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert('Compte administrateur créé');
          } else {
            alert(data.message);
          }
        });
    } else {
      alert('Code d’accès incorrect');
    }
  };

  return (
    <div>
      <h2>Inscription Administrateur</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Code Admin" onChange={(e) => setAdminCode(e.target.value)} />
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">S'enregistrer</button>
      </form>
    </div>
  );
}

export default RegisterAdminPage;
