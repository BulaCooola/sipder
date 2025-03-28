import { useState } from "react";
import FakeSensorData from "./components/FakeSensorData";
import SensorData from "./components/SensorData";
import Workflow from "./pages/Workflow";
// import { io as Client } from "socket.io-client";
import "./App.css";
import HomePage from "./components/HomePage";
import NavBar from "./components/NavBar";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

// const socket = Client("http://localhost:3000");

function App() {
  const [useFakeData, setUseFakeData] = useState(false); // State to toggle between real and fake data

  const toggleDataMode = () => {
    setUseFakeData(!useFakeData); // Toggle the data mode
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen dark:bg-neutral-800 p-6">
      <h1 className="text-4xl font-bold text-stone-50 underline mb-6">Real-Time Sensor Data</h1>
      <NavBar />
      <Routes location={location} key={location.pathname}>
        <Route path="" element={<HomePage />} />
        <Route path="/fake-sensor" element={<FakeSensorData />} />
        <Route path="/real-sensor" element={<SensorData />} />
        <Route path="/workflow" element={<Workflow />} />
      </Routes>
    </div>
  );
}

export default App;
