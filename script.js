// --- Global Variables ---
let map;
let currentMode = 'descriptive';
let roadSegments = [];

// --- Environment Variables ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SEGMENT_API_ENDPOINT = import.meta.env.VITE_SEGMENT_API_ENDPOINT;

// --- Mode Detection Logic ---
function determineModeFromDate(selectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    if (selectedDate <= today) {
        return 'descriptive'; // Past or today = descriptive
    } else {
        return 'predictive'; // Future = predictive
    }
}

// --- Flatpickr ---
flatpickr("#fecha-picker", {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    locale: "es",
    onChange: function(selectedDates, dateStr, instance) {
        // Automatically determine mode based on selected date
        const selectedDate = selectedDates[0];
        const detectedMode = determineModeFromDate(selectedDate);
        
        setMode(detectedMode);
        loadSegmentData();
    }
});

// --- Mode Display (automatic labels) ---
function setMode(mode) {
    currentMode = mode;
    
    // Update label styles and text
    const descriptiveLabel = document.getElementById('descriptive-label');
    const predictiveLabel = document.getElementById('predictive-label');
    
    // Remove active class from both
    descriptiveLabel.classList.remove('active');
    predictiveLabel.classList.remove('active');
    
    // Add active class to current mode
    if (mode === 'descriptive') {
        descriptiveLabel.classList.add('active');
        descriptiveLabel.innerHTML = '📊 Descriptivo';
        predictiveLabel.innerHTML = '🔮 Predictivo';
    } else {
        predictiveLabel.classList.add('active');
        descriptiveLabel.innerHTML = '📊 Descriptivo';
        predictiveLabel.innerHTML = '🔮 Predictivo';
    }
}

// --- Google Maps Initialization ---
function loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 3.746525, lng: -71.863551 },
        zoom: 14,
    });
    
    // Load initial data
    loadSegmentData();
}

// Make initMap globally available for the Google Maps callback
window.initMap = initMap;

// --- API Integration ---
async function loadSegmentData() {
    try {
        const selectedDate = document.getElementById("fecha-picker").value;
        console.log(`Loading ${currentMode} data for date: ${selectedDate}`);
        
        // Clear segment info when loading new data
        clearSegmentInfo();
        
        // Route to appropriate mode handler
        if (currentMode === 'descriptive') {
            await loadDescriptiveData(selectedDate);
        } else {
            await loadPredictiveData(selectedDate);
        }
        
    } catch (error) {
        console.error("Error loading segment data:", error);
        alert("Error cargando datos: " + error.message);
    }
}

// --- Descriptive Mode ---
async function loadDescriptiveData(selectedDate) {
    console.log("Loading descriptive (current) road conditions");
    
    // API call for descriptive data
    const apiUrl = `${SEGMENT_API_ENDPOINT}/descriptive?date=${selectedDate}`;
    
    // TODO: Replace with actual API call
    // const response = await fetch(apiUrl);
    // const data = await response.json();
    // displaySegments(data);
    
    // For now, using mock descriptive data
    const descriptiveData = generateDescriptiveData(selectedDate);
    displaySegments(descriptiveData);
}

// --- Predictive Mode ---
async function loadPredictiveData(selectedDate) {
    console.log("Loading predictive (forecast) road conditions");
    
    // API call for predictive data
    const apiUrl = `${SEGMENT_API_ENDPOINT}/predictive?date=${selectedDate}`;
    
    // TODO: Replace with actual API call
    // const response = await fetch(apiUrl);
    // const data = await response.json();
    // displaySegments(data);
    
    // For now, using mock predictive data
    const predictiveData = generatePredictiveData(selectedDate);
    displaySegments(predictiveData);
}

function clearSegmentInfo() {
    const infoContent = document.querySelector('.info-content');
    infoContent.innerHTML = '<p>Selecciona un segmento en el mapa para ver su información</p>';
}

// --- Mock Data Generators ---
function getBaseSegments() {
    return [
        {
            segment_id: "1500+58",
            coordinates: [
                { lat: 3.746525, lng: -71.863551 },
                { lat: 3.750000, lng: -71.860000 }
            ]
        },
        {
            segment_id: "1500+59", 
            coordinates: [
                { lat: 3.750000, lng: -71.860000 },
                { lat: 3.753000, lng: -71.857000 }
            ]
        },
        {
            segment_id: "1500+60",
            coordinates: [
                { lat: 3.753000, lng: -71.857000 },
                { lat: 3.756000, lng: -71.854000 }
            ]
        }
    ];
}

function generateDescriptiveData(selectedDate) {
    console.log("Generating descriptive (historical/current) data");
    const baseSegments = getBaseSegments();
    const dateVariation = new Date(selectedDate).getDate() % 3;
    
    // Descriptive data represents actual observed conditions
    return baseSegments.map((segment, index) => {
        const rainValues = [15.2, 7.8, 1.9];
        const tempValues = [33, 30, 26];
        const volumeValues = [562, 423, 301];
        const criticalityPattern = ['media', 'baja', 'alta'];
        
        return {
            ...segment,
            date: selectedDate,
            variables: {
                rain_mm: rainValues[index] + (dateVariation * 1.5),
                temperature_c: tempValues[index] + dateVariation,
                oil_volume_lt: volumeValues[index] + (dateVariation * 15)
            },
            target: {
                criticidad: criticalityPattern[(index + dateVariation) % 3]
            }
        };
    });
}

function generatePredictiveData(selectedDate) {
    console.log("Generating predictive (forecast) data");
    const baseSegments = getBaseSegments();
    const dateVariation = new Date(selectedDate).getDate() % 3;
    
    // Predictive data represents forecasted conditions (usually more uncertain/variable)
    return baseSegments.map((segment, index) => {
        const rainValues = [23.7, 14.2, 6.8]; // Higher variability for predictions
        const tempValues = [37, 35, 31]; // Slightly different from descriptive
        const volumeValues = [634, 498, 367]; // Different traffic predictions
        const criticalityPattern = ['alta', 'alta', 'media']; // More conservative predictions
        
        return {
            ...segment,
            date: selectedDate,
            variables: {
                rain_mm: rainValues[index] + (dateVariation * 2.5), // More variation
                temperature_c: tempValues[index] + (dateVariation * 1.5),
                oil_volume_lt: volumeValues[index] + (dateVariation * 25)
            },
            target: {
                criticidad: criticalityPattern[(index + dateVariation) % 3]
            }
        };
    });
}

// --- Segment Display ---
function displaySegments(segmentData) {
    // Clear existing segments
    roadSegments.forEach(segment => {
        if (segment.polyline) {
            segment.polyline.setMap(null);
        }
    });
    roadSegments = [];

    // Create new segments
    segmentData.forEach(segment => {
        const color = getCriticalityColor(segment.target.criticidad);
        
        const polyline = new google.maps.Polyline({
            path: segment.coordinates,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 8,
            map: map
        });

        // Add click listener
        polyline.addListener("click", () => {
            showSegmentInfo(segment);
        });

        roadSegments.push({
            ...segment,
            polyline: polyline
        });
    });
}

function getCriticalityColor(criticality) {
    const colors = {
        'alta': '#dc2626',    // Red
        'media': '#f59e0b',   // Orange  
        'baja': '#16a34a'     // Green
    };
    return colors[criticality] || '#000000';
}

function getDataTypeLabel(dateString) {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        return 'Histórico';
    } else if (selectedDate.getTime() === today.getTime()) {
        return 'Actual';
    } else {
        return 'Predicción';
    }
}

function showSegmentInfo(segment) {
    const infoContent = document.querySelector('.info-content');
    const dataType = getDataTypeLabel(segment.date);
    
    infoContent.innerHTML = `
        <div class="variable-item">
            <strong>Tipo de datos:</strong> ${dataType}
        </div>
        <div class="variable-item">
            <strong>Segmento:</strong> ${segment.segment_id}
        </div>
        <div class="variable-item">
            <strong>Fecha:</strong> ${segment.date}
        </div>
        <div class="variable-item criticality-${segment.target.criticidad === 'alta' ? 'high' : segment.target.criticidad === 'media' ? 'medium' : 'low'}">
            <strong>Criticidad:</strong> ${segment.target.criticidad.toUpperCase()}
        </div>
        <div class="variable-item">
            <strong>Lluvia:</strong> ${segment.variables.rain_mm.toFixed(1)} mm
        </div>
        <div class="variable-item">
            <strong>Temperatura:</strong> ${segment.variables.temperature_c.toFixed(1)}°C
        </div>
        <div class="variable-item">
            <strong>Volumen de aceite:</strong> ${segment.variables.oil_volume_lt} L
        </div>
    `;
}

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMaps();
});
