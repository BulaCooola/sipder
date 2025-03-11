import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";
import { config } from "./config.js";

let port;
let isFirstLine = true;

export const startSerialPort = (callback) => {
  port = new SerialPort({ path: config.SERIAL_PORT, baudRate: config.BAUD_RATE }, (err) => {
    if (err) return console.error("Error opening port:", err.message);
    console.log("Serial port opened successfully!");
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
  parser.on("data", (data) => {
    if (isFirstLine) {
      console.log(`Ignoring first line: ${data}`);
      isFirstLine = false;
      return;
    }
    console.log(data.trim());
    callback(data.trim());
  });
};

export const stopSerialPort = () => {
  if (port) {
    port.close((err) => {
      if (err) return console.error("Error closing port:", err.message);
      console.log("Serial port closed successfully!");
    });
  }
};

export const listSerialPorts = async () => {
  // const ports = await SerialPort.list();
  // console.log("Available ports: ", ports);
  // return ports;
  let previousPorts = [];

  async function checkPorts() {
    const allowedVendors = ["0403"]; // vendor IDs (FTDI)
    const ports = await SerialPort.list();
    const trustedPorts = ports.filter((port) => allowedVendors.includes(port.vendorId));
    const portPaths = trustedPorts.map((port) => port.path);

    // Check for new ports
    const newPorts = portPaths.filter((port) => !previousPorts.includes(port));
    if (newPorts.length > 0) {
      console.log("New serial ports connected:", newPorts);
    }

    // Check for removed ports
    const removedPorts = previousPorts.filter((port) => !portPaths.includes(port));
    if (removedPorts.length > 0) {
      console.log("Serial ports disconnected:", removedPorts);
    }

    // Update the previous port list
    previousPorts = portPaths;

    // Re-run after a delay
    setTimeout(checkPorts, 2000); // Check every 2 seconds
  }

  // Start detection
  checkPorts();
};
