import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  return (
    <div>
      <h3>Liste des Tâches</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.titre} - Statut: {task.statut}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
