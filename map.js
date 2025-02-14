// create the map
var map = new maplibregl.Map({
    container: 'map',
    center: [-71.10014318424898, 42.38773236718748], // starting position [lng, lat]
    zoom: 14, // starting zoom
    maxZoom: 16,
    minZoom: 14,
    maxBounds: bounds,
    style: 'https://api.maptiler.com/maps/streets/style.json?key=f3eW7cW24ywUKjVzsqdN', // stylesheet location
});

// disable rotation navigations
map.scrollZoom.disable();
map.dragRotate.disable();
map.keyboard.disable();
map.touchZoomRotate.disableRotation();

// draw mbta stations
const radiusCenter = [-71.10014318424898, 42.38773236718748]

fetch('data/mbta_stops.json')
.then(response => response.json())
.then(data => {
    let count = 0
    let relevant_stops = []
    for (let i = 0; i < data.length; i++) {
        const stop = data[i];
        if (stop.location_type == 1 && stop.municipality == "Somerville") {
            count++
            relevant_stops.push(stop)
        }
    }
    console.log(count)
    drawStops(relevant_stops)
})
.catch(error => console.error('Error reading JSON:', error));

function drawStops(stops) {
    for (let i=0;i<stops.length;i++) {
        let stop = stops[i]
        drawStop(stop.stop_lon, stop.stop_lat, i)
    }
}

function drawStop(lng, lat, idx) {
    console.log("drawing", lng, lat)
    map.on('load', () => {
        // Generate a polygon using turf.circle
        // See https://turfjs.org/docs/#circle
        const radius = 0.1; // kilometer
        const options = {
            steps: 64,
            units: 'miles'
        };
        const circle = turf.circle([lng, lat], radius, options);
    
        // Add the circle as a GeoJSON source
        map.addSource(`stop${idx}`, {
            type: 'geojson',
            data: circle
        });
    
        // // Add a fill layer with some transparency
        // map.addLayer({
        //     id: 'location-radius',
        //     type: 'fill',
        //     source: 'location-radius',
        //     paint: {
        //         'fill-color': '#8CCFFF',
        //         'fill-opacity': 0.5
        //     }
        // });
    
        // Add a line layer to draw the circle outline
        map.addLayer({
            id: `stop${idx}-outline`,
            type: 'line',
            source: `stop${idx}`,
            paint: {
                'line-color': '#0094ff',
                'line-width': 3
            }
        });
    });
}