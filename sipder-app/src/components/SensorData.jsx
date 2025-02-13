// src/components/SensorData.js
import { useEffect, useState, useRef } from "react";
import { io as Client } from "socket.io-client";
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import * as d3 from "d3";

const socket = Client("http://localhost:3000");

const SensorData = () => {
  const [data, setData] = useState([]);
  const [ultraData, setUltraData] = useState([]);
  const [tevData, setTevData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [timestampsUD, setTimestampsUD] = useState([]);
  const [timestampsTEV, setTimestampsTEV] = useState([]);
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
      const currentTime = new Date().toLocaleTimeString();

      // console.log("Received data: ", data);
      setData((prevData) => {
        if (prevData.length >= 50) {
          prevData.shift(); // Keep the buffer at 30 entries
        }
        return [...prevData, data];
      });

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
        console.log(data);
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
    <div style={{ width: "80%", margin: "auto", textAlign: "center" }}>
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
        {/* <ul>
          {ultraData.map((data, index) => (
            <li key={index}>{JSON.stringify(data)}</li>
          ))}
        </ul>
        <h2>Latest TEV Sensor Data:</h2>
        <ul>
          {tevData.map((data, index) => (
            <li key={index}>{JSON.stringify(data)}</li>
          ))}
        </ul> */}
        <div style={{ height: "400px", marginTop: "20px" }}>
          <Line data={lineDataUltra} options={options} />
        </div>
        <div style={{ height: "400px", marginTop: "20px" }}>
          <Line data={lineDataTEV} options={optionsTEV} />
        </div>
      </div>
    </div>
  );
};

export default SensorData;
