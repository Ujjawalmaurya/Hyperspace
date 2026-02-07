const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// User Schema (will be defined after MongoDB connection)
// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    farmLocation: {
        address: String,
        lat: Number,
        lng: Number
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Farm Schema
const farmSchema = new mongoose.Schema({
    name: String,
    location: {
        lat: Number,
        lng: Number
    },
    size: Number,
    cropType: String,
    farmerName: String,
    analysisHistory: [{
        date: { type: Date, default: Date.now },
        ndvi: Number,
        healthStatus: String,
        diseaseDetected: Boolean,
        detections: [{
            label: String,
            confidence: Number,
            severity: String,
            box: [Number]
        }],
        yieldPrediction: Number,
        imageUrl: String,
        recommendations: [String],
        sprayPlan: {
            area: String,
            dosage: String,
            chemical: String,
            urgency: String
        },
        metadata: mongoose.Schema.Types.Mixed
    }]
});

const Farm = mongoose.model('Farm', farmSchema);

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

app.get('/', (req, res) => {
    res.status(200).send('API is running...');
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phoneNumber, farmLocation } = req.body;


        console.log('Register attempt:', { name, email, passwordExists: !!password, farmLocation });

        const missing = [];
        if (!name) missing.push('name');
        if (!email) missing.push('email');
        if (!password) missing.push('password');

        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            farmLocation: farmLocation || {}
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                farmLocation: user.farmLocation
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                farmLocation: user.farmLocation
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phoneNumber, farmLocation } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email; // Note: In a real app we should check if email is taken by another user
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (farmLocation) user.farmLocation = { ...user.farmLocation, ...farmLocation };

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                farmLocation: user.farmLocation
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Chat Route
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the Sky Scouts AI, a precision agriculture assistant. 
    Your goal is to help farmers monitor crop health, analyze NDVI maps, and manage drone missions.
    Be helpful, technical yet accessible, and professional. 
    If asked about farm health, suggest checking NDVI maps.
    If asked about drones, mention flight stability and coverage.
    
    Keep responses concise and action-oriented.
    
    LAnguage rules: 
    Use simple, human like natural language, butifully crafed for easy readibility and understadinig, dont throw robotic garbage.

    response in same language as aksed for example:
    question: update my profile.
    Answer: To update you profile, to this, this and this.

    if Question is: PRofile kaise update karen?
    then answer: Pahle apko yaha jana hai fir yaha fir yahan, aur apka kaam hogya!!!

Use emojis to beutiful looking reponses.

    `;

    const prompt = `${systemPrompt}\n\nUser: ${message}\nSky Scout AI:`;

    try {

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Simulate some actions based on response content
        const actions = [];
        if (responseText.toLowerCase().includes('ndvi') || responseText.toLowerCase().includes('map')) {
            actions.push({ label: 'View NDVI Map', value: 'Show me the latest NDVI map' });
        }
        if (responseText.toLowerCase().includes('drone') || responseText.toLowerCase().includes('fly')) {
            actions.push({ label: 'Launch Drone', value: 'Start a new drone mission' });
        }
        if (responseText.toLowerCase().includes('pest') || responseText.toLowerCase().includes('disease')) {
            actions.push({ label: 'Check Alerts', value: 'Show me pest alerts' });
        }

        res.json({
            response: responseText,
            actions: actions
        });
    } catch (err) {
        console.error('Gemini SDK Error, attempting fallback...', err.message);
        try {
            // Fallback to direct fetch if SDK fails
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nUser: ${message}\nSky Scout AI:`
                        }]
                    }]
                }
            );

            const responseText = response.data.candidates[0].content.parts[0].text;
            const actions = [];
            if (responseText.toLowerCase().includes('ndvi') || responseText.toLowerCase().includes('map')) {
                actions.push({ label: 'View NDVI Map', value: 'Show me the latest NDVI map' });
            }
            if (responseText.toLowerCase().includes('drone') || responseText.toLowerCase().includes('fly')) {
                actions.push({ label: 'Launch Drone', value: 'Start a new drone mission' });
            }
            if (responseText.toLowerCase().includes('pest') || responseText.toLowerCase().includes('disease')) {
                actions.push({ label: 'Check Alerts', value: 'Show me pest alerts' });
            }

            return res.json({
                response: responseText,
                actions: actions
            });
        } catch (fallbackErr) {
            console.error('Gemini Fallback Error:', fallbackErr.response?.data || fallbackErr.message);
            res.status(500).json({ error: 'AI failed to respond' });
        }
    }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both current and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const MONGODB_URI = process.env.MONGODB_URI;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('Could not connect to MongoDB', err));


async function seedData() {
    const count = await Farm.countDocuments();
    if (count === 0) {
        const defaultFarm = new Farm({
            name: "North Field A",
            location: { lat: 28.6139, lng: 77.2090 },
            size: 15.5,
            cropType: "Wheat",
            farmerName: "amittt",
            analysisHistory: []
        });
        await defaultFarm.save();
        console.info('Seeded default farm');
    }
}
seedData();

app.get('/api/farms', authenticateToken, async (req, res) => {
    try {
        const farms = await Farm.find();
        res.json(farms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/farms', authenticateToken, async (req, res) => {
    try {
        const farm = new Farm(req.body);
        await farm.save();
        res.status(201).json(farm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/farms/:id', authenticateToken, async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) return res.status(404).send('Farm not found');
        res.json(farm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const count = await Farm.countDocuments();
        const farms = await Farm.find();

        let totalArea = 0;
        let avgNDVI = 0;
        let alertCount = 0;
        let analysisCount = 0;

        farms.forEach(f => {
            totalArea += f.size || 0;
            if (f.analysisHistory && f.analysisHistory.length > 0) {
                const latest = f.analysisHistory[f.analysisHistory.length - 1];
                avgNDVI += latest.ndvi || 0;
                analysisCount++;
                if (latest.diseaseDetected) alertCount++;
            }
        });

        res.json({
            totalFarms: count,
            totalArea: totalArea.toFixed(1),
            avgNDVI: analysisCount > 0 ? (avgNDVI / analysisCount).toFixed(2) : 0.75,
            activeAlerts: alertCount,
            recentAnalyses: analysisCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/analyze', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { farmId } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const farm = await Farm.findById(farmId);
        if (!farm) return res.status(404).json({ error: 'Farm not found' });

        try {
            const formData = new FormData();
            const fileBuffer = fs.readFileSync(req.file.path);
            const blob = new Blob([fileBuffer], { type: req.file.mimetype });
            formData.append('file', blob, req.file.originalname);

            const mlResponse = await fetch(`${ML_SERVICE_URL}/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!mlResponse.ok) {
                throw new Error('ML Service failed');
            }

            const mlData = await mlResponse.json();

            const sprayPlan = mlData.disease_detected ? {
                area: '4.2 Acres (Northeast Zone)',
                dosage: '250ml / ha',
                chemical: 'Agricultural Fungicide-X3',
                urgency: 'Immediate'
            } : null;

            const results = {
                ndvi: mlData.ndvi,
                healthStatus: mlData.ndvi > 0.6 ? 'Optimal Health' : mlData.ndvi > 0.3 ? 'Moderate Stress' : 'Critical Anomaly',
                diseaseDetected: mlData.disease_detected,
                detections: mlData.detections,
                yieldPrediction: mlData.yield_prediction,
                recommendations: mlData.disease_detected ?
                    ['Apply targeted fungicide in Zone B', 'Schedule follow-up drone inspection', 'Isolate affected sector'] :
                    ['Maintain current irrigation schedule', 'Observe nitrogen levels in Zone A', 'Optimal growth detected'],
                sprayPlan,
                imageUrl,
                metadata: {
                    ...mlData.metadata,
                    weather: 'Sunny, 28°C',
                    soil_moisture: '64%',
                    flight_stitching: 'Success'
                }
            };

            farm.analysisHistory.push(results);
            await farm.save();

            res.json(results);
        } catch (mlErr) {
            console.error('ML Service Error:', mlErr);
            const fallbackResults = {
                ndvi: 0.7,
                healthStatus: 'Unknown (Fallback Active)',
                diseaseDetected: false,
                detections: [],
                yieldPrediction: 10.5,
                recommendations: ['Check system connectivity'],
                imageUrl,
                metadata: { weather: 'Unknown', engine: 'Fallback' }
            };

            farm.analysisHistory.push(fallbackResults);
            await farm.save();
            res.json(fallbackResults);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Multispectral Analysis Routes
const ML_SERVICE_URL_BASE = process.env.ML_SERVICE_URL || 'http://localhost:8000';

app.post('/api/multispectral/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const formData = new FormData();
        const fileBuffer = fs.readFileSync(req.file.path);
        formData.append('file', fileBuffer, req.file.originalname);

        const response = await axios.post(`${ML_SERVICE_URL_BASE}/process-dataset`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);

        res.json(response.data);
    } catch (error) {
        console.error('Proxy Upload Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to communicate with ML service' });
    }
});

app.get('/api/multispectral/status/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const response = await axios.get(`${ML_SERVICE_URL_BASE}/status/${jobId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Proxy Status Error:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to check status' });
    }
});

app.get('/api/multispectral/report/:jobId', async (req, res) => {
    console.log("fetching report")
    try {
        const { jobId } = req.params;
        const response = await axios.get(`${ML_SERVICE_URL_BASE}/report/${jobId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Proxy Report Error:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetching report' });
    }
});

app.use('/api/multispectral/proxy', async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
    try {
        const resourcePath = req.path;
        if (!resourcePath || resourcePath === '/') {
            return res.status(400).json({ error: 'No resource path specified' });
        }

        const targetUrl = `${ML_SERVICE_URL_BASE}/data${resourcePath}`;

        const response = await axios({
            method: 'get',
            url: targetUrl,
            responseType: 'stream'
        });

        // Forward headers like Content-Type
        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Static Error:', error.message);
        res.status(error.response?.status || 500).send('Failed to fetch resource');
    }
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
