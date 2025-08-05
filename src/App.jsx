import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Users from './pages/Users';
import Roles from './pages/Roles';

function Home() {
  return <h2>Bienvenido al Dashboard</h2>;
}

function Departments() {
  return <h2>Gestión de Departamentos</h2>;
}

function Attendances() {
  return <h2>Gestión de Asistencias</h2>;
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="departments" element={<Departments />} />
          <Route path="attendances" element={<Attendances />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
