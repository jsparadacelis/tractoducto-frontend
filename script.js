// --- Flatpickr ---
flatpickr("#fecha-picker", {
    dateFormat: "d/m/Y",
    defaultDate: "07/03/2025",
    locale: "es" // idioma español
});

// --- Google Maps ---
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 3.746525, lng: -71.863551 },
        zoom: 14,
    });
}

async function snapToRoads(points) {
    const path = points.map(p => `${p.lat},${p.lng}`).join("|");
    const url = `https://roads.googleapis.com/v1/snapToRoads?interpolate=true&path=${encodeURIComponent(path)}&key=`;
    const r = await fetch(url);
    const data = await r.json();
    return data.snappedPoints.map(sp => ({
        lat: sp.location.latitude,
        lng: sp.location.longitude
    }));
}

function dividePath(path, numSegments) {
    const total = path.length - 1;
    const step = total / numSegments;
    const pieces = [];
    for (let i = 0; i < numSegments; i++) {
        const startIdx = Math.round(i * step);
        const endIdx = Math.round((i + 1) * step);
        pieces.push(path.slice(startIdx, endIdx + 1));
    }
    return pieces;
}

async function generateRoute() {
    const [startLat, startLng] = document.getElementById("start").value.split(",").map(Number);
    const [endLat, endLng] = document.getElementById("end").value.split(",").map(Number);
    const numSegments = parseInt(document.getElementById("segments").value);

    // 1. Obtener ruta ajustada a carretera
    const snapped = await snapToRoads([
        { lat: startLat, lng: startLng },
        { lat: endLat, lng: endLng }
    ]);

    // 2. Dividir en segmentos
    const pieces = dividePath(snapped, numSegments);

    // 3. Pintar en mapa
    map.setCenter(snapped[0]);
    const colors = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#f59e0b"];
    pieces.forEach((segment, idx) => {
        new google.maps.Polyline({
            path: segment,
            geodesic: true,
            strokeColor: colors[idx % colors.length],
            strokeOpacity: 1.0,
            strokeWeight: 6,
            map: map
        });
    });
}

async function callMyApi() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1"); // API de prueba
        if (!response.ok) throw new Error("Error en la llamada: " + response.status);

        const data = await response.json();
        console.log("Respuesta API:", data);
        alert("Datos recibidos: " + JSON.stringify(data));
    } catch (error) {
        console.error("Error al llamar la API:", error);
        alert("Error al llamar la API: " + error.message);
    }
}

// --- Event listener del botón ---
document.getElementById("callApiBtn").addEventListener("click", () => {
    callMyApi();
});
