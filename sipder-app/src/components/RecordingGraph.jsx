import React from "react";
import { useState } from "react";

const RecordingGraph = ({rawdata}) => {
    const [ultraData, setUltraData] = useState([]);
    const [tevData, setTevData] = useState([]);
    const [error, setError] = useState(null);

    const handleSensorData = (data) => {
        const currentTime = new Date().toLocaleTimeString();
        setError(null);
    
        if (data.includes("Ultra=")) {
          data = data.split("=")[1];
          setUltraData((prevData) => {
            if (prevData.length >= 50) {
              prevData.shift(); // Keep the buffer at 50 entries
            }
            return [...prevData, data];
          });
          setTimestampsUD((prev) =>
            prev.length >= 50 ? [...prev.slice(1), currentTime] : [...prev, currentTime]
          );
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
          setTimestampsTEV((prev) =>
            prev.length >= 10 ? [...prev.slice(1), currentTime] : [...prev, currentTime]
          );
        }
      };

      // Chart.js data
  const lineDataUltra = {
    labels: timestampsUD,
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
    labels: timestampsTEV,
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
        max: 50,
      },
    },
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
  };

    return (
      <div className="bg-white" style={{ width: "80%", margin: "auto", textAlign: "center" }}>
        <h1 className="text-black">Sensor Data</h1>
            
        <NavLink to="/all-recordings" className="hover:underline">
            All Recordings
        </NavLink>
  
        <div>
          <h2>RECORDING</h2>
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