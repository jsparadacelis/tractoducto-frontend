// --- Main Application Script ---
// Import all modules
import { loadGoogleMaps, displaySegments } from './js/maps.js';
import { loadDescriptiveData, loadPredictiveData } from './js/api.js';
import { drawMetricChart } from './js/charts.js';
import { 
    determineModeFromDate, 
    setMode, 
    showSegmentInfo, 
    clearSegmentInfo, 
    showSegmentAnalytics, 
    hideSegmentAnalytics 
} from './js/ui.js';

// --- Global State ---
let currentMode = 'descriptive';

// --- Flatpickr Initialization ---
flatpickr("#fecha-picker", {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    locale: "es",
    onChange: function(selectedDates, dateStr, instance) {
        // Automatically determine mode based on selected date
        const selectedDate = selectedDates[0];
        const detectedMode = determineModeFromDate(selectedDate);
        
        setMode(detectedMode);
        currentMode = detectedMode;
        loadSegmentData();
    }
});

// --- Main Data Loading Function ---
async function loadSegmentData() {
    try {
        const selectedDate = document.getElementById("fecha-picker").value;
        console.log(`Loading ${currentMode} data for date: ${selectedDate}`);
        
        // Clear segment info when loading new data
        clearSegmentInfo();
        hideSegmentAnalytics();
        
        // Route to appropriate mode handler
        let segmentData;
        if (currentMode === 'descriptive') {
            segmentData = await loadDescriptiveData(selectedDate);
        } else {
            segmentData = await loadPredictiveData(selectedDate);
        }
        
        // Display segments on map with click handler
        displaySegments(segmentData, onSegmentClick);
        
    } catch (error) {
        console.error("Error loading segment data:", error);
        alert("Error cargando datos: " + error.message);
    }
}

// --- Segment Click Handler ---
function onSegmentClick(segment) {
    // Show segment information in side panel
    showSegmentInfo(segment);
    
    // Show analytics section with segment data
    showSegmentAnalytics(segment);
    
    // Draw default rain chart
    drawMetricChart(segment, 'rain', 'mm');
}

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Google Maps
    loadGoogleMaps();
    
    // Hide analytics section initially - only show when segment is selected
    hideSegmentAnalytics();
});