// FilterHeader.tsx
import React, { useState } from 'react';
import './FilterHeader.css';

const FilterHeader = ({ onFilterButtonClick, onDistanceFilterClick, onActiveLayer}) => {
  const [filterValue, setFilterValue] = useState(null);
  const [textFilterValue, setTextFilterValue] = useState('');

  const [activeLayer, setActiveLayer] = useState<string[]>([]);

  const handleFilterButtonClick = (value) => {
    setFilterValue(value);
    onFilterButtonClick(value, textFilterValue);
  };

  const handleActiveLayer =  (value) => {
    if (activeLayer.includes(value)) {
      setActiveLayer(activeLayer.filter((item) => item !== value));
    } else {
      setActiveLayer(activeLayer.concat(value));
    }
    onActiveLayer(value);
  };


  const handleDistanceFilterClick = () => {
    // Add logic to toggle the selected state
    if (filterValue === 'Distance') {
      setFilterValue(null);
    } else {
      setFilterValue('Distance');
    }
    onDistanceFilterClick(); // Call the callback for the distance filter
  };

  return (
    <div className="filter-header">
      <div className='filter-component'>
        <label>What are you looking for?</label>
        <div className='buttons-component'>
            <button
            className={`filter-button ${activeLayer.includes('Trainstations') ? 'selected Trainstations' : ''}`}
            onClick={() => handleActiveLayer('Trainstations')}
            >
            Train Stations
            </button>
            <button
            className={`filter-button ${activeLayer.includes('Parkingspaces') ? 'selected Parkingspaces' : ''}`}
            onClick={() => handleActiveLayer('Parkingspaces')}
            >
            Parking Places
            </button>
        </div>
        
      </div>
      <div className='filt-component'>
        <label>Train station services</label>
        <div className='buttons-component'>
            <button
            className={`filter-button ${filterValue === 'WC' ? 'selected WC' : ''}`}
            onClick={() => handleFilterButtonClick('WC')}
            >
            WCs for wheelchairs
            </button>
            <button
            className={`filter-button ${filterValue === 'Ramps' ? 'selected Ramps' : ''}`}
            onClick={() => handleFilterButtonClick('Ramps')}
            >
            Ramps for wheelchairs
            </button>
            <button
            className={`filter-button ${filterValue === 'rampWC' ? 'selected rampWC' : ''}`}
            onClick={() => handleFilterButtonClick('rampWC')}
            >
            Ramps & WCs
            </button>
        </div>
      </div>
      <div className='filt-component'>
        <label>Parking near stations</label>
        <div className='buttons-component'>
            <button
        className={`filter-button ${filterValue === 'Distance' ? 'selected Distance' : ''}`}
            onClick={handleDistanceFilterClick}
            >
            Press me
            </button>
        </div>
      </div>
      {/* Add more filt-components as needed */}
    </div>
  );
};

export default FilterHeader;
