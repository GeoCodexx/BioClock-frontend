import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import GlobalSnackbar from "./components/GlobalSnackbar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LogoProvider } from "./contexts/LogoContext";
import useAuthStore from "./store/useAuthStore";

// ─── Eager (pequeños, críticos, siempre necesarios) ──────────────────────────
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import NoAccessPage from "./pages/NoAccessPage";

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Users          = lazy(() => import("./pages/Users"));
const Roles          = lazy(() => import("./pages/Roles"));
const Permissions    = lazy(() => import("./pages/Permissions"));
const Devices        = lazy(() => import("./pages/Devices"));
const Schedules      = lazy(() => import("./pages/Schedules"));
const Departments    = lazy(() => import("./pages/Departments"));
const Fingerprint    = lazy(() => import("./pages/Fingerprints"));
const Attendances    = lazy(() => import("./pages/Attendances"));
const MyAttendances  = lazy(() => import("./pages/MyAttendances"));
const GeneralReport  = lazy(() => import("./pages/GeneralReport"));
const Justifications = lazy(() => import("./pages/Justifications"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProfilePage    = lazy(() => import("./pages/ProfilePage"));

// ─── Preload helpers (úsalos en el sidebar con onMouseEnter) ─────────────────
// Cada función dispara el import() sin esperar el resultado,
// lo que le dice al browser que descargue y parsee el chunk con anticipación.
export const preload = {
  dashboard:      () => import("./pages/Dashboard"),
  users:          () => import("./pages/Users"),
  roles:          () => import("./pages/Roles"),
  permissions:    () => import("./pages/Permissions"),
  devices:        () => import("./pages/Devices"),
  schedules:      () => import("./pages/Schedules"),
  departments:    () => import("./pages/Departments"),
  fingerprints:   () => import("./pages/Fingerprints"),
  attendances:    () => import("./pages/Attendances"),
  myAttendance:   () => import("./pages/MyAttendances"),
  generalReport:  () => import("./pages/GeneralReport"),
  justifications: () => import("./pages/Justifications"),
  notifications:  () => import("./pages/NotificationsPage"),
  profile:        () => import("./pages/ProfilePage"),
};

// ─── Fallback de carga ────────────────────────────────────────────────────────
// Reemplaza por tu propio Skeleton o Spinner si lo tienes.
function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <span>Cargando…</span>
    </div>
  );
}

// ─── Guards ───────────────────────────────────────────────────────────────────
function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PermissionRoute({ permission, children }) {
  const { permissions } = useAuthStore();
  if (permission && !permissions.includes(permission)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user } = useAuthStore();
  const dashboardRoles = ["Administrador", "Director", "RRHH"];
  return (
    <Navigate
      to={dashboardRoles.includes(user?.role) ? "/dashboard" : "/myattendance"}
      replace
    />
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <LogoProvider>
        <BrowserRouter>
          {/* Un único Suspense envuelve todas las rutas lazy */}
          <Suspense fallback={<PageLoader />}>
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
                <Route index element={<HomeRedirect />} />

                <Route path="dashboard" element={
                  <PermissionRoute permission="dashboard:read"><Dashboard /></PermissionRoute>
                } />
                <Route path="users" element={
                  <PermissionRoute permission="users:read"><Users /></PermissionRoute>
                } />
                <Route path="fingerprints" element={
                  <PermissionRoute permission="fingerprints:read"><Fingerprint /></PermissionRoute>
                } />
                <Route path="users/roles" element={
                  <PermissionRoute permission="roles:read"><Roles /></PermissionRoute>
                } />
                <Route path="users/permissions" element={
                  <PermissionRoute permission="permissions:read"><Permissions /></PermissionRoute>
                } />
                <Route path="devices" element={
                  <PermissionRoute permission="devices:read"><Devices /></PermissionRoute>
                } />
                <Route path="departments" element={
                  <PermissionRoute permission="departments:read"><Departments /></PermissionRoute>
                } />
                <Route path="schedules" element={
                  <PermissionRoute permission="schedules:read"><Schedules /></PermissionRoute>
                } />
                <Route path="attendances" element={
                  <PermissionRoute permission="attendances:read"><Attendances /></PermissionRoute>
                } />
                <Route path="myattendance" element={
                  <PermissionRoute permission="my-attendance:read"><MyAttendances /></PermissionRoute>
                } />
                <Route path="general-report" element={
                  <PermissionRoute permission="general-report:read"><GeneralReport /></PermissionRoute>
                } />
                <Route path="justifications" element={
                  <PermissionRoute permission="justifications:read"><Justifications /></PermissionRoute>
                } />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile"        element={<ProfilePage />} />
              </Route>

              <Route path="/403" element={<NoAccessPage />} />
              <Route path="*"    element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <GlobalSnackbar />
      </LogoProvider>
    </ThemeProvider>
  );
}