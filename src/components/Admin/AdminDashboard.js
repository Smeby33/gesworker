import React from 'react';
import TaskCreation from './TaskCreation';
import CreateCompany from './CreateCompany';
import CreateIntervenant from './CreateIntervenant';
import Dashboard from './Dashbord';
import TaskCategories from '../Intervenant/TaskCategories';
import '../css/AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className='AdminDashboard'>
      <div className="divh2">
        <h2>Admin Dashboard</h2>
        <Dashboard/>
      </div>
      <div className="AD-cintenu">
        <CreateCompany />
        <CreateIntervenant/>
        {/* <TaskManagement /> */}
      </div>
      <div className="AD-cintenu1">
        <TaskCreation/>
        <TaskCategories />
      </div>
     
    </div>
  );
}

export default AdminDashboard;
