// FilterHeader.tsx
import React, { useState } from 'react';
import './FilterHeader.css';

const FilterHeader = ({ onFilterButtonClick, onDistanceFilterClick, onLayerToggle, visibleLayers, tramLines, onTramLineSelect }) => {
  const [filterValue, setFilterValue] = useState<String[]>([]);
  const [layerValue, setLayerValue] = useState<String[]>([]);
  const [enableTramLine, setEnableTramLine] = useState<boolean>(false);

  const handleFilterButtonClick = (value: String) => {
    if (!isLayerActive('Trainstations')) return;
    if (filterValue.includes(value)) {
      // If the button is already selected, deselect it
      setFilterValue(filterValue.filter((item) => item !== value));
      onFilterButtonClick(value);
      return;
    }
    setFilterValue(filterValue.concat(value));
    onFilterButtonClick(value);
  };

  const handleDistanceFilterClick = () => {
    if (!isLayerActive('Parkingspaces')) return;
    if (filterValue.includes('Distance')) {
      // If the button is already selected, deselect it
      setFilterValue(filterValue.filter((item) => item !== 'Distance'));
      onDistanceFilterClick();
      return;
    }
    setFilterValue(filterValue.concat('Distance'));
    onDistanceFilterClick(); // Call the callback for the distance filter
  };



  const handleLayerButtonClick = (layerType) => {
    if (layerValue.includes(layerType)) {
      // If the button is already selected, deselect it
      setLayerValue(layerValue.filter((item) => item !== layerType));
      onLayerToggle(layerType);
      if (layerType === "Trainstations") {
        setFilterValue(filterValue.filter((item) => item !== 'WC' && item !== 'Ramps'));
      }
      else if (layerType === "Parkingspaces") {
        setFilterValue(filterValue.filter((item) => item !== 'Distance'));
      }
      return;
    }
    else {
      setLayerValue(layerValue.concat(layerType));
      onLayerToggle(layerType);
    }
  }
  // Function to check if a layer is active
  const isLayerActive = (layerType) => {
    return visibleLayers.includes(layerType);
  };
  const styleButton = (value: String) => {
    if (value === "Distance") {
      if (isLayerActive("Parkingspaces")) {
        if (filterValue.includes("Distance")) {
          return `selected ${value}`
        }
        return 'Distance'
      }
      else {
        return "deactivated"
      }
    }
    else if (value === "WC" || value === "Ramps") {
      if (isLayerActive("Trainstations")) {
        if (filterValue.includes(value)) {
          return `selected ${value}`
        }
        return 'Trainstations'
      }
      else {
        return "deactivated"
      }
    }
    else if (value === "Tramstations") {
      if (isLayerActive("Tramstations")) {
        return ''
      }
      else {
        return "deactivated"
      }
    }
  }

  function handleTramTramStationsClick() {
    handleLayerButtonClick('Tramstations')
    setEnableTramLine(!enableTramLine)
  }  

  return (
    <div className="filter-header">
      <div className='filt-component'>
        <label>What are you looking for?</label>
        <div className='buttons-component'>
          <button
            className={`filter-button ${isLayerActive('Trainstations') ? 'selected Trainstations' : 'Trainstations'}`}
            onClick={() => handleLayerButtonClick('Trainstations')}
          >
            Train Stations
          </button>
          <button
            className={`filter-button ${isLayerActive('Parkingspaces') ? 'selected Parkingspaces' : 'Parkingspaces'}`}
            onClick={() => handleLayerButtonClick('Parkingspaces')}
          >
            Parking Places
          </button>
          <button
            className={`filter-button ${isLayerActive('Tramstations') ? 'selected Tramstations' : 'Tramstations'}`}
            onClick={() => handleTramTramStationsClick()}
          >
            Tram Stations
          </button>
        </div>
      </div>
      <div className='filt-component'>
        <label>Tram Line:</label>
        <select className={`dropdown-button ${styleButton("Tramstations")}`}onChange={(e) => onTramLineSelect(e.target.value)} disabled={!enableTramLine}>
          <option value="">All lines</option>
          {tramLines.sort((a, b) => {
            // If both are numbers, sort numerically
            if (!isNaN(Number(a)) && !isNaN(Number(b))) {
              return Number(a) - Number(b);
            }
            // Otherwise, sort as strings
            return a.localeCompare(b);
          }).map(line => (
            <option key={line} value={line}>{line}</option>
          ))}
        </select>
      </div>
      <div className='filt-component'>
        <label>Train station services</label>
        <div className='buttons-component'>
          <button
            className={`filter-button ${styleButton("WC")}`}
            onClick={() => handleFilterButtonClick('WC')}
          >
            WCs for wheelchairs
          </button>
          <button
            className={`filter-button ${styleButton("Ramps")}`}
            onClick={() => handleFilterButtonClick('Ramps')}
          >
            Ramps for wheelchairs
          </button>
        </div>
      </div>
      <div className='filt-component'>
        <label>Localise parking spaces</label>
        <div className='buttons-component'>
          <button
            className={`filter-button ${styleButton("Distance")}`}
            onClick={handleDistanceFilterClick}
          >
            Near to train station
          </button>
        </div>
      </div>
      {/* Add more filt-components as needed */}
    </div>
  );
};

export default FilterHeader;
