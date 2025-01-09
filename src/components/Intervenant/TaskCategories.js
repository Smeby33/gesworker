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

  const deleteCategory = (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    localStorage.setItem("taskCategories", JSON.stringify(updatedCategories));
  };

  return (
    <div className="task-categories-container" id="Action">
      <h3>Nos Actions - Catégories de Tâches</h3>

      <div className="task-columns">
        {[0, 1].map((column) => (
          <div key={column} className="task-column">
            {categories
              .filter((_, index) => index % 2 === column)
              .map((category, index) => (
                <div key={index} className="task-item">
                  <span className="task-icon">{iconMapping[category.icon]}</span>
                  <span className="task-name">{category.name}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteCategory(index)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>

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
    </div>
  );
}

export default TaskCategories;
