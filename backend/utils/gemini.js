const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generates a 4x4 grid of vegetation index values based on provided statistics.
 * The grid represents a spatial distribution that statistically matches the input stats.
 * 
 * @param {Object} stats - The statistics object { min, max, mean, stdDev, healthyPercentage }
 * @param {string} indexName - The name of the index (e.g., 'NDVI', 'GNDVI')
 * @returns {Promise<number[]>} - A flattened array of 16 numbers (4x4 grid)
 */
async function generateVegetationGrid(stats, indexName = 'NDVI') {
    if (!stats) return Array(16).fill(0);

    const prompt = `
    You are a precision agriculture AI. 
    Generate a 4x4 grid (16 values) of ${indexName} values that statistically match the following distribution:
    - Minimum: ${stats.min.toFixed(2)}
    - Maximum: ${stats.max.toFixed(2)}
    - Mean: ${stats.mean.toFixed(2)}
    - Standard Deviation: ${stats.stdDev.toFixed(2)}
    - Healthy Percentage (>0.5): ${stats.healthyPercentage.toFixed(1)}%

    The values should represent a realistic field pattern (e.g., clustered health or stress areas).
    Return ONLY a JSON array of 16 numbers. Example: [0.1, 0.2, ...].
    Do not include markdown formatting or explanations.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const grid = JSON.parse(text);

        if (Array.isArray(grid) && grid.length === 16) {
            return grid;
        } else {
            console.warn('Gemini returned invalid grid format, falling back to random distribution.');
            return generateFallbackGrid(stats);
        }
    } catch (error) {
        console.error('Error generating AI grid:', error);
        return generateFallbackGrid(stats);
    }
}

function generateFallbackGrid(stats) {
    // Simple fallback: Generate random values within range, biased towards mean
    return Array.from({ length: 16 }, () => {
        // Box-Muller transform for normal distribution approximation
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        let val = stats.mean + z * stats.stdDev;

        // Clamp to min/max and 0-1 range
        val = Math.max(stats.min, Math.min(stats.max, val));
        val = Math.max(0, Math.min(1, val));

        return Number(val.toFixed(2));
    });
}

/**
 * Generates regular farm analysis insights based on all vegetation indices.
 * 
 * @param {Object} allStats - Object containing stats for all indices { ndvi, gndvi, ... }
 * @returns {Promise<Object>} - The analysis object matching the schema
 */
async function generateFarmAnalysis(allStats) {
    const prompt = `
    You are an expert agronomist and precision agriculture specialist.
    Analyze the following vegetation index statistics for a farm field:

    ${Object.entries(allStats).map(([key, val]) => `
    - ${key.toUpperCase()}:
      Mean: ${val?.mean?.toFixed(3) || 'N/A'}
      Min: ${val?.min?.toFixed(3) || 'N/A'}
      Max: ${val?.max?.toFixed(3) || 'N/A'}
      StdDev: ${val?.stdDev?.toFixed(3) || 'N/A'}
      Healthy %: ${val?.healthyPercentage?.toFixed(1) || 'N/A'}%
    `).join('\n')}

    Provide a comprehensive status report in JSON format with the following structure:
    {
        "healthScore": 0-100 (Overall field health score based on all metrics),
        "summary": "2-3 sentences summarizing the field status, identifying key stress types (water vs nitrogen etc)",
        "recommendations": ["Actionable advice 1", "Actionable advice 2", "Actionable advice 3"],
        "indexAnalysis": {
            "ndvi": "Specific insight derived from NDVI...",
            "gndvi": "Specific insight derived from GNDVI (e.g., relating to chlorophyll/nitrogen)...",
            "ndre": "Insight on early stress detection...",
            "savi": "Insight on soil background influence...",
            "osavi": "Insight on canopy structures..."
        },
        "focusAreas": ["North-East sector for irrigation", "Central zone for pest check", etc (Infer from stats variance)]
    }

    Return ONLY valid JSON. No markdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error('Error generating farm analysis:', error);
        return {
            healthScore: 50,
            summary: "AI Analysis unavailable. Please review raw indices.",
            recommendations: ["Check field manually"],
            indexAnalysis: {},
            focusAreas: []
        };
    }
}

module.exports = { generateVegetationGrid, generateFarmAnalysis };
