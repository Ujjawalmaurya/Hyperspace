const VegetationReport = require('../models/VegetationReport');
const { extractBands, readGeoTIFF } = require('../processors/vegetation/bandReader');
const { ndvi, gndvi, ndre, savi, osavi } = require('../processors/vegetation/indexEngine');
const { calculateStats } = require('../processors/vegetation/statistics');
const { generateVegetationGrid } = require('../utils/gemini');
const Farm = require('../models/Farm');

async function processSingleFile(file, userId, farmId) {
    const filePath = file.path;
    console.log(`[processSingleFile] Processing Vegetation Analysis for ${filePath}`);

    try {
        // 1. Read GeoTIFF
        console.log(`[processSingleFile] Reading GeoTIFF: ${file.originalname}`);
        const tiffData = await readGeoTIFF(filePath);

        // 2. Extract Bands
        console.log(`[processSingleFile] Extracting bands for: ${file.originalname}`);
        const bands = extractBands(tiffData.rasters);

        // 3. Calculate Indices
        console.log(`[processSingleFile] Calculating indices for: ${file.originalname}`);
        const ndviRaster = ndvi(bands.nir, bands.red);
        const gndviRaster = gndvi(bands.nir, bands.green);
        const ndreRaster = ndre(bands.nir, bands.redEdge);
        const saviRaster = savi(bands.nir, bands.red);
        const osaviRaster = osavi(bands.nir, bands.red);

        // 4. Calculate Stats
        console.log(`[processSingleFile] Calculating stats for: ${file.originalname}`);
        const ndviStats = calculateStats(ndviRaster);
        const gndviStats = calculateStats(gndviRaster);
        const ndreStats = ndreRaster ? calculateStats(ndreRaster) : null;
        const saviStats = calculateStats(saviRaster);
        const osaviStats = calculateStats(osaviRaster);

        // 5. Generate AI Grids for Visualization
        console.log(`[processSingleFile] Generating AI grids for: ${file.originalname}`);
        const ndviGrid = await generateVegetationGrid(ndviStats, 'NDVI');

        // 5b. Create Report Object (to be saved)
        console.log(`[processSingleFile] Saving report to DB for: ${file.originalname}`);
        const report = new VegetationReport({
            userId: userId,
            farmId: farmId,
            originalFile: file.filename,
            width: tiffData.width,
            height: tiffData.height,
            ndvi: { stats: ndviStats, grid: ndviGrid }, // Save grid
            gndvi: { stats: gndviStats },
            ndre: { stats: ndreStats },
            savi: { stats: saviStats },
            osavi: { stats: osaviStats },
            metadata: {
                bbox: tiffData.bbox ? Array.from(tiffData.bbox) : []
            }
        });

        await report.save();
        console.log(`[processSingleFile] Report saved successfully: ${report._id}`);

        // 6. Update Farm History
        if (farmId) {
            console.log(`[processSingleFile] Updating Farm history for: ${farmId}`);
            await Farm.findByIdAndUpdate(farmId, {
                $push: {
                    analysisHistory: {
                        date: new Date(),
                        ndvi: ndviStats ? ndviStats.mean : 0,
                        healthStatus: (ndviStats && ndviStats.mean > 0.5) ? 'Good' : 'Needs Attention',
                        diseaseDetected: false, // Placeholder
                        imageUrl: `/uploads/${file.filename}`, // Simple path for now
                        metadata: {
                            reportId: report._id,
                            ndviGrid: ndviGrid, // Explicitly save grid to farm history for easy frontend access
                            resolution: `${tiffData.width}x${tiffData.height}`
                        }
                    }
                }
            });
        }

        return {
            filename: file.originalname,
            reportId: report._id,
            results: {
                ndvi: { stats: ndviStats, grid: ndviGrid },
                gndvi: gndviStats,
                ndre: ndreStats,
                savi: saviStats,
                osavi: osaviStats
            }
        };
    } catch (error) {
        console.error(`[processSingleFile] Error processing file ${file.originalname}:`, error);
        throw error; // Re-throw to be caught by the batch processor
    }
}

async function processVegetation(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No TIF file uploaded' });
        }

        const result = await processSingleFile(req.file, req.user.id, req.body.farmId);

        res.status(201).json({
            message: 'Vegetation analysis complete',
            ...result
        });

    } catch (error) {
        console.error('Vegetation Processing Error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function processBatchVegetation(req, res) {
    console.log('Batch vegetation upload request received');
    try {
        if (!req.files || req.files.length === 0) {
            console.error('No files found in request');
            return res.status(400).json({ error: 'No TIF files uploaded' });
        }

        const { farmId } = req.body;
        // farmId is now optional
        if (farmId) {
            console.log(`Processing ${req.files.length} files for farm ${farmId}`);
        } else {
            console.log(`Processing ${req.files.length} files without linked farm`);
        }

        const results = [];
        const errors = [];

        // Determine if we are processing a single file upload masquerading as batch or actual batch
        const filesToProcess = Array.isArray(req.files) ? req.files : [req.files];

        for (const file of filesToProcess) {
            try {
                console.log(`Starting processing for file: ${file.originalname}`);
                const result = await processSingleFile(file, req.user.id, farmId);
                results.push(result);
                console.log(`Successfully processed: ${file.originalname}`);
            } catch (err) {
                console.error(`Error processing ${file.originalname}:`, err);
                errors.push({ filename: file.originalname, error: err.message });
            }
        }

        const responseStatus = results.length > 0 ? 201 : 400; // If at least one succeeded, 201, else 400 (or partial content 207 but sticking to simple for now)

        res.status(responseStatus).json({
            message: 'Batch vegetation analysis complete',
            processed: results.length,
            failed: errors.length,
            results,
            errors
        });

    } catch (error) {
        console.error('Batch Vegetation Processing Critical Error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { processVegetation, processBatchVegetation };
