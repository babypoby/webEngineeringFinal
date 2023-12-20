import React, { useEffect, useRef, useState } from 'react';
import './styles/tailwind.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import L, { LatLngExpression, Layer } from 'leaflet';
import StatisticsPanel from './StatisticsPanel';
import type { Point, ParkingPoint, PointLayer } from './types/statistics';
import Header from './Header';
import './App.css';
import FilterHeader from './FilterHeader';

import { zoom } from 'd3';


const App = () => {
  /* Use the react state hook for initializing a responsive list of coordinates,information tuples */
  const [traincoordinates, setTrainCoordinates] = useState<Point[]>([]);
  const [parkingcoordinates, setParkingCoordinates] = useState<ParkingPoint[]>([]);
  const [activeLayer, setActiveLayer] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [filteredParking, setFilteredParking] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState(new Set());


  /* State to store the current map reference */
  const mapRef = useRef(null);

  /* State to store the current geopositional map bounds */
  const [bounds, setBounds] = useState(null);

  /* State to store the current statistics */
  const [statistics, setStatistics] = useState<PointLayer[]>([]);   

  /* Logic to handle the gepositional bound state */

  const compute_statistics = (visibleLayers, bounds, setStatistics, traincoordinates, parkingcoordinates) => {
    if (!bounds || !visibleLayers) return;
  
    const computeForLayer = (coordinates) => {
      const northEast = bounds._northEast;
      const southWest = bounds._southWest;
  
      return coordinates.filter((item) => {
        const lat = item.coordinates[0];
        const lng = item.coordinates[1];
        return lat <= northEast.lat && lat >= southWest.lat && lng <= northEast.lng && lng >= southWest.lng;
      });
    };
  
    let stats = [];
  
    if (visibleLayers.has('Trainstations') && traincoordinates.length > 0) {
      stats.push({ name: 'Trainstations', coordinates: computeForLayer(traincoordinates) });
    }
  
    if (visibleLayers.has('Parkingspaces') && parkingcoordinates.length > 0) {
      stats.push({ name: 'Parkingspaces', coordinates: computeForLayer(parkingcoordinates) });
    }
  
    setStatistics(stats);
  };
  

  

  // Function to update bounds
  const updateBounds = () => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds());
    }
  };

  const updateBoundsRecompute = () => {
    updateBounds();
    compute_statistics(visibleLayers, bounds, setStatistics, traincoordinates, parkingcoordinates);
  };

  // Map Event Handler
  // Map Event Handler
  const MapEvents = () => {
    const map = useMapEvents({
      moveend: updateBoundsRecompute,
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
    if (bounds) {
        compute_statistics(visibleLayers, bounds, setStatistics, traincoordinates, parkingcoordinates);
    }
}, [visibleLayers, bounds, traincoordinates, parkingcoordinates]);


  
  


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

  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters
    return distance;
  };
    // Function to filter parking places within 200m of any train station
  const filterParkingWithin200m = (trainStations, parkingPlaces) => {
    const filteredParking = [];

    for (const parking of parkingPlaces) {
      let shortestDistance = Infinity;
      let nearestStation = null;

      for (const station of trainStations) {
        const distance = calculateDistance(
          parking.coordinates,
          station.coordinates
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestStation = station;
        }
      }

      if (shortestDistance <= 300) {
        filteredParking.push({
          ...parking,
          nearestStationCoordinates: nearestStation.coordinates,
        });
      }
    }
    return filteredParking;
  };

  const getNearestStationName = (stationCoordinates) => {
    // Iterate through traincoordinates to find the nearest station
    let nearestStationName = 'N/A'; // Default value if no station is found
    let shortestDistance = Infinity;
  
    for (const station of traincoordinates) {
      const distance = calculateDistance(stationCoordinates, station.coordinates);
  
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStationName = station.properties.name; // Assuming the station has a 'name' property
      }
    }
  
    return nearestStationName;
  };

    const handleFilterButtonClick = (filterValue) => {
      setSelectedFilter(filterValue);
    };

    // Callback function for the distance filter button
    const handleDistanceFilterClick = () => {
      const filteredParkingWithin200m = filterParkingWithin200m(
        traincoordinates,
        parkingcoordinates
      );
      setFilteredParking(filteredParkingWithin200m);
      setSelectedFilter('Distance');
    };

    const toggleLayerVisibility = (layerType) => {
      setVisibleLayers(prevLayers => {
        const newLayers = new Set(prevLayers);
        if (newLayers.has(layerType)) {
          newLayers.delete(layerType);
        } else {
          newLayers.add(layerType);
        }
        return newLayers;
      });
    };

    return(
    <div className='app-container'>

      <div className="map-content">
        <FilterHeader onFilterButtonClick={handleFilterButtonClick}
                      onDistanceFilterClick={handleDistanceFilterClick}
                      onLayerToggle={toggleLayerVisibility}
                      visibleLayers={visibleLayers} />
        <div className="map">
          <MapContainer center={[47.36667, 8.55]} zoom={13} scrollWheelZoom={false} className='mapContainer'
          ref={mapRef}>
            <MapEvents />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className='tile-layer'
            />
            {visibleLayers.has('Trainstations') && (
                      <LayerGroup>
                          {traincoordinates.map((item, index) => (
                              <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                                  iconUrl: "/icons/icon-blue.png",
                                  iconSize: [7 * zoomLevel, 7 * zoomLevel],
                                  iconAnchor: [3.5 * zoomLevel, 3.5 * zoomLevel],
                                  popupAnchor: [0, -14 * zoomLevel],
                              })}>
                                  <Popup className="train-popup">
                                    {/* Custom close button */}
                                    <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                                      &times;
                                    </span>
                                    {/* Header with station name */}
                                    <div className="popup-header">
                                      stationName 
                                    </div>
                                    {/* Container for rectangles */}
                                    <div className="popup-container">
                                      {/* Address Rectangle */}
                                      <div className="rectangle">
                                        <div className="header">Accessible WC</div>
                                        <div className="value">{item.properties.rollstuhl_wc ? "Yes" : "No"}</div>
                                      </div>

                                      {/* Available Places Rectangle */}
                                      <div className="rectangle">
                                        <div className="header">Accessible stairs</div>
                                        <div className="value">{item.properties.stufenloser_perronzugang ? "Yes" : "No"}</div>
                                      </div>
                                    </div>
                                  </Popup>
                              </Marker>
                          ))}
                      </LayerGroup>
              )}
              {visibleLayers.has('Parkingspaces') && (
                      <LayerGroup>
                          {parkingcoordinates.map((item, index) => (
                              <Marker key={index} position={item.coordinates.reverse() as LatLngExpression} icon={L.icon({
                                  iconUrl: "/icons/icon-orange.png",
                                  iconSize: [4 * zoomLevel, 4 * zoomLevel],
                                  iconAnchor: [2 * zoomLevel, 2 * zoomLevel],
                                  popupAnchor: [0, -8 * zoomLevel],
                              })}>
                                  <Popup className="park-popup">
                                    {/* Custom close button */}
                                    <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                                      &times;
                                    </span>

                                    {/* Container for rectangles */}
                                    <div className="popup-container">
                                      {/* Address Rectangle */}
                                      <div className="rectangle">
                                        <div className="header">Address</div>
                                        <div className="value">{item.properties.adresse}</div>
                                      </div>

                                      {/* Available Places Rectangle */}
                                      <div className="rectangle">
                                        <div className="header">Available</div>
                                        <div className="value">{item.count}</div>
                                      </div>
                                    </div>
                                  </Popup>
                              </Marker>
                          ))}
                      </LayerGroup>
              )}
              
              {selectedFilter === 'WC' && (
              <LayerGroup>
                {traincoordinates
                  .filter(item => item.properties.rollstuhl_wc === true)
                  .map((item, index) => (
                    <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                      iconUrl: "/icons/icon-blue-wc.png", // Assuming you have an icon for WC
                      iconSize: [7 * zoomLevel, 7 * zoomLevel],
                      iconAnchor: [3.5 * zoomLevel, 3.5 * zoomLevel],
                      popupAnchor: [0, -1.5 * zoomLevel],
                    })}>
                      <Popup className="train-popup">
                        {/* Custom close button */}
                        <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                          &times;
                        </span>
                        {/* Header with station name */}
                        <div className="popup-header">
                          stationName 
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </LayerGroup>
            )}
            {selectedFilter === 'Ramps' && (
              <LayerGroup>
                {traincoordinates
                  .filter(item => item.properties.stufenloser_perronzugang === true)
                  .map((item, index) => (
                    <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                      iconUrl: "/icons/icon-blue-ramp.png",
                      iconSize: [7 * zoomLevel, 7 * zoomLevel],
                      iconAnchor: [3.5 * zoomLevel, 3.5 * zoomLevel],
                      popupAnchor: [0, -1.5 * zoomLevel],
                    })}>
                      <Popup className="train-popup">
                        {/* Custom close button */}
                        <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                          &times;
                        </span>
                        {/* Header with station name */}
                        <div className="popup-header">
                          stationName 
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </LayerGroup>
            )}
            {selectedFilter === 'rampWC' && (
              <LayerGroup>
                {traincoordinates
                  .filter(item => item.properties.stufenloser_perronzugang === true && item.properties.rollstuhl_wc === true)
                  .map((item, index) => (
                    <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                      iconUrl: "/icons/icon-blue-ramp-wc.png",
                      iconSize: [7 * zoomLevel, 7 * zoomLevel],
                      iconAnchor: [3.5 * zoomLevel, 3.5 * zoomLevel],
                      popupAnchor: [0, -1.5 * zoomLevel],
                    })}>
                      <Popup className="train-popup">
                        {/* Custom close button */}
                        <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                          &times;
                        </span>
                        {/* Header with station name */}
                        <div className="popup-header">
                          stationName 
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </LayerGroup>
            )}
            {selectedFilter === 'Distance' && (
              <LayerGroup>
                {filteredParking.map((item, index) => (
                  <Marker key={index} position={item.coordinates.reverse() as LatLngExpression} icon={L.icon({
                    iconUrl: "/icons/icon-red.png",
                    iconSize: [4 * zoomLevel, 4 * zoomLevel],
                    iconAnchor: [2 * zoomLevel, 2 * zoomLevel],
                    popupAnchor: [0, -1 * zoomLevel],
                })}>
                    <Popup className="nearpark-popup">
                      {/* Custom close button */}
                      <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                        &times;
                      </span>

                      {/* Container for rectangles */}
                      <div className="popup-container">
                        {/* Address Rectangle */}
                        <div className="rectangle">
                          <div className="header">Address</div>
                          <div className="value">{item.properties.adresse}</div>
                        </div>

                        {/* Available Places Rectangle */}
                        <div className="rectangle">
                          <div className="header">Available</div>
                          <div className="value">{item.count}</div>
                        </div>

                        {/* Nearest Station Rectangle */}
                        <div className="rectangle">
                          <div className="header">Nearest Station</div>
                          <div className="value">{getNearestStationName(item.nearestStationCoordinates)}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>
        </div>      
      </div>
      <StatisticsPanel statistics={statistics}/> 
    </div>
  );

};

export default App;
