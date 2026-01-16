const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperspace';
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

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

async function seedData() {
    const count = await Farm.countDocuments();
    if (count === 0) {
        const defaultFarm = new Farm({
            name: "North Field A",
            location: { lat: 28.6139, lng: 77.2090 },
            size: 15.5,
            cropType: "Wheat",
            farmerName: "Rajesh Kumar",
            analysisHistory: []
        });
        await defaultFarm.save();
        console.info('Seeded default farm');
    }
}
seedData();

app.get('/api/farms', async (req, res) => {
    try {
        const farms = await Farm.find();
        res.json(farms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/farms', async (req, res) => {
    try {
        const farm = new Farm(req.body);
        await farm.save();
        res.status(201).json(farm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/farms/:id', async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) return res.status(404).send('Farm not found');
        res.json(farm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
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

app.post('/api/analyze', upload.single('image'), async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
