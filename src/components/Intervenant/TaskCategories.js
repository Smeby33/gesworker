import React, { useState, useEffect } from "react";
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


  const defaultCategories = [
    { name: "Saisie prestataires contractuels", icon: "FaFileInvoice" },
    { name: "Saisie caisse", icon: "FaCashRegister" },
    { name: "Saisie autre dépense", icon: "FaCalculator" },
    { name: "Rapprochement bancaire", icon: "FaBalanceScale" },
    { name: "Plan de trésorerie", icon: "FaChartLine" },
    { name: "Arrêté", icon: "FaFileInvoice" },
    { name: "Reporting", icon: "FaChartLine" },
    { name: "ID10", icon: "FaFileInvoice" },
    { name: "ID28", icon: "FaFileInvoice" },
    { name: "TPS", icon: "FaFileInvoice" },
    { name: "TVA", icon: "FaCalculator" },
    { name: "CSS", icon: "FaFileInvoice" },
    { name: "TSIL", icon: "FaFileInvoice" },
    { name: "CNSS", icon: "FaFileInvoice" },
    { name: "CNAMGS", icon: "FaFileInvoice" },
    { name: "DSF", icon: "FaFileInvoice" },
    { name: "DAS", icon: "FaFileInvoice" },
  ];

  const iconMapping = {
    FaFileInvoice: <FaFileInvoice />,
    FaCashRegister: <FaCashRegister />,
    FaBalanceScale: <FaBalanceScale />,
    FaChartLine: <FaChartLine />,
    FaCalculator: <FaCalculator />,
  };

  useEffect(() => {
    const storedCategories = JSON.parse(localStorage.getItem("taskCategories"));
    if (storedCategories && storedCategories.length > 0) {
      setCategories(storedCategories);
    } else {
      localStorage.setItem("taskCategories", JSON.stringify(defaultCategories));
      setCategories(defaultCategories);
    }
  }, []);

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        name: newCategoryName,
        icon: newCategoryIcon,
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem("taskCategories", JSON.stringify(updatedCategories));
      setNewCategoryName("");
    }
  };

  const deleteCategory = (categoryToDelete) => {
    const updatedCategories = categories.filter(
      (category) => category.name !== categoryToDelete.name
    );
    setCategories(updatedCategories);
    localStorage.setItem("taskCategories", JSON.stringify(updatedCategories));
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setEditedCategoryIcon(category.icon);
  };
  
  const saveCategory = () => {
    const updatedCategories = categories.map((category) =>
      category.name === editingCategory.name
        ? { ...category, name: editedCategoryName, icon: editedCategoryIcon }
        : category
    );
    setCategories(updatedCategories);
    localStorage.setItem("taskCategories", JSON.stringify(updatedCategories));
    setEditingCategory(null); // Quitte le mode d'édition
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
      {editingCategory?.name === category.name ? (
        // Formulaire d'édition
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
        // Affichage normal
        <>
          <span className="task-icon">{iconMapping[category.icon]}</span>
          <span className="task-name">{category.name}</span>
            <div className="catebtn">
              <button
                className="edit-btn"
                onClick={() => startEditing(category)}
              >
                Modifier
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteCategory(category)}
              >
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
