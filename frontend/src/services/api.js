const getToken = () => localStorage.getItem('token');

const getHeaders = (customHeaders = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...customHeaders
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

    let data;
    try {
        data = await response.json();
    } catch (err) {
        throw new Error('Network response was not valid JSON');
    }

    if (!response.ok) {
        throw new Error(data.message || 'An error occurred during the request.');
    }

    // specific handling for backend's custom message responses
    if (data.message && data.message !== 'login_Done' && data.message !== 'data_sent' && response.status === 200) {
        // sometimes our backend returns 200 but signals a failure in the message string
        if (data.message === 'Email or Username Exists' || data.message === 'Invalid Email or password') {
            throw new Error(data.message);
        }
    }

    return data;
};

export const api = {
    login: async (credentials) => {
        const res = await fetch('/login', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials)
        });
        return handleResponse(res);
    },
    
    register: async (userData) => {
        const res = await fetch('/create-account', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(res);
    },
    
    getHazards: async () => {
        const res = await fetch('/api/hazards', {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    
    reportHazard: async (hazardData) => {
        const res = await fetch('/api/hazards', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(hazardData)
        });
        return handleResponse(res);
    },
    
    getRoutes: async (startLat, startLng, endLat, endLng) => {
        let url = '/api/routes';
        if (startLat && startLng && endLat && endLng) {
            url += `?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`;
        }
        const res = await fetch(url, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    reportCivic: async (civicData) => {
        const res = await fetch('/api/civic/report', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(civicData)
        });
        return handleResponse(res);
    },

    getCivicTickets: async () => {
        const res = await fetch('/api/civic/tickets', {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    getProfile: async () => {
        const res = await fetch('/api/user/profile', {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    updateProfile: async (data) => {
        const res = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    addEmergencyContact: async (contact) => {
        const res = await fetch('/api/user/emergency-contacts', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(contact)
        });
        return handleResponse(res);
    },

    deleteEmergencyContact: async (contactId) => {
        const res = await fetch(`/api/user/emergency-contacts/${contactId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    }
};

