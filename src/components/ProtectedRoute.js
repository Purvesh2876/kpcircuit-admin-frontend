import React from 'react';
import { Navigate } from 'react-router-dom';

// Function to get a specific cookie value
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

const ProtectedRoute = ({ children }) => {
    // Check if token exists in localStorage or cookies
    const token = localStorage.getItem('token') || getCookie('token');

    // If token is present, render the child component, otherwise redirect to /login
    return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
