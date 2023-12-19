import './StatisticsPanel.css';
import React, { useEffect, useRef } from 'react';
import type { PointLayer} from './types/statistics';
import Barplot from "./Barplot";
import { PieChart } from 'recharts';


const StatisticsPanel = ({ statistics }: { statistics: PointLayer[] }) => {
    
    console.log(statistics)

    return (
        <div className="w-full md:w-1/4 p-4 bg-white">
            <div className='text-center'>
                <h2 className='text-lg font-semibold border-b-2 border-gray-300 py-2'>Statistics</h2>
            </div>
            {
                statistics.map((layer, index) => (
                    <div key={index} className='text-center'>
                        <h3 className="text-sm text-gray-600">{layer.name}</h3>
                        <p>{layer.coordinates.length}</p>
                        {(layer.name === "Trainstations") ? <Barplot data={layer.coordinates}/> : 
                        (layer.name == "Parkingspaces") ? <PieChart data={layer.coordinates}/> : <p></p>}  
                    </div>
                ))
            }
            
        </div>
    );
};

export default StatisticsPanel;
