import express from "express";
import { Server } from "socket.io";
import fs from "fs/promises";
import { listSerialPorts } from "../services/serialService.js";
import { time } from "console";

const router = express.Router();
let useFakeData = true;
let isReading = false;
let tevDataBuffer = [];

let intervalId;
let iteration = 0;

let outputFiles_path = "/home/seniordesign/sipder-app/node-api/output_files"

router.get("/ports", (req, res) => {
  let w = listSerialPorts();
  res.status(200).send({ data: w });
});

router.get("/data", async (req, res) => {
  const allfiles = await fs.readdir(outputFiles_path);
  res.status(200).send({ data: allfiles });
});

router.get("/save-data", async (req, res) => {
  // const data = fs.readFile('/home/seniordesign/Documents/output.txt', 'utf8')
  const currentTime = new Date().toLocaleTimeString();

  await fs.copyFile(
    "/home/seniordesign/Documents/UTP2 Results/output.txt",
    `/home/seniordesign/sipder-app/node-api/output_files/${currentTime}.txt`
  );
  res.status(200).send({ message: `Saved new data as filename: ${currentTime}.txt` });
});

router.post("/read-data", async (req, res) => {
  let { filename } = req.body;

  const data = await fs.readFile(`${outputFiles_path}/${filename}.txt`, { encoding: 'utf8' });
  if (!data) {
    res.status(400).send({ error: "No data found!" });
  }

  // Parse through each line and append to lists. Keep the lists in a object
  const lines = data.split("\n").filter((line) => line.trim() !== "");

  console.log(lines);

  // console.log(file)
  res.status(200).json({ data: lines });
});

export default router;
