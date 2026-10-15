import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';

function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Edit Phone / Username state
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');

    // Add Emergency Contact form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactPhone, setNewContactPhone] = useState('');
    const [newContactRel, setNewContactRel] = useState('Parent');
    const [isSavingContact, setIsSavingContact] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getProfile();
            setProfile(data);
            setPhoneInput(data.phone || '');
        } catch (err) {
            console.error("Error loading profile:", err);
            setError(err.message || "Failed to load user profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePhone = async () => {
        try {
            await api.updateProfile({ phone: phoneInput });
            setProfile(prev => ({ ...prev, phone: phoneInput }));
            setIsEditingPhone(false);
            setSuccessMsg("Phone number updated successfully.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message || "Failed to update phone number.");
        }
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!newContactName.trim() || !newContactPhone.trim()) {
            setError("Please provide both name and phone number.");
            return;
        }

        setIsSavingContact(true);
        setError(null);
        try {
            const res = await api.addEmergencyContact({
                name: newContactName.trim(),
                phone: newContactPhone.trim(),
                relationship: newContactRel
            });

            // Update local state
            setProfile(prev => ({
                ...prev,
                emergency_contacts: [...(prev.emergency_contacts || []), res.contact]
            }));

            setNewContactName('');
            setNewContactPhone('');
            setShowAddForm(false);
            setSuccessMsg(`Emergency contact ${res.contact.name} added!`);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message || "Failed to add emergency contact.");
        } finally {
            setIsSavingContact(false);
        }
    };

    const handleDeleteContact = async (contactId, contactName) => {
        if (!window.confirm(`Are you sure you want to remove ${contactName} from your emergency contacts?`)) {
            return;
        }

        try {
            await api.deleteEmergencyContact(contactId);
            setProfile(prev => ({
                ...prev,
                emergency_contacts: prev.emergency_contacts.filter(c => c.id !== contactId)
            }));
            setSuccessMsg("Emergency contact removed.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message || "Failed to delete contact.");
        }
    };

    const handleAddHelplinePreset = async (name, phone, relationship) => {
        try {
            const res = await api.addEmergencyContact({ name, phone, relationship });
            setProfile(prev => ({
                ...prev,
                emergency_contacts: [...(prev.emergency_contacts || []), res.contact]
            }));
            setSuccessMsg(`${name} added to emergency contacts.`);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message || "Failed to add preset.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            backgroundColor: '#0f172a', color: '#f8fafc',
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
        }}>
            {/* Top Navigation */}
            <nav style={{
                padding: '1.25rem 3rem', backgroundColor: '#020617',
                borderBottom: '1px solid #1e293b',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div 
                    onClick={() => navigate('/dashboard')} 
                    style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                >
                    <div style={{ width: '22px', height: '22px', backgroundColor: '#0d9488', borderRadius: '4px' }}></div>
                    SafeRoute
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1',
                            padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>map</span>
                        Live Map
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center', flex: 1 }}>
                <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Notification Messages */}
                    {error && (
                        <div style={{
                            backgroundColor: '#fff1f2', color: '#e11d48', padding: '1rem', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 500
                        }}>
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399',
                            padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem',
                            fontSize: '0.9rem', fontWeight: 600
                        }}>
                            <span className="material-symbols-outlined">check_circle</span>
                            {successMsg}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', animation: 'spin 1s infinite' }}>refresh</span>
                            <p style={{ marginTop: '0.5rem' }}>Loading user profile...</p>
                        </div>
                    ) : profile && (
                        <>
                            {/* Profile Header Card */}
                            <div style={{
                                backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
                                padding: '2.5rem', boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)',
                                display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    width: '84px', height: '84px', borderRadius: '50%',
                                    backgroundColor: '#0d9488', color: '#ffffff', fontSize: '2.2rem',
                                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)'
                                }}>
                                    {(profile.username || 'U')[0].toUpperCase()}
                                </div>

                                <div style={{ flex: 1, minWidth: '260px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{profile.username}</h1>
                                        <span style={{
                                            backgroundColor: 'rgba(13, 148, 136, 0.2)', color: '#2dd4bf',
                                            border: '1px solid rgba(13, 148, 136, 0.4)', padding: '2px 10px',
                                            borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600
                                        }}>
                                            {profile.role === 'admin' ? 'Administrator' : 'Verified Citizen'}
                                        </span>
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>mail</span>
                                        {profile.email}
                                    </div>

                                    {/* Phone Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#94a3b8' }}>call</span>
                                        {isEditingPhone ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={phoneInput}
                                                    onChange={e => setPhoneInput(e.target.value)}
                                                    placeholder="+91 9876543210"
                                                    style={{
                                                        backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc',
                                                        padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none'
                                                    }}
                                                />
                                                <button
                                                    onClick={handleSavePhone}
                                                    style={{ backgroundColor: '#0d9488', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingPhone(false)}
                                                    style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>{profile.phone || 'No phone added yet'}</span>
                                                <button
                                                    onClick={() => setIsEditingPhone(true)}
                                                    style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                                >
                                                    {profile.phone ? 'Edit' : 'Add Phone'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.8rem' }}>
                                    Member since<br/>
                                    <strong style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{profile.created_at}</strong>
                                </div>
                            </div>

                            {/* Emergency Contacts Section */}
                            <div style={{
                                backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
                                padding: '2.5rem', boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className="material-symbols-outlined" style={{ color: '#f43f5e' }}>contact_emergency</span>
                                            Trusted Emergency Contacts
                                        </h2>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                                            These numbers receive immediate live GPS distress alerts when you trigger SOS or activate Guardian Mode.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        style={{
                                            backgroundColor: showAddForm ? '#334155' : '#0d9488',
                                            color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem',
                                            borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s'
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                                            {showAddForm ? 'close' : 'person_add'}
                                        </span>
                                        {showAddForm ? 'Cancel' : 'Add Contact'}
                                    </button>
                                </div>

                                {/* Safety Banner */}
                                <div style={{
                                    backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
                                    borderRadius: '10px', padding: '1rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                                }}>
                                    <span className="material-symbols-outlined" style={{ color: '#f43f5e', fontSize: '1.3rem', marginTop: '2px' }}>shield</span>
                                    <div style={{ fontSize: '0.825rem', color: '#fecdd3', lineHeight: 1.5 }}>
                                        <strong>How Guardian Emergency Broadcast works:</strong> When you start a late-night trip in Kolhapur, activating Guardian Mode streams encrypted GPS coordinates to SafeRoute's backend. In the event of panic or path deviation, an instant SOS notification is dispatched to all verified contacts listed here.
                                    </div>
                                </div>

                                {/* Add Contact Form */}
                                {showAddForm && (
                                    <form onSubmit={handleAddContact} style={{
                                        backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px',
                                        padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                                    }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2dd4bf', marginBottom: '0.25rem' }}>
                                            Add New Trusted Contact
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Full Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Radhika Sharma"
                                                    value={newContactName}
                                                    onChange={e => setNewContactName(e.target.value)}
                                                    style={{
                                                        width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155',
                                                        color: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px',
                                                        outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="+91 98220 12345"
                                                    value={newContactPhone}
                                                    onChange={e => setNewContactPhone(e.target.value)}
                                                    style={{
                                                        width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155',
                                                        color: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px',
                                                        outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Relationship</label>
                                                <select
                                                    value={newContactRel}
                                                    onChange={e => setNewContactRel(e.target.value)}
                                                    style={{
                                                        width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155',
                                                        color: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px',
                                                        outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <option value="Parent">Parent</option>
                                                    <option value="Sibling">Sibling</option>
                                                    <option value="Spouse / Partner">Spouse / Partner</option>
                                                    <option value="Close Friend">Close Friend</option>
                                                    <option value="Local Guardian">Local Guardian</option>
                                                    <option value="Colleague">Colleague</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                                style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSavingContact}
                                                style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: isSavingContact ? 0.7 : 1 }}
                                            >
                                                {isSavingContact ? 'Saving...' : 'Save Emergency Contact'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Contacts List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {(!profile.emergency_contacts || profile.emergency_contacts.length === 0) ? (
                                        <div style={{
                                            textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#0f172a',
                                            borderRadius: '12px', border: '1px dashed #334155', color: '#64748b'
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#475569', marginBottom: '0.5rem' }}>person_alert</span>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>No emergency contacts added yet</div>
                                            <p style={{ fontSize: '0.825rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                                                Add at least one family member, friend, or emergency helpline so your live location can be broadcasted in an emergency.
                                            </p>
                                        </div>
                                    ) : (
                                        profile.emergency_contacts.map(c => (
                                            <div
                                                key={c.id}
                                                style={{
                                                    backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px',
                                                    padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '10px',
                                                        backgroundColor: '#334155', color: '#2dd4bf', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem'
                                                    }}>
                                                        {c.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{c.name}</strong>
                                                            <span style={{
                                                                backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8',
                                                                border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1px 8px',
                                                                borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600
                                                            }}>
                                                                {c.relationship}
                                                            </span>
                                                        </div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>call</span>
                                                            {c.phone}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                                    <a
                                                        href={`tel:${c.phone}`}
                                                        style={{
                                                            backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8',
                                                            padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.8rem',
                                                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span>
                                                        Call
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteContact(c.id, c.name)}
                                                        style={{
                                                            backgroundColor: 'transparent', border: '1px solid #475569', color: '#f43f5e',
                                                            padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                        title="Remove contact"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Quick Presets for Kolhapur */}
                                <div style={{ marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem' }}>
                                        Quick Add: Official Kolhapur Emergency Helplines
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleAddHelplinePreset("Kolhapur Women Helpline", "1091", "Women Safety Helpline")}
                                            style={{
                                                backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1',
                                                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ color: '#f43f5e', fontSize: '1rem' }}>emergency</span>
                                            + Women Helpline (1091)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAddHelplinePreset("Kolhapur Police Control Room", "112", "Police Emergency")}
                                            style={{
                                                backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1',
                                                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ color: '#38bdf8', fontSize: '1rem' }}>local_police</span>
                                            + Police Control Room (112)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAddHelplinePreset("KMC Municipal Emergency Desk", "0231-2540291", "Municipal Civic Desk")}
                                            style={{
                                                backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1',
                                                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '1rem' }}>account_balance</span>
                                            + KMC Civic Desk (0231-2540291)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
