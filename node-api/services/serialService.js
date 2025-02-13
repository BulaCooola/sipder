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
