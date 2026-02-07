# Vegetation Analysis Module

This module provides multispectral analysis capabilities for the HyperSpace platform. It allows users to upload TIF images with multiple spectral bands (Red, Green, Blue, RedEdge, NIR) and automatically calculates vegetation indices.

## Overview
The module uses `geotiff` and `ndarray` in the backend to parse raster data and compute pixel-wise metrics. It stores reports in the `VegetationReports` collection.

## API Endpoints

### Upload Analysis
- **URL**: `/api/vegetation/upload`
- **Method**: `POST`
- **Headers**:
    - `Authorization`: `Bearer <token>`
    - `Content-Type`: `multipart/form-data`
- **Body**:
    - `image`: File (.tif only)
    - `farmId`: ID of the farm (optional)
- **Response**:
    ```json
    {
        "message": "Vegetation analysis complete",
        "reportId": "...",
        "results": {
            "ndvi": { "min": 0.1, "max": 0.8, "mean": 0.45, "healthyPercentage": 60 },
            "gndvi": { ... },
            ...
        }
    }
    ```

### Batch Upload (Placeholder)
- **URL**: `/api/vegetation/batch`
- **Method**: `POST`
- **Body**: multiple files

## Indices Formulas

- **NDVI** (Normalized Difference Vegetation Index): `(NIR - Red) / (NIR + Red)`
- **GNDVI** (Green NDVI): `(NIR - Green) / (NIR + Green)`
- **NDRE** (Normalized Difference Red Edge): `(NIR - RedEdge) / (NIR + RedEdge)`
- **SAVI** (Soil Adjusted Vegetation Index): `((NIR - Red) / (NIR + Red + L)) * (1 + L)`, L=0.5
- **OSAVI** (Optimized SAVI): `(NIR - Red) / (NIR + Red + 0.16)`

## Performance Limits
- Max file size recommended: 200MB (due to in-memory processing).
- Processing time scales with pixel count.
- Supported Formats: GeoTIFF uncompressed or LZW.

## Usage
1.  Go to `/vegetation`.
2.  Upload a 5-band multispectral TIF.
3.  View the calculated statistics and indices.
