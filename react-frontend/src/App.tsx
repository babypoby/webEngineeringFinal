import React, { useEffect, useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const App = () => {
  /* Use the react state hook for initializing a responsive list of coordinates,information tuples */
  const [coordinates, setCoordinates] = useState([]);

  /* Query the backend on mount to load the data into the state */
  useEffect(() => {
    fetch("http://localhost:8000/api/data")
      .then((response) => response.json())
      .then((geojson) => {
        const formattedCoordinates = geojson.features.map(x => ({
          coordinates: x.geometry.coordinates, 
          properties: x.properties
        }));
        setCoordinates(formattedCoordinates);
      })
      .catch(error => console.error('Error fetching data: ', error));
  }, []);


  return( 
    <div>
      <MapContainer center={[47.36667, 8.55]} zoom={13} scrollWheelZoom={false} className='mapContainer'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {coordinates.map((item, index) => (
          <Marker key={index} position={item.coordinates.reverse()} icon={L.icon({iconUrl: "/icons/icon-blue.png",
              iconSize: [100, 100],
              iconAnchor: [50, 50],
              popupAnchor: [0, -20],})}>
            <Popup>
              {item.properties.name || 'No Name'}
            </Popup>
          </Marker>
        ))}
    </MapContainer>

    </div>
  );

};

export default App;
