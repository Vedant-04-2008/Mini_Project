import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    const handleMapAccess = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

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
                <div 
                    onClick={() => navigate('/')} 
                    style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                >
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#0d9488', borderRadius: '6px' }}></div>
                    SafeRoute
                </div>
                
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <a href="#motto" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Our Motto</a>
                    <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>How It Works</a>
                    <a href="#civic-action" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>KMC Action</a>
                    
                    {isLoggedIn ? (
                        <>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                style={{ 
                                    backgroundColor: '#0d9488', border: 'none', color: '#ffffff', 
                                    padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.3)'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>map</span>
                                Live Map
                            </button>
                            <button 
                                onClick={() => navigate('/profile')}
                                style={{ 
                                    backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', 
                                    padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>account_circle</span>
                                Profile
                            </button>
                            <button 
                                onClick={handleLogout}
                                style={{ 
                                    backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', 
                                    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, 
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => navigate('/login')}
                                style={{ 
                                    backgroundColor: 'transparent', border: '1px solid #334155', color: '#cbd5e1', 
                                    padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, 
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
                                    padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, 
                                    cursor: 'pointer', transition: 'background-color 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.3)'
                                }}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Main Hero Section with Motto */}
            <main style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                padding: '5rem 2rem 3rem 2rem'
            }}>
                
                {/* Hero Banner */}
                <div style={{ 
                    maxWidth: '880px', width: '100%', textAlign: 'center', marginBottom: '5rem'
                }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)',
                        color: '#2dd4bf', padding: '0.4rem 1.1rem', borderRadius: '50px',
                        fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.75rem', letterSpacing: '0.04em'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>shield_with_heart</span>
                        WOMEN SAFETY & SECURE URBAN NAVIGATION • KOLHAPUR
                    </div>

                    <h1 style={{ 
                        fontSize: '3.75rem', fontWeight: 800, margin: '0 0 1.5rem 0', 
                        lineHeight: 1.15, color: '#f8fafc', letterSpacing: '-0.02em'
                    }}>
                        Every woman deserves a <span style={{ color: '#14b8a6' }}>safe route home.</span>
                    </h1>
                    
                    <p style={{ 
                        fontSize: '1.25rem', color: '#94a3b8', margin: '0 auto 2.5rem auto', 
                        maxWidth: '720px', lineHeight: 1.6 
                    }}>
                        Traditional navigation apps optimize solely for speed—often routing pedestrians through pitch-dark alleys, deserted bypasses, and unlit shortcuts. 
                        <strong> SafeRoute</strong> combines OpenStreetMap with Kolhapur's real-time illumination, police patrol data, and spatial hazards to calculate the <span style={{ color: '#2dd4bf' }}>safest walkable corridors</span> for late-night commuters.
                    </p>
                    
                    {/* Hero Action Buttons */}
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isLoggedIn ? (
                            <>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    style={{ 
                                        backgroundColor: '#14b8a6', color: '#ffffff', border: 'none', 
                                        padding: '1rem 2.25rem', borderRadius: '10px', fontSize: '1.05rem', 
                                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span className="material-symbols-outlined">explore</span>
                                    Open Live Safety Map
                                </button>
                                <button 
                                    onClick={() => navigate('/profile')}
                                    style={{ 
                                        backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', 
                                        padding: '1rem 2rem', borderRadius: '10px', fontSize: '1.05rem', 
                                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span className="material-symbols-outlined">contact_emergency</span>
                                    Emergency Contacts
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigate('/register')}
                                    style={{ 
                                        backgroundColor: '#14b8a6', color: '#ffffff', border: 'none', 
                                        padding: '1rem 2.25rem', borderRadius: '10px', fontSize: '1.05rem', 
                                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span className="material-symbols-outlined">person_add</span>
                                    Get Started Free
                                </button>
                                
                                <button 
                                    onClick={handleMapAccess}
                                    style={{ 
                                        backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', 
                                        padding: '1rem 2rem', borderRadius: '10px', fontSize: '1.05rem', 
                                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                    title="Sign in required for personalized safety telemetry"
                                >
                                    <span className="material-symbols-outlined">lock</span>
                                    View Live Map (Sign In)
                                </button>
                            </>
                        )}
                    </div>

                    {!isLoggedIn && (
                        <div style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
                            🔒 Authentication is required to access live GPS telemetry, personalized emergency contacts, and Guardian SOS broadcasting.
                        </div>
                    )}
                </div>

                {/* Core Motto & Safety Pillars Section */}
                <section id="motto" style={{ maxWidth: '1100px', width: '100%', marginBottom: '5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ color: '#14b8a6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Our Foundation & Purpose
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                            Why SafeRoute Exists
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '650px', margin: '0.75rem auto 0 auto' }}>
                            Safety is not just a secondary filter—it is our primary routing parameter. Here is how our architecture protects everyday travelers in Kolhapur.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.75rem' }}>
                        {/* Pillar 1 */}
                        <div style={{
                            backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
                            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(20, 184, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#14b8a6', fontSize: '1.75rem' }}>alt_route</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Safest vs. Fastest AI</h3>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Evaluates OpenStreetMap road vectors against MySQL spatial hazard databases (`ST_Distance`) to penalize unlit alleys and recommend well-illuminated arterial avenues.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div style={{
                            backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
                            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(225, 29, 72, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#f43f5e', fontSize: '1.75rem' }}>sensors</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Guardian Mode & Live SOS</h3>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Streams live GPS telemetry over WebSockets to your trusted emergency contacts and includes an instant 1-click Panic SOS broadcast.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div style={{
                            backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
                            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '1.75rem' }}>account_balance</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>KMC Civic Redressal</h3>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Direct connection to Kolhapur Municipal Corporation to log official grievance tickets for broken streetlights, potholes, and waterlogging.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div style={{
                            backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
                            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '1.75rem' }}>groups</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Community Crowdsourcing</h3>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Citizens collaboratively flag safety hotspots, police checkposts, well-maintained parks, and suspicious activities with instant map feedback.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" style={{ maxWidth: '1000px', width: '100%', marginBottom: '5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ color: '#14b8a6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Simple & Proactive
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                            How SafeRoute Protects You
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '2rem', position: 'relative' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#334155', position: 'absolute', top: '1rem', right: '1.5rem' }}>01</div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2dd4bf', margin: '0 0 0.75rem 0' }}>Register & Set Contacts</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                Create your account and configure trusted emergency contacts (family, friends, or local police helpline 112) in your personalized profile.
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '2rem', position: 'relative' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#334155', position: 'absolute', top: '1rem', right: '1.5rem' }}>02</div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', margin: '0 0 0.75rem 0' }}>Choose Safest Route</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                Search your destination with Google Maps-style autocomplete or drop a pin. Compare the direct route vs. the safety-optimized well-lit corridor.
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '2rem', position: 'relative' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#334155', position: 'absolute', top: '1rem', right: '1.5rem' }}>03</div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f43f5e', margin: '0 0 0.75rem 0' }}>Guardian Telemetry</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                Activate Guardian Mode while walking. If you ever feel unsafe, 1-click SOS triggers panic broadcasts directly to your emergency contacts.
                            </p>
                        </div>
                    </div>
                </section>

                {/* KMC Civic Action Section */}
                <section id="civic-action" style={{ maxWidth: '1000px', width: '100%' }}>
                    <div style={{ 
                        backgroundColor: '#1e293b', borderRadius: '16px', padding: '3.5rem',
                        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)',
                        border: '1px solid #334155', display: 'flex', gap: '3rem', alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ flex: '1 1 420px' }}>
                            <div style={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                Academic Future Scope Collaboration
                            </div>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#f8fafc', lineHeight: 1.2 }}>
                                Kolhapur Municipal Corporation (KMC) Redressal Integration
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                                We are bridging citizen safety reporting with civic governance. When users flag non-functional streetlights or dangerous road cavities in Kolhapur, an automated ticket is registered for municipal engineering divisions to permanently illuminate and repair dangerous corridors.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>check_circle</span>
                                    Instant grievance token generation with tracking reference
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>check_circle</span>
                                    Direct routing to Electrical, Roads & Sanitation engineering desks
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>check_circle</span>
                                    Transforming reactive panic into proactive city infrastructure maintenance
                                </li>
                            </ul>
                        </div>

                        <div style={{ flex: '1 1 300px', backgroundColor: '#0f172a', padding: '1.75rem', borderRadius: '12px', border: '1px solid #334155' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>account_balance</span>
                                Live KMC Dispatch Simulation
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Ticket KMC-2026-TKT-1004</div>
                                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Broken Streetlight at CBS Old Square</div>
                                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#f59e0b' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>pending</span> Escalated to Ward Electrical Cell
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #14b8a6' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Ticket KMC-2026-TKT-1002</div>
                                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Dark Alleyway near Rankala Gate</div>
                                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#14b8a6' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>task_alt</span> Scheduled for LED Retrofit
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: '#020617', borderTop: '1px solid #1e293b', padding: '2rem 3rem',
                textAlign: 'center', color: '#64748b', fontSize: '0.85rem'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>© 2026 SafeRoute • Intelligent Women Safety & Spatial Routing for Kolhapur</div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Academic Mini Project</span>
                        <span style={{ color: '#94a3b8' }}>KMC Open Civic Project</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
