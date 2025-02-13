import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer(); // Create an HTTP server
// const io = new Server(4000); // Sensor Emulator runs on port 4000
const io = new Server(httpServer, {
  cors: { origin: "*" }, // Allow all origins for testing
});

let iteration = 0;

// Error handling for the serial port
io.on("error", (err) => {
  console.error("IO Error:", err.message);
});

io.on("connect", () => {
  setInterval(() => {
    let data;

    if (iteration % 5 == 0 && iteration != 0) {
      data = `TEV=${(30 + Math.random()).toFixed(0)}/${(79 + Math.random() * 10).toFixed(0)}`;
      iteration = 0;
    } else {
      data = `Ultra=${Math.floor(Math.random() * 100)}`;
      iteration = iteration + 1;
    }

    io.emit("sensor-data", data);
    console.log("Sent:", data);
  }, 200);
});

io.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

io.on("disconnect", () => {
  clearInterval();
  console.log("Disconnected from server");
});

// console.log("Sensor emulator running on http://localhost:4000");
httpServer.listen(4000, () => console.log("Sensor Emulator running on port 4000"));
