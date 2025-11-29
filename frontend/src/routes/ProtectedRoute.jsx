import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/common/feedback/LoadingSpinner";

const ProtectedRoute = ({ requiredRole = null }) => {
  const location = useLocation();
  const { isAuthenticated, isInitialized, isLoading, user } = useSelector(
    (state) => state.auth
  );

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Checking your access…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to="/access-denied"
        replace
        state={{ from: location, requiredRole }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;