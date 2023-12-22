import React from 'react';
import type { ParkingPoint } from './types/statistics';


const ParkingSpaceData = ({data}: {data : ParkingPoint[]} ) => {
    let total = 0;
    const number = data.length;
    data.forEach((item) => {
        total += item.count;
    });

    const containerStyle = {
        padding: '10px',
        borderRadius: '10px', // Rounded corners
        backgroundColor: '#f5f5f5', // Light background color
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
        border: '2px solid #ff8c0090' // Gray border
         
    };


    return (

        <div style = {containerStyle}>
            <p className="barplot-title">Number of distinct parking places:<br/> {number}</p>
            <p className="barplot-title">Total number of parking spaces:<br/> {total}</p>
        </div>

    )

}

export default ParkingSpaceData;