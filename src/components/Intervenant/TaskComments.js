import React, { useState, useEffect, useRef } from 'react';
import { FaPaperclip, FaTrash, FaEdit, FaReply, FaThumbtack, FaTimes,FaDownload ,FaCheck,FaPaperPlane} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/TaskComments.css';

const TaskComments = ({ taskId, currentUser }) => {
        console.log("Props reçues :", { taskId, currentUser }); // Ajoute ceci au début du composant

  const [comments, setComments] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const commentInputRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5000/comments';

  // Charger les commentaires depuis l'API
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/recupertoutcomment/${taskId}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      console.log("les tcommentaires",data)
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError(error.message);
      toast.error("Erreur lors du chargement des commentaires");
    } finally {
      setIsLoading(false);
    }
  };
  console.log("Current user:", currentUser);
console.log("First comment author:", comments[0]?.authorId);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  // Ajouter un commentaire
  const addComment = async (text, files = [], parentId = null) => {
    if (!text.trim()) return;
  
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('taskId', taskId);
      formData.append('authorId', currentUser.uid);
      formData.append('authorType', currentUser.type || 'intervenant');
      if (parentId) formData.append('parentId', parentId);
      
      // Ajouter chaque fichier au FormData
      files.forEach(file => {
        formData.append('attachments', file);
      });
  
      const response = await fetch(`${API_BASE_URL}/ajouteruncomment`, {
        method: 'POST',
        body: formData, // Pas besoin de Content-Type, le navigateur le fera automatiquement
      });
  
      if (!response.ok) throw new Error(await response.text());
  
      const newComment = await response.json();
      setComments([...comments, newComment]);
      setPreviewFiles([]);
      setFileInputKey(Date.now());
      setReplyToCommentId(null);
      toast.success("Commentaire ajouté avec succès");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError(error.message);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviewFiles(files);
  };

  // Modifier un commentaire
  const updateComment = async (commentId, newText) => {
    if (!newText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/updateuncomment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedComment = await response.json();
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingCommentId(null);
      toast.success("Commentaire modifié avec succès");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Erreur lors de la modification du commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un commentaire
  const deleteComment = async (commentId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/deleteuncomments/${commentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Commentaire supprimé avec succès");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erreur lors de la suppression du commentaire");
    } finally {
      setIsLoading(false);
    }
  };
  const downloadFile = async (fileId, fileName) => {
    try {
      setIsLoading(true);
      
      // Ouvrir le téléchargement dans un nouvel onglet
      window.open(`${API_BASE_URL}/attachments/${fileId}`, '_blank');
      
      toast.success(`Téléchargement de ${fileName} démarré`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(`Échec du téléchargement: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
 

  // Épingler/désépingler un commentaire
  const togglePinComment = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/epingle/${commentId}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedComment = await response.json();
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      toast.success(updatedComment.is_pinned ? 
        "Commentaire épinglé" : "Commentaire désépinglé");
    } catch (error) {
      console.error("Error pinning comment:", error);
      toast.error("Erreur lors de la modification du commentaire");
    }
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gestion de la soumission du formulaire
const handleSubmit = (e) => {
  e.preventDefault();
  const text = e.target.comment.value;
  
  if (editingCommentId) {
    updateComment(editingCommentId, text);
  } else {
    addComment(text, previewFiles, replyToCommentId);
  }
  
  e.target.reset();
  setPreviewFiles([]); // Réinitialise l'aperçu après envoi
  setFileInputKey(Date.now()); // Réinitialise l'input file
  setEditingCommentId(null);
  setReplyToCommentId(null);
};

  // Focus sur l'input quand on répond ou édite
  useEffect(() => {
    if (replyToCommentId || editingCommentId) {
      commentInputRef.current?.focus();
    }
  }, [replyToCommentId, editingCommentId]);

  return (
    <div className="whatsapp-comment-section" onDoubleClick={fetchComments}>
      <div className="comment-section-header">
        <h3 className="comment-section-title">
          <span className="comment-count-badge">{comments.length}</span>
          Commentaires
        </h3>
        <div className="comment-section-actions">
          {currentUser.isAdmin && (
            <button 
              className="refresh-btn"
              onClick={fetchComments}
              disabled={isLoading}
              title="Actualiser les commentaires"
            >
              ↻
            </button>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Chargement...</span>
        </div>
      )}
      
      {error && (
        <div className="error-alert">
          <FaTimes className="close-error" onClick={() => setError(null)} />
          {error}
        </div>
      )}

      <div className="whatsapp-comment-thread">
        {comments.length > 0 ? (
           comments
           .sort((a, b) => {
             const pinnedDiff = b.is_pinned - a.is_pinned;
             if (pinnedDiff !== 0) return pinnedDiff;
             return new Date(a.created_at) - new Date(b.created_at);
           })
           .map((comment) => (
              <div 
                key={comment.id} 
                className={`whatsapp-comment-container ${comment.author_id === currentUser.uid? 'current-user' : 'other-user'}`}
              >
                <div className="comment-avatar">
                  {comment.author_name?.charAt(0) || comment.authorId?.charAt(0) || 'A'}
                </div>
                
                <div className={`whatsapp-comment-card ${comment.is_pinned ? 'pinned-comment' : ''}`}>
                  {comment.is_pinned && (
                    <div className="pinned-indicator">
                      <FaThumbtack /> Épinglé
                    </div>
                  )}
                  
                  <div className="comment-header">
                    <div className="author-info">
                      <span className="author-name">{comment.author_name || comment.authorid}</span>
                      <span className="comment-date">
                        
                        {comment.updated_at !== comment.created_at && (
                          <span className="edited-badge">modifié</span>
                        )}
                      </span>

                    </div>
                    
                    <div className="comment-actions">
                      {comment.authorId === currentUser.id && (
                        <>
                          <button 
                            className="icon-btn edit-btn"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              commentInputRef.current.value = comment.text;
                            }}
                            disabled={isLoading}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="icon-btn delete-btn"
                            onClick={() => deleteComment(comment.id)}
                            disabled={isLoading}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                      <button 
                        className="icon-btn reply-btn"
                        onClick={() => {
                          setReplyToCommentId(comment.id);
                          setEditingCommentId(null);
                        }}
                        disabled={isLoading}
                        title="Répondre"
                      >
                        <FaReply />
                      </button>
                      {currentUser.isAdmin && (
                        <button 
                          className="icon-btn pin-btn"
                          onClick={() => togglePinComment(comment.id)}
                          disabled={isLoading}
                          title={comment.is_pinned ? 'Désépingler' : 'Épingler'}
                        >
                          <FaThumbtack />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="comment-content">
                    <p>{comment.text}</p>
                    
                    {comment.attachments?.length > 0 && (
                      <div className="attachments-grid">
                        {comment.attachments.map((file) => (
                          <a 
                            key={file.id}
                            href={`${API_BASE_URL}/attachments/${file.id}`}
                            className="attachment-item"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="attachment-icon">
                              <FaPaperclip />
                            </div>
                            <div className="attachment-info">
                              <span className="attachment-name">{file.file_name}</span>
                              <span className="attachment-type">{file.file_type}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(file.id, file.file_name);
                              }}
                              className="download-btn"
                            >
                              <FaDownload />
                            </button>
                          </a>
                        ))}
                      </div>
                    )}
                    {formatDate(comment.created_at)}
                  </div>
                  
                  {replyToCommentId === comment.id && (
                    <div className="replying-indicator">
                      <span>↳ Réponse à {comment.author_name || comment.authorId}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h4>Aucun commentaire pour cette tâche</h4>
              <p>Soyez le premier à commenter</p>
            </div>
          )
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="form-header">
          {(editingCommentId || replyToCommentId) && (
            <div className="form-context">
              {editingCommentId ? (
                <span>Modification du commentaire</span>
              ) : (
                <span>Réponse à {comments.find(c => c.id === replyToCommentId)?.author_name}</span>
              )}
              <button 
                type="button" 
                className="cancel-context-btn"
                onClick={() => {
                  setEditingCommentId(null);
                  setReplyToCommentId(null);
                  commentInputRef.current.value = '';
                }}
                disabled={isLoading}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        
        <div id="form-group">
          <input
            type="text"
            name="comment"
            ref={commentInputRef}
            placeholder={
              editingCommentId ? "Modifier votre commentaire..." :
              replyToCommentId ? "Votre réponse..." :
              "Écrire un commentaire..."
            }
            disabled={isLoading}
            className="comment-input"
          />
          
          <div className="form-actions">
            <label htmlFor={`attachments-${fileInputKey}`} className="file-upload-btn">
              <FaPaperclip />
              <input
                id={`attachments-${fileInputKey}`}
                key={fileInputKey}
                type="file"
                name="attachments"
                multiple
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {editingCommentId ? "Mettre à jour" : "Envoyer"}
            </button>
          </div>
        </div>
        
        {previewFiles.length > 0 && (
          <div className="file-previews">
            {previewFiles.map((file, index) => (
              <div key={index} className="file-preview">
                <FaPaperclip />
                <span>{file.name}</span>
                <button 
                  type="button"
                  onClick={() => {
                    const newFiles = [...previewFiles];
                    newFiles.splice(index, 1);
                    setPreviewFiles(newFiles);
                    if (newFiles.length === 0) {
                      setFileInputKey(Date.now());
                    }
                  }}
                  className="remove-file-btn"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskComments;