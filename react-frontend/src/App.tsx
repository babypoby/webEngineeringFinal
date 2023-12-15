import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import L, { Layer } from 'leaflet';
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
  const [traincoordinates, setTrainCoordinates] = useState([]);
  const [parkingcoordinates, setParkingCoordinates] = useState([]);
  const [activeLayer, setActiveLayer] = useState(null);

  /* State to store the current map reference */
  const mapRef = useRef(null);

  /* State to store the current geopositional map bounds */
  const [bounds, setBounds] = useState(null);

  /* State to store the current statistics */
  const [statistics, setStatistics] = useState(null);  

  /* Logic to handle the gepositional bound state */

  // Function to update bounds
  const updateBounds = () => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds());
    }
  };

  const updateBoundsRecompute = () => {
    updateBounds();
    compute_statistics(activeLayer, bounds, setStatistics);
  };

  // Map Event Handler
  const MapEvents = () => {
    useMapEvents({
      moveend: updateBoundsRecompute,
      zoomend: updateBoundsRecompute,
      overlayadd: (e) => { 
        setActiveLayer(e.name === "Trainstations" ? traincoordinates : parkingcoordinates);
    },
      overlayremove: (e) => { 
        setActiveLayer(e.name === "Trainstations" ? traincoordinates : parkingcoordinates);
    },
    });
    return null;
  };

  


  /* Query the backend on mount to load the data into the state */
  useEffect(() => {
    fetch("http://localhost:8000/api/data/trainstations")
        .then((response) => response.json())
        .then((geojson) => {
          const formattedCoordinates = geojson.features.map(x => ({
            coordinates: x.geometry.coordinates,
            properties: x.properties
          }));
          console.log("trainstations", formattedCoordinates)
          setTrainCoordinates(formattedCoordinates);
        })
        .catch(error => console.error('Error fetching data: ', error));

    fetch("http://localhost:8000/api/data/parkingspaces")
        .then((response) => response.json())
        .then((geojson) => {
          const groups = groupByAddress(geojson.features);
          const formattedCoordinates = Object.values(groups).map(x => ({
            coordinates: ToReversed(x[0].geometry.coordinates),
            properties: x[0].properties,
            count: x.length
          }));
          console.log("parkingspaces", formattedCoordinates)
          setParkingCoordinates(formattedCoordinates);
        })
        .catch(error => console.error('Error fetching data: ', error));

    updateBounds();
  }, []);

    function groupByAddress(features: any[]): { [key: string]: any[] } {
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

    function ToReversed<T>(inp: T[]): T[] {
        const copy = [...inp]
        copy.reverse();
        return copy;
    }

  



    return(
    <div className='app-container'>
      <MapContainer center={[47.36667, 8.55]} zoom={13} scrollWheelZoom={false} className='mapContainer'
      ref={mapRef}>
        <MapEvents />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className='tile-layer'
        />
          <LayersControl position="topright">
              <LayersControl.Overlay name="Trainstations">
                  <LayerGroup>
                      {traincoordinates.map((item, index) => (
                          <Marker key={index} position={item.coordinates} icon={L.icon({
                              iconUrl: "/icons/icon-blue.png",
                              iconSize: [100, 100],
                              iconAnchor: [50, 50],
                              popupAnchor: [0, -20],
                          })}>
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
                  </LayerGroup>
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Parkingspaces">
                  <LayerGroup>
                      {parkingcoordinates.map((item, index) => (
                          <Marker key={index} position={item.coordinates.reverse()} icon={L.icon({
                              iconUrl: "/icons/icon-orange.png",
                              iconSize: [100, 100],
                              iconAnchor: [50, 50],
                              popupAnchor: [0, -20],
                          })}>
                              <Popup>
                                  Address: {item.properties.adresse} <br />
                                  Type: {item.properties.art} <br />
                                  Number of available parking spaces: {item.count}
                                  Fee Required: {item.properties.gebpflicht === '1' ? 'Yes' : 'No'} <br />'
                              </Popup>
                          </Marker>
                      ))}
                  </LayerGroup>
              </LayersControl.Overlay>
          </LayersControl>

      </MapContainer>

      <StatisticsPanel  statistics={statistics}/>

    </div>
  );

};

export default App;
