import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { initAuth } from "./redux/slices/authSlice";

import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import LoadingSpinner from "./components/common/feedback/LoadingSpinner";

import routeConfig from "./routes/routeConfig";
import ProtectedRoute from "./routes/ProtectedRoute";

// Fallback component shown while lazy-loaded components are being fetched
const SuspenseFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
    <LoadingSpinner size="xl" message="Crafting your ShoeMarkNet experience…" />
  </div>
);

// Helper function to dynamically render Route components from routeConfig
const renderRoute = ({
  path,
  component: Component,
  element,
  index = false,
  componentProps = {},
}) => {
  // Determine the element to render: use provided element or create from Component
  const routeElement =
    element ?? (Component ? <Component {...componentProps} /> : null);

  // Skip rendering if no valid element
  if (!routeElement) {
    return null;
  }

  // Render index route for default child routes
  if (index) {
    return (
      <Route
        key={`index-${Component?.name || path || "route"}`}
        index
        element={routeElement}
      />
    );
  }

  // Render standard route
  return <Route key={path} path={path} element={routeElement} />;
};

// Core content component handling auth initialization and route rendering
const AppContent = () => {
  const dispatch = useDispatch();
  const { isLoading, isInitialized } = useSelector((state) => state.auth);

  // Initialize authentication on app load (e.g., check session/token)
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  // Show loading screen while auth is initializing
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <LoadingSpinner size="xl" message="Getting everything ready…" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Admin routes: protected by role and wrapped in AdminLayout */}
          {routeConfig.admin.length > 0 && (
            <Route
              path="/admin/*"
              element={<ProtectedRoute requiredRole="admin" />}
            >
              <Route element={<AdminLayout />}>
                {routeConfig.admin.map(renderRoute)}
              </Route>
            </Route>
          )}

          {/* Auth routes (e.g., login/signup): standalone, no layout */}
          {routeConfig.auth.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}

          {/* Public and protected routes: wrapped in MainLayout */}
          <Route path="/*" element={<MainLayout />}>
            {/* Public routes accessible to all users */}
            {routeConfig.public.map(renderRoute)}

            {/* Protected routes requiring authentication */}
            {routeConfig.protected.length > 0 && (
              <Route element={<ProtectedRoute />}>
                {routeConfig.protected.map(renderRoute)}
              </Route>
            )}

            {/* Fallback route for unmatched paths (e.g., 404) */}
            {routeConfig.fallback && renderRoute(routeConfig.fallback)}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
