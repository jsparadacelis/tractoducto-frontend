// --- Google Maps Module ---

let map;
let roadSegments = [];

// --- Environment Variables ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// --- Google Maps Initialization ---
export function loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

export function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 3.746525, lng: -71.863551 },
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    
    // Enable labels on satellite view
    map.setOptions({
        mapTypeControlOptions: {
            mapTypeIds: ['satellite', 'hybrid']
        }
    });
    
    // Set to hybrid mode (satellite with labels)
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
}

// Make initMap globally available for the Google Maps callback
window.initMap = initMap;

// --- Segment Display ---
export function displaySegments(segmentData, onSegmentClick) {
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
            onSegmentClick(segment);
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