import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Inline error handling

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.login({ username, password });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // On success, redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      backgroundColor: '#0f172a', // slate-900
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>
      
      {/* Return Home Button */}
      <button onClick={() => navigate('/')} style={{
        position: 'absolute', top: '2rem', left: '2rem', backgroundColor: '#1e293b', 
        border: '1px solid #334155', color: '#cbd5e1', padding: '0.75rem', 
        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      {/* Solid UI Card */}
      <div style={{
        backgroundColor: '#1e293b', // slate-800
        border: '1px solid #334155', // slate-700
        borderRadius: '16px',
        padding: '3rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)', // shadow-lg shadow-slate-950/50
        color: '#f8fafc' // slate-50
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>
            Welcome Back
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Log in to access your dashboard.</p>
        </div>

        {/* Inline Error State */}
        {error && (
          <div style={{ 
            backgroundColor: '#fff1f2', // rose-50
            color: '#e11d48', // rose-600
            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', 
            fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>error</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="name@example.com" 
                required 
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                  color: '#f8fafc', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', 
                  outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem' }}>mail</span>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="••••••••" 
                required 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                  color: '#f8fafc', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px', 
                  outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem' }}>lock</span>
              <span className="material-symbols-outlined" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} style={{ 
            backgroundColor: '#0d9488', // teal-600
            color: '#ffffff', border: 'none', padding: '0.75rem 1rem', 
            borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)', transition: 'background-color 0.2s',
            opacity: isLoading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
          Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#14b8a6', cursor: 'pointer', fontWeight: 600 }}>Create Account</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
