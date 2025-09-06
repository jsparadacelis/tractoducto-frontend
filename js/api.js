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