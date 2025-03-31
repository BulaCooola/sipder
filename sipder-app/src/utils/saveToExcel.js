import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // Install using: npm install file-saver

export async function saveToExcel(filename = "fake_data.xlsx", fakeDataBuffer = []) {
  if (fakeDataBuffer.length === 0) {
    console.log("No data to save!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const ultraSheet = workbook.addWorksheet("Ultra Data");
  const tevSheet = workbook.addWorksheet("TEV Data");

  // Define columns for each sheet
  ultraSheet.columns = [
    { header: "Timestamp", key: "timestamp", width: 20 },
    { header: "Value", key: "value", width: 10 },
  ];

  tevSheet.columns = [
    { header: "Timestamp", key: "timestamp", width: 20 },
    { header: "Value", key: "value", width: 10 },
    { header: "PPC", key: "Value", width: 10 },
  ];

  // Process data and add to the correct sheet
  fakeDataBuffer.forEach(({ data, timestamp }) => {
    const formattedTimestamp = new Date(timestamp).toLocaleString(); // Convert timestamp to readable format

    //   ! ADD THE ROW FOR
    if (data.startsWith("Ultra=")) {
      ultraSheet.addRow({
        timestamp: formattedTimestamp,
        value: parseInt(data.split("=")[1], 10),
      });
    } else if (data.startsWith("TEV=")) {
      tevSheet.addRow({
        timestamp: formattedTimestamp,
        value: data.split("=")[1],
      }); // Keep TEV in original format
    }
  });

  try {
    // Generate Excel file as a Blob and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
    console.log(`File downloaded: ${filename}`);
  } catch (error) {
    console.error("Error saving Excel file:", error);
  }
}
