import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STANDARD_LOCATIONS = [
    { name: "-- Select a Standard Location --", lat: null, lng: null },
    { name: "Mahalaxmi Temple", lat: 16.6946, lng: 74.2230 },
    { name: "Rankala Lake", lat: 16.6915, lng: 74.2155 },
    { name: "CBS (Central Bus Stand)", lat: 16.7032, lng: 74.2432 },
    { name: "Shivaji University", lat: 16.6780, lng: 74.2540 },
    { name: "Bhavani Mandap", lat: 16.6950, lng: 74.2235 }
];

function LocationSelector({ position, setPosition }) {
    const map = useMap();
    useMapEvents({
        click(e) { setPosition(e.latlng); }
    });
    useEffect(() => {
        if (position && position.lat) { map.flyTo([position.lat, position.lng], 15); }
    }, [position, map]);
    return position && position.lat ? <Marker position={[position.lat, position.lng]} /> : null;
}

function ReportPage() {
    const navigate = useNavigate();
    const [hazardType, setHazardType] = useState('safe_area');
    const [hazardDesc, setHazardDesc] = useState('');
    const [severityScore, setSeverityScore] = useState(0); 
    const [position, setPosition] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleStandardLocationChange = (e) => {
        const loc = STANDARD_LOCATIONS.find(l => l.name === e.target.value);
        if (loc && loc.lat) setPosition({ lat: loc.lat, lng: loc.lng });
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setError("Could not get location. Please enable location services.")
            );
        } else {
            setError("Geolocation is not supported by your browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!position) {
            setError("Please select a location on the map first.");
            return;
        }

        setIsSubmitting(true);
        const newHazard = { 
            lat: position.lat, 
            lng: position.lng, 
            type: hazardType, 
            description: hazardDesc,
            severity_score: parseInt(severityScore, 10)
        };

        try {
            await api.reportHazard(newHazard);
            // On success, redirect back to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || "Failed to submit the report.");
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', flexDirection: 'column', minHeight: '100vh', 
            backgroundColor: '#0f172a', // slate-900
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
        }}>
            
            <nav style={{ 
                padding: '1.25rem 3rem', backgroundColor: '#020617', // slate-950
                borderBottom: '1px solid #1e293b', // slate-800
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#0d9488', borderRadius: '4px' }}></div>
                    SafeRoute
                </div>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    style={{ 
                        backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', 
                        padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', 
                        fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s'
                    }}
                >
                    Cancel
                </button>
            </nav>

            <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center', flex: 1 }}>
                <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1100px', flexWrap: 'wrap' }}>
                    
                    {/* Form Section */}
                    <div style={{ 
                        flex: '1 1 400px', 
                        backgroundColor: '#1e293b', // slate-800
                        border: '1px solid #334155', // slate-700
                        borderRadius: '16px',
                        padding: '2.5rem', 
                        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="material-symbols-outlined" style={{ color: '#14b8a6' }}>rate_review</span> 
                            Submit Report
                        </h2>

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
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>1. Location</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={handleCurrentLocation} 
                                        style={{ 
                                            backgroundColor: '#334155', border: 'none', color: '#f8fafc', 
                                            padding: '0.75rem', borderRadius: '8px', flex: '0 0 auto', 
                                            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Use Current Location"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>my_location</span>
                                    </button>
                                    <select 
                                        onChange={handleStandardLocationChange} 
                                        style={{ 
                                            flex: 1, backgroundColor: '#0f172a', border: '1px solid #334155', 
                                            color: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem', 
                                            outline: 'none', fontSize: '0.95rem' 
                                        }}
                                    >
                                        {STANDARD_LOCATIONS.map(loc => <option key={loc.name} value={loc.name}>{loc.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>2. Category</label>
                                <select 
                                    value={hazardType} 
                                    onChange={e => setHazardType(e.target.value)} 
                                    style={{ 
                                        width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                                        color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', 
                                        outline: 'none', marginBottom: '1.25rem', fontSize: '0.95rem' 
                                    }}
                                >
                                    <optgroup label="Positive Feedback">
                                        <option value="safe_area">Safe & Secure Area</option>
                                        <option value="well_lit">Well-Lit Street</option>
                                        <option value="police_presence">Active Patrol / Police Presence</option>
                                    </optgroup>
                                    <optgroup label="Hazards / Warnings">
                                        <option value="poor_lighting">Poor Lighting / Dark Area</option>
                                        <option value="suspicious_activity">Suspicious Activity</option>
                                        <option value="harassment">Harassment Reported</option>
                                        <option value="no_sidewalk">No Sidewalk / Bad Road</option>
                                    </optgroup>
                                    <optgroup label="KMC Civic Issues (Future)">
                                        <option value="broken_streetlight" disabled>Broken Streetlight (Coming Soon)</option>
                                        <option value="flooded_road" disabled>Flooded Road (Coming Soon)</option>
                                        <option value="pothole" disabled>Severe Pothole (Coming Soon)</option>
                                    </optgroup>
                                </select>

                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>3. Severity Level</label>
                                <select 
                                    value={severityScore} 
                                    onChange={e => setSeverityScore(e.target.value)} 
                                    style={{ 
                                        width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                                        color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', 
                                        outline: 'none', fontSize: '0.95rem' 
                                    }}
                                >
                                    <option value={0}>Positive / Safe (Teal)</option>
                                    <option value={1}>Low - Minor Caution (Green)</option>
                                    <option value={2}>Medium - Hazardous (Yellow)</option>
                                    <option value={3}>High - Avoid Area (Red)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>4. Additional Details</label>
                                <textarea 
                                    placeholder="Provide more context..." 
                                    value={hazardDesc} 
                                    onChange={e => setHazardDesc(e.target.value)} 
                                    required 
                                    rows={4} 
                                    style={{ 
                                        width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                                        color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', 
                                        outline: 'none', resize: 'vertical', fontSize: '0.95rem', boxSizing: 'border-box'
                                    }} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                style={{ 
                                    backgroundColor: '#0d9488', color: '#ffffff', border: 'none', 
                                    padding: '1rem', borderRadius: '8px', fontSize: '1rem', 
                                    fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', 
                                    boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)',
                                    transition: 'background-color 0.2s', opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </div>

                    <div style={{ 
                        flex: '1 1 500px', border: '1px solid #334155', borderRadius: '16px', 
                        overflow: 'hidden', minHeight: '400px', position: 'relative', 
                        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)' 
                    }}>
                        <MapContainer center={[16.7050, 74.2433]} zoom={13} style={{ height: '100%', width: '100%', cursor: 'crosshair' }} zoomControl={false}>
                            <TileLayer 
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationSelector position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportPage;
