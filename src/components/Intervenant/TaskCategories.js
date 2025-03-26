import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFileInvoice,
  FaCashRegister,
  FaBalanceScale,
  FaChartLine,
  FaCalculator,
  FaTrashAlt,
  FaPlusCircle,
} from "react-icons/fa";
import "../css/TaskCategories.css";

function TaskCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("FaFileInvoice");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedCategoryIcon, setEditedCategoryIcon] = useState("");

  const iconMapping = {
    FaFileInvoice: <FaFileInvoice />,
    FaCashRegister: <FaCashRegister />,
    FaBalanceScale: <FaBalanceScale />,
    FaChartLine: <FaChartLine />,
    FaCalculator: <FaCalculator />,
  };

  // 📌 Récupérer les catégories depuis l'API
  useEffect(() => {
    axios
      .get("http://localhost:5000/categories/toutescategories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des catégories :", error);
      });
  }, []);

  // 📌 Ajouter une nouvelle catégorie
  const addCategory = () => {
    if (newCategoryName.trim()) {
      axios
        .post("http://localhost:5000/categories/ajouterunecategorie", {
          name: newCategoryName,
          icon: newCategoryIcon,
        })
        .then((response) => {
          setCategories([...categories, response.data]);
          setNewCategoryName("");
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout :", error);
        });
    }
  };

  // 📌 Supprimer une catégorie
  const deleteCategory = (categoryId) => {
    axios
      .delete(`http://localhost:5000/categories/suprimerunecategorie/${categoryId}`)
      .then(() => {
        setCategories(categories.filter((category) => category.id !== categoryId));
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression :", error);
      });
  };

  // 📌 Démarrer l'édition
  const startEditing = (category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setEditedCategoryIcon(category.icon);
  };

  // 📌 Sauvegarder la modification
  const saveCategory = () => {
    axios
      .put(`http://localhost:5000/categories/modifierunegategorie/${editingCategory.id}`, {
        name: editedCategoryName,
        icon: editedCategoryIcon,
      })
      .then(() => {
        setCategories(
          categories.map((category) =>
            category.id === editingCategory.id
              ? { ...category, name: editedCategoryName, icon: editedCategoryIcon }
              : category
          )
        );
        setEditingCategory(null);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour :", error);
      });
  };

  return (
    <div className="task-categories-container" id="Action">
      <h3>Nos Actions - Catégories de Tâches</h3>

      <div className="add-category">
        <input
          type="text"
          placeholder="Nom de la tâche"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="add-input"
        />
        <select
          value={newCategoryIcon}
          onChange={(e) => setNewCategoryIcon(e.target.value)}
          className="add-select"
        >
          {Object.keys(iconMapping).map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        <button onClick={addCategory} className="add-btn">
          <FaPlusCircle /> Ajouter
        </button>
      </div>

      <div className="task-columns">
        {[0, 1].map((column) => (
          <div key={column} className="task-column">
            {categories
              .filter((_, index) => index % 2 === column)
              .map((category, index) => (
                <div key={index} className="task-item">
                  {editingCategory?.id === category.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className="edit-input"
                      />
                      <select
                        value={editedCategoryIcon}
                        onChange={(e) => setEditedCategoryIcon(e.target.value)}
                        className="edit-select"
                      >
                        {Object.keys(iconMapping).map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                      <button onClick={saveCategory} className="save-btn">
                        Sauvegarder
                      </button>
                      <button onClick={() => setEditingCategory(null)} className="cancel-btn">
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="task-icon">{iconMapping[category.icon]}</span>
                      <span className="task-name">{category.name}</span>
                      <div className="catebtn">
                        <button className="edit-btn" onClick={() => startEditing(category)}>
                          Modifier
                        </button>
                        <button className="delete-btn" onClick={() => deleteCategory(category.id)}>
                          <FaTrashAlt />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskCategories;
