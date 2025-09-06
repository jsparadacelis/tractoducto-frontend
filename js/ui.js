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
    const segmentTitle = document.querySelector('.segment-info h3');
    const dataType = getDataTypeLabel(segment.date);
    
    // Update header to show segment ID on the right
    segmentTitle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>Información del Segmento</span>
            <span style="font-size: 12px; font-weight: 500; color: #6b7280; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${segment.segment_id}</span>
        </div>
    `;
    
    infoContent.innerHTML = `
        <div class="info-item">
            <div class="info-content-item">
                <span class="info-name">📊 Tipo de datos</span>
                <span class="info-value">${dataType}</span>
            </div>
        </div>
        <div class="info-item">
            <div class="info-content-item">
                <span class="info-name">📅 Fecha</span>
                <span class="info-value">${segment.date}</span>
            </div>
        </div>
        <div class="info-item criticality-${segment.target.criticidad === 'alta' ? 'high' : segment.target.criticidad === 'media' ? 'medium' : 'low'}">
            <div class="info-content-item">
                <span class="info-name">⚠️ Criticidad</span>
                <span class="info-value">${segment.target.criticidad.toUpperCase()}</span>
            </div>
        </div>
        <div class="info-item">
            <div class="info-content-item">
                <span class="info-name">🌧️ Lluvia</span>
                <span class="info-value">${segment.variables.rain_mm.toFixed(1)} mm</span>
            </div>
        </div>
    `;
}

export function clearSegmentInfo() {
    const infoContent = document.querySelector('.info-content');
    const segmentTitle = document.querySelector('.segment-info h3');
    
    // Reset header to original state
    segmentTitle.innerHTML = 'Información del Segmento';
    
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
            <span class="metric-name">🌧️ Lluvia</span>
        </li>
        <li class="metric-item" data-metric="oil_volume" data-unit="L">
            <span class="metric-name">🛢️ Galones crudo</span>
        </li>
        <li class="metric-item" data-metric="criticality" data-unit="">
            <span class="metric-name">⚠️ Criticidad promedio</span>
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