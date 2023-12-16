import './StatisticsPanel.css';
import React from 'react';

const StatisticsPanel = ({statistics}) => {

    return (
        <div className='statistics-panel'>
            <h2>Statistics</h2>
            <p>Currently selected markers: {statistics ? statistics.length : "0"}</p>
        </div>
    );
};

export default StatisticsPanel;