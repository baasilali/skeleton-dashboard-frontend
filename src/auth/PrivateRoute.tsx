import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { JSX } from 'react';

interface PrivateRouteProps {
  children: JSX.Element;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { loading, user, isApproved } = useAuth();

  if (loading) {
    return null; // Could return spinner component
  }

  if (user && isApproved) {
    return children;
  }

  return <Navigate to="/login" replace />;
}; 