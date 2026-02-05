import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute";
import PublicOnlyRoute from "./router/PublicOnlyRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { Toaster } from 'react-hot-toast';
import AccessDeniedDialog from './components/common/AccessDeniedDialog';
import { setAccessDeniedHandler } from './lib/api';

// Layouts
import AppLayout from "./layout/AppLayout";
import QuotesLayout from "./pages/Quotes/Layout/QuotesLayouts";
import ShoppingLayout from "./pages/Shopping/layout/ShoppingLayouts";

// Auth pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

// App pages
import Home from "./pages/Dashboard/Home";
import MyQuotes from "./pages/Quotes/MyQuotes";
import Quotes from "./pages/Quotes/Quotes";
import QuotesNew from "./pages/Quotes/New";
import QuotesFollowUps from "./pages/Quotes/FollowUps";
import QuotesHistory from "./pages/Quotes/History";
import QuotesAssignment from "./pages/Quotes/Assignment";
import Shopping from "./pages/Shopping/Shopping";
import ShoppingAssignment from "./pages/Shopping/Assignment";
import ShoppingFollowUps from "./pages/Shopping/FollowUps";
import ShoppingHistory from "./pages/Shopping/History";
import ShoppingNew from "./pages/Shopping/New";
import Profiles from "./pages/users/Profiles";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Dashboard from "./pages/Home/Dashboard";
import { NotificationProvider } from "./pages/Notifications/context/NotificationContext";
import NotificationContainer from "./pages/Notifications/components/notifications/NotificationContainer";
import NotificationPanel from "./pages/Notifications/components/notifications/NotificationPanel";
import Projects from "./pages/projects/Projects";
import NewProject from "./pages/projects/NewProject";
import { useState, useEffect } from "react";

const SHOPPING_MANAGER_ROLES = ["ADMIN", "SUPERVISOR"];
const QUOTES_SUPERVISOR_ROLES = ["SUPERVISOR", "ADMIN"];
const STAFF_ROLES = ["ADMIN", "SUPERVISOR"]; // NUEVO - Todos menos USUARIO;

export default function App() {
  const [accessDenied, setAccessDenied] = useState({ open: false, message: '' });

  useEffect(() => {
    setAccessDeniedHandler((message) => {
      setAccessDenied({ open: true, message });
    });
  }, []);
  return (
    <NotificationProvider>
      <>
        {/* ========================================
            🔔 TOASTER - Notificaciones globales
            ======================================== */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Opciones por defecto para todos los toasts
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },

            // Estilos específicos por tipo
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },

            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },

            loading: {
              style: {
                background: '#3b82f6',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#3b82f6',
              },
            },
          }}
        />

        <ScrollToTop />

        <Routes>
          {/* públicas solo */}
          <Route path="/signin" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />

          {/* protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<AppLayout />}>
              {/* Dashboard - Solo STAFF */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* QUOTES */}
              <Route path="/quotes" element={<QuotesLayout />}>
                {/* Resumen - Solo STAFF */}
                <Route
                  index
                  element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                      <Quotes />
                    </ProtectedRoute>
                  }
                />
                {/* New - TODOS pueden acceder */}
                <Route path="new" element={<QuotesNew />} />
                {/* My Quotes - TODOS pueden acceder */}
                <Route path="my-quotes" element={<MyQuotes />} />
                {/* Follow-ups - Solo STAFF */}
                <Route
                  path="follow-ups"
                  element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                      <QuotesFollowUps />
                    </ProtectedRoute>
                  }
                />
                {/* History - TODOS pueden acceder */}
                <Route path="history" element={<QuotesHistory />} />
                {/* Assignment - Solo SUPERVISOR/ADMIN */}
                <Route
                  path="assignment"
                  element={
                    <ProtectedRoute roles={QUOTES_SUPERVISOR_ROLES}>
                      <QuotesAssignment />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* SHOPPING - Solo STAFF */}
              <Route
                path="/shopping"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <ShoppingLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Shopping />} />
                <Route path="follow-ups" element={<ShoppingFollowUps />} />
                <Route path="history" element={<ShoppingHistory />} />
                <Route
                  path="assignment"
                  element={
                    <ProtectedRoute roles={SHOPPING_MANAGER_ROLES}>
                      <ShoppingAssignment />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Proyectos - Solo STAFF */}
              <Route
                path="/projects"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <NewProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/edit/:id"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <NewProject />
                  </ProtectedRoute>
                }
              />

              {/* Usuarios - Solo ADMIN */}
              <Route
                path="/Profiles"
                element={
                  <ProtectedRoute roles={["ADMIN"]}>
                    <Profiles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <UserProfiles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute roles={["ADMIN"]}>
                    <UserProfiles />
                  </ProtectedRoute>
                }
              />

              {/* Resto - Solo STAFF */}
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute roles={STAFF_ROLES}>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              {/* ... resto de rutas genéricas igual con STAFF_ROLES */}
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Dialog de acceso denegado */}
        <AccessDeniedDialog
          isOpen={accessDenied.open}
          onClose={() => setAccessDenied({ open: false, message: '' })}
          message={accessDenied.message}
        />
      </>
      <NotificationContainer />
      {/*<NotificationPanel />*/}
    </NotificationProvider>
  );
}