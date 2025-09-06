# 🛣️ Tractoducto IA - Pipeline Monitoring System

A real-time pipeline monitoring system that visualizes road segments with environmental data and criticality analysis using Google Maps integration.

## ✨ Features

- **Interactive Map**: 20 road segments following real street paths using Google Roads API
- **Dual Analysis Modes**: 
  - 📊 **Descriptive**: Historical/current conditions
  - 🔮 **Predictive**: Forecasted conditions
- **Real-time Metrics**: Rain, temperature, oil volume, and criticality tracking
- **Color-coded Risk Levels**: Visual representation of segment criticality
- **Interactive Charts**: Detailed analytics for each segment using Chart.js

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Maps API Key** with the following APIs enabled:
  - Google Maps JavaScript API
  - Google Roads API

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd proyecto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the `.env` file and update it with your credentials:
   ```bash
   cp .env .env.local
   ```
   
   Edit `.env.local`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   VITE_SEGMENT_API_ENDPOINT=your_api_endpoint_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🔧 Google Maps API Setup

### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Google Maps JavaScript API**
   - **Google Roads API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### Step 2: Configure API Key Restrictions (Recommended)

1. Click on your API key in the Google Cloud Console
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add `http://localhost:5173/*` for development
   - Add your production domain when deploying
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Google Maps JavaScript API" and "Google Roads API"

## 📁 Project Structure

```
proyecto/
├── index.html          # Main HTML file
├── script.js           # Main application logic
├── styles.css          # Styling
├── js/
│   ├── api.js          # Data fetching and segment generation
│   ├── maps.js         # Google Maps integration
│   ├── charts.js       # Chart.js configuration
│   └── ui.js           # UI interactions and state management
├── .env                # Environment variables (template)
└── package.json        # Project dependencies
```

## 🎯 Usage

### Basic Navigation

1. **Select Date**: Use the date picker to choose analysis date
2. **Mode Auto-Detection**: 
   - Past/Today dates → Descriptive mode
   - Future dates → Predictive mode
3. **Click Segments**: Click any road segment to view detailed information
4. **View Analytics**: Segment details and charts appear in the sidebar

### Road Segment Configuration

The system displays 20 segments between two coordinates:
- **Start**: `3.746525, -71.863551`
- **End**: `3.734982, -71.889231`

To modify the route, edit the coordinates in `js/api.js`:
```javascript
const start = { lat: YOUR_START_LAT, lng: YOUR_START_LNG };
const end = { lat: YOUR_END_LAT, lng: YOUR_END_LNG };
```

## 🔄 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Build the project
```bash
npm run build
```

### Deploy the `dist` folder
The build creates a `dist` folder with optimized static files. Deploy this folder to any static hosting service:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your git repository
- **GitHub Pages**: Upload `dist` contents to your repo

### Environment Variables for Production
Make sure to set your environment variables in your hosting platform:
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_SEGMENT_API_ENDPOINT`

## 🔧 Configuration

### Segment Criticality Colors
Edit colors in `js/maps.js`:
```javascript
const colors = {
    'alta': '#dc2626',    // Red - High risk
    'media': '#f59e0b',   // Orange - Medium risk
    'baja': '#16a34a'     // Green - Low risk
};
```

### Mock Data Generation
Currently using mock data generators in `js/api.js`. Replace with your actual API endpoints when ready.

## 🐛 Troubleshooting

### Map not loading
- ✅ Check that your Google Maps API key is valid
- ✅ Verify APIs are enabled (Maps JavaScript API + Roads API)
- ✅ Check browser console for errors
- ✅ Ensure proper HTTP referrer restrictions

### Segments not displaying
- ✅ Check Roads API quota limits
- ✅ Verify start/end coordinates are accessible by roads
- ✅ Check network requests in browser dev tools

### Charts not working
- ✅ Verify Chart.js is loading properly
- ✅ Check segment click functionality
- ✅ Ensure canvas element exists in DOM

## 📊 API Integration

The system is designed to integrate with your backend API. Update the endpoints in `js/api.js`:

```javascript
// Replace mock functions with actual API calls
export async function loadDescriptiveData(selectedDate) {
    const response = await fetch(`${SEGMENT_API_ENDPOINT}/descriptive?date=${selectedDate}`);
    return response.json();
}
```

Expected API response format:
```json
[
  {
    "segment_id": "1500+58",
    "coordinates": [
      {"lat": 3.746525, "lng": -71.863551},
      {"lat": 3.747000, "lng": -71.863000}
    ],
    "variables": {
      "rain_mm": 15.2,
      "temperature_c": 33,
      "oil_volume_lt": 562
    },
    "target": {
      "criticidad": "media"
    }
  }
]
```