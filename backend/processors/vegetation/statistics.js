function calculateStats(raster) {
    if (!raster || raster.length === 0) return null;

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;
    let healthyCount = 0; // Assuming > 0.5 is healthy

    for (let i = 0; i < raster.length; i++) {
        const val = raster[i];
        if (Number.isNaN(val) || val === -9999) continue; // Skip NoData or NaN

        if (val < min) min = val;
        if (val > max) max = val;
        sum += val;
        count++;

        if (val > 0.5) healthyCount++; // Very simple threshold for demo
    }

    const mean = count > 0 ? sum / count : 0;

    // Calculate StdDev
    let sumSqDiff = 0;
    for (let i = 0; i < raster.length; i++) {
        const val = raster[i];
        if (Number.isNaN(val) || val === -9999) continue;
        const diff = val - mean;
        sumSqDiff += diff * diff;
    }
    const stdDev = count > 0 ? Math.sqrt(sumSqDiff / count) : 0;

    return {
        min,
        max,
        mean,
        stdDev,
        healthyPercentage: count > 0 ? (healthyCount / count) * 100 : 0
    };
}

module.exports = { calculateStats };
