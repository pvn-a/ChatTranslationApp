import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, children }) => {
  if (!user || !user.username) {
    // Redirect to login page if the user is not logged in
    return <Navigate to="/login" />;
  }

  // Allow access if the user is logged in
  return children;
};

export default PrivateRoute;
