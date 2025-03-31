import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { getAuth } from "firebase/auth";
import cloudinaryConfig from './cloudinaryConfig';
import 'react-toastify/dist/ReactToastify.css';
import '../css/ProfilePicture.css';
import axios from 'axios'; // Importez axios


function ProfilePicture() {
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [imageUrl,setImageUrl]=useState('')
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const auth = getAuth();
    const [email, setEmail] = useState('');
    const [adminEmail, setAdminEmail] = useState('');

  // Avatars prédéfinis (stockés dans le dossier public)
  const avatars = [
    '/avatar1.png',
    '/avatar2.png',
    '/avatar3.png',
    '/avatar4.png',
  ];

  // Récupérer l'URL de la photo de profil depuis l'API

  useEffect(() => {
    const fetchIntervenantData = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
      
        // Récupérer l'ID de l'utilisateur depuis le localStorage ou l'état d'authentification
        

        // Appel à l'API backend
        const response = await axios.get(`http://localhost:5000/intervenants/recupererun/${adminUID}`);
        
        // Mettre à jour l'état avec les données reçues
        setUsername(response.data.name); // Utilisez le champ approprié (name ou username)
        
      // ou une page d'erreur appropriée
        }
      
    
  };

    fetchIntervenantData();
  }, [auth.currentUser]);

  const fetchProfilePicture = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/users/getProfilePicture/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Les donness de l'image recus  à affiché est ",data)
      console.log("Le liens de l'image recus  à affiché est ",data.profilePicture)


      
      if (data.profilePicture) {
        setProfilePictureUrl(data.profilePicture);
      } else {
        setProfilePictureUrl(null);
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

  // Uploader l'image vers Cloudinary
  const uploadImageToCloudinary = async (imageFile) => {
    if (!imageFile) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', 'profile-pictures');
      formData.append('cloud_name', cloudinaryConfig.cloudName);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
  
      if (!response.ok) {
        throw new Error('Échec de l\'upload vers Cloudinary');
      }
  
      const data = await response.json();
      console.log("l'image recus est ",data)
      console.log("Le liens de l'image recus est ",data.secure_url)
      return data.secure_url;
      setImageUrl(data.secure_url)
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      throw error;
    }
  };

  // Mettre à jour la photo de profil dans la base de données
  const updateProfilePictureInDB = async (imageUrl) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }
      console.log("les donnes pour limage recus sont",imageUrl)

      const response = await fetch(`http://localhost:5000/users/updateProfilePicture/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      return data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      throw error;
    }
  };

  // Gestion principale de la mise à jour de la photo
  const updateProfilePicture = async (imageFileOrUrl) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);

      let newImageUrl = null;

      if (imageFileOrUrl instanceof File) {
        // Upload de la nouvelle image vers Cloudinary
        newImageUrl = await uploadImageToCloudinary(imageFileOrUrl);
      } else if (typeof imageFileOrUrl === 'string') {
        // URL directe (pour les avatars locaux)
        newImageUrl = imageFileOrUrl;
      }

      // Mise à jour dans la base de données
      await updateProfilePictureInDB(newImageUrl);

      // Mise à jour de l'état local
      setProfilePictureUrl(newImageUrl);
      setPreviewUrl(null);
      setSelectedImage(null);
      toast.success("Photo mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Gestion de la sélection d'image
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

    setSelectedImage(file);
    
    // Création d'une URL de prévisualisation
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // Réinitialiser la photo
  const handleResetPicture = async () => {
    try {
      setIsLoading(true);
      
      // Mettre à jour la base de données
      await updateProfilePictureInDB(null);
      
      // Mettre à jour l'état local
      setProfilePictureUrl(null);
      toast.success("Photo réinitialisée avec succès");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast.error(error.message || "Erreur lors de la réinitialisation");
    } finally {
      setIsLoading(false);
    }
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
        {isLoading && uploadProgress > 0 ? (
          <div className="upload-progress">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        ) : isLoading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : profilePictureUrl ? (
          <img
            src={profilePictureUrl}
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
            
            {profilePictureUrl && (
              <button
                onClick={handleResetPicture}
                className="remove-button"
                disabled={isLoading}
              >
                {isLoading ? 'En cours...' : 'Réinitialiser la photo'}
              </button>
            )}
          </div>

          {/* Prévisualisation */}
          {previewUrl && (
            <div className="preview-container">
              <h5>Prévisualisation</h5>
              <img
                src={previewUrl}
                alt="Prévisualisation"
                className="profile-picture-image"
              />
              <div className="preview-actions">
                <button
                  onClick={() => updateProfilePicture(selectedImage)}
                  className="confirm-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'En cours...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedImage(null);
                  }}
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