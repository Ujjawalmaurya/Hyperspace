# Backend API Documentation

This file documents the API endpoints for the Hyperspace backend.
Base URL: `http://localhost:5000` (or `http://localhost:5000/api` for api routes)

## System

### Health Check
- **URL:** `/`
- **Method:** `GET`
- **Description:** Checks if the API serves is running.
- **Response:**
  - `200 OK`: "API is running..."

---

## Farms

### List All Farms
- **URL:** `/api/farms`
- **Method:** `GET`
- **Description:** Retrieves a list of all farms.
- **Response:** `Array` of Farm objects.

### Create Farm
- **URL:** `/api/farms`
- **Method:** `POST`
- **Description:** Creates a new farm.
- **Body:**
  ```json
  {
      "name": "String",
      "location": { "lat": Number, "lng": Number },
      "size": Number,
      "cropType": "String",
      "farmerName": "String"
  }
  ```
- **Response:** `201 Created` with the created Farm object.

### Get Farm by ID
- **URL:** `/api/farms/:id`
- **Method:** `GET`
- **Description:** Retrieves details of a specific farm.
- **Response:** Farm object.

### Get Dashboard Stats
- **URL:** `/api/stats`
- **Method:** `GET`
- **Description:** Retrieves aggregated statistics (total farms, area, average NDVI, etc.).
- **Response:**
  ```json
  {
      "totalFarms": Number,
      "totalArea": String,
      "avgNDVI": String,
      "activeAlerts": Number,
      "recentAnalyses": Number
  }
  ```

---

## Analysis

### Analyze Image
- **URL:** `/api/analyze`
- **Method:** `POST`
- **Description:** Uploads an image for ML analysis.
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `image`: File (The image to analyze)
  - `farmId`: String (ID of the farm)
- **Response:** Analysis results (NDVI, disease detection, recommendations, etc.) which is also appended to the farm's history.
