import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import StatisticsPanel from './StatisticsPanel';

const compute_statistics = (coordinates, bounds, setStatistics) => {
  if (bounds && coordinates) {
    const northEast = bounds._northEast;
    const southWest = bounds._southWest;

    const filteredCoordinates = coordinates.filter((item) => {
      const lat = item.coordinates[0];
      const lng = item.coordinates[1];

      return lat <= northEast.lat && lat >= southWest.lat && lng <= northEast.lng && lng >= southWest.lng;
    });

    setStatistics(filteredCoordinates);
  }
};

const App = () => {
  /* Use the react state hook for initializing a responsive list of coordinates,information tuples */
  const [coordinates, setCoordinates] = useState([]);

  /* State to store the current map reference */
  const map = useRef(null);

  /* State to store the current geopositional map bounds */
  const [bounds, setBounds] = useState(null);

  /* State to store the current statistics */
  const [statistics, setStatistics] = useState(null);  

  /* Logic to handle the gepositional bound state */

  // Function to update bounds
  const updateBounds = () => {
    if (map.current) {
      setBounds(map.current.getBounds());
    }
  };

  const updateBoundsRecompute = () => {
    updateBounds();
    compute_statistics(coordinates, bounds, setStatistics);
  };

  // Map Event Handler
  const MapEvents = () => {
    useMapEvents({
      moveend: updateBoundsRecompute,
      zoomend: updateBoundsRecompute,
    });
    return null;
  };


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

      updateBounds();
  }, []);


  return( 
    <div className='app-container'>
      <MapContainer center={[47.36667, 8.55]} zoom={13} scrollWheelZoom={false} className='mapContainer'
      ref={map}>
        <MapEvents />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className='tile-layer'
        />

        {coordinates.map((item, index) => (
            <Marker key={index} position={item.coordinates.reverse()} icon={L.icon({iconUrl: "/icons/icon-blue.png",
                iconSize: [100, 100],
                iconAnchor: [50, 50],
                popupAnchor: [0, -20],})}>
              <Popup>
                {
                  JSON
                  .stringify(item.properties, null, "\t")
                  .replaceAll(
                      "],\n\t\"", 
                      "],\n\n\t\""
                  )
                }
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <StatisticsPanel  statistics={statistics}/>

    </div>
  );

};

export default App;
