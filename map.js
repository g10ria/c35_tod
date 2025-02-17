// create the map
var map = new maplibregl.Map({
    container: 'map',
    center: [-71.10014318424898, 42.38773236718748], // starting position [lng, lat]
    zoom: 13, // starting zoom
    maxZoom: 16,
    minZoom: 13,
    // maxBounds: bounds,
    style: 'https://api.maptiler.com/maps/streets/style.json?key=f3eW7cW24ywUKjVzsqdN', // stylesheet location
});


var yearinput = 2020
var rangeInput = document.getElementById("yearinput");
rangeInput.addEventListener("input", function() {
    console.log("yo")
    document.getElementById("yearoutput").textContent = rangeInput.value;
    yearinput = rangeInput.value
    filterAndDrawDevs()
}, false);

// disable rotation navigations
// map.scrollZoom.disable();
map.dragRotate.disable();
map.keyboard.disable();
map.touchZoomRotate.disableRotation();

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
})
.catch(error => console.error('Error reading JSON:', error));

var somerville_developments = []

fetch('data/somerville_developments.json')
.then(response => response.json())
.then(data => {
    somerville_developments = data
    filterAndDrawDevs()
})

function filterAndDrawDevs() {
    let relevant_devs = []
    let max_parking_amount = 0
    for (let i=0;i<somerville_developments.length;i++) {
        const dev = somerville_developments[i]
        if (dev.status == "completed") {
            if (dev.year_compl == yearinput) relevant_devs.push(dev)

            // if (dev.onsitepark && dev.onsitepark > max_parking_amount) max_parking_amount = dev.onsitepark 

            // if (dev.year_compl >= 2016 && dev.year_compl <= 2025) {
            // } else if (dev.year_compl >= 2005 && dev.year_compl <= 2015) {
            // }
        }
    }
    console.log(max_parking_amount)
    drawDevs(relevant_devs)
}

// fetch("data/mbta_bus_network_2024.geojson")
// .then(response => response.json())
// .then(data => {
//     map.on('load', () => {
//         map.addSource("network", {
//             type: "geojson",
//             data: data
//         })

//         map.addLayer({
//             'id': 'network',
//             'type': 'line',
//             'source': 'network',
//             'layout': {
//                 'line-join': 'round',
//                 'line-cap': 'round'
//             },
//             'paint': {
//                 'line-color': '#fcba03',
//                 'line-width': 25,
//                 'line-opacity': 0.13
//             }
//         })
//     })
// })

fetch("data/somerville_border.geojson")
.then(response => response.json())
.then(data => {
    map.on('load', () => {
        map.addSource("border", {
            type: "geojson",
            data: data
        })

        map.addLayer({
            'id': 'border',
            'type': 'line',
            'source': 'border',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#000',
                'line-width': 3
            }
        })
    })
})

// returns a sum with checking for falsey/empty strings
function sum(sing, smmult, lgmult) {
    let sum = 0
    sum += sing ? sing : 0
    sum += smmult ? smmult : 0
    sum += lgmult ? lgmult : 0
    return sum
}

function drawDevs(devs) {
    let circles = []
    const options = {
        steps: 64,
        units: "miles"
    }
    // max num units = 500
    for (let i=0;i<devs.length;i++) {
        const dev = devs[i]

        // circle size proportional to # units added
        let num_units = sum(dev.singfamhu, dev.smmultifam,dev.lgmultifam)
        let radius = 0.01 + num_units / 500 * .1
        circles.push(turf.circle([dev.longitude, dev.latitude], radius, options))

        // circle size proportional to # parking spots added
        // if (dev.onsitepark) {
        //     let radius = 0.01 + dev.onsitepark / 2000 * .1
        //     circles.push(turf.circle([dev.longitude, dev.latitude], radius, options))
        // }
    }

    if (map.loaded()) {
        map.removeLayer("devs-fill")
        map.removeLayer("devs-outline")
        map.removeSource("devs")

        map.addSource(`devs`, {
            type: "geojson",
            data: {
                'type': 'FeatureCollection',
                'features': circles
            }
        });
        map.addLayer({
            id: 'devs-fill',
            type: 'fill',
            source: 'devs',
            paint: {
                'fill-color': '#097969',
                'fill-opacity': 0.5
            }
        });
        map.addLayer({
            id: `devs-outline`,
            type: 'line',
            source: `devs`,
            paint: {
                'line-color': '#097969',
                'line-width': 2
            }
        });
    } else {
        map.on('load', () => {
            map.addSource(`devs`, {
                type: "geojson",
                data: {
                    'type': 'FeatureCollection',
                    'features': circles
                }
            });
            map.addLayer({
                id: 'devs-fill',
                type: 'fill',
                source: 'devs',
                paint: {
                    'fill-color': '#097969',
                    'fill-opacity': 0.5
                }
            });
            map.addLayer({
                id: `devs-outline`,
                type: 'line',
                source: `devs`,
                paint: {
                    'line-color': '#097969',
                    'line-width': 2
                }
            });
        });
    }
}

// function drawStops(stops) {
//     let circles = []
//     const radius = 0.1;
//     const options = {
//         steps: 20,
//         units: 'miles'
//     };
//     for (let i=0;i<stops.length;i++) {
//         circles.push(turf.circle([stops[i].stop_lon, stops[i].stop_lat], radius, options))
//     }
//     map.on('load', () => {
//         map.addSource(`stops`, {
//             type: "geojson",
//             data: {
//                 'type': 'FeatureCollection',
//                 'features': circles
//             }
//         });
//         map.addLayer({
//             id: `stops-outline`,
//             type: 'line',
//             source: `stops`,
//             paint: {
//                 'line-color': '#0094ff',
//                 'line-width': 2
//             }
//         });
//     });
// }