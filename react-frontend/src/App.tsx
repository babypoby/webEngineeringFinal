import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import L, { LatLngExpression, Layer } from 'leaflet';
import StatisticsPanel from './StatisticsPanel';
import type { Point, ParkingPoint, PointLayer } from './types/statistics';




const App = () => {
  /* Use the react state hook for initializing a responsive list of coordinates,information tuples */
  const [traincoordinates, setTrainCoordinates] = useState<Point[]>([]);
  const [parkingcoordinates, setParkingCoordinates] = useState<ParkingPoint[]>([]);
  const [activeLayer, setActiveLayer] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(13);


  /* State to store the current map reference */
  const mapRef = useRef(null);

  /* State to store the current geopositional map bounds */
  const [bounds, setBounds] = useState(null);

  /* State to store the current statistics */
  const [statistics, setStatistics] = useState<PointLayer[]>([]);   

  /* Logic to handle the gepositional bound state */

  const compute_statistics = (layerNames, bounds, setStatistics) => {
    if (bounds && layerNames.length > 0) {
      const northEast = bounds._northEast;
      const southWest = bounds._southWest;
     
      const layers: PointLayer[] = [];
  
      layerNames.forEach((layerName: string) => {
        if (layerName === "Trainstations") {
          layers.push({name: layerName, coordinates: traincoordinates});
        } else if (layerName === "Parkingspaces") {
          layers.push({name: layerName, coordinates: parkingcoordinates});
        }
      })
  
      const updatedLayers = layers.map((layer) => {
        const filteredCoordinates = layer.coordinates.filter((item) => {
          const lat = item.coordinates[0];
          const lng = item.coordinates[1];
  
          return lat <= northEast.lat && lat >= southWest.lat && lng <= northEast.lng && lng >= southWest.lng;
        });
  
        return { ...layer, coordinates: filteredCoordinates };
      });
      
      setStatistics(updatedLayers);
     
    }
    else {
      setStatistics([]);
    }
  };

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
  // Map Event Handler
  const MapEvents = () => {
    const map = useMapEvents({
      moveend: updateBoundsRecompute,
      overlayadd: (e) => {
        setActiveLayer(activeLayer.concat(e.name));
      },
      overlayremove: (e) => {
        setActiveLayer(activeLayer.filter((item) => item !== e.name));
      },
    });

    // Handle the zoomend event
    const handleZoomend = () => {
      updateBoundsRecompute();
      const zoomLevel = map.getZoom();
      setZoomLevel(zoomLevel);
      console.log(`Zoom Level: ${zoomLevel}`);
    };

    // Attach the zoomend event handler
    useEffect(() => {
      map.addEventListener("zoomend", handleZoomend);
      return () => {
        map.removeEventListener("zoomend", handleZoomend);
      };
    }, [map]);

    return null;
  };

  useEffect(() => {
    compute_statistics(activeLayer, bounds, setStatistics);

  }, [activeLayer, bounds]);
  


  /* Query the backend on mount to load the data into the state */
  useEffect(() => {
    fetch("http://localhost:8000/api/data/trainstations")
        .then((response) => response.json())
        .then((geojson) => {
          const formattedCoordinates: Point[] = geojson.features.map(x => ({
            coordinates: x.geometry.coordinates,
            properties: x.properties
          }));
          setTrainCoordinates(formattedCoordinates);
        })
        .catch(error => console.error('Error fetching data: ', error));

    fetch("http://localhost:8000/api/data/parkingspaces")
        .then((response) => response.json())
        .then((geojson) => {
          const groups = groupByAddress(geojson.features);
          const formattedCoordinates: ParkingPoint[] = Object.values(groups).map(x => ({
            coordinates: ToReversed(x[0].geometry.coordinates),
            properties: x[0].properties,
            count: x.length
          }));
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
                          <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                              iconUrl: "/icons/icon-blue.png",
                              iconSize: [7 * zoomLevel, 7 * zoomLevel],
                              iconAnchor: [3.5 * zoomLevel, 3.5 * zoomLevel],
                              popupAnchor: [0, -1.5 * zoomLevel],
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
                          <Marker key={index} position={item.coordinates.reverse() as LatLngExpression} icon={L.icon({
                              iconUrl: "/icons/icon-orange.png",
                              iconSize: [4 * zoomLevel, 4 * zoomLevel],
                              iconAnchor: [2 * zoomLevel, 2 * zoomLevel],
                              popupAnchor: [0, -1 * zoomLevel],
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

      <StatisticsPanel  statistics = {statistics} />

    </div>
  );

};

export default App;
