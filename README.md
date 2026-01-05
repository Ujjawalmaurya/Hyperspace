# Hyperspace Precision Agriculture Platform

Hyperspace is a state-of-the-art AI-driven platform designed for precision agriculture. It leverages multispectral drone imagery, AI object detection (YOLOv8), and vegetation indices (NDVI) to provide farmers with real-time insights into field health, disease detection, and yield forecasts.

## � Key Features
- **AI Analysis Command Center**: Upload drone imagery for real-time AI processing.
- **Interactive GIS Maps**: Visualize multispectral and health layers via a simulated GIS engine.
- **Disease Detection**: Automated anomaly detection using YOLOv8 models.
- **Health Indicators**: Real-time NDVI (Normalized Difference Vegetation Index) calculations.
- **Multilingual Support**: Fully localized interface in English and Hindi.
- **Team Management**: Role-based access control for farm staff.
- **Fleet Connectivity**: Integrated drone hardware status and management.

## 🛠️ Technology Stack
- **Frontend**: Next.js 15+, React, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Multer.
- **ML Service**: Python, FastAPI, OpenCV, PyTorch, Ultralytics YOLOv8.

## 📦 How to Run the Project

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Running locally or via Atlas)

### 1. Setup Backend
1. Navigate to the `backend` folder.
2. Install dependencies: `npm install`.
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hyperspace
   ML_SERVICE_URL=http://localhost:8000
   ```
4. Start the server: `node index.js`.

### 2. Setup ML Service
1. Navigate to the `ml_service` folder.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4. Install dependencies: `pip install -r requirements.txt`.
5. Run the service: `python main.py`.

### 3. Setup Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Run dev server: `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚁 Drone Connectivity
To connect a drone:
1. Go to **Settings** > **Integrations**.
2. Click **Connect** on the DJI or Satellite Hub option.
3. Access the **Launch Analysis** command center in the Navbar to begin uploading flight imagery.

---
Built with ❤️ by the Hyperspace Team.

