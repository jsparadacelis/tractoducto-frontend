// --- API and Data Module ---

const SEGMENT_API_ENDPOINT = import.meta.env.VITE_SEGMENT_API_ENDPOINT;

// --- API Integration ---
export async function loadDescriptiveData(selectedDate) {
    console.log("Loading descriptive (current) road conditions");
    
    // API call for descriptive data
    const apiUrl = `${SEGMENT_API_ENDPOINT}/descriptive?date=${selectedDate}`;
    
    // TODO: Replace with actual API call
    // const response = await fetch(apiUrl);
    // const data = await response.json();
    // return data;
    
    // For now, using mock descriptive data
    return generateDescriptiveData(selectedDate);
}

export async function loadPredictiveData(selectedDate) {
    console.log("Loading predictive (forecast) road conditions");
    
    // API call for predictive data
    const apiUrl = `${SEGMENT_API_ENDPOINT}/predictive?date=${selectedDate}`;
    
    // TODO: Replace with actual API call
    // const response = await fetch(apiUrl);
    // const data = await response.json();
    // return data;
    
    // For now, using mock predictive data
    return generatePredictiveData(selectedDate);
}

// --- Mock Data Generators ---
let cachedRoadSegments = null;

async function getBaseSegments() {
    // Return cached segments if already calculated
    if (cachedRoadSegments) {
        return cachedRoadSegments;
    }
    
    const start = { lat: 3.746525, lng: -71.863551 };
    const end = { lat: 3.734982, lng: -71.889231 };
    
    try {
        // Get the actual road path using Google Directions API
        const roadPath = await getRoadPath(start, end);
        
        // Divide the road path into 20 segments
        cachedRoadSegments = createSegmentsFromPath(roadPath);
        return cachedRoadSegments;
        
    } catch (error) {
        console.warn('Failed to get road path, using fallback segments:', error);
        // Fallback to straight line segments if Directions API fails
        return getFallbackSegments(start, end);
    }
}

async function getRoadPath(start, end) {
    try {
        // Use Roads API to snap to roads with interpolation
        const snappedPath = await snapToRoads([start, end]);
        console.log(`Got snapped road path with ${snappedPath.length} points`);
        return snappedPath;
    } catch (error) {
        throw new Error(`Roads API failed: ${error.message}`);
    }
}

// --- Roads API Integration ---
async function snapToRoads(points) {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const pathParam = points.map(p => `${p.lat},${p.lng}`).join("|");
    const url = `https://roads.googleapis.com/v1/snapToRoads?interpolate=true&path=${encodeURIComponent(pathParam)}&key=${GOOGLE_MAPS_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.snappedPoints) {
        throw new Error("Snap to Roads failed: " + JSON.stringify(data));
    }

    return data.snappedPoints.map(sp => ({
        lat: sp.location.latitude,
        lng: sp.location.longitude
    }));
}

function createSegmentsFromPath(path) {
    if (path.length < 2) return [];

    const segments = [];
    const numSegments = 20;
    
    // Split by index along snapped path (following POC approach)
    const step = Math.max(1, Math.floor(path.length / numSegments));

    for (let i = 0; i < path.length - 1; i += step) {
        const startPoint = path[i];
        const endPoint = path[i + step] || path[path.length - 1];
        
        // Create segment with start and end coordinates
        const segmentCoords = [startPoint, endPoint];
        
        segments.push({
            segment_id: `1500+${String(58 + Math.floor(i / step)).padStart(2, '0')}`,
            coordinates: segmentCoords
        });
    }
    
    // Ensure we have exactly 20 segments
    while (segments.length < 20 && path.length >= 2) {
        const lastSegment = segments[segments.length - 1];
        const nextIndex = segments.length;
        segments.push({
            segment_id: `1500+${String(58 + nextIndex).padStart(2, '0')}`,
            coordinates: [lastSegment.coordinates[1], path[path.length - 1]]
        });
    }
    
    console.log(`Created ${segments.length} segments following the snapped road path`);
    return segments.slice(0, 20); // Ensure exactly 20 segments
}

function getFallbackSegments(start, end) {
    const segments = [];
    
    // Calculate increments for 20 segments (straight line fallback)
    const latIncrement = (end.lat - start.lat) / 20;
    const lngIncrement = (end.lng - start.lng) / 20;
    
    for (let i = 0; i < 20; i++) {
        const currentLat = start.lat + (latIncrement * i);
        const currentLng = start.lng + (lngIncrement * i);
        const nextLat = start.lat + (latIncrement * (i + 1));
        const nextLng = start.lng + (lngIncrement * (i + 1));
        
        segments.push({
            segment_id: `1500+${String(58 + i).padStart(2, '0')}`,
            coordinates: [
                { lat: currentLat, lng: currentLng },
                { lat: nextLat, lng: nextLng }
            ]
        });
    }
    
    return segments;
}

async function generateDescriptiveData(selectedDate) {
    console.log("Generating descriptive (historical/current) data");
    const baseSegments = await getBaseSegments();
    const dateVariation = new Date(selectedDate).getDate() % 5;
    
    // Descriptive data represents actual observed conditions
    return baseSegments.map((segment, index) => {
        // Generate varied data along the road
        const rainBase = 10 + Math.sin(index * 0.5) * 8 + Math.random() * 5; // 5-23mm range
        const tempBase = 28 + Math.cos(index * 0.3) * 4 + Math.random() * 3; // 25-35°C range  
        const volumeBase = 300 + index * 20 + Math.random() * 100; // Increasing volume along road
        
        // Vary criticality realistically along the road
        const criticalityOptions = ['baja', 'media', 'alta'];
        let criticalityIndex;
        if (index < 5) criticalityIndex = 0; // First segments usually low risk
        else if (index > 15) criticalityIndex = 2; // End segments higher risk
        else criticalityIndex = Math.floor(Math.random() * 3); // Middle segments random
        
        return {
            ...segment,
            date: selectedDate,
            variables: {
                rain_mm: Math.round((rainBase + dateVariation * 1.5) * 10) / 10,
                temperature_c: Math.round((tempBase + dateVariation) * 10) / 10,
                oil_volume_lt: Math.round(volumeBase + (dateVariation * 15))
            },
            target: {
                criticidad: criticalityOptions[(criticalityIndex + dateVariation) % 3]
            }
        };
    });
}

async function generatePredictiveData(selectedDate) {
    console.log("Generating predictive (forecast) data");
    const baseSegments = await getBaseSegments();
    const dateVariation = new Date(selectedDate).getDate() % 5;
    
    // Predictive data represents forecasted conditions (usually more uncertain/variable)
    return baseSegments.map((segment, index) => {
        // Generate more variable predictions along the road
        const rainBase = 12 + Math.sin(index * 0.4) * 10 + Math.random() * 8; // Higher variability
        const tempBase = 30 + Math.cos(index * 0.2) * 5 + Math.random() * 4; // More temperature variation
        const volumeBase = 350 + index * 25 + Math.random() * 150; // Higher traffic predictions
        
        // More conservative (higher risk) predictions
        const criticalityOptions = ['baja', 'media', 'alta'];
        let criticalityIndex;
        if (index < 3) criticalityIndex = 1; // Start with medium risk
        else if (index > 17) criticalityIndex = 2; // End segments high risk
        else criticalityIndex = Math.floor(Math.random() * 3) + 0.5; // Slightly higher risk tendency
        
        // Ensure index is within bounds
        criticalityIndex = Math.min(2, Math.floor(criticalityIndex));
        
        return {
            ...segment,
            date: selectedDate,
            variables: {
                rain_mm: Math.round((rainBase + dateVariation * 2.5) * 10) / 10,
                temperature_c: Math.round((tempBase + dateVariation * 1.5) * 10) / 10,
                oil_volume_lt: Math.round(volumeBase + (dateVariation * 25))
            },
            target: {
                criticidad: criticalityOptions[(criticalityIndex + dateVariation) % 3]
            }
        };
    });
}

// --- Time Series Data Generation ---
export function generateMetricTimeSeriesData(segment, metric) {
    const dates = [];
    const values = [];
    const selectedDate = new Date(document.getElementById("fecha-picker").value);
    
    // Generate 7 days from selected date
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(selectedDate.getDate() + i);
        dates.push(currentDate.toLocaleDateString('es', { month: '2-digit', day: '2-digit' }));
        
        // Generate realistic values based on metric type
        values.push(generateMetricValue(segment, metric, i));
    }
    
    return { dates, values };
}

function generateMetricValue(segment, metric, dayOffset) {
    const baseValues = {
        rain: segment.variables.rain_mm,
        temperature: segment.variables.temperature_c,
        oil_volume: segment.variables.oil_volume_lt,
        criticality: segment.target.criticidad === 'alta' ? 3 : segment.target.criticidad === 'media' ? 2 : 1
    };
    
    const baseValue = baseValues[metric];
    
    // Add realistic variation based on metric type and time
    let variation = 0;
    switch (metric) {
        case 'rain':
            variation = (Math.random() - 0.5) * baseValue * 0.6; // Rain varies a lot
            break;
        case 'temperature':
            variation = (Math.random() - 0.5) * 8 + Math.sin(dayOffset * 0.5) * 3; // Daily temp cycles
            break;
        case 'oil_volume':
            variation = (Math.random() - 0.5) * baseValue * 0.3; // Traffic varies moderately
            break;
        case 'criticality':
            // Criticality trends based on other factors
            variation = (Math.random() - 0.5) * 0.8;
            break;
    }
    
    const newValue = baseValue + variation;
    
    // Ensure reasonable bounds
    if (metric === 'criticality') {
        return Math.max(1, Math.min(3, newValue));
    } else if (metric === 'rain') {
        return Math.max(0, newValue);
    } else {
        return newValue;
    }
}