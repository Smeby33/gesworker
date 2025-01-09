import React, { useState } from 'react';
import '../css/CreateCompany.css'; // Vérifiez que le chemin est correct
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateCompany({ onCompanyCreated }) {
  const [companyName, setCompanyName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Créer un nouvel objet entreprise
    const newCompany = {
      companyName,
      contact,
      email,
      address,
      description,
      timestamp: new Date().getTime(),
    };

    // Récupérer les entreprises existantes depuis le local storage
    const existingCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    // Ajouter la nouvelle entreprise
    const updatedCompanies = [...existingCompanies, newCompany];
    // Mettre à jour le local storage
    localStorage.setItem('clients', JSON.stringify(updatedCompanies));

    // Réinitialiser les champs du formulaire
    setCompanyName('');
    setContact('');
    setEmail('');
    setAddress('');
    setDescription('');

    toast.success('Entreprise créée avec succès');
    onCompanyCreated();
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10" id='form'>
      
      <h3 className="text-xl font-semibold mb-4" id='Form-company'>Créer une Entreprise</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nom de l'entreprise</label>
          <input
            type="text"
            placeholder="Nom de l'entreprise"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Contact</label>
          <input
            type="text"
            placeholder="Contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
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
          <label>Adresse</label>
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            placeholder="Description de l'entreprise"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700" id='button-company'>
          Créer
        </button>
      </form>
    </div>
  );
}

export default CreateCompany;
