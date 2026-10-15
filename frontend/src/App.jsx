import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './Login';
import Register from './Register';
import MapDashboard from './MapDashboard';
import ReportPage from './ReportPage';
import ProfilePage from './ProfilePage';
import './index.css';

// Route guard: Redirect unauthenticated visitors to login
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes (Require Authentication) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <MapDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/report" 
                    element={
                        <ProtectedRoute>
                            <ReportPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
