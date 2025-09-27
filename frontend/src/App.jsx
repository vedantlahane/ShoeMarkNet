import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { initAuth } from "./redux/slices/authSlice";

// Layout & core components
import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Routing helpers
import routeConfig from "./routes/routeConfig";
import ProtectedRoute from "./routes/ProtectedRoute";

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <LoadingSpinner size="xl" message="Crafting your ShoeMarkNet experience…" />
  </div>
);

const renderRoute = ({ path, component: Component, index = false }) => {
  if (index) {
    return <Route key="index" index element={<Component />} />;
  }

  return <Route key={path} path={path} element={<Component />} />;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isLoading, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <LoadingSpinner size="xl" message="Getting everything ready…" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {routeConfig.admin.length > 0 && (
                <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin" />}>
                  <Route element={<AdminLayout />}>
                    {routeConfig.admin.map(renderRoute)}
                  </Route>
                </Route>
              )}

              <Route path="/*" element={<MainLayout />}>
                {routeConfig.public.map(renderRoute)}

                {routeConfig.protected.length > 0 && (
                  <Route element={<ProtectedRoute />}>
                    {routeConfig.protected.map(renderRoute)}
                  </Route>
                )}

                {routeConfig.fallback && renderRoute(routeConfig.fallback)}
              </Route>

              {routeConfig.auth.map(({ path, component: Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Routes>
          </Suspense>
        </BrowserRouter>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
