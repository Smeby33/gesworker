import React, { useState } from 'react';
import '../css/CreateIntervenant.css'; // Assurez-vous que le chemin est correct
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateIntervenant() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ profilePicture, setProfilePicture]= useState('')
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const generatePassword = (name) => {
    return name.split(' ').join('').toLowerCase() + Math.floor(1000 + Math.random() * 9000);
  };

  const generateId = () => {
    return 'INT-' + Math.floor(100000 + Math.random() * 900000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newIntervenant = {
      id: generateId(),
      name,
      email,
      phone,
      role,
      profilePicture,
      password: generatePassword(name),
      timestamp: new Date().getTime(),
    };

    const existingIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    const updatedIntervenants = [...existingIntervenants, newIntervenant];
    localStorage.setItem('intervenant', JSON.stringify(updatedIntervenants));

    setName('');
    setProfilePicture('');
    setEmail('');
    setPhone('');
    setRole('');
    toast.success('Intervenant créé avec succès');
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10" id="form-intervenant">
      <h3 className="text-xl font-semibold mb-4">Créer un Intervenant</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nom</label>
          <input
            type="text"
            placeholder="Nom de l'intervenant"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Téléphone</label>
          <input
            type="text"
            placeholder="Numéro de téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Rôle</label>
          <input
            type="text"
            placeholder="Rôle de l'intervenant"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700" id='button-intervenant'>
          Créer
        </button>
      </form>
    </div>
  );
}

export default CreateIntervenant;
