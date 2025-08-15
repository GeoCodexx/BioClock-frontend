import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Dashboard from "./pages/Dashboard";
import Permissions from "./pages/Permissions";
import Schedules from "./pages/Schedules";
import Departments from "./pages/Departments";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./themes";
import Fingerprint from "./pages/Fingerprints";


function Attendances() {
  return <h2>Gestión de Asistencias</h2>;
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="fingerprints" element={<Fingerprint />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permisos" element={<Permissions />} />
            <Route path="departments" element={<Departments />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="attendances" element={<Attendances />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
