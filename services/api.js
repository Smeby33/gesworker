import axios from 'axios';

// Configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 60000, // 10 secondes timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion centralisée des erreurs
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Gérer la déconnexion si token expiré
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          error.message = "Vous n'avez pas les permissions nécessaires";
          break;
        case 404:
          error.message = "Ressource non trouvée";
          break;
        case 500:
          error.message = "Erreur interne du serveur";
          break;
        default:
          error.message = error.response.data?.message || "Erreur inconnue";
      }
    } else if (error.request) {
      error.message = "Le serveur ne répond pas";
    } else {
      error.message = "Erreur de configuration de la requête";
    }
    
    console.error('Erreur API:', error.message);
    return Promise.reject(error);
  }
);

// Gestion des tâches
export const getTasks = () => api.get('/tasks');
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (task) => api.post('/tasks', task);
export const updateTask = (id, task) => api.put(`/tasks/${id}`, task);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Gestion des entreprises
export const getCompanies = () => api.get('/entreprises');
export const getCompany = (id) => api.get(`/entreprises/${id}`);
export const createCompany = (company) => api.post('/entreprises', company);
export const updateCompany = (id, company) => api.put(`/entreprises/${id}`, company);
export const deleteCompany = (id) => api.delete(`/entreprises/${id}`);

// Authentification
export const registerAdmin = (email, password) => 
  api.post('/api/auth/register-admin', { email, password });

export const login = (email, password) => 
  api.post('/api/auth/login', { email, password });

export const logout = () => {
  localStorage.removeItem('authToken');
  // Optionnel: faire une requête au serveur pour invalider le token
};

export const verifyToken = () => 
  api.get('/api/auth/verify-token');

// Fonction utilitaire pour gérer les erreurs dans les composants
export const handleApiError = (error, setError) => {
  const message = error.response?.data?.message || error.message;
  setError(message);
  console.error('Erreur API:', message);
};

export default api;
