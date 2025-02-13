import { useEffect, useState } from "react";
import { Line, Scatter } from "react-chartjs-2";
import { io as Client } from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const socket = Client("http://localhost:3000");

const SensorData = () => {
  const [ultraData, setUltraData] = useState([]);
  const [tevData, setTevData] = useState([]);
  const [timestampsUD, setTimestampsUD] = useState([]);
  const [timestampsTEV, setTimestampsTEV] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const startReading = () => {
    setIsConnected(true);
    socket.emit("start-fake-read");
    console.log("Started Reading data");
  };

  const stopReading = () => {
    setIsConnected(false);
    socket.emit("stop-stream");
    console.log("Stopped reading data");
  };

  useEffect(() => {
    socket.on("sensor-error", () => {
      setError("No Connection with Sensor");
    });

    socket.on("sensor-data", (data) => {
      console.log("Received data: ", data);
      const currentTime = new Date().toLocaleTimeString();

      if (data.includes("Ultra=")) {
        const value = parseFloat(data.split("=")[1]);
        setUltraData((prev) => (prev.length >= 50 ? [...prev.slice(1), value] : [...prev, value]));
        setTimestampsUD((prev) =>
          prev.length >= 50 ? [...prev.slice(1), currentTime] : [...prev, currentTime]
        );
      }


      if (data.includes("TEV=")) {
        console.log(currentTime)
        const value = parseFloat(data.split("=")[1]);
        setTevData((prev) => (prev.length >= 10 ? [...prev.slice(1), value] : [...prev, value]));
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
      }
    ],
  };

  const scatterData = {
    labels: timestampsUD,
    datasets: [
      {
        label: "Ultrasound Sensor (Scatter)",
        data: ultraData.map((value, index) => ({
          x: index,
          y: value,
        })),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        showLine: false,  // Disable line to make it a scatter plot
        pointRadius: 5,   // Adjust point size
      },
      {
        label: "TEV Sensor (Scatter)",
        data: tevData.map((value, index) => ({
          x: index,
          y: value,
        })),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        showLine: false,  // Disable line to make it a scatter plot
        pointRadius: 5,   // Adjust point size
      },
    ],
  }

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,  // Disable animation
    },
    scales: {
      x: {
        title: { display: true, text: "Time" },
      },
      y: {
        title: { display: true, text: "Sensor Value" },
        beginAtZero: true,
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
      duration: 0,  // Disable animation
    },
    scales: {
      x: {
        title: { display: true, text: "Time",  },
      },
      y: {
        title: { display: true, text: "Sensor Value" },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
  };

  const optionsScatter = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,  // Disable animation
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: "Time", 
        },
        type: "category",  // Makes x-axis a category for time (or a set of labels)
        ticks: {
          autoSkip: true,    // Skip ticks for readability if too many
          maxRotation: 45,   // Rotates labels to avoid overlap
          minRotation: 0,
        },
        grid: {
          display: true,     // Show grid lines
          color: "rgba(0, 0, 0, 0.1)", // Color for the grid lines
          lineWidth: 1,      // Grid line width
        },
      },
      y: {
        title: { 
          display: true, 
          text: "Sensor Value" 
        },
        ticks: {
          beginAtZero: true,  // Start from zero on Y-axis
          stepSize: 5,        // Adjust the interval of ticks
        },
        grid: {
          display: true,      // Show grid lines
          color: "rgba(0, 0, 0, 0.1)", // Color for the grid lines
          lineWidth: 1,       // Grid line width
        },
      },
    },
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
  };
  
  //! ADJUST TEV READING SUCH THAT IT GRAPHS EVERY 5 TICKS

  return (
    <div style={{ width: "80%", margin: "auto", textAlign: "center" }}>
      <h1 className="text-2xl font-bold py-4 px-2">Fake Sensor Data Visualization</h1>
      <button onClick={startReading} disabled={isConnected} className="mx-4 px-6 py-3 mb-6 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition">
        Start Reading
      </button>
      <button onClick={stopReading} disabled={!isConnected} className="btn btn-success">
        Stop Reading
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ height: "400px", marginTop: "20px" }}>
        <Line data={lineDataUltra} options={options} />
      </div>
      <div style={{ height: "400px", marginTop: "20px" }}>
        <Line data={lineDataTEV} options={optionsTEV} />
      </div>
      
      <div style={{ height: "400px", marginTop: "20px" }}>
        {console.log(scatterData)}
          <Scatter data={scatterData} options={optionsScatter } />
      </div>
    </div>
  );
};

export default SensorData;
