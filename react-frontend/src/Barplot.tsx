import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const propertyNameMapping = {
    rollstuhl_billet: "Accessible ticket counters",
    rollstuhl_wc: "Accessible WC",
    rollstuhl_verlad: "Wheelchair loading",
    mobilift: "Mobilift",
    stufenloser_perronzugang: "Step-free platform access"
};

const processDataForBarPlot = (dataArray) => {
    // Initialize an object to hold the counts
    const counts = {
        mobilift: 0,
        rollstuhl_billet: 0,
        rollstuhl_verlad: 0,
        rollstuhl_wc: 0,
        stufenloser_perronzugang: 0,
    };

    // Iterate through each record and count the 'true' values for each property
    dataArray.forEach(record => {
        Object.keys(record.properties).forEach(property => {
            if (record.properties[property] === true) {
                counts[property]++;
            }
        });
    });

    // Transform the counts object into an array suitable for the bar plot
    const plotData = Object.keys(counts).map(property => ({
        name: propertyNameMapping[property],
        count: counts[property]
    }));

    return plotData;
};



const Barplot = ({ data }) => {
    
    const plotContainerStyle = {
        backgroundColor: '#f5f5f5', // White background
        borderRadius: '10px', // Rounded corners
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Box shadow for depth
        padding: '10px', // Padding around the chart
        border: '2px solid #0061c990' // Gray border
    };

    return (
        <div style={plotContainerStyle}>
            <h4 className="barplot-title">Total number of stations: {data.length}</h4>
            <ResponsiveContainer width="100%" height={100}  className='barplot'>
                <BarChart data={processDataForBarPlot(data)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide={true} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0061c9" />
                </BarChart>
            </ResponsiveContainer>
        </div>


    )
}

export default Barplot;