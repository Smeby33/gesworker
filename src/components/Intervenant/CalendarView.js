import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('https://gesworkerback.onrender.com/tasks')
      .then(response => {
        const tasks = response.data.map(task => ({
          title: task.titre,
          start: new Date(task.date_debut),
          end: new Date(task.date_fin)
        }));
        setEvents(tasks);
      })
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  return (
    <div>
      <h3>Vue du Calendrier</h3>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: 500 }}
      />
    </div>
  );
}

export default CalendarView;
