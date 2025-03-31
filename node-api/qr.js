import QRCode from "qrcode-terminal";

// Function to generate and display QR code
async function generateQRCode(data) {
  const jsonString = JSON.stringify(data); // Stringify the data

  QRCode.generate(jsonString, { small: true }, function (qrcode) {
    console.log(qrcode);
  });
}

// Example Data
const panelData = {
  panelNumber: "P12345",
  assetName: "Transformer",
  component: "Busbar",
  subLocation: "Substation 1, Section A",
  insulation: "Oil",
  switchPosition: "Closed",
  comments: "Routine inspection completed",
};

// Generate QR code for panelData
console.log(await generateQRCode(panelData));
