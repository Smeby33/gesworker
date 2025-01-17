import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/ProfilePicture.css';

function ProfilePicture() {
  const currentUserKey = 'currentUser';
  const intervenantKey = 'intervenant';

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewPicture, setPreviewPicture] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [username, setUsername] = useState(''); // Nouvel état pour le `username`

  const avatars = [
    '/avatar1.png',
    '/avatar2.png',
    '/avatar3.png',
    '/avatar4.png',
  ];

  useEffect(() => {
    const loadUserProfile = () => {
      const storedUser = JSON.parse(localStorage.getItem(currentUserKey));
      const intervenants = JSON.parse(localStorage.getItem(intervenantKey)) || [];

      if (storedUser?.username) {
        setUsername(storedUser.username); // Récupérer et définir le `username`

        // Trouver l'objet correspondant dans `intervenant`
        const currentUserData = intervenants.find(
          (intervenant) => intervenant.name === storedUser.username
        );

        if (currentUserData?.profilePicture) {
          setProfilePicture(currentUserData.profilePicture);
        } else {
          const defaultPicture = null;
          updateUserProfilePicture(defaultPicture, storedUser, intervenants);
        }
      } else {
        console.error('Utilisateur actuel introuvable dans localStorage.');
      }
    };

    loadUserProfile();
  }, []);

  const updateUserProfilePicture = (picture, storedUser, intervenants) => {
    if (!storedUser?.username) {
      console.error("Le 'currentUser' est invalide :", storedUser);
      return;
    }

    // Mise à jour de `currentUser`
    const updatedUser = { ...storedUser, profilePicture: picture };
    localStorage.setItem(currentUserKey, JSON.stringify(updatedUser));
    console.log('Updated Current User:', updatedUser);

    // Mise à jour de l'objet dans `intervenants`
    const updatedIntervenants = intervenants.map((intervenant) =>
      intervenant.name === storedUser.username
        ? { ...intervenant, profilePicture: picture }
        : intervenant
    );
    localStorage.setItem(intervenantKey, JSON.stringify(updatedIntervenants));
    console.log('Updated Intervenants:', updatedIntervenants);

    setProfilePicture(picture);
  };

  const saveProfilePicture = (picture) => {
    const storedUser = JSON.parse(localStorage.getItem(currentUserKey));
    const intervenants = JSON.parse(localStorage.getItem(intervenantKey)) || [];

    if (!storedUser || !storedUser.username) {
      toast.error("Impossible de trouver l'utilisateur actuel.");
      return;
    }

    updateUserProfilePicture(picture, storedUser, intervenants);
    setPreviewPicture(null);
    toast.success('Photo de profil mise à jour avec succès !');
  };

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
      {/* Affichage du username */}
      <h3> {username || 'Utilisateur'} </h3>

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
                onClick={() => saveProfilePicture(null)}
                className="remove-button"
              >
                Réinitialiser la photo
              </button>
            )}
          </div>

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
