import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Map initialization
    const map = L.map('map').setView([47.36667, 8.55], 13);

    /*==================================================
                        TILE LAYER
    ====================================================*/

    // Google street
    const googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });
    googleStreets.addTo(map);

    // Google satellite
    const googleSat = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });

    /*==================================================
                        MARKER
    ====================================================*/

    // Marker icon (customize later)
    const myIcon = L.icon({
      iconUrl: 'my-icon.png',
      iconSize: [38, 95],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
      shadowUrl: 'my-icon-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94],
    });

    // Marker
    const singleMarker = L.marker([47.36667, 8.55], { icon: myIcon });
    const popup = singleMarker.bindPopup('This is Zurich center').openPopup();
    popup.addTo(map);

    /*==================================================
                        GEOJSON
    ====================================================*/

    // Fetch GeoJSON data from the 'data' folder
    const fetchData = async () => {
      try {
        const response = await fetch('./data/your_geojson_file.json'); // Replace 'your_geojson_file.json' with your actual file name
        const geoJsonData = await response.json();

        const pointData = L.geoJSON(geoJsonData, {
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name);
          },
        }).addTo(map);

        /*==================================================
                    LAYER CONTROL
        ====================================================*/
        const baseMaps = {
          'Google Street': googleStreets,
          'Google Satellite': googleSat,
        };

        const overlayMaps = {
          Marker: singleMarker,
          'Point Data': pointData,
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);

        /*==================================================
                        LEAFLET EVENT
        ====================================================*/

        map.on('mouseover', function () {
          console.log('Your mouse is over the map');
        });
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return <div id="map" className="leaflet-map"></div>;
};

export default App;
