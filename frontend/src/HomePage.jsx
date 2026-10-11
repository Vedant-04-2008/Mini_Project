import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div style={{ 
            display: 'flex', flexDirection: 'column', minHeight: '100vh', 
            backgroundColor: '#0f172a', // slate-900
            color: '#f8fafc', // slate-50
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
        }}>
            
            {/* Top Navigation Bar */}
            <nav style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '1.25rem 3rem', backgroundColor: '#020617', // slate-950
                borderBottom: '1px solid #1e293b', // slate-800
                position: 'sticky', top: 0, zIndex: 50 
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#0d9488', borderRadius: '4px' }}></div>
                    SafeRoute
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <a href="#mission" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Mission</a>
                    <a href="#civic-action" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Civic Action</a>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ 
                            backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#cbd5e1', 
                            padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, 
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Log In
                    </button>
                    <button 
                        onClick={() => navigate('/register')}
                        style={{ 
                            backgroundColor: '#0d9488', // teal-600
                            border: 'none', color: '#ffffff', 
                            padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, 
                            cursor: 'pointer', transition: 'background-color 0.2s'
                        }}
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Main Hero Content */}
            <main style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                padding: '6rem 2rem'
            }}>
                
                <div style={{ 
                    maxWidth: '800px', width: '100%', textAlign: 'center', marginBottom: '6rem'
                }}>
                    <h1 style={{ 
                        fontSize: '4rem', fontWeight: 800, margin: '0 0 1.5rem 0', 
                        lineHeight: 1.1, color: '#f8fafc'
                    }}>
                        Navigate your city with <span style={{ color: '#14b8a6' }}>confidence.</span>
                    </h1>
                    
                    <p style={{ 
                        fontSize: '1.25rem', color: '#94a3b8', margin: '0 auto 3rem auto', 
                        maxWidth: '600px', lineHeight: 1.6 
                    }}>
                        SafeRoute provides real-time community-driven insights and safest-route computations, empowering you to make informed decisions about your daily commute.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button 
                            onClick={() => navigate('/register')}
                            style={{ 
                                backgroundColor: '#14b8a6', // teal-500
                                color: '#ffffff', border: 'none', padding: '1rem 2rem', 
                                borderRadius: '8px', fontSize: '1rem', fontWeight: 600, 
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.2)'
                            }}
                        >
                            Get Started
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard')}
                            style={{ 
                                backgroundColor: '#1e293b', // slate-800
                                color: '#f8fafc', border: '1px solid #334155', // slate-700
                                padding: '1rem 2rem', borderRadius: '8px', 
                                fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            View Live Map
                        </button>
                    </div>
                </div>

                {/* Future Integrations / Civic Action Section */}
                <section id="civic-action" style={{ maxWidth: '1000px', width: '100%', marginTop: '2rem' }}>
                    <div style={{ 
                        backgroundColor: '#1e293b', // slate-800
                        borderRadius: '16px', padding: '4rem',
                        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)',
                        border: '1px solid #334155', display: 'flex', gap: '3rem', alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <div style={{ color: '#14b8a6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Future Integration
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#f8fafc', lineHeight: 1.2 }}>
                                Direct line to the Kolhapur Municipal Corporation (KMC)
                            </h2>
                            <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
                                We are working to bridge the gap between citizens and city officials. Soon, SafeRoute will integrate directly with KMC systems. When you flag infrastructure hazards—like broken streetlights, flooded roads, or missing pavement—the data will be instantly routed to the appropriate city department for resolution.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>check_circle</span>
                                    Report civic issues directly from the map
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>check_circle</span>
                                    Track resolution status in real-time
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>check_circle</span>
                                    Build a safer, better-maintained Kolhapur
                                </li>
                            </ul>
                        </div>
                        <div style={{ flex: '1 1 300px', backgroundColor: '#0f172a', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
                            {/* Mockup / Abstract illustration */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>KMC Ticket #4029</div>
                                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>Broken Streetlight at CBS</div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#f59e0b' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>pending</span> In Review
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #14b8a6' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>KMC Ticket #4011</div>
                                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>Flooded Road at Rankala</div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#14b8a6' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>task_alt</span> Resolved
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default HomePage;
