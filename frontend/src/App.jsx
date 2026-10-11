import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './Login';
import Register from './Register';
import MapDashboard from './MapDashboard';
import ReportPage from './ReportPage';
import './index.css'; // Make sure global styles are imported

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<MapDashboard />} />
                <Route path="/report" element={<ReportPage />} />
                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
