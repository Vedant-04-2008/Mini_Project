import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [Username, setUsername] = useState('');
  const [Email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [c_password, setC_password] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      if (password !== c_password) {
          setError('Passwords do not match');
          return;
      }

      setIsLoading(true);
      
      try { 
        await api.register({ Username, Email, password, c_password });
        // After successful registration, navigate to login
        navigate('/login');
      } catch (err) {
        setError(err.message || 'Failed to create account.');
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
        maxWidth: '460px',
        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)',
        color: '#f8fafc'
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>
            Create Account
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Join the community network.</p>
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
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="John Doe" 
                required 
                type="text"
                value={Username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                  color: '#f8fafc', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', 
                  outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem' }}>person</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="name@example.com" 
                required 
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                  color: '#f8fafc', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', 
                  outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem' }}>mail</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
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
                    color: '#f8fafc', padding: '0.75rem 2.25rem 0.75rem 2.25rem', borderRadius: '8px', 
                    outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                  }}
                />
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem' }}>lock</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={c_password}
                  onChange={(e) => setC_password(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                    color: '#f8fafc', padding: '0.75rem 2.25rem 0.75rem 2.25rem', borderRadius: '8px', 
                    outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                  }}
                />
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem' }}>lock_reset</span>
                <span className="material-symbols-outlined" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} style={{ 
            backgroundColor: '#0d9488', // teal-600
            color: '#ffffff', border: 'none', padding: '0.75rem 1rem', 
            borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)', transition: 'background-color 0.2s',
            opacity: isLoading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
          Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#14b8a6', cursor: 'pointer', fontWeight: 600 }}>Log In</span>
        </div>
      </div>
    </div>
  );
}

export default Register;
