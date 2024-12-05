import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/ProfilePicture.css';

function ProfilePicture() {
  const currentUserKey = 'currentUser';
  const usersKey = 'users';
  const intervenantsKey = 'intervenants';

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewPicture, setPreviewPicture] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [username, setUsername] = useState(''); // Nouvel état pour le `username`

  // Avatars prédéfinis
  const avatars = [
    '/avatar1.png',
    '/avatar2.png',
    '/avatar3.png',
    '/avatar4.png',
  ];

  useEffect(() => {
    const loadUserProfile = () => {
      const storedUser = JSON.parse(localStorage.getItem(currentUserKey));
      if (storedUser?.username) {
        setUsername(storedUser.username); // Met à jour le nom d'utilisateur
        const isIntervenant = storedUser.type === 'intervenant';
        const tableKey = isIntervenant ? intervenantsKey : usersKey;

        // Récupérer la table correcte
        const table = JSON.parse(localStorage.getItem(tableKey)) || [];
        const currentUserData = table.find(
          (user) => user.username === storedUser.username
        );

        if (currentUserData?.profilePicture) {
          setProfilePicture(currentUserData.profilePicture);
        } else {
          setProfilePicture(null); // Initialisation à null si non trouvé
        }
      }
    };
    loadUserProfile();
  }, []);

  // Sauvegarder la photo de profil dans la table correspondante
  const saveProfilePicture = (picture) => {
    const storedUser = JSON.parse(localStorage.getItem(currentUserKey));
    const username = storedUser?.username;

    if (!username) {
      toast.error("Impossible de trouver l'utilisateur actuel.");
      return;
    }

    const isIntervenant = storedUser.type === 'intervenant';
    const tableKey = isIntervenant ? intervenantsKey : usersKey;

    const table = JSON.parse(localStorage.getItem(tableKey)) || [];

    // Mettre à jour la photo de profil
    const updatedTable = table.map((user) =>
      user.username === username ? { ...user, profilePicture: picture } : user
    );

    localStorage.setItem(tableKey, JSON.stringify(updatedTable));

    setProfilePicture(picture);
    setPreviewPicture(null);
    toast.success('Photo de profil mise à jour avec succès !');
  };

  // Gestion de l'upload d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La taille de l’image ne doit pas dépasser 2 Mo.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setPreviewPicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-picture-container">
      <ToastContainer />
      <h3> {username}</h3> {/* Affichage du username */}

      {/* Affichage de la photo actuelle */}
      <div
        className="profile-picture-display"
        onClick={() => setShowOptions(!showOptions)}
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Photo de profil"
            className="profile-picture-image"
          />
        ) : (
          <div className="placeholder">Aucune photo</div>
        )}
      </div>

      {/* Options d'édition */}
      {showOptions && (
        <div className="options-container">
          {/* Section des actions */}
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
                onClick={() => saveProfilePicture(null)}
                className="remove-button"
              >
                Réinitialiser la photo
              </button>
            )}
          </div>

          {/* Section de prévisualisation */}
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
                  onClick={() => saveProfilePicture(previewPicture)}
                  className="confirm-button"
                >
                  Confirmer
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

          {/* Section des avatars prédéfinis */}
          <div className="avatars-gallery">
            <h5>Choisir un avatar</h5>
            {avatars.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Avatar ${index + 1}`}
                className="avatar-option"
                onClick={() => saveProfilePicture(src)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePicture;
