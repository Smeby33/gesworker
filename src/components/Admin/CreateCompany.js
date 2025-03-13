import React, { useState } from 'react';
import { auth } from "../pages/firebaseConfig";
import axios from 'axios';
import '../css/CreateCompany.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateCompany({ onCompanyCreated }) {
  const [companyName, setCompanyName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); // Pour gérer l'état du bouton

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (auth.currentUser) {
        const adminUID = auth.currentUser.uid;
  
        // Création de l'objet à envoyer
        const newCompany = {
          company_name: companyName,
          contact,
          email,
          address,
          description,
          proprietaire: adminUID,
        };
  
        // Envoi de la requête au serveur
        const response = await axios.post("http://localhost:5000/clients/ajout", newCompany);
  
        if (response.status === 201) {
          toast.success("Entreprise créée avec succès");
  
          // Réinitialisation des champs après succès
          setCompanyName('');
          setContact('');
          setEmail('');
          setAddress('');
          setDescription('');
  
          // Notifier le parent que l'entreprise a été créée
          onCompanyCreated();
        }
      } else {
        toast.error("Utilisateur non authentifié !");
      }
    } catch (error) {  // Assure-toi que cette accolade n'est pas mal indentée
      console.error("Erreur lors de l'ajout de l'entreprise :", error);
      toast.error("Une erreur est survenue lors de la création de l'entreprise");
    } finally {
      setLoading(false);
    }
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
        <button 
          type="submit" 
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          id='button-company'
          disabled={loading} // Désactive le bouton pendant le chargement
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}



export default CreateCompany;
