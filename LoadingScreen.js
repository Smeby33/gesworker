import React from 'react';
import '../css/LoandingScreen.css'; // Assure-toi de créer ce fichier CSS pour le style
import { color } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="logo-container">
        <img 
          src="/logo.png" // Utilisez votre logo principal (meilleur que favicon)
          alt="RobiPona Logo" 
          className="app-icon" 
        />
<h3 className='animationh3' style={{ color: "#f5a623" }}>Voir loin, travailler mieux</h3>      </div>
      <h3 className='animationh3'>Organisez, maximisez et gérez vos équipes</h3>
      <h1>Chargement</h1> {/* Les points seront ajoutés par CSS */}
    </div>
  );
};

export default LoadingScreen;



