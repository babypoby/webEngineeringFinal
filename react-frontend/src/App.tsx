import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { pointJson } from './data/point.js'; // Import directly from the stations.js file


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
      iconUrl: process.env.PUBLIC_URL + '/marker-icon-blue.png',
      iconSize: [100, 100], // Set the size of your custom marker
      iconAnchor: [50, 50], // Adjust the anchor point if needed
      popupAnchor: [0, -20], // Adjust the popup anchor if needed
    });

    const singleMarker = L.marker([47.3642485188943,8.530827162960605], {icon: customMarkerBlue})
    const popup = singleMarker.bindPopup('This is Zurich center').openPopup()
    popup.addTo(map)

    const geojsonLayer = L.layerGroup();
    // Load GeoJSON data from the file
    fetch(process.env.PUBLIC_URL + '/data/sample.geojson')
      .then((response) => response.json())
      .then((geojson) => {
        // Create a new layer group for GeoJSON markers
        const geojsonLayer = L.layerGroup();

        // Use L.geoJSON to add the GeoJSON data to the layer group
        L.geoJSON(geojson, {
          pointToLayer: (feature, latlng) => {
            // Create a marker for each feature in the GeoJSON data
            return L.marker(latlng, { icon: customMarkerOrange });
          },
          onEachFeature: (feature, layer) => {
            // Add a popup for each feature in the GeoJSON data
            layer.bindPopup('Popup content'); // You can customize the content here
          },
        }).addTo(geojsonLayer);

        // Add the layer group to the map
        geojsonLayer.addTo(map);
      });

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
