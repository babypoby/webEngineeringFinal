import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const processDataForBarPlot = (dataArray) => {
    // Initialize an object to hold the counts
    const counts = {
        autelca: 0,
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
        name: property,
        count: counts[property]
    }));

    return plotData;
};



const Barplot = ({ data }) => {

    return (
        <div>
            <p>{data.length}</p>
            <ResponsiveContainer width="100%" height={200}  className='barplot'>
                <BarChart data={processDataForBarPlot(data)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide={true} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>


    )
}

export default Barplot;