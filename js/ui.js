// --- UI Utilities Module ---
import { drawMetricChart } from './charts.js';

// --- Mode Detection Logic ---
export function determineModeFromDate(selectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    if (selectedDate <= today) {
        return 'descriptive'; // Past or today = descriptive
    } else {
        return 'predictive'; // Future = predictive
    }
}

export function getDataTypeLabel(dateString) {
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

// --- Mode Display (automatic labels) ---
export function setMode(mode) {
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

// --- Segment Information Display ---
export function showSegmentInfo(segment) {
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

export function clearSegmentInfo() {
    const infoContent = document.querySelector('.info-content');
    infoContent.innerHTML = '<p>Selecciona un segmento en el mapa para ver su información</p>';
}

// --- Segment Analytics ---
export function showSegmentAnalytics(segment) {
    const analyticsSection = document.querySelector('.analytics-section');
    analyticsSection.style.display = 'flex';
    
    // Update metrics panel with segment data
    updateMetricsPanel(segment);
}

export function hideSegmentAnalytics() {
    const analyticsSection = document.querySelector('.analytics-section');
    analyticsSection.style.display = 'none';
}

function updateMetricsPanel(segment) {
    const metricsList = document.querySelector('.metrics-list');
    metricsList.innerHTML = `
        <li class="metric-item" data-metric="rain" data-unit="mm">
            Lluvia
        </li>
        <li class="metric-item" data-metric="temperature" data-unit="°C">
            Temperatura
        </li>
        <li class="metric-item" data-metric="oil_volume" data-unit="L">
            Galones crudo
        </li>
        <li class="metric-item" data-metric="criticality" data-unit="">
            Criticidad promedio
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
            drawMetricChart(segment, metric, unit);
        });
    });
}