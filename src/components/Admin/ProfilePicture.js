import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { getAuth } from "firebase/auth";
import 'react-toastify/dist/ReactToastify.css';
import '../css/ProfilePicture.css';

function ProfilePicture() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewPicture, setPreviewPicture] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  // Avatars prédéfinis
  const avatars = [
    '/avatar1.png',
    '/avatar2.png',
    '/avatar3.png',
    '/avatar4.png',
  ];

  // Fonction pour formater correctement l'image base64
  const formatBase64Image = (base64String) => {
    if (!base64String) return null;
    
    // Vérifie si le string contient déjà le préfixe
    if (base64String.startsWith('data:image')) {
      return base64String;
    }
    
    // Ajoute le préfixe pour les images JPEG (ajuster selon le type d'image)
    return `data:image/jpeg;base64,${base64String}`;
  };

  // Récupérer la photo de profil depuis l'API
  const fetchProfilePicture = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/users/getProfilePicture/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.profilePicture) {
        // Formate correctement l'image base64
        const formattedImage = formatBase64Image(data.profilePicture);
        setProfilePicture(formattedImage);
      } else {
        setProfilePicture(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la photo:", error);
      toast.error("Erreur lors du chargement de la photo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));

    if (storedUser?.username) {
      setUsername(storedUser.username);
    }

    if (user?.uid) {
      fetchProfilePicture(user.uid);
    }
  }, [auth.currentUser]);

  // Mettre à jour la photo de profil via l'API
  const updateProfilePicture = async (picture) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Utilisateur non authentifié");
        return;
      }

      setIsLoading(true);
      
      // Envoie seulement la partie base64 sans le préfixe
      const base64Data = picture?.replace(/^data:image\/\w+;base64,/, '');
      
      const response = await fetch(`http://localhost:5000/users/updateProfilePicture/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: base64Data }),
      });

      const data = await response.json();
      console.log("la photo est envoye normalement",data)

      if (response.ok) {
        setProfilePicture(picture);
        setPreviewPicture(null);
        toast.success(data.message || "Photo mise à jour avec succès");
      } else {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'upload d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreviewPicture(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-picture-container">
    <ToastContainer />
    <h3>{username || "Utilisateur"}</h3>

    {/* Affichage de la photo actuelle */}
    <div
      className="profile-picture-display"
      onClick={() => setShowOptions(!showOptions)}
    >
      {isLoading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : profilePicture ? (
        <img
          src={profilePicture}
          alt="Photo de profil"
          className="profile-picture-image"
          onError={(e) => {
            console.error("Erreur de chargement de l'image");
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div className="placeholder">Aucune photo</div>
      )}
    </div>

      {/* Options d'édition */}
      {showOptions && (
        <div className="options-container">
          <div className="profile-picture-actions">
            <label htmlFor="file-upload" className="upload-button">
              Téléverser une photo
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
            
            {profilePicture && (
              <button
                onClick={() => updateProfilePicture(null)}
                className="remove-button"
                disabled={isLoading}
              >
                {isLoading ? 'En cours...' : 'Réinitialiser la photo'}
              </button>
            )}
          </div>

          {/* Prévisualisation */}
          {previewPicture && (
            <div className="preview-container">
              <h5>Prévisualisation</h5>
              <img
                src={previewPicture}
                alt="Prévisualisation"
                className="profile-picture-image"
              />
              <div className="preview-actions">
                <button
                  onClick={() => updateProfilePicture(previewPicture)}
                  className="confirm-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'En cours...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setPreviewPicture(null)}
                  className="cancel-button"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Avatars prédéfinis */}
          <div className="avatars-gallery">
            <h5>Choisir un avatar</h5>
            <div className="avatars-grid">
              {avatars.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Avatar ${index + 1}`}
                  className="avatar-option"
                  onClick={() => updateProfilePicture(src)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePicture;
//recuperer la photo de profil 
