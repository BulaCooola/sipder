import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Chart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("width", 500).attr("height", 300);

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.timestamp))) // Use the timestamp for the X-axis
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)]) // Use the value for the Y-axis
      .range([height, 0]);

    // Draw the axes once, if they don't exist yet
    if (!svg.select(".x-axis").node()) {
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    }

    if (!svg.select(".y-axis").node()) {
      g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
    }

    // Update the scales based on the new data
    g.select(".x-axis").transition().duration(500).call(d3.axisBottom(x));

    g.select(".y-axis").transition().duration(500).call(d3.axisLeft(y));

    // Create circles for each data point
    const dots = g.selectAll(".dot").data(data);

    // Remove any old dots
    dots.exit().remove();

    // Update existing dots
    dots
      .attr("cx", (d) => x(new Date(d.timestamp))) // Map timestamp to X-axis
      .attr("cy", (d) => y(d.value)) // Map value to Y-axis
      .attr("r", 5) // Set the radius of the circle
      .attr("fill", "steelblue"); // Set the color of the circle

    // Add new dots
    dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(new Date(d.timestamp))) // Map timestamp to X-axis
      .attr("cy", (d) => y(d.value)) // Map value to Y-axis
      .attr("r", 5) // Set the radius of the circle
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("fill", "orange"); // Change color on hover
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).attr("fill", "steelblue"); // Reset color on mouse out
      });
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Chart;
