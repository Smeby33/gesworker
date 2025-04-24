import React, { useState, useEffect } from 'react';
import { signOut, deleteUser,getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import '../css/CreateIntervenant.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUserPlus,
  FaFileMedical,
  FaList,
  FaPlusCircle,
  FaTimes,
  FaTh
} from 'react-icons/fa';

function CreateIntervenant({ onIntervenantAdded, setShowAjoutinter }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const auth = getAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;

        try {
          const response = await fetch(`https://gesworkerback.onrender.com/users/getUser/${adminUID}`);
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || "Erreur récupération admin.");
          setAdminPassword(data.password);
        } catch (error) {
          console.error("Erreur récupération admin:", error);
          toast.error("Impossible de récupérer les infos de l'admin.");
        }
      }
    };

    fetchAdminData();
  }, [auth.currentUser]);

  const generatePassword = (name) => {
    return name.split(' ').join('').toLowerCase() + Math.floor(1000 + Math.random() * 9000);
  };

  const createIntervenantAPI = async (intervenant) => {
    try {
      const response = await fetch('https://gesworkerback.onrender.com/intervenants/ajouterun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intervenant),
      });

      if (response.ok) {
        toast.success('Intervenant ajouté avec succès dans la base de données');
        setName('');
        setProfilePicture('');
        setEmail('');
        setPhone('');
        setRole('');
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion à l'API:", error);
      toast.error("Erreur lors de la création de l'intervenant");
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!name || !email) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
  
    const password = generatePassword(name);
  
    try {
      if (!auth.currentUser) {
        toast.error("Aucun administrateur connecté");
        return;
      }
  
      const adminUID = auth.currentUser.uid;
  
      // 1. Création du compte Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user; // Renommé de 'user' à 'firebaseUser' pour plus de clarté
  
      // 2. Préparation des données pour la BD
      const newIntervenant = {
        id: firebaseUser.uid,
        name,
        email,
        phone,
        role,
        password,
        profilePicture,
        timestamp: new Date().getTime(),
        proprietaire: adminUID,
      };
  
      // 3. Enregistrement dans la base de données
      await createIntervenantAPI(newIntervenant);
  
      // 4. Actualisation du token (alternative à la reconnexion)
      await auth.currentUser.getIdToken(true);
  
      // 5. Feedback et callback
      toast.success("Intervenant créé avec succès !");
      if (onIntervenantAdded) {
        onIntervenantAdded(newIntervenant);
      }
  
      // Reset du formulaire
      setName('');
      setEmail('');
      setPhone('');
      setRole('');
      setProfilePicture('');
  
    } catch (error) {
      console.error("Erreur:", error);
      
      let errorMessage = "Erreur lors de la création";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = "Erreur de lien avec l'administrateur";
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage);
      
      // Suppression du compte Firebase si l'enregistrement BD a échoué
      if (error.userCredential) { // Vérifie si userCredential existe dans l'erreur
        try {
          await deleteUser(error.userCredential.user);
        } catch (deleteError) {
          console.error("Erreur suppression compte:", deleteError);
        }
      }
    }
  };

  const handleClose = () => {
    setShowAjoutinter(false); // Ferme le formulaire
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10" id="form-intervenant">
      <button className="close-button" onClick={handleClose}>
        <FaTimes />
      </button>
      <ToastContainer />
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
        <div>
          <label>Photo de profil (URL)</label>
          <input
            type="text"
            placeholder="Lien de la photo de profil"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700" id="button-intervenant">
          Créer
        </button>
      </form>
    </div>
  );
}

export default CreateIntervenant;
