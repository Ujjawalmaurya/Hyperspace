const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Farm = require('../models/Farm');
const Report = require('../models/Report');
const authenticateToken = require('../middleware/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

router.post('/analyze', authenticateToken, upload.single('image'), async (req, res) => {
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
            formData.append('file', fileBuffer, req.file.originalname);

            const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
                headers: { ...formData.getHeaders() }
            });

            const mlData = mlResponse.data;

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
            console.error('ML Service Error:', mlErr.message);
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

router.post('/analyze-batch', authenticateToken, upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const formData = new FormData();
        req.files.forEach(file => {
            const fileBuffer = fs.readFileSync(file.path);
            formData.append('files', fileBuffer, file.originalname);
        });

        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze-batch`, formData, {
            headers: { ...formData.getHeaders() }
        });

        const mlData = mlResponse.data;

        const reportPrompt = `
        You are an agricultural expert. Below is the data from a batch analysis of farm images:
        ${JSON.stringify(mlData, null, 2)}

        Please prepare a detailed, human-readable report in Markdown format. 
        Include sections for:
        - Executive Summary
        - Detailed Findings (per image if available)
        - Trend Analysis
        - Recommended Actions
        - Urgency Levels

        Respond ONLY with the markdown content. No conversational filler.
        `;

        const geminiResult = await model.generateContent(reportPrompt);
        const reportMarkdown = geminiResult.response.text();

        const imagePaths = req.files.map(f => `/uploads/${f.filename}`);
        const report = new Report({
            content: reportMarkdown,
            mlResults: mlData,
            images: imagePaths
        });

        await report.save();

        req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        res.json({
            message: 'Report generated and saved successfully',
            report: reportMarkdown,
            reportId: report._id
        });

    } catch (error) {
        console.error('Batch Analysis Error:', error.message);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ error: error.message || 'Analysis failed' });
    }
});

module.exports = router;
