const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchFarms = async () => {
    const response = await fetch(`${API_BASE_URL}/farms`);
    if (!response.ok) throw new Error('Failed to fetch farms');
    return response.json();
};

export const fetchFarmDetails = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`);
    if (!response.ok) throw new Error('Failed to fetch farm details');
    return response.json();
};

export const fetchStats = async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

export const analyzeFarmImage = async (farmId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('farmId', farmId);
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
};
