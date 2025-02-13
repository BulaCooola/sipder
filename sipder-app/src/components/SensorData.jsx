// src/components/SensorData.js
import { useEffect, useState, useRef } from "react";
import { io as Client } from "socket.io-client";
import * as d3 from "d3";

const socket = Client("http://localhost:3000");

const SensorData = () => {
  const [data, setData] = useState([]);
  const [ultraData, setUltraData] = useState([]);
  const [tevData, setTevData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  const startReading = () => {
    setIsConnected(true);
    socket.emit("start-read");
    console.log("Started Reading data");
  };

  const stopReading = () => {
    setIsConnected(false);
    socket.emit("stop-stream");
    console.log("Stopped reading data");
  };

  useEffect(() => {
    socket.on("sensor-error", (data) => {
      setError("No Connection with Sensor");
    });

    socket.on("sensor-data", (data) => {
      console.log("Received data: ", data);
      setData((prevData) => {
        if (prevData.length >= 30) {
          prevData.shift(); // Keep the buffer at 30 entries
        }
        return [...prevData, data];
      });

      if (data.includes("Ultra=")) {
        data = data.split("=")[1];
        setUltraData((prevData) => {
          if (prevData.length >= 30) {
            prevData.shift(); // Keep the buffer at 30 entries
          }
          return [...prevData, data];
        });
      }
      if (data.includes("TEV=")) {
        data = data.split("=")[1];
        setTevData((prevData) => {
          if (prevData.length >= 30) {
            prevData.shift(); // Keep the buffer at 30 entries
          }
          return [...prevData, data];
        });
      }
    });

    socket.on("disconnect", () => {
      setError("Disconnected from server");
    });

    return () => {
      socket.off("sensor-data");
      socket.off("disconnect");
      socket.off("sensor-error");
    };
  }, []);

  // Set up the D3 chart after data is updated
  useEffect(() => {
    // Define SVG dimensions
    const width = 800;
    const height = 400;

    // Set up SVG
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    // Define the scales
    const xScale = d3
      .scaleLinear()
      .domain([0, ultraData.length - 1])
      .range([50, width - 50]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100]) // Adjust based on your sensor value range
      .range([height - 50, 50]);

    // Clear old points
    svg.selectAll("*").remove();

    // Add points
    svg
      .selectAll(".dot")
      .data(ultraData)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i))
      .attr("cy", (d) => yScale(d))
      .attr("r", 5)
      .attr("fill", "steelblue");

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(ultraData.length);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(xAxis);

    svg.append("g").attr("transform", `translate(50,0)`).call(yAxis);
  }, [ultraData]);

  //   useEffect(() => {
  //     const svg = d3.select(svgRef.current).attr("width", 500).attr("height", 300);

  //     const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  //     const width = +svg.attr("width") - margin.left - margin.right;
  //     const height = +svg.attr("height") - margin.top - margin.bottom;

  //     const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  //     const x = d3
  //       .scaleTime()
  //       .domain(d3.extent(data, (d) => new Date(d.timestamp))) // Use the timestamp for the X-axis
  //       .range([0, width]);

  //     const y = d3
  //       .scaleLinear()
  //       .domain([0, d3.max(data, (d) => d.voltage)]) // Use the value for the Y-axis
  //       .range([height, 0]);

  //     // Draw the axes once, if they don't exist yet
  //     if (!svg.select(".x-axis").node()) {
  //       g.append("g")
  //         .attr("class", "x-axis")
  //         .attr("transform", `translate(0,${height})`)
  //         .call(d3.axisBottom(x));
  //     }

  //     if (!svg.select(".y-axis").node()) {
  //       g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
  //     }

  //     // Update the scales based on the new data
  //     g.select(".x-axis").transition().duration(500).call(d3.axisBottom(x));

  //     g.select(".y-axis").transition().duration(500).call(d3.axisLeft(y));

  //     // Create circles for each data point
  //     // const dots = g.selectAll(".dot").data(data);
  //     svg.selectAll(".dot").remove();

  //     const dots = g.selectAll(".dot").data(data, (d) => d.timestamp); // Use timestamp as a key for proper data binding

  //     // Remove any old dots
  //     // dots.exit().remove();

  //     // Update existing dots
  //     dots
  //       .attr("cx", (d) => x(new Date(d.timestamp))) // Map timestamp to X-axis
  //       .attr("cy", (d) => y(d.voltage)) // Map value to Y-axis
  //       .attr("r", 5) // Set the radius of the circle
  //       .attr("fill", "steelblue"); // Set the color of the circle

  //     // Add new dots
  //     dots
  //       .enter()
  //       .append("circle")
  //       .attr("class", "dot")
  //       .attr("cx", (d) => x(new Date(d.timestamp))) // Map timestamp to X-axis
  //       .attr("cy", (d) => y(d.voltage)) // Map value to Y-axis
  //       .attr("r", 5) // Set the radius of the circle
  //       .attr("fill", "steelblue")
  //       .on("mouseover", (event, d) => {
  //         d3.select(event.currentTarget).attr("fill", "orange"); // Change color on hover
  //       })
  //       .on("mouseout", (event, d) => {
  //         d3.select(event.currentTarget).attr("fill", "steelblue"); // Reset color on mouse out
  //       });
  //   }, [data]);

  return (
    <div>
      <h1>Sensor Data</h1>
      <button onClick={startReading} disabled={isConnected} className="btn">
        Start Reading
      </button>
      <button onClick={stopReading} disabled={!isConnected} className="btn">
        Stop Reading
      </button>
      <div>
        <h2>Real-Time Sensor Data</h2>
        <svg ref={svgRef}></svg>
      </div>
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <h2>Latest Ultra Sound Sensor Data:</h2>
        <ul>
          {ultraData.map((data, index) => (
            <li key={index}>{JSON.stringify(data)}</li>
          ))}
        </ul>
        <h2>Latest TEV Sensor Data:</h2>
        <ul>
          {tevData.map((data, index) => (
            <li key={index}>{JSON.stringify(data)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SensorData;
