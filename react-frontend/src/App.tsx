import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayerGroup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import StatisticsPanel from './StatisticsPanel';
import type { Point, ParkingPoint, PointLayer } from './types/statistics';
import './App.css';
import FilterHeader from './FilterHeader';
import trainStationsIcon from './icons/icon-blue.png'
import parkingSpacesIcon from './icons/icon-orange.png'
import nearParkingSpacesIcon from './icons/icon-yellow.png'
import tramYellowIcon from './icons/icon-tram-yellow.png'
import tramGreenIcon from './icons/icon-tram-green.png'
import tramRedIcon from './icons/icon-tram-red.png'
import blueWcIcon from './icons/icon-blue-wc.png'
import blueRampIcon from './icons/icon-blue-ramp.png'
import blueRampWcIcon from './icons/icon-blue-ramp-wc.png'
import tramstationsData from './resources/tramstations.json'
import parkingSpaceData from './resources/taz.behindertenparkplaetze_dav_p.json'
import accessiblityData from './resources/accessibility_1.json'

/*test*/
const App = () => {
  /* Use the react state hook for initializing a responsive list of coordinates,information tuples */
  const [traincoordinates, setTrainCoordinates] = useState<Point[]>([]);
  const [parkingcoordinates, setParkingCoordinates] = useState<ParkingPoint[]>([]);
  const [tramcoordinates, setTramCoordinates] = useState<Point[]>([]);
  /* Handle map zoom level */
  const [zoomLevel, setZoomLevel] = useState(13);
  /* Handle buttons filtering */
  const [selectedFilter, setSelectedFilter] = useState<String[]>([]);
  const [filteredParking, setFilteredParking] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState<String[]>([]);
  /* State to store the current map reference */
  const mapRef = useRef(null);
  /* State to store the current geopositional map bounds */
  const [bounds, setBounds] = useState(null);
  /* State to store the current statistics */
  const [statistics, setStatistics] = useState<PointLayer[]>([]);   

  const [tramLines, setTramLines] = useState<string[]>([]);
  const [selectedTramLine, setSelectedTramLine] = useState<string>('');

  /* Function to compute statistics about train stations and parkin spaces */
  const compute_statistics = (visibleLayers, bounds, setStatistics, traincoordinates, parkingcoordinates, tramcoordinates) => {
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
  
    if (visibleLayers.includes('Trainstations') && traincoordinates.length > 0) {
      stats.push({ name: 'Trainstations', coordinates: computeForLayer(traincoordinates) });
    }
  
    if (visibleLayers.includes('Parkingspaces') && parkingcoordinates.length > 0) {
      stats.push({ name: 'Parkingspaces', coordinates: computeForLayer(parkingcoordinates) });
    }

   if (visibleLayers.includes('Tramstations') && tramcoordinates.length > 0) {
      const filteredTramCoordinates = tramcoordinates.filter(item => {
        if (selectedTramLine === '') {
            return true; // If no line is selected, show all stations
        }
        const lines = item.properties.tram_line.split(',').map(line => line.trim());
        return lines.includes(selectedTramLine); // Check if the selected line is in the list
      })

      stats.push({ name: 'Tramstations', coordinates: computeForLayer(filteredTramCoordinates)});
   }
  
    setStatistics(stats);
  };


  // Function to update bounds
  const updateBounds = () => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds());
    }
  };
  // Function to update bound and statistics
  const updateBoundsRecompute = () => {
    updateBounds();
    compute_statistics(visibleLayers, bounds, setStatistics, traincoordinates, parkingcoordinates, tramcoordinates);
  };

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
    };

    // Attach the zoomend event handler
    useEffect(() => {
      map.addEventListener("zoomend", handleZoomend);
      return () => {
        map.removeEventListener("zoomend", handleZoomend);
      };
    },);

    return null;
  };

 
  useEffect(() => {
    if(bounds){
      compute_statistics(visibleLayers, bounds, setStatistics, traincoordinates, parkingcoordinates, tramcoordinates);
    }
  }, [bounds, visibleLayers, traincoordinates, parkingcoordinates, tramcoordinates]);
  
  


  /* Query the backend on mount to load the data into the state */
  useEffect(() => {
    Promise.resolve(accessiblityData)
        .then((geojson) => {
          const formattedCoordinates: Point[] = geojson.features.map(x => ({
            coordinates: x.geometry.coordinates.map(x => parseFloat(x)),
            properties: x.properties
          }));
          setTrainCoordinates(formattedCoordinates);
        })
        .catch(error => console.error('Error fetching data: ', error));

    Promise.resolve(parkingSpaceData)
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

      Promise.resolve(tramstationsData)
        .then((geojson) => {
          const lines = Array.from(new Set(geojson.features.flatMap(feature => 
            feature.properties.tram_line.split(',').map(line => line.trim())
          ))).sort() as string[];
          setTramLines(lines);
          setTramCoordinates(geojson.features.map(x => ({
            coordinates: ToReversed(x.geometry.coordinates),
            properties: x.properties
          })));
        })
        .catch(error => console.error('Error fetching tram line data: ', error));
        
        updateBounds()
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

    const handleFilterButtonClick = (filterValue: String) => {
      if (selectedFilter.includes(filterValue)) {
        setSelectedFilter(selectedFilter.filter(item => item !== filterValue));
        return;
      }
      setSelectedFilter(selectedFilter.concat(filterValue));
    };

    // Callback function for the distance filter button
    const handleDistanceFilterClick = () => {
      if (selectedFilter.includes('Distance')) {
        setSelectedFilter(selectedFilter.filter(item => item !== "Distance"));
        return;
      }
      const filteredParkingWithin200m = filterParkingWithin200m(
        traincoordinates,
        parkingcoordinates
      );
      setFilteredParking(filteredParkingWithin200m);
      setSelectedFilter((selectedFilter.concat('Distance')))
    };

    const toggleLayerVisibility = (layerType) => {
      setVisibleLayers(currentLayers => {
        const isLayerActive = currentLayers.includes(layerType);
        const newLayers = isLayerActive 
          ? currentLayers.filter(layer => layer !== layerType)
          : [...currentLayers, layerType];
    
        // Reset the selected tram line when toggling off the tram stations layer
        if (layerType === "Tramstations" && isLayerActive) {
          setSelectedTramLine('');
        }
    
        return newLayers;
      });
    
      updateBoundsRecompute();
    };
    const handleTramLineSelect = (line) => {
      setSelectedTramLine(line);
      updateBoundsRecompute();
    };

    return(
    <div className='app-container'>

      <div className="map-content">
        <FilterHeader onFilterButtonClick={handleFilterButtonClick}
                      onDistanceFilterClick={handleDistanceFilterClick}
                      onLayerToggle={toggleLayerVisibility}
                      visibleLayers={visibleLayers} 
                      tramLines={tramLines}
                      onTramLineSelect={handleTramLineSelect}/>
        <div className="map">
        <MapContainer center={[47.36667, 8.55]} zoom={13} scrollWheelZoom={false} className='mapContainer'
        ref={mapRef}>
          <MapEvents />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className='tile-layer'
          />
          {visibleLayers.includes('Trainstations') && (
                    <LayerGroup>
                        {traincoordinates.map((item, index) => (
                            <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                                iconUrl: trainStationsIcon,
                                iconSize: [7 * zoomLevel, 7 * zoomLevel],
                                iconAnchor: [3.5 * zoomLevel, 4.5 * zoomLevel],
                                popupAnchor: [0, -.5 * zoomLevel],
                            })}>
                                <Popup className="train-popup">
                                  {/* Custom close button */}
                                  <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                                    &times;
                                  </span>
                                  {/* Header with station name */}
                                  <div className="popup-header">
                                    {item.properties.name}
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
            {visibleLayers.includes('Parkingspaces') && (
                    <LayerGroup>
                        {parkingcoordinates.map((item, index) => (
                            <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                                iconUrl: parkingSpacesIcon,
                                iconSize: [1.2 * zoomLevel, 1.6 * zoomLevel],
                                iconAnchor: [0.6 * zoomLevel, 1.6 * zoomLevel],
                                popupAnchor: [0, -.8 * zoomLevel],
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
            {visibleLayers.includes('Tramstations') && (
            <LayerGroup>
              {tramcoordinates
                .filter(item => {
                  if (selectedTramLine === '') {
                    return true; // If no line is selected, show all stations
                  }
                  const lines = item.properties.tram_line.split(',').map(line => line.trim());
                  return lines.includes(selectedTramLine); // Check if the selected line is in the list
                })
                .map((item, index) => {
                  let iconUrl = tramGreenIcon; // default icon
                  if (item.properties.wheelchair_boarding === 1) {
                    iconUrl = tramYellowIcon; // icon for stations accessible with help
                  } else if (item.properties.wheelchair_boarding === 2) {
                    iconUrl = tramRedIcon; // icon for stations not accessible
                  }

                  return (
                    <Marker 
                      key={index} 
                      position={item.coordinates as LatLngExpression} 
                      icon={L.icon({
                        iconUrl: iconUrl,
                        iconSize: [1.8 * zoomLevel, 2.4 * zoomLevel],
                        iconAnchor: [0.9 * zoomLevel, 2.4 * zoomLevel],
                        popupAnchor: [0, -1.8 * zoomLevel]
                      })}
                    >
                      <Popup className="tram-popup">
                        {/* Custom close button */}
                        <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                          &times;
                        </span>
                        {/* Header with station name */}
                        <div className="popup-header">
                          {item.properties.stop_name}
                        </div>
                        {/* Container for rectangles */}
                        <div className="popup-container">
                          {/* Address Rectangle */}
                          <div className="rectangle">
                            <div className="header">Available Lines</div>
                            <div className="value">{item.properties.tram_line}</div>
                          </div>
                          {/* Accessibility Rectangle */}
                          <div className="rectangle">
                            <div className="header">Accessibility</div>
                            <div className={
                                item.properties.wheelchair_boarding === 0 ? "value-a" :
                                item.properties.wheelchair_boarding === 1 ? "value-awh" :
                                "value-na"
                              }>
                              {item.properties.wheelchair_boarding === 0 ? "Accessible without help" :
                              item.properties.wheelchair_boarding === 1 ? "Accessible with help" :
                              "Not Accessible"}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })
              }
            </LayerGroup>
          )}
            
            {selectedFilter.includes("WC") && (
            <LayerGroup>
              {traincoordinates
                .filter(item => item.properties.rollstuhl_wc === true)
                .map((item, index) => (
                  <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                    iconUrl: blueWcIcon, // Assuming you have an icon for WC
                    iconSize: [7 * zoomLevel, 7 * zoomLevel],
                    iconAnchor: [3.5 * zoomLevel, 4.5 * zoomLevel],
                    popupAnchor: [0, -.5 * zoomLevel],
                  })}>
                    <Popup className="train-popup">
                      {/* Custom close button */}
                      <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                        &times;
                      </span>
                      {/* Header with station name */}
                      <div className="popup-header">
                        {item.properties.name}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </LayerGroup>
          )}
          {selectedFilter.includes("Ramps") && (
            <LayerGroup>
              {traincoordinates
                .filter(item => item.properties.stufenloser_perronzugang === true)
                .map((item, index) => (
                  <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                    iconUrl: blueRampIcon,
                    iconSize: [7 * zoomLevel, 7 * zoomLevel],
                    iconAnchor: [3.5 * zoomLevel, 4.5 * zoomLevel],
                    popupAnchor: [0, -0.5 * zoomLevel],
                  })}>
                    <Popup className="train-popup">
                      {/* Custom close button */}
                      <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                        &times;
                      </span>
                      {/* Header with station name */}
                      <div className="popup-header">
                        {item.properties.name}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </LayerGroup>
          )}
          {selectedFilter.includes("WC") && selectedFilter.includes("Ramps") && (
            <LayerGroup>
              {traincoordinates
                .filter(item => item.properties.stufenloser_perronzugang === true && item.properties.rollstuhl_wc === true)
                .map((item, index) => (
                  <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                    iconUrl: blueRampWcIcon,
                    iconSize: [7 * zoomLevel, 7 * zoomLevel],
                    iconAnchor: [3.5 * zoomLevel, 4.5 * zoomLevel],
                    popupAnchor: [0, -.5 * zoomLevel],
                  })}>
                    <Popup className="train-popup">
                      {/* Custom close button */}
                      <span className="custom-close-button" onClick={() => mapRef.current.closePopup()}>
                        &times;
                      </span>
                      {/* Header with station name */}
                      <div className="popup-header">
                        {item.properties.name}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </LayerGroup>
          )}
          {selectedFilter.includes("Distance") && (
            <LayerGroup>
              {filteredParking.map((item, index) => (
                <Marker key={index} position={item.coordinates as LatLngExpression} icon={L.icon({
                  iconUrl: nearParkingSpacesIcon,
                  iconSize: [1.2 * zoomLevel, 1.6 * zoomLevel],
                  iconAnchor: [0.6 * zoomLevel, 1.6 * zoomLevel],
                  popupAnchor: [0, -.8 * zoomLevel],
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
