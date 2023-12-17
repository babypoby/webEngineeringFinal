import './StatisticsPanel.css';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PointLayer} from './types/statistics';
import Graph from './Graph';

const StatisticsPanel = ({ statistics }: { statistics: PointLayer[] }) => {
    
    return (
        <div className='statistics-panel'>
            <h2>Statistics</h2>
            {
                statistics.map((layer, index) => (
                    <div key={index}>
                        <h3>{layer.name}</h3>
                        <p>{layer.coordinates.length}</p>
                        <Graph layer = {layer}/>
                    </div>
                ))
            }
            
        </div>
    );
};

export default StatisticsPanel;
