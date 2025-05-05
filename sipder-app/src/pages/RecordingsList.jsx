import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const RecordingsList = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile]  = useState("");
  const [ultraData, setUltraData] = useState([]);
  const [tevData, setTevData] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:3000/data");
        console.log(res)
        setFiles(res.data.data);
      } catch (err) {
        console.error("Failed to fetch file list:", err);
      }
    };

    fetchFiles();
  }, []);

  const handleSaveClick = async () => {
    try {
      const res = await axios.get("http://localhost:3000/save-data");
    } catch (err) {
      console.error("Failed to save file content: ", err);
    }
  };

  const handleFileClick = async (filename) => {
    setSelectedFile(filename);
    try {
      const res = await axios.post("http://localhost:3000/read-data", {
        filename: filename.replace(".txt", ""),
      });
      const lines = res.data.split("\n").filter((line) => line.trim() !== "");
      setFileContent(lines);
    } catch (err) {
      console.error("Failed to fetch file content:", err);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <button className="btn" onClick={handleSaveClick}>
        Save Recorded Data
      </button>
      <button className="btn">Refresh Data</button>

        <h1 className="text-2xl font-semibold mb-4">Output File Viewer</h1>

        {/* File List */}
        <div>
          <h2 className="text-lg font-medium mb-2">Available Files</h2>
          <ul className="bg-white border rounded-md divide-y">
            {files.map((file, index) => (
              <li key={index}>
                <button
                  onClick={() => handleFileClick(file)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {file}
                </button>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
};

export default RecordingsList;

// import { useEffect, useState } from 'react';

// const OutputViewer = () => {
//   const [lines, setLines] = useState([]);

//   useEffect(() => {
//     fetch('http://localhost:3001/api/data')
//       .then((res) => res.json())
//       .then((data) => {
//         setLines(data.lines);
//       })
//       .catch((err) => console.error('Error fetching data:', err));
//   }, []);

//   return (
//     <div className="p-6 bg-gray-900 text-white">
//       <h2 className="text-2xl font-semibold mb-4">UTP2 & Arm Log Output</h2>
//       <div className="bg-gray-800 p-4 rounded overflow-y-auto max-h-[500px]">
//         {lines.map((line, i) => (
//           <p key={i} className="text-sm text-green-300">
//             {line}
//           </p>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OutputViewer;
