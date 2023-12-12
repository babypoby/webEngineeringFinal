import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-search'
import 'leaflet-search/dist/leaflet-search.src.css'
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
      iconUrl: '/icons' + '/icon-blue.png',
      iconSize: [100, 100], // Set the size of your custom marker
      iconAnchor: [50, 50], // Adjust the anchor point if needed
      popupAnchor: [0, -20], // Adjust the popup anchor if needed
    });
    const customMarkerOrange = L.icon({
      iconUrl: '/icons' + '/icon-orange.png',
      iconSize: [100, 100], // Set the size of your custom marker
      iconAnchor: [50, 50], // Adjust the anchor point if needed
      popupAnchor: [0, -20], // Adjust the popup anchor if needed
    });



    const train_stations = L.layerGroup();
    const parking_spaces = L.geoJSON();
    // Load GeoJSON data from the file
    fetch("http://localhost:8000/api/data/trainstations")
    .then((response) => response.json())
    .then((geojson) => {
      geojson.features.map(point => {
        const singleMarker = L.marker([point.geometry.coordinates[0],point.geometry.coordinates[1]], {icon: customMarkerBlue})
        const desc = JSON
        .stringify(point.properties, null, "\t")
        .replaceAll(
            "],\n\t\"",
            "],\n\n\t\""
        );
        const popup = singleMarker.bindPopup(desc).openPopup()
        popup.addTo(train_stations)
      });
    })

    fetch("http://localhost:8000/api/data/parkingspaces")
      .then((response) => response.json())
      .then((geojson) => {
        // Use L.geoJSON to add the GeoJSON data to the layer group
        const groups = groupByAddress(geojson.features);

        Object.values(groups).forEach(group => {
          const coordinates = group[0].geometry.coordinates;
          const properties = group[0].properties;
          const count = group.length;

          const singleMarker = L.marker([coordinates[1], coordinates[0]], { icon: customMarkerOrange, title: properties.adresse });

          // Create popup content with information from properties
          const desc = `
            <strong>Address:</strong> ${properties.adresse}<br>
            <strong>Type:</strong> ${properties.art}<br>
            <strong>Number of spaces:</strong> ${count}<br>
            <strong>Fee Required:</strong> ${properties.gebpflicht === '1' ? 'Yes' : 'No'}<br>
          `;

          const popup = singleMarker.bindPopup(desc).openPopup()
          popup.addTo(parking_spaces);
          parking_spaces.addLayer(popup);
        });

      })





    const baseMaps = {
      'Google Street': googleStreets,
      'Google Satellite': googleSat,
    };
    const overlayMaps = {
      "Train stations": train_stations,
      "Parking spaces": parking_spaces
    }

    parking_spaces.addTo(map);

    const controlSearch = new (L.Control as any).Search({ 
      position: 'topright', 
      layer: parking_spaces, 
      initial: false,
      zoom: 12, 
      propertyName: 'adresse'});
    map.addControl(controlSearch);

  }, []);

  function groupByAddress(features: any[]) {
    const groups: { [key: string]: any[] } = {};
    features.forEach((feature: any) => {
      const address = feature.properties.adresse;
      if (!groups[address]) {
        groups[address] = [feature];
      }
      groups[address].push(feature);
    });
    return groups;
  }



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
