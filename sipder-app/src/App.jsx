import { useState } from "react";
import FakeSensorData from "./components/FakeSensorData";
import SensorData from "./components/SensorData";
// import { io as Client } from "socket.io-client";
import "./App.css";

// const socket = Client("http://localhost:3000");

function App() {
  const [useFakeData, setUseFakeData] = useState(false); // State to toggle between real and fake data

  const toggleDataMode = () => {
    setUseFakeData(!useFakeData); // Toggle the data mode
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen dark:bg-neutral-800 p-6">
      <h1 className="text-4xl font-bold text-stone-50 underline mb-6">Real-Time Sensor Data</h1>
      <button 
      onClick={toggleDataMode}
      className="px-6 py-3 mb-6 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition"
      > {useFakeData ? "Show Real Data" : "Show Fake Data"}</button>
      {useFakeData ? <FakeSensorData /> : <SensorData />}
    </div>
  );
}

export default App;
