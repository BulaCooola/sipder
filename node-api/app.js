import express from "express";
import { Server } from "socket.io";
// import { io as Client } from "socket.io-client";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import configRoutes from "./routes/index.js";
import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

import { startSerialConnection, listSerialPorts } from "./services/serialService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your React app's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const connectionStartTime = Date.now();
let isPort = false;
let port;
let latestData = null; // Buffer for the latest sensor data
let isReading = false;
let isRecording = false;
export let tevDataBuffer = [];

// Variables for Fake Data
let fakeDataInterval = null;

let previousPorts = [];
/**
 * @returns {Array} Detected port paths
 */
async function detectSerialPortChanges() {
  setInterval(async () => {
    const allowedVendors = ["0403"]; // vendor IDs (FTDI)
    const ports = await SerialPort.list();
    const trustedPorts = ports.filter((port) => allowedVendors.includes(port.vendorId));
    const portPaths = trustedPorts.map((port) => port.path);

    if (JSON.stringify(portPaths) !== JSON.stringify(previousPorts)) {
      console.log("Serial port change detected:", portPaths);
      previousPorts = portPaths;
    }

    // Check for new ports
    const newPorts = portPaths.filter((port) => !previousPorts.includes(port));
    if (newPorts.length > 0) {
      console.log("New serial ports connected:", newPorts);
      previousPorts = portPaths;
    }

    // Check for removed ports
    const removedPorts = previousPorts.filter((port) => !portPaths.includes(port));
    if (removedPorts.length > 0) {
      console.log("Serial ports disconnected:", removedPorts);
      previousPorts = portPaths;
    }

    return previousPorts;
  }, 1000); // Check every 2 seconds
}

detectSerialPortChanges();

const sensorDataListener = (data) => {
  tevDataBuffer.push(data);
  console.log(data);
  io.emit("start-read", data);
};

async function startFakeSensor(socket) {
  let iteration = 0;

  if (fakeDataInterval) {
    return socket.emit("sensor-error", { error: "Fake Sensor is already running." });
  }

  console.log(`Starting fake data for: ${socket.id}`);
  tevDataBuffer = [];

  // Set interval to emit sensor data every 200ms
  socket.join("fake-data");
  fakeDataInterval = setInterval(() => {
    let data;
    let dataTimestamp;

    // Send different data every 5 iterations
    if (iteration % 5 == 0 && iteration != 0) {
      data = `TEV=${(30 + Math.random()).toFixed(0)}/${(79 + Math.random() * 10).toFixed(0)}`;
      dataTimestamp = Date.now();
      iteration = 0;
    } else {
      data = `Ultra=${Math.floor(Math.random() * 100)}`;
      dataTimestamp = Date.now();
      iteration = iteration + 1;
    }

    // Store the emitted data in the shared buffer
    // If the buffer exceeds 150 items, remove the oldest one
    tevDataBuffer.push({ data: data, timestamp: dataTimestamp });
    if (tevDataBuffer.length > 75) {
      tevDataBuffer.shift(); // Removes the first item (oldest)
    }

    // socket.emit("sensor-data", data);
    io.to("fake-data").emit("sensor-data", data);
    // messageCount++;

    console.log(`Sent:`, data);
  }, 200);
}

// ✅ Helper Function for Real Sensor Data
async function startRealSensor(socket) {
  socket.join("real-data");
  console.log("Read command received");

  tevDataBuffer = [];
  let parser;
  // Connect and collect the streamed data
  if (previousPorts.length > 0) {
    // { port, parser } = await startSerialConnection(socket, previousPorts[0])

    port = new SerialPort({ path: previousPorts[0], baudRate: 115200 }, (err) => {
      if (err) {
        console.error("Error opening port:", err.message);
        isReading = false;
        socket.emit("sensor-error", err);
      } else {
        console.log("Port opened successfully!");

        // ! Needs to check if there is data coming out, if there isn't disconnect
        isReading = true;
        isPort = true;
        parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

        let timeout;
        const TIMEOUT_DURATION = 5000;

        const resetTimeout = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (isReading) {
              try {
                port.close();
              } catch (e) {
                io.to("real-data").emit("sensor-error", "Internal Server Error");
              }
            } else {
              console.error("⚠️ No data received for 5 seconds! Disconnecting...");
              io.to("real-data").emit("sensor-error", "No data received for 5 seconds");
            }
            isReading = false; // no longer reading
          }, TIMEOUT_DURATION);
        };

        // Start timeout in case no data comes at all
        resetTimeout();

        parser.on("data", (data) => {
          const startTime = Date.now();

          resetTimeout();

          // Strip '\r\ out of each line of data
          data = data.replace(/\r/g, ""); // Remove all occurrences of \r

          // Push data into the buffer for saving
          tevDataBuffer.push({ data: data, timestamp: Date.now() });
          if (tevDataBuffer.length > 75) {
            tevDataBuffer.shift(); // Removes the first item (oldest)
          }

          // Send data to the client
          io.to("real-data").emit("sensor-data", data.toString().trim());
          // messageCount++;
          const processingTime = Date.now() - startTime;
          console.log(`Processing time: ${processingTime}ms`);
        });

        // Handle port errors properly
        parser.on("error", (err) => {
          console.error("⚠️ Serial port error:", err.message);
          io.to("real-data").emit("sensor-error", err.message);
          clearTimeout(timeout);
          isReading = false;
          port.close();
        });
      }
    });
  }
}

// ! CODE FOR TESTING PERFORMANCE
// setInterval(() => {
//   const memoryUsage = process.memoryUsage();
//   console.log(`Memory Usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
// }, 5000);

// let messageCount = 0;
// setInterval(() => {
//   console.log(`Messages per second: ${messageCount}`);
//   messageCount = 0;
// }, 1000); // Reset every secon

// ✅ Socket.io Connections
io.on("connection", (socket) => {
  socket.emit("connection-ack", { message: "Connected to server" });

  const latency = Date.now() - connectionStartTime;
  console.log(`Connection latency for ${socket.id}: ${latency}ms`);

  console.log("Front End Client connected:", socket.id);

  // Sockets that Initialize Sensor Data Acquisition
  socket.on("start-fake-read", () => startFakeSensor(socket));
  socket.on("start-read", () => startRealSensor(socket));

  // Start 10-second recording
  socket.on("start-record", () => {
    if (!isReading) {
      // ! IMPLEMENT THE SOCKET ERRORS
      console.error(
        "Sensor must be connected and reading in order to record. (IMPLEMENT SOCKET ERRORS)"
      );
    }

    if (isRecording) {
      return socket.emit("recording-status", { message: "Recording is already in progress!" });
    } else {
      console.log("Recording started for 10 seconds");
      recordedData = [];
      isRecording = true;

      recordingTimer = setTimeout(() => {
        isRecording = false;
        console.log("⏹️ Recording stopped. Sending data...");
        socket.emit("recorded-data", recordedData); // Send recorded data to frontend
      }, 10000); // 10 seconds
    }
  });

  // Requesting to save data
  socket.on("request-tev-data", () => {
    socket.emit("send-tev-data", tevDataBuffer);
  });

  // Manually Stop 10-second recording
  socket.on("stop-record", () => {
    if (!isRecording) {
      return socket.emit("recording-status", { message: "No active recording to stop!" });
    } else {
      clearTimeout(recordingTimer);
      isRecording = false;
      console.log("Recording manually stopped. Sending data");
      socket.emit("recorded-data", recordedData);
    }
  });

  // Listener to stop data streaming
  socket.on("stop-stream", () => {
    // // Real Data
    if (isPort) {
      // parser.close("data");
      if (isReading) {
        isReading = false;
        isRecording = false;
        port.close();
        isPort = false;
      }
      console.log(tevDataBuffer);
    }
    // Fake Data
    if (fakeDataInterval) {
      clearInterval(fakeDataInterval);
      fakeDataInterval = null;
      console.log(tevDataBuffer);
    }

    console.log("Stop streaming command received for:", socket.id);
    socket.leave("fake-data");
    socket.leave("real-data");
    console.log("Client left all rooms");

    console.log("Streaming stopped");
  });

  socket.on("disconnect", () => {
    console.log("Front End Client disconnected:", socket.id);
  });
});

configRoutes(app);

server.listen(3000, () => {
  console.log(`Server listening at http://localhost:3000`);
});
