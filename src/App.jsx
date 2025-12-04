import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Dashboard from "./pages/Dashboard";
import Permissions from "./pages/Permissions";
import Devices from "./pages/Devices";
import Schedules from "./pages/Schedules";
import Departments from "./pages/Departments";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./themes";
import Fingerprint from "./pages/Fingerprints";
import Attendances from "./pages/Attendances";
import DailyReport from "./pages/DailyReport";
//import UserHistoryReport from "./pages/UserHistoryReport";
import GlobalSnackbar from "./components/GlobalSnackbar";
import GeneralReportPage from "./pages/GeneralReport";
import MyAttendances from "./pages/MyAttendances";

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
            <Route path="permissions" element={<Permissions />} />
            <Route path="devices" element={<Devices />} />
            <Route path="departments" element={<Departments />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="attendances" element={<Attendances />} />
            <Route path="myattendances" element={<MyAttendances />} />
            <Route path="reports/daily" element={<DailyReport />} />
            <Route path="reports/general" element={<GeneralReportPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <GlobalSnackbar />
    </ThemeProvider>
  );
}
