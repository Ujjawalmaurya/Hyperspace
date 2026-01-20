const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const IS_STANDALONE = process.env.NEXT_PUBLIC_STANDALONE === 'true';

const mockFarms = [
    { _id: 'mock-1', name: 'Emerald Valley', location: { lat: 28.61, lng: 77.21 }, size: 25.4, cropType: 'Wheat', farmerName: 'D. Smith' },
    { _id: 'mock-2', name: 'Azure Plains', location: { lat: 28.62, lng: 77.22 }, size: 12.8, cropType: 'Rice', farmerName: 'J. Doe' },
];

const mockStats = {
    totalFarms: 2,
    totalArea: "38.2",
    avgNDVI: "0.78",
    activeAlerts: 1,
    recentAnalyses: 5
};

export const fetchFarms = async () => {
    if (IS_STANDALONE) return mockFarms;
    try {
        const response = await fetch(`${API_BASE_URL}/farms`);
        if (!response.ok) throw new Error('Failed to fetch farms');
        return response.json();
    } catch (e) {
        console.warn('Falling back to mock farms', e);
        return mockFarms;
    }
};

export const fetchStats = async () => {
    if (IS_STANDALONE) return mockStats;
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    } catch (e) {
        console.warn('Falling back to mock stats', e);
        return mockStats;
    }
};

export const analyzeFarmImage = async (farmId: string, imageFile: File) => {
    if (IS_STANDALONE) {
        await new Promise(r => setTimeout(r, 2000));
        return {
            ndvi: 0.72 + Math.random() * 0.1,
            healthStatus: 'Optimal Health',
            diseaseDetected: false,
            detections: [],
            yieldPrediction: 12.4,
            recommendations: ['Maintain current irrigation', 'Schedule next flyover in 10 days'],
            metadata: { engine: 'Mock-AI-Engine', resolution: '4K' }
        };
    }
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

