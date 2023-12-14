
import React, { useEffect, useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L, { Layer } from 'leaflet';



const App = () => {
  /* Use the react state hook for initializing a responsive list of coordinates,information tuples */
  const [traincoordinates, setTrainCoordinates] = useState([]);
  const [parkingcoordinates, setParkingCoordinates] = useState([]);
  /* Query the backend on mount to load the data into the state */
  useEffect(() => {
    console.log("Effect is running");
    fetch("http://localhost:8000/api/data/trainstations")
      .then((response) => response.json())
      .then((geojson) => {
        const formattedCoordinates = geojson.features.map(x => ({
          coordinates: x.geometry.coordinates, 
          properties: x.properties
        }));
        setTrainCoordinates(formattedCoordinates);
      })
      .catch(error => console.error('Error fetching data: ', error));

      fetch("http://localhost:8000/api/data/parkingspaces")
      .then((response) => response.json())
      .then((geojson) => {
        const formattedCoordinates = geojson.features.map(x => ({
          coordinates: x.geometry.coordinates, 
          properties: x.properties
        }));
        setParkingCoordinates(formattedCoordinates);
      })
      .catch(error => console.error('Error fetching data: ', error));

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



  return( 
    <div>
      <MapContainer center={[47.36667, 8.55]} zoom={13} scrollWheelZoom={false} className='mapContainer'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position = "topright">
        <LayersControl.Overlay name = "Trainstations">
        {traincoordinates.map((item, index) => (
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
        </LayersControl.Overlay>
        <LayersControl.Overlay name = "Parkingspaces">
        {parkingcoordinates.map((item, index) => (
          <Marker key={index} position={item.coordinates.reverse()} icon={L.icon({iconUrl: "/icons/icon-orange.png",
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
        </LayersControl.Overlay>

      
      </LayersControl>
      
    </MapContainer>

    </div>
  );

};

export default App;
