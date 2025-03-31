import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";
import { config } from "./config.js";

let isFirstLine = true;

export const startSerialConnection = async (socket, portPath) => {
  let port = new SerialPort({ path: portPath, baudRate: config.BAUD_RATE }, (err) => {
    if (err) {
      socket.emit("sensor-error", err.message);
      return console.error("Error opening port:", err.message);
    }
    console.log("Serial port opened successfully!");

    // ! Needs to check if there is data coming out, if there isn't disconnect
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    return { port, parser };
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
  }

  // Re-run after a delay
  setInterval(checkPorts, 2000); // Check every 2 seconds
};
