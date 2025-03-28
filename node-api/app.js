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

import { listSerialPorts } from "./services/serialService.js";

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
let latestData = null; // Buffer for the latest sensor data
let isReading = false;
let tevDataBuffer = [];
let isFirstLine = true;

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

let isStreaming = false; // Flag to control data streaming

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

//* Connection with frontend
let intervalId;
let iteration = 0;
io.on("connection", (socket) => {
  socket.emit("connection-ack", { message: "Connected to server" });

  const latency = Date.now() - connectionStartTime;
  console.log(`Connection latency for ${socket.id}: ${latency}ms`);

  console.log("Front End Client connected:", socket.id);
  let parser;
  let port;
  let isPort = false;

  socket.on("start-fake-read", () => {
    console.log(`Starting fake data for: ${socket.id}`);
    socket.join("fake-data");

    if (intervalId) {
      return socket.emit("sensor-error", { error: "Sensor is already running." });
    }

    // Set interval to emit sensor data every 200ms
    intervalId = setInterval(() => {
      let data;

      // Send different data every 5 iterations
      if (iteration % 5 == 0 && iteration != 0) {
        data = `TEV=${(30 + Math.random()).toFixed(0)}/${(79 + Math.random() * 10).toFixed(0)}`;
        iteration = 0;
      } else {
        data = `Ultra=${Math.floor(Math.random() * 100)}`;
        iteration = iteration + 1;
      }

      // Store the emitted data in the shared buffer
      tevDataBuffer.push(data);

      // If the buffer exceeds 150 items, remove the oldest one
      if (tevDataBuffer.length > 150) {
        tevDataBuffer.shift(); // Removes the first item (oldest)
      }

      // emit data to frontend
      // socket.emit("sensor-data", data);
      io.to("fake-data").emit("sensor-data", data);
      // messageCount++;

      console.log(`Sent:`, data);
    }, 200);
  });

  // Listener to start data streaming
  socket.on("start-read", () => {
    socket.join("real-data");
    console.log("Read command received");

    // Connect and collect the streamed data
    if (previousPorts.length > 0) {
      port = new SerialPort({ path: previousPorts[0], baudRate: 115200 }, (err) => {
        if (err) {
          console.error("Error opening port:", err.message);
          socket.emit("sensor-error", err);
        } else {
          console.log("Port opened successfully!");

          // ! Needs to check if there is data coming out, if there isn't disconnect

          isPort = true;
          parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

          let timeout;
          const TIMEOUT_DURATION = 5000;

          const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              console.error("⚠️ No data received for 5 seconds! Disconnecting...");
              io.to("real-data").emit("sensor-error", "No data received for 5 seconds");
              port.close(); // Close the serial port
            }, TIMEOUT_DURATION);
          };

          // Start timeout in case no data comes at all
          resetTimeout();

          parser.on("data", (data) => {
            const startTime = Date.now();

            if (isFirstLine) {
              console.log(`Ignoring first line: ${data}`);
              isFirstLine = false; // Skip the first line
              return;
            }

            resetTimeout();

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
            port.close();
          });
        }
      });
    }
    s;
  });

  // Listener to stop data streaming
  socket.on("stop-stream", () => {
    isStreaming = false;

    // // Real Data
    if (isPort) {
      // parser.close("data");
      port.close();
      isPort = false;
    }
    // Fake Data
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
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
