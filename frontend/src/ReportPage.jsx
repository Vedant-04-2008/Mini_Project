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
    
    // Tab Mode: 'hazard' (Standard community hazard) or 'kmc' (Civic infrastructure complaint)
    const [reportCategory, setReportCategory] = useState('hazard');
    
    // Community Hazard Fields
    const [hazardType, setHazardType] = useState('safe_area');
    const [severityScore, setSeverityScore] = useState(0); 

    // KMC Civic Issue Fields
    const [kmcIssueType, setKmcIssueType] = useState('broken_streetlight');
    
    // Common Fields
    const [description, setDescription] = useState('');
    const [position, setPosition] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState(null);

    // KMC Success Receipt Modal State
    const [kmcReceipt, setKmcReceipt] = useState(null);

    const handleStandardLocationChange = (e) => {
        const loc = STANDARD_LOCATIONS.find(l => l.name === e.target.value);
        if (loc && loc.lat) setPosition({ lat: loc.lat, lng: loc.lng });
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser or environment.");
            return;
        }

        setIsLocating(true);
        setError(null);

        const onGeoSuccess = (pos) => {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setIsLocating(false);
        };

        const onGeoError = (err) => {
            console.warn("High accuracy geolocation failed, retrying with network fallback:", err);
            navigator.geolocation.getCurrentPosition(
                onGeoSuccess,
                (finalErr) => {
                    setIsLocating(false);
                    if (finalErr.code === 1) {
                        setError("Location permission denied. Please allow location permissions in your browser settings.");
                    } else if (finalErr.code === 2) {
                        setError("GPS signal unavailable. Please ensure your device location is turned on.");
                    } else if (finalErr.code === 3) {
                        setError("Location request timed out. Please try again.");
                    } else {
                        setError("Could not retrieve GPS location. Please click on the map to place the incident pin.");
                    }
                },
                { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
            );
        };

        navigator.geolocation.getCurrentPosition(
            onGeoSuccess,
            onGeoError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!position) {
            setError("Please select a location on the map first.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (reportCategory === 'hazard') {
                // Submit standard community safety hazard
                const newHazard = { 
                    lat: position.lat, 
                    lng: position.lng, 
                    type: hazardType, 
                    description: description,
                    severity_score: parseInt(severityScore, 10)
                };
                await api.reportHazard(newHazard);
                navigate('/dashboard');
            } else {
                // Submit KMC Municipal Civic Grievance
                const civicPayload = {
                    lat: position.lat,
                    lng: position.lng,
                    issue_type: kmcIssueType,
                    description: description
                };
                const response = await api.reportCivic(civicPayload);
                // Open KMC Acknowledgement Slip
                setKmcReceipt(response);
                setIsSubmitting(false);
            }
        } catch (err) {
            setError(err.message || "Failed to submit report.");
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', flexDirection: 'column', minHeight: '100vh', 
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
        }}>
            
            <nav style={{ 
                padding: '1.25rem 3rem', backgroundColor: '#020617', 
                borderBottom: '1px solid #1e293b', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
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
                    Back to Map
                </button>
            </nav>

            <div style={{ padding: '2.5rem 2rem', display: 'flex', justifyContent: 'center', flex: 1 }}>
                <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1150px', flexWrap: 'wrap' }}>
                    
                    {/* Form Section */}
                    <div style={{ 
                        flex: '1 1 450px', 
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '2.5rem', 
                        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)'
                    }}>
                        
                        {/* Tab Switcher: Hazard vs KMC Complaint */}
                        <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '10px', padding: '4px', marginBottom: '1.75rem', border: '1px solid #334155' }}>
                            <button
                                type="button"
                                onClick={() => setReportCategory('hazard')}
                                style={{
                                    flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    backgroundColor: reportCategory === 'hazard' ? '#0d9488' : 'transparent',
                                    color: reportCategory === 'hazard' ? '#ffffff' : '#94a3b8',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>warning</span>
                                Safety Hazard
                            </button>
                            <button
                                type="button"
                                onClick={() => setReportCategory('kmc')}
                                style={{
                                    flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    backgroundColor: reportCategory === 'kmc' ? '#2563eb' : 'transparent',
                                    color: reportCategory === 'kmc' ? '#ffffff' : '#94a3b8',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>account_balance</span>
                                KMC Civic Grievance
                            </button>
                        </div>

                        {reportCategory === 'kmc' && (
                            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '1px solid #3b82f6', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#93c5fd' }}>
                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '3px', color: '#60a5fa' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>info</span>
                                    Future Scope Feature (Kolhapur Municipal Corporation)
                                </div>
                                Registered civic complaints are logged with coordinates and queued for automated dispatch to KMC ward engineering divisions.
                            </div>
                        )}

                        {error && (
                            <div style={{ 
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', 
                                fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>error</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>1. Incident Location</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={handleCurrentLocation} 
                                        disabled={isLocating}
                                        style={{ 
                                            backgroundColor: isLocating ? '#0d9488' : '#334155', 
                                            border: isLocating ? '1px solid #14b8a6' : '1px solid #475569', 
                                            color: '#f8fafc', padding: '0.75rem', borderRadius: '8px', flex: '0 0 auto', 
                                            cursor: isLocating ? 'wait' : 'pointer', 
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            transition: 'all 0.2s',
                                            boxShadow: isLocating ? '0 0 10px rgba(20, 184, 166, 0.4)' : 'none'
                                        }}
                                        title={isLocating ? "Acquiring GPS coordinates..." : "Use Current Location"}
                                    >
                                        <span 
                                            className="material-symbols-outlined" 
                                            style={{ 
                                                fontSize: '1.25rem',
                                                animation: isLocating ? 'spin 1s linear infinite' : 'none',
                                                color: isLocating ? '#ffffff' : '#38bdf8'
                                            }}
                                        >
                                            {isLocating ? 'sync' : 'my_location'}
                                        </span>
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

                            {/* Mode A: Standard Safety Hazard */}
                            {reportCategory === 'hazard' ? (
                                <>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>2. Category</label>
                                        <select 
                                            value={hazardType} 
                                            onChange={e => setHazardType(e.target.value)} 
                                            style={{ 
                                                width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                                                color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', 
                                                outline: 'none', fontSize: '0.95rem' 
                                            }}
                                        >
                                            <optgroup label="Positive Landmarks">
                                                <option value="safe_area">Safe & Secure Zone</option>
                                                <option value="well_lit">Well-Lit Street</option>
                                                <option value="police_presence">Police Patrol / Outpost</option>
                                                <option value="Green Park">Green Park</option>
                                                <option value="Heritage Spot">Heritage Spot</option>
                                            </optgroup>
                                            <optgroup label="Safety Concerns">
                                                <option value="poor_lighting">Dark / Unlit Alley</option>
                                                <option value="suspicious_activity">Suspicious Gathering</option>
                                                <option value="harassment">Harassment Hotspot</option>
                                                <option value="no_sidewalk">Isolated / Deserted Stretch</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>3. Severity / Rating Level</label>
                                        <select 
                                            value={severityScore} 
                                            onChange={e => setSeverityScore(e.target.value)} 
                                            style={{ 
                                                width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                                                color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', 
                                                outline: 'none', fontSize: '0.95rem' 
                                            }}
                                        >
                                            <option value={0}>Positive / High Safety (Teal)</option>
                                            <option value={1}>Low - Minor Caution (Lime)</option>
                                            <option value={2}>Medium - Hazardous (Amber)</option>
                                            <option value={3}>High - Avoid Area (Red)</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                /* Mode B: KMC Municipal Grievance */
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>2. KMC Civic Issue Category</label>
                                    <select 
                                        value={kmcIssueType} 
                                        onChange={e => setKmcIssueType(e.target.value)} 
                                        style={{ 
                                            width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', 
                                            color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', 
                                            outline: 'none', fontSize: '0.95rem' 
                                        }}
                                    >
                                        <option value="broken_streetlight">Broken / Non-functional Streetlight (Electrical Dept)</option>
                                        <option value="pothole">Dangerous Pothole / Crater (Roads Dept)</option>
                                        <option value="flooded_road">Drain Overflow / Waterlogging (Drainage Dept)</option>
                                        <option value="open_manhole">Uncovered / Broken Manhole (Sanitation Dept)</option>
                                        <option value="damaged_sidewalk">Damaged Footpath / Missing Curb (Town Planning)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', display: 'block' }}>
                                    {reportCategory === 'hazard' ? '4. Description' : '3. Grievance Details for KMC'}
                                </label>
                                <textarea 
                                    placeholder={reportCategory === 'hazard' ? "Describe the safety condition..." : "Provide specific landmarks or damage details for municipal repair team..."}
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    required 
                                    rows={3} 
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
                                    backgroundColor: reportCategory === 'kmc' ? '#2563eb' : '#0d9488', 
                                    color: '#ffffff', border: 'none', 
                                    padding: '0.875rem', borderRadius: '8px', fontSize: '1rem', 
                                    fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', 
                                    boxShadow: reportCategory === 'kmc' ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)' : '0 4px 6px -1px rgba(13, 148, 136, 0.2)',
                                    transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                                    {reportCategory === 'kmc' ? 'send' : 'add_location'}
                                </span>
                                {isSubmitting ? 'Registering...' : (reportCategory === 'kmc' ? 'Submit KMC Grievance' : 'Submit Safety Report')}
                            </button>
                        </form>
                    </div>

                    {/* Interactive Map Picker */}
                    <div style={{ 
                        flex: '1 1 500px', border: '1px solid #334155', borderRadius: '16px', 
                        overflow: 'hidden', minHeight: '400px', position: 'relative', 
                        boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)' 
                    }}>
                        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            📍 Click on the map to place the incident pin
                        </div>
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

            {/* Official KMC Grievance Receipt Modal */}
            {kmcReceipt && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b', border: '1px solid #3b82f6', borderRadius: '16px',
                        maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ backgroundColor: '#2563eb', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
                                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '1.5rem' }}>verified</span>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>Grievance Registered</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#93c5fd' }}>Kolhapur Municipal Corporation (KMC)</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '1.25rem', border: '1px solid #334155', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ticket Reference:</span>
                                <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>{kmcReceipt.reference_number}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Routing Division:</span>
                                <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>{kmcReceipt.department}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dispatch Status:</span>
                                <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>● {kmcReceipt.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Est. SLA:</span>
                                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{kmcReceipt.estimated_resolution}</span>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px dashed #3b82f6', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#93c5fd' }}>
                            <strong>🎓 Academic Future Scope Note:</strong><br/>
                            In production deployment, this ticket is dispatched to KMC's Municipal Field Team API to dispatch electrical & road maintenance crews to illuminate and repair high-risk corridors.
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none',
                                    padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Back to Map
                            </button>
                            <button
                                onClick={() => { setKmcReceipt(null); setDescription(''); setPosition(null); }}
                                style={{
                                    flex: 1, backgroundColor: '#334155', color: '#cbd5e1', border: 'none',
                                    padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                File Another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportPage;
