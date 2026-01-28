const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const login = async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

export const register = async (email: string, password: string, role = 'user') => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
};

export const fetchFarms = async () => {
    const response = await fetch(`${API_BASE_URL}/farms`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch farms');
    return response.json();
};

export const fetchFarmDetails = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch farm details');
    return response.json();
};

export const fetchStats = async () => {
    const response = await fetch(`${API_BASE_URL}/stats`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

export const analyzeFarmImage = async (farmId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('farmId', farmId);
    formData.append('file', imageFile);

    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
};

export const chatWithAI = async (message: string) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Chat failed');
    return response.json();
};
