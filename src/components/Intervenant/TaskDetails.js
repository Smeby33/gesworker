import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/tasks/${id}`)
      .then(response => setTask(response.data))
      .catch(error => console.error('Error fetching task details:', error));
  }, [id]);

  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <h3>Détails de la Tâche</h3>
      <p>{task.titre}</p>
      <p>Date de début : {task.date_debut}</p>
      <p>Date de fin : {task.date_fin}</p>
      <p>Statut : {task.statut}</p>
    </div>
  );
}

export default TaskDetails;
