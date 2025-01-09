import React from 'react';
import '../css/LoandingScreen.css'; // Assure-toi de créer ce fichier CSS pour le style

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <img src="/favicon.ico" alt="App Icon" className="app-icon" />
      <h3 className='animationh3'>Organisez et maximisez votre travail avec moi  </h3>
      <h1>Chargement...</h1>
    </div>
  );
};

export default LoadingScreen;
