// --- Charts Module ---
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

let currentChart = null; // Store chart instance

// --- Main Chart Function ---
export function drawChart(chartData) {
    const { 
        data, 
        labels, 
        metric, 
        unit, 
        segmentId, 
        chartType = 'line',
        title 
    } = chartData;
    
    const canvas = document.getElementById('metric-chart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Get metric configuration
    const metricConfig = getMetricConfig(metric);
    
    // Create chart configuration
    const chartConfig = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: `${metricConfig.name} (${unit})`,
                data: data,
                backgroundColor: chartType === 'line' 
                    ? metricConfig.color + '20' 
                    : metricConfig.color,
                borderColor: metricConfig.color,
                borderWidth: chartType === 'line' ? 3 : 1,
                fill: chartType === 'line',
                tension: chartType === 'line' ? 0.4 : 0,
                pointBackgroundColor: chartType === 'line' ? metricConfig.color : undefined,
                pointBorderColor: chartType === 'line' ? '#fff' : undefined,
                pointBorderWidth: chartType === 'line' ? 2 : undefined,
                pointRadius: chartType === 'line' ? 5 : undefined,
                pointHoverRadius: chartType === 'line' ? 7 : undefined,
                borderRadius: chartType === 'bar' ? 4 : undefined,
                borderSkipped: chartType === 'bar' ? false : undefined,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title || `${metricConfig.name} - Segmento ${segmentId}`,
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
                        },
                        maxTicksLimit: chartType === 'bar' ? 8 : undefined
                    }
                }
            }
        }
    };
    
    // Create the chart
    currentChart = new Chart(ctx, chartConfig);
}

// --- Metric Chart Function ---
export function drawMetricChart(segment, metric, unit, apiData = null) {
    // Use API data if provided, otherwise generate mock data
    const chartData = apiData || generateMockTimeSeriesData(segment, metric);
    
    drawChart({
        data: chartData.values,
        labels: chartData.dates,
        metric: metric,
        unit: unit,
        segmentId: segment.segment_id,
        chartType: 'line',
        title: `${getMetricConfig(metric).name} - Segmento ${segment.segment_id} (7 días)`
    });
}

// --- Metric Configuration ---
function getMetricConfig(metric) {
    const configs = {
        rain: { name: 'Lluvia', color: '#3b82f6' },
        temperature: { name: 'Temperatura', color: '#ef4444' },
        oil_volume: { name: 'Galones Crudo', color: '#8b5cf6' },
        criticality: { name: 'Criticidad', color: '#f59e0b' }
    };
    return configs[metric] || { name: 'Métrica', color: '#6b7280' };
}

// --- Mock Data Generation (for development) ---
function generateMockTimeSeriesData(segment, metric) {
    const dates = [];
    const values = [];
    const selectedDate = new Date(document.getElementById("fecha-picker").value);
    
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(selectedDate.getDate() + i);
        dates.push(currentDate.toLocaleDateString('es', { month: '2-digit', day: '2-digit' }));
        
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
    
    let variation = 0;
    switch (metric) {
        case 'rain':
            variation = (Math.random() - 0.5) * baseValue * 0.6;
            break;
        case 'temperature':
            variation = (Math.random() - 0.5) * 8 + Math.sin(dayOffset * 0.5) * 3;
            break;
        case 'oil_volume':
            variation = (Math.random() - 0.5) * baseValue * 0.3;
            break;
        case 'criticality':
            variation = (Math.random() - 0.5) * 0.8;
            break;
    }
    
    const newValue = baseValue + variation;
    
    if (metric === 'criticality') {
        return Math.max(1, Math.min(3, newValue));
    } else if (metric === 'rain') {
        return Math.max(0, newValue);
    } else {
        return newValue;
    }
}