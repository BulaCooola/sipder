import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="text-3xl font-bold text-blue-600 mb-4">
        Welcome to the Serial Port Dashboard
      </header>
      <p className="text-gray-700 text-lg mb-6 text-center">
        Connect and monitor serial port data in real-time. Start streaming data now!
      </p>
      <div className="flex gap-4">
        <Link
          to="/real-sensor"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600"
        >
          Connect Serial Port
        </Link>
        <Link
          to="/fake-sensor"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-600"
        >
          Start Fake Data
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
