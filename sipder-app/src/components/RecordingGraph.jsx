import React from "react";
import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

import { Line, Scatter } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  } from "chart.js";

const RecordingGraph = ({rawdata}) => {
    const [ultraData, setUltraData] = useState([]);
    const [tevData, setTevData] = useState([]);
    const [error, setError] = useState(null);
    const svgRef = useRef(null);

    useEffect( () => {
        const handleSensorData = () => {
            const currentTime = new Date().toLocaleTimeString();
            setError(null);
            
            for (let data of rawdata) {
                if (data.includes("Ultra=")) {
                    data = data.split("=")[1];
                    setUltraData((prevData) => {
                        if (prevData.length >= 50) {
                        prevData.shift(); // Keep the buffer at 50 entries
                        }
                        return [...prevData, data];
                    });
                    //   setTimestampsUD((prev) =>
                    //     prev.length >= 50 ? [...prev.slice(1), currentTime] : [...prev, currentTime]
                    //   );
                }

                if (data.includes("TEV=")) {
                    data = data.split("=")[1];
                    data = data.split("/")[1];
                    let ppc = data / 30;
                    setTevData((prevData) => {
                        if (prevData.length >= 10) {
                        prevData.shift(); // Keep the buffer at 10 entries
                        }
                        return [...prevData, ppc];
                    });
                }
            //   setTimestampsTEV((prev) =>
            //     prev.length >= 10 ? [...prev.slice(1), currentTime] : [...prev, currentTime]
            //   );
            }
          };

          handleSensorData()
    }, [rawdata] )

      // Chart.js data
    const lineDataUltra = {
        labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17
            ,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
            33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,
            50,51,52,53,54
        ],
        datasets: [
        {
            label: "Ultrasound Sensor (Line)",
            data: ultraData,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)",
            tension: 0.4,
        },
        ],
    };

    const lineDataTEV = {
        // labels: timestampsTEV,
        labels: [1,2,3,4,5,6,7,8,9,10],
        datasets: [
        {
            label: "TEV Sensor (Line)",
            data: tevData,
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            tension: 0.4,
        },
        ],
    };

    // Chart.js options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
        duration: 0, // Disable animation
        },
        scales: {
        x: {
            title: { display: true, text: "Time" },
        },
        y: {
            title: { display: true, text: "dB" },
            beginAtZero: true,
            min: 0,
            max: 100,
        },
        },
        plugins: {
        legend: { position: "top" },
        tooltip: { mode: "index", intersect: false },
        },
    };

    const optionsTEV = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
        duration: 0, // Disable animation
        },
        scales: {
        x: {
            title: { display: true, text: "Time" },
        },
        y: {
            title: { display: true, text: "Pulses per Cycle" },
            beginAtZero: true,
            min: 0,
            max: 500,
        },
        },
        plugins: {
        legend: { position: "top" },
        tooltip: { mode: "index", intersect: false },
        },
    };

    return (
      <div className="bg-white" style={{ width: "80%", margin: "auto", textAlign: "center" }}>
            
        <div>
          <svg ref={svgRef}></svg>
        </div>
        <div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <h2 className="text-black">Latest Ultra Sound Sensor Data:</h2>

          <div style={{ height: "400px", marginTop: "20px" }}>
            <Line data={lineDataUltra} options={options} />
          </div>
          <h2 className="text-black">Latest TEV Sensor Data:</h2>
          <div style={{ height: "400px", marginTop: "20px" }}>
            <Line data={lineDataTEV} options={optionsTEV} />
          </div>
        </div>
      </div>
    );
}

export default RecordingGraph