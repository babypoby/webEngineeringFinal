import React from 'react';
import type { ParkingPoint } from './types/statistics';


const ParkingSpaceData = ({data}: {data : ParkingPoint[]} ) => {
    let total = 0;
    const number = data.length;
    data.forEach((item) => {
        total += item.count;
    });

    const containerStyle = {
        border: '1px solid #757575', // 2px solid black border
        padding: '5px', // Optional padding for better appearance
        borderRadius: '2px', // Optional rounded corners
      };
    const divStyle = {
       padding: '10px'
      };

    return (
        <div style = {divStyle}>
        <div style = {containerStyle}>
            <p className="text-sm text-gray-600">Number of distinct parking places:<br/> {number}</p>
            <p className="text-sm text-gray-600">Total number of parking spaces:<br/> {total}</p>
        </div>
        </div>
    )

}

export default ParkingSpaceData;