import './StatisticsPanel.css';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PointLayer, GraphData } from './types/statistics';

const Graph = ({ layer }: { layer: PointLayer }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
       
            const data: GraphData[] = [];


                if (layer.name === "Trainstations") {
                    for (const point of layer.coordinates) {
                        for (const [key, value] of Object.entries(point.properties)) {
                            const existingData = data.find(d => d.name === key);
                            if (value && existingData) {
                                existingData.data += 1;
                            } else if (value) {
                                data.push({ name: key, data: 1 });
                            }
                            else if (!value && !existingData) {
                                data.push({ name: key, data: 0 });
                            }
                        }
                    }

                    console.log(data);

                    const margin = { top: 20, right: 20, bottom: 100, left: 30 };
                    const widthPercentage = 100;
                    const heightPercentage = 50;

                    const svg = d3.select(svgRef.current)
                    svg.selectAll('*').remove();

                    svg.attr('width', `${widthPercentage}%`)
                        .attr('height', `${heightPercentage}%`)
                        .append('g')
                        .attr('transform', `translate(${margin.left},${margin.top})`);

                    const svgElement = svgRef.current;
                    const svgRect = svgElement.getBoundingClientRect();

                    const width = svgRect.width;
                    const height = svgRect.height;

                    const maxDataValue = layer.coordinates.length;
                    const maxTicks = 10; // Set the maximum number of ticks you want to display

                    const tickCount = maxDataValue <= maxTicks ? maxDataValue : maxTicks;


                    const x = d3.scaleBand().domain(data.map(d => d.name)).range([margin.left, width - margin.right]);
                    const y = d3.scaleLinear().domain([0, maxDataValue || 1]).range([height - margin.bottom, margin.top]);


                    svg
                        .selectAll('.bar')
                        .data(data)
                        .enter()
                        .append('rect')
                        .attr('class', 'bar')
                        .attr('x', d => x(d.name) || 0)
                        .attr('width', x.bandwidth())
                        .attr('y', d => y(d.data))
                        .attr('height', d => Math.abs(y(0) - y(d.data)));

                    svg
                        .append('g')
                        .attr('transform', `translate(0,${height - margin.bottom})`)
                        .call(d3.axisBottom(x))
                        .selectAll('text') // Select all the text elements for customization
                        .attr('transform', 'rotate(-45)') // Rotate the text at a 45-degree angle
                        .style('text-anchor', 'end'); // Set the anchor point of the text

                    svg.append("g")
                        .attr("transform", `translate(${margin.left},0)`)
                        .call(d3
                            .axisLeft(y)
                            .ticks(tickCount)
                            .tickFormat((domainValue: number | { valueOf(): number }, index: number) => {
                                if (Number.isInteger(domainValue) || index === tickCount - 1) {
                                    return domainValue.toString();
                                } else {
                                    return (domainValue as number).toFixed();
                                }
                            }))

                        .call(g => g.append("text")
                            .attr("x", - margin.left)
                            .attr("y", - 10)
                            .attr("fill", "currentColor")
                            .attr("text-anchor", "start")
                            .text(maxDataValue.toFixed())
                        );


                    svg
                        .append('text')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 0 - margin.left)
                        .attr('x', 0 - height / 2)
                        .attr('dy', '1em')
                        .style('text-anchor', 'middle')
                        .text('Count');

                    svg
                        .append("line")
                        .attr("x1", margin.left)
                        .attr("y1", y(layer.coordinates.length))
                        .attr("x2", width - margin.right)
                        .attr("y2", y(layer.coordinates.length))
                        .attr("stroke", "red");
                }
        },[layer]);

    return (
            <svg ref={svgRef}>
            </svg>
    );
};


export default Graph;

