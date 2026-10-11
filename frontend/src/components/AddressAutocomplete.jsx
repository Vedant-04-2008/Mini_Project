import React, { useState, useEffect, useRef } from 'react';

function AddressAutocomplete({ placeholder, value, onSelect, customStyles }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const typingTimeout = useRef(null);

    // Update internal state if value prop changes externally (e.g. Current Location)
    useEffect(() => {
        if (value) {
            setQuery(value);
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Kolhapur bounding box approx: 16.6 to 16.8 lat, 74.1 to 74.3 lng
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=74.1,16.8,74.3,16.6&bounded=1&limit=5`
            );
            const data = await response.json();
            setSuggestions(data);
            setIsOpen(true);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        if (val.length >= 3) {
            typingTimeout.current = setTimeout(() => {
                fetchSuggestions(val);
            }, 500); // 500ms debounce
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (suggestion) => {
        setQuery(suggestion.display_name);
        setIsOpen(false);
        onSelect({
            name: suggestion.display_name,
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon)
        });
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    style={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '0.95rem',
                        width: '100%',
                        outline: 'none',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        ...customStyles
                    }}
                />
                {loading && (
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Loading...
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    marginTop: '4px',
                    padding: 0,
                    margin: '4px 0 0 0',
                    listStyle: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            style={{
                                padding: '0.75rem',
                                borderBottom: index < suggestions.length - 1 ? '1px solid #334155' : 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: '#e2e8f0',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {suggestion.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AddressAutocomplete;

