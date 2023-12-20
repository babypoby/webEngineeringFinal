import React from 'react';
import type { ParkingPoint } from './types/statistics';


const ParkingSpaceData = ({data}: {data : ParkingPoint[]} ) => {
    let total = 0;
    const number = data.length;
    data.forEach((item) => {
        total += item.count;
    });

    const containerStyle = {
        border: '1px solid #83a4d4', // Adjust border color
        padding: '10px',
        borderRadius: '5px', // Rounded corners
        backgroundColor: '#f2f2f2', // Light background color
        margin: '10px 0', // Margin for spacing
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' // Subtle shadow for depth
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