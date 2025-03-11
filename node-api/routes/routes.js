import express from "express";
import { Server } from "socket.io";
import { startSerialPort, stopSerialPort, listSerialPorts } from "../services/serialService.js";

const router = express.Router();
let useFakeData = true;
let isReading = false;
let tevDataBuffer = [];

let intervalId;
let iteration = 0;

router.get("/toggle-mode", (req, res) => {
  useFakeData = !useFakeData;
  console.log(`Switched to ${useFakeData ? "FAKE" : "REAL"} sensor data`);
  res.json({ mode: useFakeData ? "FAKE" : "REAL" });
});

router.get("/inspect", (req, res) => {
  tevDataBuffer.length > 0 ? res.json(tevDataBuffer) : res.status(204).send("No data available");
});

router.get("/read-latest", (req, res) => {
  console.log(tevDataBuffer);
  tevDataBuffer.length > 0 ? res.json(tevDataBuffer) : res.status(204).send("No data available");
});

router.get("/ports", (req, res) => {
  let w = listSerialPorts();
  res.status(200).send({ data: w });
});

export default router;
