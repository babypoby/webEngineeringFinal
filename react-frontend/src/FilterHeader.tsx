// FilterHeader.tsx
import React, { useEffect, useState } from 'react';
import './FilterHeader.css';
import { style } from 'd3';

const FilterHeader = ({ onFilterButtonClick, onDistanceFilterClick, onLayerToggle, visibleLayers }) => {
  const [filterValue, setFilterValue] = useState<String[]>([]);
  const [layerValue, setLayerValue] = useState<String[]>([]);

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
      if (layerType == "Trainstations") {
        setFilterValue(filterValue.filter((item) => item !== 'WC' && item !== 'Ramps'));
      }
      else if (layerType == "Parkingspaces") {
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
    if (value == "Distance") {
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
    else if (value == "WC" || value == "Ramps") {
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
        </div>

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
