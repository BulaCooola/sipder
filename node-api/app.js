import express from "express";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import configRoutes from "./routes/index.js";
import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

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

let latestData = null; // Buffer for the latest sensor data
let isReading = false;
let tevDataBuffer = [];
let isFirstLine = true;

const sensorDataListener = (data) => {
  tevDataBuffer.push(data);
  console.log(data);
  io.emit("start-read", data);
};

let isStreaming = false; // Flag to control data streaming

//* Connection with frontend
let intervalId;
let iteration = 0;
io.on("connection", (socket) => {
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
      console.log("Sent:", data);
    }, 200);
  });

  // Listener to start data streaming
  socket.on("start-read", () => {
    socket.join("real-data");
    console.log("Read command received");

    port = new SerialPort({ path: "COM5", baudRate: 115200 }, (err) => {
      if (err) {
        console.error("Error opening port:", err.message);
        socket.emit("sensor-error", err);
      } else {
        console.log("Port opened successfully!");
        isPort = true;
      }
    });

    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    // Real data
    if (isPort) {
      parser.on("data", (data) => {
        if (isFirstLine) {
          console.log(`Ignoring first line: ${data}`);
          isFirstLine = false; // Skip the first line
          return;
        }
        print(data)
        console.log(data.toString().trim());
        socket.emit("sensor-data", data.toString().trim());
      });
    }
  });

  // Listener to stop data streaming
  socket.on("stop-stream", () => {
    isStreaming = false;

    // // Real Data
    if (isPort) {
      // parser.close("data");
      port.close()
      isPort = false
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

// Handle socket connections
io.on("connection", (socket) => {
  console.log("Front End Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Front End Client disconnected:", socket.id);
  });
});

configRoutes(app);

server.listen(3000, () => {
  console.log(`NutritionAI listening at http://localhost:3000`);
});
