import express from "express";
import { Server } from "socket.io";
import { listSerialPorts } from "../services/serialService.js";

const router = express.Router();
let useFakeData = true;
let isReading = false;
let tevDataBuffer = [];

let intervalId;
let iteration = 0;

router.get("/ports", (req, res) => {
  let w = listSerialPorts();
  res.status(200).send({ data: w });
});

export default router;
