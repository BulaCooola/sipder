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
import { saveToExcel } from "../utils/saveToExcel";

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
  const [bufferData, setBufferData] = useState([]);

  const [ultraData, setUltraData] = useState([]);
  const [tevData, setTevData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [timestampsUD, setTimestampsUD] = useState([]);
  const [timestampsTEV, setTimestampsTEV] = useState([]);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [canSave, setCanSave] = useState(false);

  const startRecording = () => {
    const startTime = new Date();

    if (!isConnected) {
      setIsConnected(true);
      socket.emit("start-read");
      console.log("Started Reading data");
    }

    setRecording(true);
    setCanSave(false); // Disable save button when recording starts

    setTimeout(() => {
      setRecording(false);
      setCanSave(true); // Enable save button after 10 seconds

      setIsConnected(false);
      socket.emit("stop-stream");
      console.log("Stopped reading data");
      const totalTime = new Date() - startTime - 10000;
      console.log(totalTime);
    }, 10000); // 10 seconds
  };

  const startReading = () => {
    setIsConnected(true);
    socket.emit("start-read");
    console.log("Started Reading data");
  };

  const stopReading = () => {
    setIsConnected(false);
    setError(null);
    socket.emit("stop-stream");
    console.log("Stopped reading data");
  };

  const handleSave = () => {
    socket.emit("request-tev-data"); // Ask server for TEV data buffer
    saveToExcel("tev_data.xlsx", bufferData); // Call the function in frontend
  };

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

  useEffect(() => {
    socket.connect();

    socket.on("real-data", (data) => {
      console.log("Received real sensor data:", data);
      setRealData(data); // Update state with new data
    });

    socket.on("sensor-error", (data) => {
      setError(data);
    });

    socket.on("send-tev-data", (buffer) => {
      setBufferData(buffer); // Store the received TEV data
    });

    socket.on("sensor-data", handleSensorData);

    socket.on("disconnect", () => {
      setError("Disconnected from server");
    });

    return () => {
      socket.off("sensor-data");
      socket.off("disconnect");
      socket.off("sensor-error");
      socket.disconnect();
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
    <div className="bg-white" style={{ width: "80%", margin: "auto", textAlign: "center" }}>
      <h1 className="text-black">Sensor Data</h1>

      <button onClick={startReading} disabled={isConnected} className="btn">
        Start Reading
      </button>

      <button onClick={stopReading} disabled={!isConnected} className="btn">
        Stop Reading
      </button>

      <button onClick={startRecording} disabled={recording} className="btn">
        10-sec Record
      </button>

      <button onClick={handleSave} disabled={!canSave} className="btn">
        Save
      </button>

      <div>
        <h2>Real-Time Sensor Data</h2>
        <svg ref={svgRef}></svg>
      </div>
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <h2 className="text-black">Latest Ultra Sound Sensor Data:</h2>
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
        <h2 className="text-black">Latest TEV Sensor Data:</h2>
        <div style={{ height: "400px", marginTop: "20px" }}>
          <Line data={lineDataTEV} options={optionsTEV} />
        </div>
      </div>
    </div>
  );
};

export default SensorData;
