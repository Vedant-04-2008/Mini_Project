import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Popup, useMap, CircleMarker, useMapEvents } from 'react-leaflet';
import { api } from './services/api';
import { useStore } from './store/useStore';
import { socket } from './services/socket';
import AddressAutocomplete from './components/AddressAutocomplete';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const STANDARD_LOCATIONS = [
    { name: "-- Select Location --", lat: null, lng: null },
    { name: "Mahalaxmi Temple", lat: 16.6946, lng: 74.2230 },
    { name: "Rankala Lake", lat: 16.6915, lng: 74.2155 },
    { name: "CBS (Central Bus Stand)", lat: 16.7032, lng: 74.2432 },
    { name: "Shivaji University", lat: 16.6780, lng: 74.2540 },
    { name: "Bhavani Mandap", lat: 16.6950, lng: 74.2235 }
];

function MapDashboard() {
    const navigate = useNavigate();
    
    // Zustand State
    const { hazards, setHazards, routes, setRoutes, guardianActive, setGuardianActive, isOffline, setIsOffline } = useStore();
    
    // Local State
    const [activeRoute, setActiveRoute] = useState('safest_route');
    const [startLoc, setStartLoc] = useState({ name: 'CBS (Central Bus Stand)', lat: 16.7032, lng: 74.2432 });
    const [endLoc, setEndLoc] = useState({ name: 'Rankala Lake', lat: 16.6915, lng: 74.2155 });
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);

    // Ref for tracking GPS simulation interval
    const gpsIntervalRef = useRef(null);

    useEffect(() => {
        // Offline Status Listener
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Fetch hazards
        api.getHazards()
            .then(data => setHazards(data))
            .catch(err => {
                console.error("Error fetching hazards:", err);
                if (!isOffline) setError("Failed to load live map data.");
            });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
            socket.disconnect();
        };
    }, []);

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setStartLoc({ name: "Current Location", lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setError("Could not get location. Please enable location services.")
            );
        } else {
            setError("Geolocation is not supported by your browser.");
        }
    };

    const handleCalculateRoute = () => {
        if (isOffline) {
            setError("Cannot calculate routes while offline. Connect to network.");
            return;
        }
        if (!startLoc.lat || !endLoc.lat) {
            setError("Please select both a starting point and a destination.");
            return;
        }

        setIsCalculating(true);
        setError(null);
        setTimeout(() => {
            api.getRoutes(startLoc.lat, startLoc.lng, endLoc.lat, endLoc.lng)
                .then(data => {
                    setRoutes(data);
                    setIsCalculating(false);
                })
                .catch(err => {
                    console.error("Error fetching routes:", err);
                    setError("Failed to calculate secure routes.");
                    setIsCalculating(false);
                });
        }, 800);
    };

    const toggleGuardianMode = () => {
        if (!guardianActive) {
            // Activate Guardian Mode
            socket.connect();
            const sessionId = `usr_${Math.floor(Math.random() * 10000)}`; // Simulated dynamic ID
            socket.emit('start_guardian_session', { session_id: sessionId });
            
            // Simulate live GPS broadcasting every 3 seconds
            gpsIntervalRef.current = setInterval(() => {
                socket.emit('broadcast_location', {
                    session_id: sessionId,
                    lat: startLoc.lat ? startLoc.lat + (Math.random() * 0.001) : 16.7050, 
                    lng: startLoc.lng ? startLoc.lng + (Math.random() * 0.001) : 74.2433
                });
            }, 3000);
            
            setGuardianActive(true);
        } else {
            // Deactivate
            if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
            socket.disconnect();
            setGuardianActive(false);
        }
    };

    const handleSOS = () => {
        if (guardianActive) {
            socket.emit('trigger_sos', { session_id: 'current_session' });
            alert("CRITICAL SOS BROADCASTED TO EMERGENCY CONTACTS!");
        } else {
            alert("Please activate Guardian Mode to broadcast SOS.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const MapBounds = ({ path }) => {
        const map = useMap();
        useEffect(() => {
            if (path && path.length > 0) {
                map.fitBounds(path, { padding: [50, 50], animate: true });
            }
        }, [path, map]);
        return null;
    };

    const DestinationSelector = () => {
        useMapEvents({
            click(e) {
                setEndLoc({ name: "Dropped Pin", lat: e.latlng.lat, lng: e.latlng.lng });
            }
        });
        return endLoc.lat ? <CircleMarker center={[endLoc.lat, endLoc.lng]} radius={6} pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 1 }} /> : null;
    };

    const getSeverityColor = (score) => {
        if (score === 0) return '#14b8a6'; // teal-500
        if (score === 1) return '#22c55e'; // green-500
        if (score === 2) return '#f59e0b'; // amber-500
        return '#f43f5e'; // rose-500
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', overflow: 'hidden' }}>
            
            <nav style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', 
                alignItems: 'center', padding: '1rem 2.5rem', backgroundColor: '#020617', borderBottom: '1px solid #1e293b' 
            }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#0d9488', borderRadius: '4px' }}></div>
                    SafeRoute
                </div>
                
                {isOffline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b', color: '#fff', padding: '0.25rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>wifi_off</span>
                        OFFLINE MODE (CACHED MAPS)
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                        onClick={toggleGuardianMode} 
                        style={{ 
                            backgroundColor: guardianActive ? '#e11d48' : '#334155', // rose-600 or slate-700
                            border: '1px solid ' + (guardianActive ? '#be123c' : '#475569'), 
                            color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s',
                            boxShadow: guardianActive ? '0 0 15px rgba(225, 29, 72, 0.4)' : 'none'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{guardianActive ? 'sensors' : 'sensors_off'}</span>
                        {guardianActive ? 'Guardian Active' : 'Enable Guardian'}
                    </button>

                    <button onClick={() => navigate('/report')} style={{ backgroundColor: '#0d9488', border: 'none', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add_location</span> Report
                    </button>

                    <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                    </button>
                </div>
            </nav>

            <aside style={{ 
                width: '380px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', 
                display: 'flex', flexDirection: 'column', zIndex: 500, paddingTop: '4.5rem', boxShadow: '4px 0 15px -3px rgba(2, 6, 23, 0.5)' 
            }}>
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    
                    {error && (
                        <div style={{ backgroundColor: '#fff1f2', color: '#e11d48', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            {error}
                        </div>
                    )}

                    {guardianActive && (
                        <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fda4af', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ color: '#e11d48', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined" style={{ animation: 'pulse 2s infinite' }}>my_location</span>
                                LIVE TELEMETRY BROADCASTING
                            </div>
                            <p style={{ color: '#be123c', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>Your location is being streamed to trusted contacts.</p>
                            <button onClick={handleSOS} style={{ width: '100%', backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(225, 29, 72, 0.3)' }}>
                                <span className="material-symbols-outlined">warning</span> SOS PANIC BUTTON
                            </button>
                        </div>
                    )}

                    <div style={{ marginBottom: '2rem', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '1.25rem' }}>Find Safe Route</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: 'transparent', border: '2px solid #94a3b8', borderRadius: '50%', flexShrink: 0 }}></div>
                            <AddressAutocomplete 
                                placeholder="Search starting point..."
                                value={startLoc.name}
                                onSelect={(loc) => setStartLoc(loc)}
                            />
                            <button 
                                onClick={handleCurrentLocation}
                                style={{ backgroundColor: '#334155', border: 'none', color: '#f8fafc', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                title="Use Current Location"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>my_location</span>
                            </button>
                        </div>

                        <div style={{ width: '2px', height: '15px', backgroundColor: '#334155', marginLeft: '5px', marginBottom: '1rem' }}></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#0d9488', borderRadius: '50%', flexShrink: 0 }}></div>
                            <AddressAutocomplete 
                                placeholder="Search destination or drop a pin..."
                                value={endLoc.name}
                                onSelect={(loc) => setEndLoc(loc)}
                            />
                        </div>

                        <button 
                            onClick={handleCalculateRoute} disabled={isCalculating || isOffline}
                            style={{ 
                                width: '100%', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', 
                                padding: '0.875rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, 
                                cursor: 'pointer', transition: 'all 0.2s', opacity: isCalculating || isOffline ? 0.7 : 1, 
                                boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)'
                            }}>
                            {isCalculating ? 'Calculating...' : 'Calculate Safe Route'}
                        </button>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem' }}>Suggested Routes</div>

                    {routes && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div 
                                onClick={() => setActiveRoute('safest_route')}
                                style={{ 
                                    padding: '1.25rem', border: `1px solid ${activeRoute === 'safest_route' ? '#14b8a6' : '#334155'}`, 
                                    backgroundColor: activeRoute === 'safest_route' ? 'rgba(20, 184, 166, 0.1)' : '#1e293b', 
                                    cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s'
                                }}
                            >
                                <h4 style={{ margin: '0 0 0.5rem 0', color: activeRoute === 'safest_route' ? '#14b8a6' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>shield</span> Safest Route
                                </h4>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.4 }}>{routes.safest_route.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                                    <span>{routes.safest_route.time}</span>
                                    <span>{routes.safest_route.distance}</span>
                                </div>
                            </div>

                            <div 
                                onClick={() => setActiveRoute('fastest_route')}
                                style={{ 
                                    padding: '1.25rem', border: `1px solid ${activeRoute === 'fastest_route' ? '#8b5cf6' : '#334155'}`, 
                                    backgroundColor: activeRoute === 'fastest_route' ? 'rgba(139, 92, 246, 0.1)' : '#1e293b', 
                                    cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s'
                                }}
                            >
                                <h4 style={{ margin: '0 0 0.5rem 0', color: activeRoute === 'fastest_route' ? '#a78bfa' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>bolt</span> Fastest Route
                                </h4>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.4 }}>{routes.fastest_route.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                                    <span>{routes.fastest_route.time}</span>
                                    <span>{routes.fastest_route.distance}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer center={[16.7050, 74.2433]} zoom={14} style={{ height: '100%', width: '100%', cursor: 'crosshair' }} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    <DestinationSelector />

                    {startLoc.lat && startLoc.name === "Current Location" && (
                        <CircleMarker center={[startLoc.lat, startLoc.lng]} radius={6} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 1 }} />
                    )}

                    {hazards.map(hazard => {
                        const score = hazard.severity_score !== undefined && hazard.severity_score !== null ? hazard.severity_score : 3;
                        const markerColor = getSeverityColor(score);
                        return (
                            <CircleMarker 
                                key={hazard.id} center={[hazard.lat, hazard.lng]} radius={8}
                                pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.9, weight: 2 }}
                            >
                                <Popup>
                                    <strong style={{color: markerColor}}>{hazard.type.replace(/_/g, ' ').toUpperCase()}</strong><br/>
                                    Severity Score: {score}<br/>
                                    {hazard.description}
                                </Popup>
                            </CircleMarker>
                        );
                    })}

                    {routes && (
                        <>
                            {/* Inactive Alternative Route (Muted dashed line, clickable to switch) */}
                            {activeRoute === 'safest_route' && routes.fastest_route && (
                                <Polyline 
                                    positions={routes.fastest_route.path} 
                                    color="#94a3b8" 
                                    weight={4} 
                                    opacity={0.55}
                                    dashArray="6, 8"
                                    eventHandlers={{ click: () => setActiveRoute('fastest_route') }}
                                />
                            )}
                            {activeRoute === 'fastest_route' && routes.safest_route && (
                                <Polyline 
                                    positions={routes.safest_route.path} 
                                    color="#94a3b8" 
                                    weight={4} 
                                    opacity={0.55}
                                    dashArray="6, 8"
                                    eventHandlers={{ click: () => setActiveRoute('safest_route') }}
                                />
                            )}

                            {/* Active Selected Route (Vibrant Bold Line) */}
                            {activeRoute === 'safest_route' && (
                                <Polyline positions={routes.safest_route.path} color="#14b8a6" weight={6} opacity={0.95} />
                            )}
                            {activeRoute === 'fastest_route' && (
                                <Polyline positions={routes.fastest_route.path} color="#8b5cf6" weight={6} opacity={0.95} />
                            )}
                            
                            <MapBounds path={activeRoute === 'safest_route' ? routes.safest_route.path : routes.fastest_route.path} />
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

export default MapDashboard;
