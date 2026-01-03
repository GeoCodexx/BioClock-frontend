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
import Fingerprint from "./pages/Fingerprints";
import Attendances from "./pages/Attendances";
import DailyReport from "./pages/DailyReport";
import GlobalSnackbar from "./components/GlobalSnackbar";
import GeneralReportPage from "./pages/GeneralReport";
import MyAttendances from "./pages/MyAttendances";
import { ThemeProvider } from "./contexts/ThemeContext";
import useAuthStore from "./store/useAuthStore";
import NoAccessPage from "./pages/NoAccessPage";

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PermissionRoute({ permission, children }) {
  const { permissions } = useAuthStore();
  console.log(permissions, permission);
  if (permission && !permissions.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthRoute>
                <MainLayout />
              </AuthRoute>
            }
          >
            <Route
              index
              element={
                <PermissionRoute permission="dashboard:read">
                  <Dashboard />
                </PermissionRoute>
              }
            />
            <Route
              path="users"
              element={
                <PermissionRoute permission="users:read">
                  <Users />
                </PermissionRoute>
              }
            />
            <Route
              path="fingerprints"
              element={
                <PermissionRoute permission="fingerprints:read">
                  <Fingerprint />
                </PermissionRoute>
              }
            />
            <Route
              path="users/roles"
              element={
                <PermissionRoute permission="roles:read">
                  <Roles />
                </PermissionRoute>
              }
            />
            <Route
              path="users/permissions"
              element={
                <PermissionRoute permission="permissions:read">
                  <Permissions />
                </PermissionRoute>
              }
            />
            <Route
              path="devices"
              element={
                <PermissionRoute permission="devices:read">
                  <Devices />
                </PermissionRoute>
              }
            />
            <Route
              path="departments"
              element={
                <PermissionRoute permission="departments:read">
                  <Departments />
                </PermissionRoute>
              }
            />
            <Route
              path="schedules"
              element={
                <PermissionRoute permission="schedules:read">
                  <Schedules />
                </PermissionRoute>
              }
            />
            <Route
              path="attendances"
              element={
                <PermissionRoute permission="attendances:read">
                  <Attendances />
                </PermissionRoute>
              }
            />
            <Route
              path="myattendance"
              element={
                <PermissionRoute permission="my-attendance:read">
                  <MyAttendances />
                </PermissionRoute>
              }
            />
            <Route
              path="reports/daily"
              element={
                <PermissionRoute permission="daily-report:read">
                  <DailyReport />
                </PermissionRoute>
              }
            />
            <Route
              path="reports/general"
              element={
                <PermissionRoute permission="general-report:read">
                  <GeneralReportPage />
                </PermissionRoute>
              }
            />
          </Route>
          <Route path="/403" element={<NoAccessPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <GlobalSnackbar />
    </ThemeProvider>
  );
}
