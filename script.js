// --- Imports ---
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// --- Global Variables ---
let map;
let currentMode = 'descriptive';
let roadSegments = [];
let rainfallChart = null; // Store chart instance

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
    
    // Hide analytics section when no segment is selected
    hideSegmentAnalytics();
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
    
    // Show analytics section with segment data
    showSegmentAnalytics(segment);
}

// --- Segment Analytics ---
function showSegmentAnalytics(segment) {
    const analyticsSection = document.querySelector('.analytics-section');
    analyticsSection.style.display = 'flex';
    
    // Update metrics panel with segment data
    updateMetricsPanel(segment);
    
    // Update chart with segment's historical data
    drawSegmentRainfallChart(segment);
}

function hideSegmentAnalytics() {
    const analyticsSection = document.querySelector('.analytics-section');
    analyticsSection.style.display = 'none';
}

function updateMetricsPanel(segment) {
    const metricsList = document.querySelector('.metrics-list');
    metricsList.innerHTML = `
        <li class="metric-item" data-metric="rain" data-value="${segment.variables.rain_mm}" data-unit="mm">
            - Lluvia: ${segment.variables.rain_mm.toFixed(1)} mm
        </li>
        <li class="metric-item" data-metric="temperature" data-value="${segment.variables.temperature_c}" data-unit="°C">
            - Temperatura: ${segment.variables.temperature_c.toFixed(1)}°C
        </li>
        <li class="metric-item" data-metric="oil_volume" data-value="${segment.variables.oil_volume_lt}" data-unit="L">
            - Galones crudo: ${segment.variables.oil_volume_lt} L
        </li>
        <li class="metric-item" data-metric="criticality" data-value="${segment.target.criticidad}" data-unit="">
            - Criticidad promedio: ${segment.target.criticidad.toUpperCase()}
        </li>
    `;
    
    // Add click listeners to metric items
    addMetricClickListeners(segment);
}

function addMetricClickListeners(segment) {
    const metricItems = document.querySelectorAll('.metric-item');
    
    metricItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            metricItems.forEach(i => i.classList.remove('metric-active'));
            
            // Add active class to clicked item
            item.classList.add('metric-active');
            
            // Get metric data
            const metric = item.dataset.metric;
            const unit = item.dataset.unit;
            
            // Draw time-series chart for this metric
            drawMetricTimeSeriesChart(segment, metric, unit);
        });
    });
}

// --- Rainfall Chart with Chart.js ---
function drawSegmentRainfallChart(segment) {
    const canvas = document.getElementById('rainfall-chart');
    const ctx = canvas.getContext('2d');
    
    // Generate historical data for this segment (mock data)
    const data = generateSegmentHistoricalData(segment);
    
    // Destroy existing chart if it exists
    if (rainfallChart) {
        rainfallChart.destroy();
    }
    
    // Create new Chart.js chart
    rainfallChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'Lluvia (mm)',
                data: data.rainfall,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Lluvia diaria - Segmento ${segment.segment_id}`,
                    font: {
                        size: 16,
                        weight: '600'
                    },
                    color: '#374151'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 8 // Limit labels to avoid crowding
                    }
                }
            },
            elements: {
                bar: {
                    backgroundColor: '#3b82f6'
                }
            }
        }
    });
}

function generateSegmentHistoricalData(segment) {
    // Mock historical data generation based on segment
    const dates = [];
    const rainfall = [];
    const baseValue = segment.variables.rain_mm;
    
    for (let i = 14; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('es', { month: '2-digit', day: '2-digit' }));
        
        // Generate varied rainfall data around the segment's current value
        const variation = (Math.random() - 0.5) * 10;
        rainfall.push(Math.max(0, baseValue + variation));
    }
    
    return { dates, rainfall };
}

// --- Time-Series Chart for Selected Metric ---
function drawMetricTimeSeriesChart(segment, metric, unit) {
    const canvas = document.getElementById('rainfall-chart');
    const ctx = canvas.getContext('2d');
    
    // Generate 7-day time series data for the selected metric
    const timeSeriesData = generateMetricTimeSeriesData(segment, metric);
    
    // Destroy existing chart if it exists
    if (rainfallChart) {
        rainfallChart.destroy();
    }
    
    // Get metric display name and color
    const metricConfig = getMetricConfig(metric);
    
    // Create new time-series chart
    rainfallChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeSeriesData.dates,
            datasets: [{
                label: `${metricConfig.name} (${unit})`,
                data: timeSeriesData.values,
                backgroundColor: metricConfig.color + '20', // Semi-transparent
                borderColor: metricConfig.color,
                borderWidth: 3,
                fill: true,
                tension: 0.4, // Smooth curves
                pointBackgroundColor: metricConfig.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${metricConfig.name} - Segmento ${segment.segment_id} (7 días)`,
                    font: {
                        size: 16,
                        weight: '600'
                    },
                    color: '#374151'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: metric === 'rain' || metric === 'oil_volume',
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function getMetricConfig(metric) {
    const configs = {
        rain: { name: 'Lluvia', color: '#3b82f6' },
        temperature: { name: 'Temperatura', color: '#ef4444' },
        oil_volume: { name: 'Galones Crudo', color: '#8b5cf6' },
        criticality: { name: 'Criticidad', color: '#f59e0b' }
    };
    return configs[metric] || { name: 'Métrica', color: '#6b7280' };
}

function generateMetricTimeSeriesData(segment, metric) {
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

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMaps();
    // Hide analytics section initially - only show when segment is selected
    hideSegmentAnalytics();
});
