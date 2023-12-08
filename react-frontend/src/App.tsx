import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';


const Map = () => {
  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView([47.36667, 8.55], 13);

    const googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });
    googleStreets.addTo(map);

    const googleSat = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });
    const customMarkerBlue = L.icon({
      iconUrl: process.env.PUBLIC_URL + '/marker-icon-blue.png',
      iconSize: [100, 100], // Set the size of your custom marker
      iconAnchor: [50, 50], // Adjust the anchor point if needed
      popupAnchor: [0, -20], // Adjust the popup anchor if needed
    });
    const customMarkerOrange = L.icon({
      iconUrl: process.env.PUBLIC_URL + '/marker-icon-orange.png',
      iconSize: [10, 10], // Set the size of your custom marker
      iconAnchor: [50, 50], // Adjust the anchor point if needed
      popupAnchor: [0, -20], // Adjust the popup anchor if needed
    });

    const singleMarker = L.marker([47.3642485188943,8.530827162960605], {icon: customMarkerBlue})
    const popup = singleMarker.bindPopup('This is Zurich center').openPopup()
    popup.addTo(map)

    const geojsonLayer = L.layerGroup();
    // Load GeoJSON data from the file
    fetch("http://localhost:8000/api/data")
      .then((response) => response.json())
      .then((geojson) => {
        // Use L.geoJSON to add the GeoJSON data to the layer group
        geojson.features.map(point => {
          const singleMarker = L.marker([point.geometry.coordinates[0],point.geometry.coordinates[1]], {icon: customMarkerBlue})
          const desc = JSON
          .stringify(point.properties, null, "\t")
          .replaceAll(
              "],\n\t\"",
              "],\n\n\t\""
          );


          const popup = singleMarker.bindPopup(desc).openPopup()
          popup.addTo(map)
        });
      })

    const baseMaps = {
      'Google Street': googleStreets,
      'Google Satellite': googleSat,
    };
    const overlayMaps = {
      "Marker": singleMarker,
      "sample geoJSON": geojsonLayer
    }

    L.control.layers(baseMaps, overlayMaps).addTo(map)
  }, []);


  return <div id="map" style={{ height: '100vh' }}></div>;
};

const App = () => {
  return (
    <div>
      <Map />
    </div>
  );
};

export default App;
