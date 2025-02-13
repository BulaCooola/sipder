import { connectFakeSensor } from "./fakeSensorService.js";

connectFakeSensor((data) => {
  console.log("📥 Received Fake Data:", data);
});
