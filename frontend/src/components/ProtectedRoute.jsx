import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user === null) {
    return (
      <div className="min-h-[60vh] grid place-items-center" data-testid="auth-loading">
        <p className="overline animate-pulse">Vérification…</p>
      </div>
    );
  }
  if (user === false) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-8 text-center" data-testid="auth-forbidden">
        <div className="max-w-md">
          <p className="overline">403</p>
          <h2 className="font-display text-4xl mt-2">Accès réservé.</h2>
          <p className="text-sm text-muted-foreground mt-3">
            Cette zone est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }
  return children;
};

export default ProtectedRoute;
