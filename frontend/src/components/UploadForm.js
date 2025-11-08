// import React, { useState, useRef, useCallback } from "react";
// import axios from "axios";
// import Papa from "papaparse";
// import "./UploadForm.css";

// const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/predict/";

// function Badge({ children, color = "#2563eb" }) {
//   return (
//     <span className="uf-badge" style={{ backgroundColor: color }}>
//       {children}
//     </span>
//   );
// }

// export default function UploadForm() {
//   const [file, setFile] = useState(null);
//   const [tablePreview, setTablePreview] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [showPreview, setShowPreview] = useState(true);
//   const inputRef = useRef();

//   const onFile = useCallback((f) => {
//     setError(null);
//     setResult(null);
//     setFile(f);
//     setProgress(0);
//     if (!f) {
//       setTablePreview([]);
//       return;
//     }

//     // Use PapaParse to show a small preview of CSV
//     Papa.parse(f, {
//       header: true,
//       dynamicTyping: true,
//       preview: 30,
//       skipEmptyLines: true,
//       complete: (p) => {
//         setTablePreview(p.data.slice(0, 30));
//       },
//       error: (err) => {
//         setTablePreview([]);
//         setError("Failed to parse CSV preview: " + err.message);
//       },
//     });
//   }, []);

//   const handleChange = (e) => onFile(e.target.files?.[0] || null);

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files?.[0];
//     if (f) onFile(f);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       setError("Please select a CSV file to upload.");
//       return;
//     }

//     setError(null);
//     setLoading(true);
//     setResult(null);
//     setProgress(0);

//     try {
//       const fd = new FormData();
//       fd.append("file", file);

//       const res = await axios.post(API, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (ev) => {
//           if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
//         },
//         timeout: 120000,
//       });

//       if (res.data?.error) {
//         setError(res.data.error);
//       } else {
//         setResult(res.data);
//         // if backend returns table_data, show it
//         if (res.data.table_data) setTablePreview(res.data.table_data.slice(0, 50));
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.error || err.message || "Upload failed");
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   };

//   const clear = () => {
//     setFile(null);
//     setTablePreview([]);
//     setResult(null);
//     setError(null);
//     inputRef.current && (inputRef.current.value = "");
//   };

//   return (
//     <div className="uf-root">
//       <div className="uf-card">
//         <div className="uf-header">
//           <div>
//             <h2>GNSS Error Predictor</h2>
//             <p className="uf-sub">Upload a 7-day CSV to predict day‑8 satellite errors. Hybrid LSTM/Transformer model selection.</p>
//           </div>
//           <div className="uf-actions">
//             <Badge color="#059669">Hybrid</Badge>
//             <Badge color="#7c3aed">Interactive</Badge>
//           </div>
//         </div>

//         <div
//           className={`uf-dropzone ${file ? 'uf-has-file' : ''}`}
//           onDrop={handleDrop}
//           onDragOver={(e) => e.preventDefault()}
//         >
//           <input ref={inputRef} type="file" accept=".csv" onChange={handleChange} />

//           {!file ? (
//             <div className="uf-drag">
//               <strong>Drag & drop a CSV file here</strong>
//               <span>or click to browse</span>
//             </div>
//           ) : (
//             <div className="uf-fileinfo">
//               <div>
//                 <div className="uf-filename">{file.name}</div>
//                 <div className="uf-filesize">{(file.size / 1024).toFixed(1)} KB</div>
//               </div>
//               <div className="uf-fileactions">
//                 <button className="uf-btn uf-btn-light" onClick={() => onFile(null)}>Remove</button>
//                 <button className="uf-btn uf-btn-primary" onClick={handleUpload} disabled={loading}>{loading ? `Uploading ${progress}%` : 'Upload & Predict'}</button>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="uf-row">
//           <div className="uf-column uf-preview">
//             <div className="uf-panel">
//               <div className="uf-panel-head">
//                 <strong>Preview</strong>
//                 <div>
//                   <button className="uf-link" onClick={() => setShowPreview(s => !s)}>{showPreview ? 'Hide' : 'Show'}</button>
//                   <button className="uf-link" onClick={clear}>Clear</button>
//                 </div>
//               </div>

//               {error && <div className="uf-error">{error}</div>}

//               {showPreview ? (
//                 <div className="uf-table-wrap">
//                   {tablePreview && tablePreview.length > 0 ? (
//                     <table className="uf-table">
//                       <thead>
//                         <tr>
//                           {Object.keys(tablePreview[0]).slice(0, 12).map((c) => <th key={c}>{c}</th>)}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {tablePreview.slice(0, 12).map((row, i) => (
//                           <tr key={i}>
//                             {Object.values(row).slice(0, 12).map((v, j) => <td key={j}>{String(v)}</td>)}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="uf-empty">No preview available</div>
//                   )}
//                 </div>
//               ) : null}
//             </div>
//           </div>

//           <div className="uf-column uf-result">
//             <div className="uf-panel">
//               <div className="uf-panel-head">
//                 <strong>Result</strong>
//                 <div>
//                   <button className="uf-link" onClick={() => { setResult(null); setError(null); }}>Reset</button>
//                 </div>
//               </div>

//               <div className="uf-result-body">
//                 {loading && (
//                   <div className="uf-loading">
//                     <div className="uf-spinner" />
//                     <div>Processing... {progress ? `${progress}%` : ''}</div>
//                   </div>
//                 )}

//                 {!loading && result && (
//                   <div className="uf-json">
//                     <pre>{JSON.stringify(result, null, 2)}</pre>
//                   </div>
//                 )}

//                 {!loading && !result && (
//                   <div className="uf-empty">Results will appear here after upload.</div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







// // uploadform.js
// import React, { useState } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// Chart.register(...registerables);

// const UploadForm = () => {
//   const [file, setFile] = useState(null);
//   const [tableData, setTableData] = useState([]);
//   const [predictionData, setPredictionData] = useState([]);
//   const [predictionSummary, setPredictionSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPredictions, setShowPredictions] = useState(true);
//   const [accuracyMetrics, setAccuracyMetrics] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a CSV file!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.error) {
//         alert("Error: " + response.data.error);
//       } else {
//         // Handle the new backend response structure
//         const data = response.data;
//         setTableData(data.table_data || []);
        
//         // Use predictions_day8 as the main prediction data
//         const predictions = data.predictions_day8 || data.prediction || [];
//         setPredictionData(predictions);
        
//         // Create prediction summary from the data
//         if (predictions.length > 0) {
//           const lstmCount = predictions.filter(row => row.model_used === "LSTM").length;
//           const transformerCount = predictions.filter(row => row.model_used === "Transformer").length;
//           const total = predictions.length;
          
//           setPredictionSummary({
//             lstm_usage: lstmCount,
//             lstm_percentage: total > 0 ? Math.round((lstmCount / total) * 100) : 0,
//             transformer_usage: transformerCount,
//             transformer_percentage: total > 0 ? Math.round((transformerCount / total) * 100) : 0,
//             hybrid_approach: "Dynamic model selection based on time gaps"
//           });
//         }

//         setAccuracyMetrics(
//           data.accuracy_metrics ||
//             (data.prediction_summary && data.prediction_summary.historical_accuracy) ||
//             null
//         );
        
//         setShowPredictions(true);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch predictions. Make sure backend is running.");
//     }
//     setLoading(false);
//   };

//   const toggleData = () => {
//     setShowPredictions(!showPredictions);
//   };

//   const getChartData = () => {
//     const dataSource = showPredictions ? predictionData : tableData;
    
//     // Safety check for empty or undefined data
//     if (!dataSource || dataSource.length === 0) {
//       return {
//         labels: [],
//         datasets: []
//       };
//     }
    
//     const labels = dataSource.map((row) => row.predicted_time || row.utc_time || '');

//     return {
//       labels,
//       datasets: FEATURES.map((feature, idx) => ({
//         label: feature,
//         data: dataSource.map((row) => parseFloat(row[feature]) || 0),
//         fill: false,
//         borderColor: COLORS[idx],
//         tension: 0.1,
//       })),
//     };
//   };

//   const FEATURES = ["x_error", "y_error", "z_error", "satclockerror"];
//   const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

//   const formatMetricValue = (value) => {
//     if (value === null || value === undefined || Number.isNaN(value)) {
//       return "N/A";
//     }
//     return Number.parseFloat(value).toFixed(4);
//   };

//   const formatAccuracy = (value) => {
//     if (value === null || value === undefined || Number.isNaN(value)) {
//       return "N/A";
//     }
//     return `${Number.parseFloat(value).toFixed(2)}%`;
//   };

//   const HistoricalAccuracyPanel = () => {
//     if (!accuracyMetrics || !accuracyMetrics.sample_size) {
//       return null;
//     }

//     const satclockMetrics = accuracyMetrics.satclockerror || {};
//     const ephemerisMetrics = accuracyMetrics.ephemeris_error || {};

//     return (
//       <div
//         style={{
//           marginTop: "20px",
//           padding: "15px",
//           backgroundColor: "#fff3cd",
//           border: "1px solid #ffeeba",
//           borderRadius: "8px",
//         }}
//       >
//         <h4>📊 Historical Accuracy (n = {accuracyMetrics.sample_size})</h4>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
//           <div style={{ minWidth: "220px" }}>
//             <h5>Satclock Error (s)</h5>
//             <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
//               <li>RMSE: {formatMetricValue(satclockMetrics.rmse)}</li>
//               <li>MAE: {formatMetricValue(satclockMetrics.mae)}</li>
//               <li>R²: {formatMetricValue(satclockMetrics.r2)}</li>
//               <li>Accuracy: {formatAccuracy(satclockMetrics.accuracy_pct)}</li>
//             </ul>
//           </div>
//           <div style={{ minWidth: "220px" }}>
//             <h5>Ephemeris Error (m)</h5>
//             <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
//               <li>RMSE: {formatMetricValue(ephemerisMetrics.three_dimensional?.rmse)}</li>
//               <li>MAE: {formatMetricValue(ephemerisMetrics.three_dimensional?.mae)}</li>
//               <li>R²: {formatMetricValue(ephemerisMetrics.three_dimensional?.r2)}</li>
//               <li>Accuracy: {formatAccuracy(ephemerisMetrics.three_dimensional?.accuracy_pct)}</li>
//             </ul>
//           </div>
//           <div style={{ minWidth: "220px" }}>
//             <h5>Axis-Level Ephemeris</h5>
//             {['x_error', 'y_error', 'z_error'].map((axis) => (
//               <div key={axis} style={{ fontSize: "0.9em", marginBottom: "6px" }}>
//                 <strong>{axis.replace("_", " ").toUpperCase()}:</strong> RMSE {formatMetricValue(ephemerisMetrics[axis]?.rmse)}, MAE {formatMetricValue(ephemerisMetrics[axis]?.mae)}, Accuracy {formatAccuracy(ephemerisMetrics[axis]?.accuracy_pct)}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Get which models were used - with safety checks
//   const modelsUsed = (predictionData || [])
//     .map((row) => row.model_used)
//     .filter((v, i, a) => v && a.indexOf(v) === i); // unique non-empty values

//   const lstmCount = (predictionData || []).filter(row => row.model_used === "LSTM").length;
//   const transformerCount = (predictionData || []).filter(row => row.model_used === "Transformer").length;

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>GNSS Prediction Upload</h2>
//       <input type="file" accept=".csv" onChange={handleFileChange} />
//       <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
//         {loading ? "Processing..." : "Upload & Predict"}
//       </button>

//       {predictionData.length > 0 && (
//         <div style={{ marginTop: "20px" }}>
//           <button onClick={toggleData}>
//             Show {showPredictions ? "Uploaded Data" : "Predictions"}
//           </button>

//           {/* Hybrid Model Summary */}
//           {predictionSummary && showPredictions && (
//             <div style={{ 
//               marginTop: "15px", 
//               padding: "15px", 
//               backgroundColor: "#f8f9fa", 
//               border: "1px solid #dee2e6", 
//               borderRadius: "8px" 
//             }}>
//               <h4>🤖 Hybrid Model Prediction Summary</h4>
//               <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
//                 <div>
//                   <strong>LSTM Usage:</strong> {predictionSummary.lstm_usage} predictions ({predictionSummary.lstm_percentage}%)
//                 </div>
//                 <div>
//                   <strong>Transformer Usage:</strong> {predictionSummary.transformer_usage} predictions ({predictionSummary.transformer_percentage}%)
//                 </div>
//               </div>
//               <div style={{ fontSize: "0.9em", color: "#6c757d" }}>
//                 <strong>Strategy:</strong> {predictionSummary.hybrid_approach}
//               </div>
//             </div>
//           )}

//           {showPredictions && <HistoricalAccuracyPanel />}

//           {/* Only render chart if we have data */}
//           {((showPredictions && predictionData.length > 0) || (!showPredictions && tableData.length > 0)) && (
//             <Line
//               data={getChartData()}
//               options={{
//                 responsive: true,
//                 plugins: {
//                   legend: { position: "bottom" },
//                   title: {
//                     display: true,
//                     text: showPredictions 
//                       ? `Predictions (LSTM: ${lstmCount}, Transformer: ${transformerCount})` 
//                       : "Historical Data"
//                   }
//                 },
//                 scales: {
//                   x: { title: { display: true, text: "Time" } },
//                   y: { title: { display: true, text: "Value (m)" } },
//                 },
//               }}
//             />
//           )}

//           {showPredictions && modelsUsed.length > 0 && (
//             <div style={{ marginTop: "10px" }}>
//               <h4>🧠 Model(s) Used for Prediction:</h4>
//               {modelsUsed.map((model, idx) => (
//                 <span
//                   key={idx}
//                   style={{
//                     backgroundColor: model === "Transformer" ? "#007BFF" : "#28A745",
//                     color: "white",
//                     padding: "5px 10px",
//                     marginRight: "10px",
//                     borderRadius: "8px",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   {model} ({model === "Transformer" ? transformerCount : lstmCount} predictions)
//                 </span>
//               ))}
//             </div>
//           )}

//           <h3 style={{ marginTop: "20px" }}>
//             {showPredictions ? "Predicted Data (8th Day)" : "Uploaded CSV Data"}
//           </h3>

//           <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
//             <table border="1" cellPadding="5">
//               <thead>
//                 <tr>
//                   {(showPredictions && predictionData.length > 0) || (!showPredictions && tableData.length > 0) ? 
//                     Object.keys(showPredictions ? predictionData[0] : tableData[0]).map((key) => (
//                       <th key={key}>{key}</th>
//                     )) : null}
//                 </tr>
//               </thead>
//               <tbody>
//                 {(showPredictions ? predictionData : tableData).map((row, idx) => (
//                   <tr key={idx}>
//                     {Object.entries(row).map(([key, val], i) => (
//                       <td
//                         key={i}
//                         style={{
//                           color:
//                             key === "model_used"
//                               ? val === "Transformer"
//                                 ? "#007BFF"
//                                 : "#28A745"
//                               : key === "gap_type"
//                               ? val === "long"
//                                 ? "#dc3545"
//                                 : "#17a2b8"
//                               : "black",
//                           fontWeight: (key === "model_used" || key === "gap_type") ? "bold" : "normal",
//                           backgroundColor: 
//                             key === "model_used" && val === "Transformer" 
//                               ? "#e3f2fd" 
//                               : key === "model_used" && val === "LSTM"
//                               ? "#e8f5e8"
//                               : "transparent"
//                         }}
//                       >
//                         {typeof val === "number" && key === "time_gap_seconds" 
//                           ? `${val.toFixed(0)}s` 
//                           : val}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadForm;





















// import React, { useState } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// Chart.register(...registerables);

// const UploadForm = () => {
//   const [file, setFile] = useState(null);
//   const [tableData, setTableData] = useState([]);
//   const [predictionData, setPredictionData] = useState([]);
//   const [predictionSummary, setPredictionSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPredictions, setShowPredictions] = useState(true);

//   const FEATURES = ["x_error", "y_error", "z_error", "satclockerror"];
//   const EPHEMERIS = ["x_error", "y_error", "z_error"];
//   const SATCLOCK = ["satclockerror"];
//   const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a CSV file!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.error) {
//         alert("Error: " + response.data.error);
//       } else {
//         const data = response.data;
//         setTableData(data.table_data || []);
//         const predictions = data.prediction || [];
//         setPredictionData(predictions);

//         if (predictions.length > 0) {
//           const lstmCount = predictions.filter(row => row.model_used === "LSTM").length;
//           const transformerCount = predictions.filter(row => row.model_used === "Transformer").length;
//           const total = predictions.length;
//           setPredictionSummary({
//             lstm_usage: lstmCount,
//             lstm_percentage: total > 0 ? Math.round((lstmCount / total) * 100) : 0,
//             transformer_usage: transformerCount,
//             transformer_percentage: total > 0 ? Math.round((transformerCount / total) * 100) : 0,
//             hybrid_approach: "Dynamic model selection based on time gaps"
//           });
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch predictions. Make sure backend is running.");
//     }
//     setLoading(false);
//   };

//   const toggleData = () => {
//     setShowPredictions(!showPredictions);
//   };

//   const getChartData = (features) => {
//     const dataSource = showPredictions ? predictionData : tableData;
//     if (!dataSource || dataSource.length === 0) return { labels: [], datasets: [] };
//     const labels = dataSource.map((row) => row.predicted_time || row.utc_time || '');

//     return {
//       labels,
//       datasets: features.map((feature, idx) => ({
//         label: feature,
//         data: dataSource.map(row => parseFloat(row[feature]) + (Math.random() * 0.0001 - 0.00005)), // tiny jitter
//         fill: false,
//         borderColor: COLORS[idx],
//         borderWidth: 2,
//         pointRadius: 3,
//         pointHoverRadius: 6,
//         tension: 0.3,
//       })),
//     };
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>GNSS Prediction Upload</h2>
//       <input type="file" accept=".csv" onChange={handleFileChange} />
//       <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
//         {loading ? "Processing..." : "Upload & Predict"}
//       </button>

//       {predictionData.length > 0 && (
//         <div style={{ marginTop: "20px" }}>
//           <button onClick={toggleData}>
//             Show {showPredictions ? "Uploaded Data" : "Predictions"}
//           </button>

//           {predictionSummary && showPredictions && (
//             <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "8px" }}>
//               <h4>🤖 Hybrid Model Prediction Summary</h4>
//               <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
//                 <div><strong>LSTM Usage:</strong> {predictionSummary.lstm_usage} predictions ({predictionSummary.lstm_percentage}%)</div>
//                 <div><strong>Transformer Usage:</strong> {predictionSummary.transformer_usage} predictions ({predictionSummary.transformer_percentage}%)</div>
//               </div>
//               <div style={{ fontSize: "0.9em", color: "#6c757d" }}>
//                 <strong>Strategy:</strong> {predictionSummary.hybrid_approach}
//               </div>
//             </div>
//           )}

//           {/* Ephemeris Chart */}
//           <h3 style={{ marginTop: "20px" }}>Ephemeris Errors (X, Y, Z)</h3>
//           <Line
//             data={getChartData(EPHEMERIS)}
//             options={{
//               responsive: true,
//               plugins: { legend: { position: "bottom" } },
//               scales: { x: { title: { display: true, text: "Time" } }, y: { beginAtZero: false, title: { display: true, text: "Error (m)" } } },
//             }}
//           />

//           {/* Satclock Chart */}
//           <h3 style={{ marginTop: "30px" }}>Satclock Error</h3>
//           <Line
//             data={getChartData(SATCLOCK)}
//             options={{
//               responsive: true,
//               plugins: { legend: { position: "bottom" } },
//               scales: { x: { title: { display: true, text: "Time" } }, y: { beginAtZero: false, title: { display: true, text: "Error (s)" } } },
//             }}
//           />

//           <h3 style={{ marginTop: "20px" }}>{showPredictions ? "Predicted Data (8th Day)" : "Uploaded CSV Data"}</h3>
//           <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
//             <table border="1" cellPadding="5">
//               <thead>
//                 <tr>
//                   {(showPredictions && predictionData.length > 0) || (!showPredictions && tableData.length > 0) ? 
//                     Object.keys(showPredictions ? predictionData[0] : tableData[0]).map((key) => <th key={key}>{key}</th>) : null}
//                 </tr>
//               </thead>
//               <tbody>
//                 {(showPredictions ? predictionData : tableData).map((row, idx) => (
//                   <tr key={idx}>
//                     {Object.entries(row).map(([key, val], i) => (
//                       <td key={i}>{val}</td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadForm;






















// // uploadform.js
// import React, { useState } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// Chart.register(...registerables);

// const UploadForm = () => {
//   const [file, setFile] = useState(null);
//   const [tableData, setTableData] = useState([]);
//   const [predictionData, setPredictionData] = useState([]);
//   const [predictionSummary, setPredictionSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPredictions, setShowPredictions] = useState(true);

//   const FEATURES = ["x_error", "y_error", "z_error", "satclockerror"];
//   const EPHEMERIS = ["x_error", "y_error", "z_error"];
//   const SATCLOCK = ["satclockerror"];
//   const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a CSV file!");
//       return;
//     }
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.error) {
//         alert("Error: " + response.data.error);
//       } else {
//         const data = response.data;
//         setTableData(data.table_data || []);
//         const predictions = data.prediction || [];
//         setPredictionData(predictions);
//         setPredictionSummary(data.summary || null);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch predictions. Make sure backend is running.");
//     }
//     setLoading(false);
//   };

//   const toggleData = () => {
//     setShowPredictions(!showPredictions);
//   };

//   const getChartData = (features) => {
//     const dataSource = showPredictions ? predictionData : tableData;
//     if (!dataSource || dataSource.length === 0) return { labels: [], datasets: [] };
//     const labels = dataSource.map((row) => row.predicted_time || row.utc_time || '');

//     return {
//       labels,
//       datasets: features.map((feature, idx) => ({
//         label: feature,
//         data: dataSource.map(row => {
//           const v = parseFloat(row[feature]);
//           return Number.isFinite(v) ? v : null;
//         }),
//         fill: false,
//         borderColor: COLORS[idx % COLORS.length],
//         borderWidth: 2,
//         pointRadius: 3,
//         pointHoverRadius: 6,
//         tension: 0.25,
//       })),
//     };
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>GNSS Prediction Upload</h2>
//       <input type="file" accept=".csv" onChange={handleFileChange} />
//       <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
//         {loading ? "Processing..." : "Upload & Predict"}
//       </button>

//       {predictionData.length > 0 && (
//         <div style={{ marginTop: "20px" }}>
//           <button onClick={toggleData}>
//             Show {showPredictions ? "Uploaded Data" : "Predictions"}
//           </button>

//           {predictionSummary && showPredictions && (
//             <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "8px" }}>
//               <h4>🤖 Hybrid Model Prediction Summary</h4>
//               <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
//                 <div><strong>LSTM Usage:</strong> {predictionSummary.lstm_usage} ({predictionSummary.lstm_percentage}%)</div>
//                 <div><strong>Transformer Usage:</strong> {predictionSummary.transformer_usage} ({predictionSummary.transformer_percentage}%)</div>
//               </div>
//               <div style={{ fontSize: "0.9em", color: "#6c757d" }}>
//                 <strong>Strategy:</strong> Dynamic model selection based on time gaps
//               </div>
//             </div>
//           )}

//           {/* Ephemeris Chart */}
//           <h3 style={{ marginTop: "20px" }}>Ephemeris Errors (X, Y, Z)</h3>
//           <Line
//             data={getChartData(EPHEMERIS)}
//             options={{
//               responsive: true,
//               animation: { duration: 600 },
//               plugins: { legend: { position: "bottom" } },
//               scales: {
//                 x: { title: { display: true, text: "Time" } },
//                 y: { beginAtZero: false, title: { display: true, text: "Error (m)" } },
//               },
//             }}
//           />

//           {/* Satclock Chart */}
//           <h3 style={{ marginTop: "30px" }}>Satclock Error (seconds)</h3>
//           <Line
//             data={getChartData(SATCLOCK)}
//             options={{
//               responsive: true,
//               animation: { duration: 600 },
//               plugins: { legend: { position: "bottom" } },
//               scales: {
//                 x: { title: { display: true, text: "Time" } },
//                 y: { beginAtZero: false, title: { display: true, text: "Error (s)" } },
//               },
//             }}
//           />

//           <h3 style={{ marginTop: "20px" }}>{showPredictions ? "Predicted Data (8th Day)" : "Uploaded CSV Data"}</h3>
//           <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
//             <table border="1" cellPadding="5">
//               <thead>
//                 <tr>
//                   {(showPredictions && predictionData.length > 0) || (!showPredictions && tableData.length > 0) ? 
//                     Object.keys(showPredictions ? predictionData[0] : tableData[0]).map((key) => <th key={key}>{key}</th>) : null}
//                 </tr>
//               </thead>
//               <tbody>
//                 {(showPredictions ? predictionData : tableData).map((row, idx) => (
//                   <tr key={idx}>
//                     {Object.entries(row).map(([key, val], i) => (
//                       <td key={i}>{val}</td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadForm;




















// // // uploadform.js - Enhanced Professional Version
// import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";

// Chart.register(...registerables);

// // ============================================================================
// // CONFIGURATION & CONSTANTS
// // ============================================================================
// const APP_CONFIG = {
//   API_ENDPOINT: "http://127.0.0.1:8000/predict/",
//   MAX_FILE_SIZE: 10485760, // 10MB
//   REQUEST_TIMEOUT: 60000,
//   ALLOWED_EXTENSIONS: ['.csv'],
//   DEBOUNCE_DELAY: 300
// };

// const DATA_FIELDS = {
//   POSITION_ERRORS: ['x_error', 'y_error', 'z_error'],
//   CLOCK_ERROR: ['satclockerror'],
//   ALL_FIELDS: ['x_error', 'y_error', 'z_error', 'satclockerror']
// };

// const THEME_COLORS = {
//   primary: { blue: '#2563eb', purple: '#7c3aed' },
//   accent: { cyan: '#06b6d4', orange: '#f59e0b' },
//   status: { success: '#059669', warning: '#d97706', error: '#dc2626' },
//   chart: {
//     x_error: '#3b82f6',
//     y_error: '#06b6d4',
//     z_error: '#8b5cf6',
//     satclockerror: '#f59e0b'
//   },
//   background: { dark: '#0f172a', medium: '#1e293b', light: '#334155' }
// };

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================
// const Utils = {
//   formatFileSize: (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const units = ['Bytes', 'KB', 'MB', 'GB'];
//     const index = Math.floor(Math.log(bytes) / Math.log(1024));
//     return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
//   },

//   formatNumber: (value, decimals = 6) => {
//     return typeof value === 'number' && isFinite(value) 
//       ? value.toFixed(decimals) 
//       : value;
//   },

//   validateFile: (file) => {
//     if (!file) return { valid: false, message: 'No file selected' };
    
//     const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
//     if (!APP_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
//       return { valid: false, message: 'Only CSV files are supported' };
//     }
    
//     if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
//       return { valid: false, message: `File exceeds ${Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)} limit` };
//     }
    
//     return { valid: true, message: 'File validated successfully' };
//   },

//   calculateStatistics: (data, fields) => {
//     if (!data || !data.length || !fields) return null;

//     const stats = {};
//     fields.forEach(field => {
//       const values = data
//         .map(row => parseFloat(row[field]))
//         .filter(v => isFinite(v));

//       if (values.length > 0) {
//         const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
//         const sortedValues = [...values].sort((a, b) => a - b);
//         const median = sortedValues[Math.floor(sortedValues.length / 2)];
        
//         stats[field] = {
//           mean,
//           median,
//           min: Math.min(...values),
//           max: Math.max(...values),
//           stdDev: Math.sqrt(
//             values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
//           ),
//           range: Math.max(...values) - Math.min(...values)
//         };
//       }
//     });

//     return Object.keys(stats).length > 0 ? stats : null;
//   },

//   debounce: (func, delay) => {
//     let timeoutId;
//     return (...args) => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(() => func(...args), delay);
//     };
//   }
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================
// const SatelliteErrorPredictor = () => {
//   // State Management
//   const [state, setState] = useState({
//     selectedFile: null,
//     uploadedDataset: [],
//     predictionResults: [],
//     performanceMetrics: null,
//     processingStatus: false,
//     currentView: 'predictions',
//     uploadProgress: 0,
//     isDragging: false
//   });

//   const [notification, setNotification] = useState({ 
//     visible: false, 
//     type: '', 
//     message: '' 
//   });

//   const [uiState, setUiState] = useState({
//     showDetailedStats: false,
//     selectedChart: 'position',
//     tableSearchTerm: ''
//   });

//   const fileInputRef = useRef(null);
//   const chartRefs = useRef({});

//   // Lifecycle Effects
//   useEffect(() => {
//     // Cleanup on unmount
//     return () => {
//       Object.values(chartRefs.current).forEach(chart => {
//         if (chart) chart.destroy();
//       });
//     };
//   }, []);

//   // ============================================================================
//   // STYLES
//   // ============================================================================
//   const styles = useMemo(() => ({
//     mainContainer: {
//       minHeight: '100vh',
//       background: `linear-gradient(135deg, ${THEME_COLORS.background.dark} 0%, ${THEME_COLORS.background.medium} 50%, ${THEME_COLORS.background.light} 100%)`,
//       padding: '2.5rem 1.5rem',
//       fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
//       position: 'relative'
//     },
//     backgroundOverlay: {
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       background: `
//         radial-gradient(circle at 20% 30%, ${THEME_COLORS.primary.blue}10 0%, transparent 50%),
//         radial-gradient(circle at 80% 70%, ${THEME_COLORS.primary.purple}10 0%, transparent 50%)
//       `,
//       pointerEvents: 'none',
//       zIndex: 0
//     },
//     contentWrapper: {
//       maxWidth: '1440px',
//       margin: '0 auto',
//       position: 'relative',
//       zIndex: 1
//     },
//     headerPanel: {
//       background: 'rgba(255, 255, 255, 0.06)',
//       backdropFilter: 'blur(20px) saturate(180%)',
//       WebkitBackdropFilter: 'blur(20px) saturate(180%)',
//       border: '1px solid rgba(255, 255, 255, 0.12)',
//       borderRadius: '24px',
//       padding: '3rem 2.5rem',
//       marginBottom: '2.5rem',
//       boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
//       transition: 'all 0.3s ease'
//     },
//     mainTitle: {
//       fontSize: '2.5rem',
//       fontWeight: '900',
//       color: '#ffffff',
//       marginBottom: '1rem',
//       letterSpacing: '-0.03em',
//       lineHeight: '1.2'
//     },
//     subtitle: {
//       fontSize: '1.05rem',
//       color: 'rgba(255, 255, 255, 0.75)',
//       lineHeight: '1.7',
//       maxWidth: '800px'
//     },
//     gridContainer: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
//       gap: '2rem',
//       marginBottom: '2.5rem'
//     },
//     panel: {
//       background: 'rgba(255, 255, 255, 0.06)',
//       backdropFilter: 'blur(20px) saturate(180%)',
//       WebkitBackdropFilter: 'blur(20px) saturate(180%)',
//       border: '1px solid rgba(255, 255, 255, 0.12)',
//       borderRadius: '20px',
//       padding: '2rem',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
//       transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//       position: 'relative',
//       overflow: 'hidden'
//     },
//     panelTitle: {
//       fontSize: '1.35rem',
//       fontWeight: '700',
//       color: '#ffffff',
//       marginBottom: '1.5rem',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.75rem'
//     },
//     uploadZone: {
//       border: '2px dashed rgba(255, 255, 255, 0.25)',
//       borderRadius: '16px',
//       padding: '3.5rem 2rem',
//       textAlign: 'center',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       background: 'rgba(255, 255, 255, 0.03)',
//       position: 'relative'
//     },
//     uploadZoneActive: {
//       borderColor: THEME_COLORS.primary.blue,
//       background: `${THEME_COLORS.primary.blue}15`,
//       transform: 'scale(1.02)',
//       boxShadow: `0 0 30px ${THEME_COLORS.primary.blue}30`
//     },
//     button: {
//       padding: '1rem 2rem',
//       borderRadius: '14px',
//       border: 'none',
//       fontWeight: '700',
//       fontSize: '1.05rem',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '0.75rem',
//       position: 'relative',
//       overflow: 'hidden'
//     },
//     buttonPrimary: {
//       background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//       color: '#ffffff',
//       boxShadow: `0 8px 24px ${THEME_COLORS.primary.blue}40`
//     },
//     buttonSecondary: {
//       background: 'rgba(255, 255, 255, 0.12)',
//       color: '#ffffff',
//       border: '1px solid rgba(255, 255, 255, 0.25)',
//       backdropFilter: 'blur(10px)'
//     },
//     metricCard: {
//       background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}20, ${THEME_COLORS.primary.purple}20)`,
//       border: `1px solid ${THEME_COLORS.primary.blue}30`,
//       borderRadius: '16px',
//       padding: '1.75rem',
//       position: 'relative',
//       overflow: 'hidden'
//     },
//     metricLabel: {
//       fontSize: '0.9rem',
//       color: 'rgba(255, 255, 255, 0.75)',
//       textTransform: 'uppercase',
//       letterSpacing: '0.08em',
//       fontWeight: '700',
//       marginBottom: '0.875rem'
//     },
//     metricValue: {
//       fontSize: '2.5rem',
//       fontWeight: '900',
//       color: '#ffffff',
//       lineHeight: '1',
//       marginBottom: '0.5rem'
//     },
//     chartWrapper: {
//       background: 'rgba(255, 255, 255, 0.06)',
//       backdropFilter: 'blur(20px) saturate(180%)',
//       WebkitBackdropFilter: 'blur(20px) saturate(180%)',
//       border: '1px solid rgba(255, 255, 255, 0.12)',
//       borderRadius: '20px',
//       padding: '2.5rem',
//       marginBottom: '2.5rem',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
//     },
//     tableWrapper: {
//       maxHeight: '550px',
//       overflowY: 'auto',
//       overflowX: 'auto',
//       borderRadius: '16px',
//       border: '1px solid rgba(255, 255, 255, 0.12)',
//       boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)'
//     },
//     table: {
//       width: '100%',
//       borderCollapse: 'collapse',
//       fontSize: '0.9rem'
//     },
//     tableHeader: {
//       padding: '1.25rem 1.5rem',
//       background: 'rgba(255, 255, 255, 0.1)',
//       color: 'rgba(255, 255, 255, 0.95)',
//       fontWeight: '700',
//       textAlign: 'left',
//       textTransform: 'uppercase',
//       fontSize: '0.8rem',
//       letterSpacing: '0.08em',
//       position: 'sticky',
//       top: 0,
//       zIndex: 10,
//       borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
//       backdropFilter: 'blur(10px)'
//     },
//     tableCell: {
//       padding: '1.125rem 1.5rem',
//       color: 'rgba(255, 255, 255, 0.85)',
//       borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
//       fontFamily: '"JetBrains Mono", ui-monospace, monospace',
//       fontSize: '0.85rem'
//     },
//     notification: {
//       padding: '1.25rem 1.75rem',
//       borderRadius: '16px',
//       marginBottom: '2rem',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       fontWeight: '600',
//       fontSize: '0.95rem',
//       animation: 'slideInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//       boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)'
//     },
//     badge: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       padding: '0.5rem 1.125rem',
//       borderRadius: '10px',
//       fontSize: '0.8rem',
//       fontWeight: '700',
//       textTransform: 'uppercase',
//       letterSpacing: '0.05em',
//       gap: '0.5rem'
//     },
//     progressBar: {
//       position: 'absolute',
//       bottom: 0,
//       left: 0,
//       height: '4px',
//       background: `linear-gradient(90deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//       transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//       borderRadius: '0 0 14px 14px'
//     },
//     loader: {
//       width: '24px',
//       height: '24px',
//       border: '3px solid rgba(255, 255, 255, 0.25)',
//       borderTopColor: '#ffffff',
//       borderRadius: '50%',
//       animation: 'spin 0.8s linear infinite'
//     },
//     statsCard: {
//       background: 'rgba(255, 255, 255, 0.04)',
//       border: '1px solid rgba(255, 255, 255, 0.08)',
//       borderRadius: '12px',
//       padding: '1.25rem',
//       transition: 'all 0.3s ease'
//     }
//   }), []);

//   // ============================================================================
//   // EVENT HANDLERS
//   // ============================================================================
//   const handleFileSelect = useCallback((event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validation = Utils.validateFile(file);
//     if (!validation.valid) {
//       setNotification({ visible: true, type: 'error', message: validation.message });
//       return;
//     }

//     setState(prev => ({ ...prev, selectedFile: file }));
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const handleDragEnter = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: true }));
//   }, []);

//   const handleDragLeave = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: false }));
//   }, []);

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   }, []);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: false }));

//     const file = e.dataTransfer.files?.[0];
//     if (!file) return;

//     const validation = Utils.validateFile(file);
//     if (!validation.valid) {
//       setNotification({ visible: true, type: 'error', message: validation.message });
//       return;
//     }

//     setState(prev => ({ ...prev, selectedFile: file }));
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const processUpload = useCallback(async () => {
//     if (!state.selectedFile) {
//       setNotification({ visible: true, type: 'error', message: 'Please select a file to upload' });
//       return;
//     }

//     setState(prev => ({ ...prev, processingStatus: true, uploadProgress: 0 }));
//     setNotification({ visible: false, type: '', message: '' });

//     try {
//       const formData = new FormData();
//       formData.append("file", state.selectedFile);

//       const response = await axios.post(APP_CONFIG.API_ENDPOINT, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setState(prev => ({ ...prev, uploadProgress: progress }));
//         },
//         timeout: APP_CONFIG.REQUEST_TIMEOUT
//       });

//       if (response.data.error) {
//         throw new Error(response.data.error);
//       }

//       setState(prev => ({
//         ...prev,
//         uploadedDataset: response.data.table_data || [],
//         predictionResults: response.data.prediction || [],
//         performanceMetrics: response.data.summary || null,
//         currentView: 'predictions',
//         processingStatus: false
//       }));

//       setNotification({ 
//         visible: true, 
//         type: 'success', 
//         message: 'Predictions generated successfully!' 
//       });

//       // Auto-hide success notification
//       setTimeout(() => {
//         setNotification(prev => ({ ...prev, visible: false }));
//       }, 5000);

//     } catch (error) {
//       console.error('Upload failed:', error);
      
//       let errorMessage = 'Processing failed. Please try again.';
//       if (error.code === 'ECONNABORTED') {
//         errorMessage = 'Request timed out. Server might be overloaded.';
//       } else if (error.response) {
//         errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || error.message}`;
//       } else if (error.request) {
//         errorMessage = 'Cannot connect to server. Ensure backend is running at ' + APP_CONFIG.API_ENDPOINT;
//       } else {
//         errorMessage = error.message;
//       }

//       setNotification({ visible: true, type: 'error', message: errorMessage });
//       setState(prev => ({ ...prev, processingStatus: false, uploadProgress: 0 }));
//     }
//   }, [state.selectedFile]);

//   const toggleView = useCallback(() => {
//     setState(prev => ({ 
//       ...prev, 
//       currentView: prev.currentView === 'predictions' ? 'uploaded' : 'predictions' 
//     }));
//   }, []);

//   const dismissNotification = useCallback(() => {
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const toggleDetailedStats = useCallback(() => {
//     setUiState(prev => ({ ...prev, showDetailedStats: !prev.showDetailedStats }));
//   }, []);

//   const clearFile = useCallback(() => {
//     setState(prev => ({ ...prev, selectedFile: null }));
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   }, []);

//   // ============================================================================
//   // COMPUTED VALUES
//   // ============================================================================
//   const activeData = useMemo(() => 
//     state.currentView === 'predictions' ? state.predictionResults : state.uploadedDataset,
//     [state.currentView, state.predictionResults, state.uploadedDataset]
//   );

//   const dataStatistics = useMemo(() => {
//     if (!activeData?.length) return null;

//     const firstTime = activeData[0]?.predicted_time || activeData[0]?.utc_time || 'N/A';
//     const lastTime = activeData[activeData.length - 1]?.predicted_time || 
//                      activeData[activeData.length - 1]?.utc_time || 'N/A';

//     return {
//       totalRecords: activeData.length,
//       timeRange: `${firstTime} → ${lastTime}`,
//       detailedStats: Utils.calculateStatistics(activeData, DATA_FIELDS.ALL_FIELDS)
//     };
//   }, [activeData]);

//   // ============================================================================
//   // CHART CONFIGURATION
//   // ============================================================================
//   const generateChartData = useCallback((fields) => {
//     if (!activeData?.length) return { labels: [], datasets: [] };

//     const labels = activeData.map((item, idx) => 
//       item.predicted_time || item.utc_time || `T${idx + 1}`
//     );

//     return {
//       labels,
//       datasets: fields.map(field => {
//         const color = THEME_COLORS.chart[field] || '#94a3b8';
//         return {
//           label: field.replace(/_/g, ' ').toUpperCase(),
//           data: activeData.map(item => {
//             const value = parseFloat(item[field]);
//             return isFinite(value) ? value : null;
//           }),
//           borderColor: color,
//           backgroundColor: `${color}25`,
//           borderWidth: 3,
//           pointRadius: 4.5,
//           pointHoverRadius: 9,
//           pointBackgroundColor: color,
//           pointBorderColor: '#ffffff',
//           pointBorderWidth: 2.5,
//           tension: 0.4,
//           fill: true,
//           spanGaps: true
//         };
//       })
//     };
//   }, [activeData]);

//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: true,
//     animation: { 
//       duration: 750,
//       easing: 'easeInOutCubic'
//     },
//     interaction: {
//       mode: 'index',
//       intersect: false
//     },
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           color: 'rgba(255, 255, 255, 0.9)',
//           padding: 22,
//           font: { size: 13, weight: '700', family: '"Inter", sans-serif' },
//           usePointStyle: true,
//           pointStyle: 'circle',
//           boxWidth: 12,
//           boxHeight: 12
//         }
//       },
//       tooltip: {
//         enabled: true,
//         backgroundColor: 'rgba(15, 23, 42, 0.95)',
//         titleColor: '#ffffff',
//         bodyColor: 'rgba(255, 255, 255, 0.9)',
//         borderColor: 'rgba(255, 255, 255, 0.2)',
//         borderWidth: 1,
//         padding: 16,
//         cornerRadius: 12,
//         titleFont: { size: 14, weight: '700' },
//         bodyFont: { size: 13, weight: '500' },
//         displayColors: true,
//         callbacks: {
//           label: (context) => {
//             const label = context.dataset.label || '';
//             const value = Utils.formatNumber(context.parsed.y, 6);
//             return `${label}: ${value}`;
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: { 
//           color: 'rgba(255, 255, 255, 0.06)',
//           drawBorder: false
//         },
//         ticks: {
//           color: 'rgba(255, 255, 255, 0.75)',
//           font: { size: 11, weight: '500' },
//           maxRotation: 45,
//           minRotation: 0,
//           autoSkip: true,
//           maxTicksLimit: 15
//         },
//         title: {
//           display: true,
//           text: 'Time Sequence',
//           color: 'rgba(255, 255, 255, 0.85)',
//           font: { size: 13, weight: '700' },
//           padding: { top: 12 }
//         }
//       },
//       y: {
//         grid: {
//           color: 'rgba(255, 255, 255, 0.06)',
//           drawBorder: false
//         },
//         ticks: {
//           color: 'rgba(255, 255, 255, 0.75)',
//           font: { size: 11, weight: '500' },
//           callback: (value) => Utils.formatNumber(value, 4)
//         },
//         title: {
//           display: true,
//           color: 'rgba(255, 255, 255, 0.85)',
//           font: { size: 13, weight: '700' },
//           padding: { bottom: 12 }
//         }
//       }
//     }
//   }), []);

//   // ============================================================================
//   // RENDER
//   // ============================================================================
//   return (
//     <div style={styles.mainContainer}>
//       <div style={styles.backgroundOverlay}></div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes slideInDown {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.6; }
//         }
        
//         .hover-lift:hover {
//           transform: translateY(-6px);
//           box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35) !important;
//         }
        
//         .hover-scale:hover:not(:disabled) {
//           transform: translateY(-3px) scale(1.02);
//           box-shadow: 0 12px 36px rgba(37, 99, 235, 0.5) !important;
//         }
        
//         .hover-scale:active:not(:disabled) {
//           transform: translateY(-1px) scale(1.01);
//         }
        
//         .table-row-hover:hover {
//           background: rgba(255, 255, 255, 0.08) !important;
//         }
        
//         /* Smooth scrollbar */
//         ::-webkit-scrollbar {
//           width: 10px;
//           height: 10px;
//         }
//         ::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.06);
//           border-radius: 6px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: linear-gradient(135deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple});
//           border-radius: 6px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: ${THEME_COLORS.primary.blue};
//         }
        
//         /* Responsive Design */
//         @media (max-width: 768px) {
//           .grid-responsive {
//             grid-template-columns: 1fr !important;
//             gap: 1.5rem !important;
//           }
//           .panel-responsive {
//             padding: 1.5rem !important;
//           }
//         }
//       `}</style>

//       <div style={styles.contentWrapper}>
//         {/* Header Section */}
//         <div style={styles.headerPanel} className="hover-lift">
//           <h1 style={styles.mainTitle}>
//             Advanced Satellite Error Prediction System
//           </h1>
//           <p style={styles.subtitle}>
//             Leverage state-of-the-art hybrid LSTM-Transformer architecture for precise GNSS error forecasting.
//             Upload 7-day historical satellite data to generate sophisticated day-8 predictions with adaptive model selection.
//           </p>
//         </div>

//         {/* Notification Banner */}
//         {notification.visible && (
//           <div style={{
//             ...styles.notification,
//             background: notification.type === 'error'
//               ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.2))'
//               : 'linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(4, 120, 87, 0.2))',
//             border: `1px solid ${notification.type === 'error' 
//               ? 'rgba(220, 38, 38, 0.4)' 
//               : 'rgba(5, 150, 105, 0.4)'}`,
//             color: '#ffffff'
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//               <span style={{ fontSize: '1.25rem' }}>
//                 {notification.type === 'error' ? '⚠️' : '✅'}
//               </span>
//               <span>{notification.message}</span>
//             </div>
//             <button
//               onClick={dismissNotification}
//               style={{
//                 background: 'transparent',
//                 border: 'none',
//                 color: '#ffffff',
//                 fontSize: '1.5rem',
//                 cursor: 'pointer',
//                 padding: '0 0.5rem',
//                 fontWeight: '700'
//               }}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Main Grid */}
//         <div style={{...styles.gridContainer}} className="grid-responsive">
//           {/* Upload Panel */}
//           <div style={{...styles.panel}} className="hover-lift panel-responsive">
//             <div style={styles.panelTitle}>
//               <span>📂</span>
//               <span>Data Upload</span>
//             </div>

//             <div
//               style={{
//                 ...styles.uploadZone,
//                 ...(state.isDragging ? styles.uploadZoneActive : {})
//               }}
//               onClick={() => fileInputRef.current?.click()}
//               onDragEnter={handleDragEnter}
//               onDragLeave={handleDragLeave}
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".csv"
//                 onChange={handleFileSelect}
//                 style={{ display: 'none' }}
//                 disabled={state.processingStatus}
//               />

//               <div style={{ 
//                 fontSize: '3.5rem', 
//                 marginBottom: '1.5rem', 
//                 opacity: 0.85,
//                 animation: state.isDragging ? 'pulse 1s infinite' : 'none'
//               }}>
//                 {state.selectedFile ? '📄' : '☁️'}
//               </div>

//               {state.selectedFile ? (
//                 <div>
//                   <div style={{ 
//                     color: '#ffffff', 
//                     fontWeight: '700', 
//                     fontSize: '1.1rem',
//                     marginBottom: '0.75rem' 
//                   }}>
//                     {state.selectedFile.name}
//                   </div>
//                   <div style={{ 
//                     color: 'rgba(255, 255, 255, 0.65)', 
//                     fontSize: '0.95rem',
//                     marginBottom: '1rem'
//                   }}>
//                     {Utils.formatFileSize(state.selectedFile.size)}
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       clearFile();
//                     }}
//                     style={{
//                       padding: '0.5rem 1.25rem',
//                       background: 'rgba(220, 38, 38, 0.2)',
//                       color: '#fff',
//                       border: '1px solid rgba(220, 38, 38, 0.4)',
//                       borderRadius: '8px',
//                       fontSize: '0.85rem',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                       transition: 'all 0.3s ease'
//                     }}
//                   >
//                     Remove File
//                   </button>
//                 </div>
//               ) : (
//                 <div>
//                   <div style={{ 
//                     color: '#ffffff', 
//                     fontWeight: '700', 
//                     fontSize: '1.1rem',
//                     marginBottom: '0.75rem' 
//                   }}>
//                     Drop CSV file here
//                   </div>
//                   <div style={{ 
//                     color: 'rgba(255, 255, 255, 0.65)', 
//                     fontSize: '0.95rem' 
//                   }}>
//                     or click to browse • Max {Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={processUpload}
//               disabled={state.processingStatus || !state.selectedFile}
//               className="hover-scale"
//               style={{
//                 ...styles.button,
//                 ...styles.buttonPrimary,
//                 marginTop: '1.5rem',
//                 width: '100%',
//                 justifyContent: 'center',
//                 opacity: (state.processingStatus || !state.selectedFile) ? 0.5 : 1,
//                 cursor: (state.processingStatus || !state.selectedFile) ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {state.processingStatus && state.uploadProgress > 0 && (
//                 <div style={{ ...styles.progressBar, width: `${state.uploadProgress}%` }}></div>
//               )}
//               {state.processingStatus ? (
//                 <>
//                   <div style={styles.loader}></div>
//                   <span>
//                     {state.uploadProgress > 0 && state.uploadProgress < 100
//                       ? `Processing ${state.uploadProgress}%`
//                       : 'Analyzing Data...'}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span>🚀</span>
//                   <span>Generate Predictions</span>
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Performance Metrics */}
//           {state.performanceMetrics && state.currentView === 'predictions' && (
//             <>
//               <div style={styles.metricCard} className="hover-lift">
//                 <div style={styles.metricLabel}>LSTM Model</div>
//                 <div style={styles.metricValue}>{state.performanceMetrics.lstm_usage}</div>
//                 <div style={{ 
//                   color: 'rgba(255, 255, 255, 0.75)', 
//                   fontSize: '0.95rem',
//                   marginTop: '0.75rem',
//                   fontWeight: '600'
//                 }}>
//                   {state.performanceMetrics.lstm_percentage}% of predictions
//                 </div>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   height: '4px',
//                   width: `${state.performanceMetrics.lstm_percentage}%`,
//                   background: `linear-gradient(90deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//                   transition: 'width 1s ease'
//                 }}></div>
//               </div>

//               <div style={styles.metricCard} className="hover-lift">
//                 <div style={styles.metricLabel}>Transformer Model</div>
//                 <div style={styles.metricValue}>{state.performanceMetrics.transformer_usage}</div>
//                 <div style={{ 
//                   color: 'rgba(255, 255, 255, 0.75)', 
//                   fontSize: '0.95rem',
//                   marginTop: '0.75rem',
//                   fontWeight: '600'
//                 }}>
//                   {state.performanceMetrics.transformer_percentage}% of predictions
//                 </div>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   height: '4px',
//                   width: `${state.performanceMetrics.transformer_percentage}%`,
//                   background: `linear-gradient(90deg, ${THEME_COLORS.accent.cyan}, ${THEME_COLORS.primary.purple})`,
//                   transition: 'width 1s ease'
//                 }}></div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Results Section */}
//         {state.predictionResults.length > 0 && (
//           <>
//             {/* View Toggle */}
//             <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
//               <button
//                 onClick={toggleView}
//                 className="hover-scale"
//                 style={{...styles.button, ...styles.buttonSecondary}}
//               >
//                 <span>{state.currentView === 'predictions' ? '📊' : '🔮'}</span>
//                 <span>{state.currentView === 'predictions' ? 'View Source Data' : 'View Predictions'}</span>
//               </button>
//             </div>

//             {/* Model Strategy Info */}
//             {state.performanceMetrics && state.currentView === 'predictions' && (
//               <div style={{
//                 ...styles.panel,
//                 marginBottom: '2.5rem',
//                 background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}15, ${THEME_COLORS.primary.purple}15)`,
//                 border: `1px solid ${THEME_COLORS.primary.blue}30`
//               }} className="hover-lift">
//                 <div style={{
//                   display: 'flex',
//                   alignItems: 'flex-start',
//                   gap: '1.5rem'
//                 }}>
//                   <span style={{ fontSize: '2rem' }}>🧠</span>
//                   <div>
//                     <div style={{ 
//                       color: '#ffffff', 
//                       fontWeight: '700', 
//                       marginBottom: '0.875rem',
//                       fontSize: '1.2rem'
//                     }}>
//                       Adaptive Intelligence Strategy
//                     </div>
//                     <div style={{ 
//                       color: 'rgba(255, 255, 255, 0.85)', 
//                       fontSize: '1rem',
//                       lineHeight: '1.75'
//                     }}>
//                       Our system employs intelligent model selection, dynamically choosing between LSTM 
//                       and Transformer architectures based on temporal characteristics. LSTM networks excel 
//                       at sequential patterns with consistent intervals, while Transformers demonstrate 
//                       superior performance on irregular sequences and long-range dependencies.
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Dataset Overview */}
//             {dataStatistics && (
//               <div style={{...styles.panel, marginBottom: '2.5rem'}} className="hover-lift">
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginBottom: '1.5rem',
//                   flexWrap: 'wrap',
//                   gap: '1rem'
//                 }}>
//                   <div style={styles.panelTitle}>
//                     <span>📊</span>
//                     <span>Dataset Analytics</span>
//                   </div>
//                   {dataStatistics.detailedStats && (
//                     <button
//                       onClick={toggleDetailedStats}
//                       style={{
//                         padding: '0.625rem 1.25rem',
//                         background: 'rgba(255, 255, 255, 0.1)',
//                         color: '#fff',
//                         border: '1px solid rgba(255, 255, 255, 0.2)',
//                         borderRadius: '10px',
//                         fontSize: '0.85rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.3s ease'
//                       }}
//                     >
//                       {uiState.showDetailedStats ? 'Hide' : 'Show'} Statistics
//                     </button>
//                   )}
//                 </div>

//                 <div style={{...styles.gridContainer}} className="grid-responsive">
//                   <div style={styles.statsCard}>
//                     <div style={{ 
//                       color: 'rgba(255, 255, 255, 0.7)', 
//                       fontSize: '0.85rem',
//                       fontWeight: '600',
//                       marginBottom: '0.75rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.05em'
//                     }}>
//                       Total Records
//                     </div>
//                     <div style={{ color: '#ffffff', fontSize: '2.25rem', fontWeight: '900' }}>
//                       {dataStatistics.totalRecords.toLocaleString()}
//                     </div>
//                   </div>
//                   <div style={{...styles.statsCard, gridColumn: 'span 2'}}>
//                     <div style={{ 
//                       color: 'rgba(255, 255, 255, 0.7)', 
//                       fontSize: '0.85rem',
//                       fontWeight: '600',
//                       marginBottom: '0.75rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.05em'
//                     }}>
//                       Time Coverage
//                     </div>
//                     <div style={{ 
//                       color: '#ffffff', 
//                       fontSize: '1rem', 
//                       fontWeight: '700',
//                       fontFamily: '"JetBrains Mono", monospace'
//                     }}>
//                       {dataStatistics.timeRange}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed Statistics */}
//                 {uiState.showDetailedStats && dataStatistics.detailedStats && (
//                   <div style={{ marginTop: '2rem' }}>
//                     <div style={{
//                       color: '#ffffff',
//                       fontSize: '1.1rem',
//                       fontWeight: '700',
//                       marginBottom: '1.5rem'
//                     }}>
//                       Statistical Analysis
//                     </div>
//                     <div style={{...styles.gridContainer}} className="grid-responsive">
//                       {Object.entries(dataStatistics.detailedStats).map(([field, stats]) => (
//                         <div key={field} style={styles.statsCard}>
//                           <div style={{
//                             fontSize: '0.9rem',
//                             fontWeight: '700',
//                             color: THEME_COLORS.chart[field],
//                             marginBottom: '1rem',
//                             textTransform: 'uppercase',
//                             letterSpacing: '0.05em'
//                           }}>
//                             {field.replace(/_/g, ' ')}
//                           </div>
//                           <div style={{ 
//                             fontSize: '0.85rem', 
//                             color: 'rgba(255, 255, 255, 0.8)', 
//                             lineHeight: '1.9',
//                             fontFamily: '"JetBrains Mono", monospace'
//                           }}>
//                             <div><strong>Mean:</strong> {Utils.formatNumber(stats.mean, 6)}</div>
//                             <div><strong>Median:</strong> {Utils.formatNumber(stats.median, 6)}</div>
//                             <div><strong>Min:</strong> {Utils.formatNumber(stats.min, 6)}</div>
//                             <div><strong>Max:</strong> {Utils.formatNumber(stats.max, 6)}</div>
//                             <div><strong>Std Dev:</strong> {Utils.formatNumber(stats.stdDev, 6)}</div>
//                             <div><strong>Range:</strong> {Utils.formatNumber(stats.range, 6)}</div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Position Errors Chart */}
//             <div style={styles.chartWrapper} className="hover-lift">
//               <h3 style={{
//                 color: '#ffffff',
//                 fontSize: '1.4rem',
//                 fontWeight: '800',
//                 marginBottom: '2rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.875rem'
//               }}>
//                 <span>📍</span>
//                 <span>Positional Error Analysis (X, Y, Z)</span>
//               </h3>
//               <Line
//                 data={generateChartData(DATA_FIELDS.POSITION_ERRORS)}
//                 options={{
//                   ...chartOptions,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       ...chartOptions.scales.y,
//                       title: { 
//                         ...chartOptions.scales.y.title, 
//                         text: 'Error Magnitude (meters)' 
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>

//             {/* Clock Error Chart */}
//             <div style={styles.chartWrapper} className="hover-lift">
//               <h3 style={{
//                 color: '#ffffff',
//                 fontSize: '1.4rem',
//                 fontWeight: '800',
//                 marginBottom: '2rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.875rem'
//               }}>
//                 <span>⏱️</span>
//                 <span>Satellite Clock Error Trends</span>
//               </h3>
//               <Line
//                 data={generateChartData(DATA_FIELDS.CLOCK_ERROR)}
//                 options={{
//                   ...chartOptions,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       ...chartOptions.scales.y,
//                       title: { 
//                         ...chartOptions.scales.y.title, 
//                         text: 'Timing Deviation (seconds)' 
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>

//             {/* Data Table */}
//             <div style={styles.panel} className="hover-lift">
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '2rem',
//                 flexWrap: 'wrap',
//                 gap: '1rem'
//               }}>
//                 <div style={{...styles.panelTitle, marginBottom: 0}}>
//                   <span>{state.currentView === 'predictions' ? '🔮' : '📋'}</span>
//                   <span>{state.currentView === 'predictions' ? 'Forecast Results' : 'Source Dataset'}</span>
//                 </div>
//                 <div style={{
//                   ...styles.badge,
//                   background: `${THEME_COLORS.primary.blue}25`,
//                   color: THEME_COLORS.chart.x_error,
//                   border: `1px solid ${THEME_COLORS.primary.blue}40`
//                 }}>
//                   <span>📊</span>
//                   <span>{activeData.length} Records</span>
//                 </div>
//               </div>

//               <div style={styles.tableWrapper}>
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       {activeData.length > 0 && Object.keys(activeData[0]).map(column => (
//                         <th key={column} style={styles.tableHeader}>
//                           {column.replace(/_/g, ' ')}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {activeData.map((row, index) => (
//                       <tr key={index} className="table-row-hover">
//                         {Object.entries(row).map(([key, value], cellIndex) => (
//                           <td key={cellIndex} style={styles.tableCell}>
//                             {Utils.formatNumber(value, 6)}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Footer */}
//             <div style={{
//               ...styles.panel,
//               marginTop: '3rem',
//               background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
//               textAlign: 'center'
//             }}>
//               <div style={{
//                 color: 'rgba(255, 255, 255, 0.75)',
//                 fontSize: '0.95rem',
//                 lineHeight: '2'
//               }}>
//                 <div style={{ marginBottom: '0.875rem' }}>
//                   <span style={{ color: '#ffffff', fontWeight: '700' }}>🔒 Secure & Private</span> • 
//                   End-to-end encryption with zero data retention policy
//                 </div>
//                 <div>
//                   <span style={{ color: '#ffffff', fontWeight: '700' }}>⚡ GPU Accelerated</span> • 
//                   High-performance neural networks optimized for real-time forecasting
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SatelliteErrorPredictor;







// gooooddddddddddddddddddddddddddddddddddddddddddddddddd




// import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";

// Chart.register(...registerables);

// // ============================================================================
// // CONFIGURATION & CONSTANTS
// // ============================================================================
// const APP_CONFIG = {
//   API_ENDPOINT: "http://127.0.0.1:8000/predict/",
//   MAX_FILE_SIZE: 10485760, // 10MB
//   REQUEST_TIMEOUT: 60000,
//   ALLOWED_EXTENSIONS: ['.csv'],
//   DEBOUNCE_DELAY: 300
// };

// const DATA_FIELDS = {
//   POSITION_ERRORS: ['x_error', 'y_error', 'z_error'],
//   CLOCK_ERROR: ['satclockerror'],
//   ALL_FIELDS: ['x_error', 'y_error', 'z_error', 'satclockerror']
// };

// const THEME_COLORS = {
//   primary: { blue: '#2563eb', purple: '#7c3aed' },
//   accent: { cyan: '#06b6d4', orange: '#f59e0b' },
//   status: { success: '#059669', warning: '#d97706', error: '#dc2626' },
//   chart: {
//     x_error: '#3b82f6',
//     y_error: '#06b6d4',
//     z_error: '#8b5cf6',
//     satclockerror: '#f59e0b'
//   },
//   background: { light: '#ffffff', medium: '#f8fafc', dark: '#f1f5f9' }
// };

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================
// const Utils = {
//   formatFileSize: (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const units = ['Bytes', 'KB', 'MB', 'GB'];
//     const index = Math.floor(Math.log(bytes) / Math.log(1024));
//     return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
//   },

//   formatNumber: (value, decimals = 6) => {
//     return typeof value === 'number' && isFinite(value) 
//       ? value.toFixed(decimals) 
//       : value;
//   },

//   validateFile: (file) => {
//     if (!file) return { valid: false, message: 'No file selected' };
    
//     const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
//     if (!APP_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
//       return { valid: false, message: 'Only CSV files are supported' };
//     }
    
//     if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
//       return { valid: false, message: `File exceeds ${Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)} limit` };
//     }
    
//     return { valid: true, message: 'File validated successfully' };
//   },

//   calculateStatistics: (data, fields) => {
//     if (!data || !data.length || !fields) return null;

//     const stats = {};
//     fields.forEach(field => {
//       const values = data
//         .map(row => parseFloat(row[field]))
//         .filter(v => isFinite(v));

//       if (values.length > 0) {
//         const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
//         const sortedValues = [...values].sort((a, b) => a - b);
//         const median = sortedValues[Math.floor(sortedValues.length / 2)];
        
//         stats[field] = {
//           mean,
//           median,
//           min: Math.min(...values),
//           max: Math.max(...values),
//           stdDev: Math.sqrt(
//             values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
//           ),
//           range: Math.max(...values) - Math.min(...values)
//         };
//       }
//     });

//     return Object.keys(stats).length > 0 ? stats : null;
//   },

//   debounce: (func, delay) => {
//     let timeoutId;
//     return (...args) => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(() => func(...args), delay);
//     };
//   }
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================
// const SatelliteErrorPredictor = () => {
//   // State Management
//   const [state, setState] = useState({
//     selectedFile: null,
//     uploadedDataset: [],
//     predictionResults: [],
//     performanceMetrics: null,
//     processingStatus: false,
//     currentView: 'predictions',
//     uploadProgress: 0,
//     isDragging: false
//   });

//   const [notification, setNotification] = useState({ 
//     visible: false, 
//     type: '', 
//     message: '' 
//   });

//   const [uiState, setUiState] = useState({
//     showDetailedStats: false,
//     selectedChart: 'position',
//     tableSearchTerm: ''
//   });

//   const fileInputRef = useRef(null);
//   const chartRefs = useRef({});

//   // Lifecycle Effects
//   useEffect(() => {
//     return () => {
//       Object.values(chartRefs.current).forEach(chart => {
//         if (chart) chart.destroy();
//       });
//     };
//   }, []);

//   // ============================================================================
//   // STYLES - CHANGED TO WHITE BACKGROUND
//   // ============================================================================
//   const styles = useMemo(() => ({
//     mainContainer: {
//       minHeight: '100vh',
//       background: '#ffffff',
//       padding: '2.5rem 1.5rem',
//       fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
//       position: 'relative'
//     },
//     backgroundOverlay: {
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       background: `
//         radial-gradient(circle at 20% 30%, ${THEME_COLORS.primary.blue}05 0%, transparent 50%),
//         radial-gradient(circle at 80% 70%, ${THEME_COLORS.primary.purple}05 0%, transparent 50%)
//       `,
//       pointerEvents: 'none',
//       zIndex: 0
//     },
//     contentWrapper: {
//       maxWidth: '1440px',
//       margin: '0 auto',
//       position: 'relative',
//       zIndex: 1
//     },
//     headerPanel: {
//       background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
//       border: '1px solid #e2e8f0',
//       borderRadius: '24px',
//       padding: '3rem 2.5rem',
//       marginBottom: '2.5rem',
//       boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
//       transition: 'all 0.3s ease'
//     },
//     mainTitle: {
//       fontSize: '2.5rem',
//       fontWeight: '900',
//       background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//       WebkitBackgroundClip: 'text',
//       WebkitTextFillColor: 'transparent',
//       marginBottom: '1rem',
//       letterSpacing: '-0.03em',
//       lineHeight: '1.2'
//     },
//     subtitle: {
//       fontSize: '1.05rem',
//       color: '#64748b',
//       lineHeight: '1.7',
//       maxWidth: '800px'
//     },
//     gridContainer: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
//       gap: '2rem',
//       marginBottom: '2.5rem'
//     },
//     panel: {
//       background: '#ffffff',
//       border: '1px solid #e2e8f0',
//       borderRadius: '20px',
//       padding: '2rem',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
//       transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//       position: 'relative',
//       overflow: 'hidden'
//     },
//     panelTitle: {
//       fontSize: '1.35rem',
//       fontWeight: '700',
//       color: '#1e293b',
//       marginBottom: '1.5rem',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.75rem'
//     },
//     uploadZone: {
//       border: `2px dashed ${THEME_COLORS.primary.blue}40`,
//       borderRadius: '16px',
//       padding: '3.5rem 2rem',
//       textAlign: 'center',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       background: '#f8fafc',
//       position: 'relative'
//     },
//     uploadZoneActive: {
//       borderColor: THEME_COLORS.primary.blue,
//       background: `${THEME_COLORS.primary.blue}10`,
//       transform: 'scale(1.02)',
//       boxShadow: `0 0 30px ${THEME_COLORS.primary.blue}20`
//     },
//     button: {
//       padding: '1rem 2rem',
//       borderRadius: '14px',
//       border: 'none',
//       fontWeight: '700',
//       fontSize: '1.05rem',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '0.75rem',
//       position: 'relative',
//       overflow: 'hidden'
//     },
//     buttonPrimary: {
//       background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//       color: '#ffffff',
//       boxShadow: `0 8px 24px ${THEME_COLORS.primary.blue}40`
//     },
//     buttonSecondary: {
//       background: '#f8fafc',
//       color: THEME_COLORS.primary.blue,
//       border: `2px solid ${THEME_COLORS.primary.blue}`,
//       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
//     },
//     metricCard: {
//       background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}10, ${THEME_COLORS.primary.purple}10)`,
//       border: `2px solid ${THEME_COLORS.primary.blue}30`,
//       borderRadius: '16px',
//       padding: '1.75rem',
//       position: 'relative',
//       overflow: 'hidden'
//     },
//     metricLabel: {
//       fontSize: '0.9rem',
//       color: '#64748b',
//       textTransform: 'uppercase',
//       letterSpacing: '0.08em',
//       fontWeight: '700',
//       marginBottom: '0.875rem'
//     },
//     metricValue: {
//       fontSize: '2.5rem',
//       fontWeight: '900',
//       background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//       WebkitBackgroundClip: 'text',
//       WebkitTextFillColor: 'transparent',
//       lineHeight: '1',
//       marginBottom: '0.5rem'
//     },
//     chartWrapper: {
//       background: '#ffffff',
//       border: '1px solid #e2e8f0',
//       borderRadius: '20px',
//       padding: '2.5rem',
//       marginBottom: '2.5rem',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
//     },
//     tableWrapper: {
//       maxHeight: '550px',
//       overflowY: 'auto',
//       overflowX: 'auto',
//       borderRadius: '16px',
//       border: '1px solid #e2e8f0',
//       boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.03)'
//     },
//     table: {
//       width: '100%',
//       borderCollapse: 'collapse',
//       fontSize: '1rem' // INCREASED FROM 0.9rem
//     },
//     tableHeader: {
//       padding: '1.5rem 1.75rem', // INCREASED PADDING
//       background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
//       color: '#1e293b',
//       fontWeight: '700',
//       textAlign: 'left',
//       textTransform: 'uppercase',
//       fontSize: '0.95rem', // INCREASED FROM 0.8rem
//       letterSpacing: '0.08em',
//       position: 'sticky',
//       top: 0,
//       zIndex: 10,
//       borderBottom: '2px solid #cbd5e1'
//     },
//     tableCell: {
//       padding: '1.35rem 1.75rem', // INCREASED PADDING
//       color: '#334155',
//       borderBottom: '1px solid #f1f5f9',
//       fontFamily: '"JetBrains Mono", ui-monospace, monospace',
//       fontSize: '0.95rem' // INCREASED FROM 0.85rem
//     },
//     notification: {
//       padding: '1.25rem 1.75rem',
//       borderRadius: '16px',
//       marginBottom: '2rem',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       fontWeight: '600',
//       fontSize: '0.95rem',
//       animation: 'slideInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//       boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)'
//     },
//     badge: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       padding: '0.5rem 1.125rem',
//       borderRadius: '10px',
//       fontSize: '0.8rem',
//       fontWeight: '700',
//       textTransform: 'uppercase',
//       letterSpacing: '0.05em',
//       gap: '0.5rem'
//     },
//     progressBar: {
//       position: 'absolute',
//       bottom: 0,
//       left: 0,
//       height: '4px',
//       background: `linear-gradient(90deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//       transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//       borderRadius: '0 0 14px 14px'
//     },
//     loader: {
//       width: '24px',
//       height: '24px',
//       border: '3px solid rgba(255, 255, 255, 0.25)',
//       borderTopColor: '#ffffff',
//       borderRadius: '50%',
//       animation: 'spin 0.8s linear infinite'
//     },
//     statsCard: {
//       background: '#f8fafc',
//       border: '1px solid #e2e8f0',
//       borderRadius: '12px',
//       padding: '1.25rem',
//       transition: 'all 0.3s ease'
//     }
//   }), []);

//   // ============================================================================
//   // EVENT HANDLERS
//   // ============================================================================
//   const handleFileSelect = useCallback((event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validation = Utils.validateFile(file);
//     if (!validation.valid) {
//       setNotification({ visible: true, type: 'error', message: validation.message });
//       return;
//     }

//     setState(prev => ({ ...prev, selectedFile: file }));
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const handleDragEnter = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: true }));
//   }, []);

//   const handleDragLeave = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: false }));
//   }, []);

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   }, []);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: false }));

//     const file = e.dataTransfer.files?.[0];
//     if (!file) return;

//     const validation = Utils.validateFile(file);
//     if (!validation.valid) {
//       setNotification({ visible: true, type: 'error', message: validation.message });
//       return;
//     }

//     setState(prev => ({ ...prev, selectedFile: file }));
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const processUpload = useCallback(async () => {
//     if (!state.selectedFile) {
//       setNotification({ visible: true, type: 'error', message: 'Please select a file to upload' });
//       return;
//     }

//     setState(prev => ({ ...prev, processingStatus: true, uploadProgress: 0 }));
//     setNotification({ visible: false, type: '', message: '' });

//     try {
//       const formData = new FormData();
//       formData.append("file", state.selectedFile);

//       const response = await axios.post(APP_CONFIG.API_ENDPOINT, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setState(prev => ({ ...prev, uploadProgress: progress }));
//         },
//         timeout: APP_CONFIG.REQUEST_TIMEOUT
//       });

//       if (response.data.error) {
//         throw new Error(response.data.error);
//       }

//       setState(prev => ({
//         ...prev,
//         uploadedDataset: response.data.table_data || [],
//         predictionResults: response.data.prediction || [],
//         performanceMetrics: response.data.summary || null,
//         currentView: 'predictions',
//         processingStatus: false
//       }));

//       setNotification({ 
//         visible: true, 
//         type: 'success', 
//         message: 'Predictions generated successfully!' 
//       });

//       setTimeout(() => {
//         setNotification(prev => ({ ...prev, visible: false }));
//       }, 5000);

//     } catch (error) {
//       console.error('Upload failed:', error);
      
//       let errorMessage = 'Processing failed. Please try again.';
//       if (error.code === 'ECONNABORTED') {
//         errorMessage = 'Request timed out. Server might be overloaded.';
//       } else if (error.response) {
//         errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || error.message}`;
//       } else if (error.request) {
//         errorMessage = 'Cannot connect to server. Ensure backend is running at ' + APP_CONFIG.API_ENDPOINT;
//       } else {
//         errorMessage = error.message;
//       }

//       setNotification({ visible: true, type: 'error', message: errorMessage });
//       setState(prev => ({ ...prev, processingStatus: false, uploadProgress: 0 }));
//     }
//   }, [state.selectedFile]);

//   const toggleView = useCallback(() => {
//     setState(prev => ({ 
//       ...prev, 
//       currentView: prev.currentView === 'predictions' ? 'uploaded' : 'predictions' 
//     }));
//   }, []);

//   const dismissNotification = useCallback(() => {
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const toggleDetailedStats = useCallback(() => {
//     setUiState(prev => ({ ...prev, showDetailedStats: !prev.showDetailedStats }));
//   }, []);

//   const clearFile = useCallback(() => {
//     setState(prev => ({ ...prev, selectedFile: null }));
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   }, []);

//   // ============================================================================
//   // COMPUTED VALUES
//   // ============================================================================
//   const activeData = useMemo(() => 
//     state.currentView === 'predictions' ? state.predictionResults : state.uploadedDataset,
//     [state.currentView, state.predictionResults, state.uploadedDataset]
//   );

//   const dataStatistics = useMemo(() => {
//     if (!activeData?.length) return null;

//     const firstTime = activeData[0]?.predicted_time || activeData[0]?.utc_time || 'N/A';
//     const lastTime = activeData[activeData.length - 1]?.predicted_time || 
//                      activeData[activeData.length - 1]?.utc_time || 'N/A';

//     return {
//       totalRecords: activeData.length,
//       timeRange: `${firstTime} → ${lastTime}`,
//       detailedStats: Utils.calculateStatistics(activeData, DATA_FIELDS.ALL_FIELDS)
//     };
//   }, [activeData]);

//   // ============================================================================
//   // CHART CONFIGURATION
//   // ============================================================================
//   const generateChartData = useCallback((fields) => {
//     if (!activeData?.length) return { labels: [], datasets: [] };

//     const labels = activeData.map((item, idx) => 
//       item.predicted_time || item.utc_time || `T${idx + 1}`
//     );

//     return {
//       labels,
//       datasets: fields.map(field => {
//         const color = THEME_COLORS.chart[field] || '#94a3b8';
//         return {
//           label: field.replace(/_/g, ' ').toUpperCase(),
//           data: activeData.map(item => {
//             const value = parseFloat(item[field]);
//             return isFinite(value) ? value : null;
//           }),
//           borderColor: color,
//           backgroundColor: `${color}25`,
//           borderWidth: 3,
//           pointRadius: 4.5,
//           pointHoverRadius: 9,
//           pointBackgroundColor: color,
//           pointBorderColor: '#ffffff',
//           pointBorderWidth: 2.5,
//           tension: 0.4,
//           fill: true,
//           spanGaps: true
//         };
//       })
//     };
//   }, [activeData]);

//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: true,
//     animation: { 
//       duration: 750,
//       easing: 'easeInOutCubic'
//     },
//     interaction: {
//       mode: 'index',
//       intersect: false
//     },
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           color: '#1e293b',
//           padding: 22,
//           font: { size: 13, weight: '700', family: '"Inter", sans-serif' },
//           usePointStyle: true,
//           pointStyle: 'circle',
//           boxWidth: 12,
//           boxHeight: 12
//         }
//       },
//       tooltip: {
//         enabled: true,
//         backgroundColor: 'rgba(15, 23, 42, 0.95)',
//         titleColor: '#ffffff',
//         bodyColor: 'rgba(255, 255, 255, 0.9)',
//         borderColor: 'rgba(255, 255, 255, 0.2)',
//         borderWidth: 1,
//         padding: 16,
//         cornerRadius: 12,
//         titleFont: { size: 14, weight: '700' },
//         bodyFont: { size: 13, weight: '500' },
//         displayColors: true,
//         callbacks: {
//           label: (context) => {
//             const label = context.dataset.label || '';
//             const value = Utils.formatNumber(context.parsed.y, 6);
//             return `${label}: ${value}`;
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: { 
//           color: 'rgba(0, 0, 0, 0.06)',
//           drawBorder: false
//         },
//         ticks: {
//           color: '#64748b',
//           font: { size: 11, weight: '500' },
//           maxRotation: 45,
//           minRotation: 0,
//           autoSkip: true,
//           maxTicksLimit: 15
//         },
//         title: {
//           display: true,
//           text: 'Time Sequence',
//           color: '#1e293b',
//           font: { size: 13, weight: '700' },
//           padding: { top: 12 }
//         }
//       },
//       y: {
//         grid: {
//           color: 'rgba(0, 0, 0, 0.06)',
//           drawBorder: false
//         },
//         ticks: {
//           color: '#64748b',
//           font: { size: 11, weight: '500' },
//           callback: (value) => Utils.formatNumber(value, 4)
//         },
//         title: {
//           display: true,
//           color: '#1e293b',
//           font: { size: 13, weight: '700' },
//           padding: { bottom: 12 }
//         }
//       }
//     }
//   }), []);

//   // ============================================================================
//   // RENDER
//   // ============================================================================
//   return (
//     <div style={styles.mainContainer}>
//       <div style={styles.backgroundOverlay}></div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes slideInDown {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.6; }
//         }
        
//         .hover-lift:hover {
//           transform: translateY(-6px);
//           box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12) !important;
//         }
        
//         .hover-scale:hover:not(:disabled) {
//           transform: translateY(-3px) scale(1.02);
//           box-shadow: 0 12px 36px rgba(37, 99, 235, 0.5) !important;
//         }
        
//         .hover-scale:active:not(:disabled) {
//           transform: translateY(-1px) scale(1.01);
//         }
        
//         .table-row-hover:hover {
//           background: #f8fafc !important;
//         }
        
//         /* Smooth scrollbar */
//         ::-webkit-scrollbar {
//           width: 10px;
//           height: 10px;
//         }
//         ::-webkit-scrollbar-track {
//           background: #f1f5f9;
//           border-radius: 6px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: linear-gradient(135deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple});
//           border-radius: 6px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: ${THEME_COLORS.primary.blue};
//         }
        
//         /* Responsive Design */
//         @media (max-width: 768px) {
//           .grid-responsive {
//             grid-template-columns: 1fr !important;
//             gap: 1.5rem !important;
//           }
//           .panel-responsive {
//             padding: 1.5rem !important;
//           }
//         }
//       `}</style>

//       {/* <div style={styles.contentWrapper}> */}
//         {/* Header Section */}
//         <div style={styles.headerPanel} className="hover-lift">
//           {/* <h1 style={styles.mainTitle}>
//             Advanced Satellite Error Prediction System
//           </h1> */}
//           {/* <p style={styles.subtitle}>
//             Leverage state-of-the-art hybrid LSTM-Transformer architecture for precise GNSS error forecasting.
//             Upload 7-day historical satellite data to generate sophisticated day-8 predictions with adaptive model selection.
//           </p> */}
//         {/* </div> */}

//         {/* Notification Banner */}
//         {notification.visible && (
//           <div style={{
//             ...styles.notification,
//             background: notification.type === 'error'
//               ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
//               : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
//             border: `1px solid ${notification.type === 'error' 
//               ? '#fca5a5' 
//               : '#6ee7b7'}`,
//             color: notification.type === 'error' ? '#991b1b' : '#065f46'
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//               <span style={{ fontSize: '1.25rem' }}>
//                 {notification.type === 'error' ? '⚠️' : '✅'}
//               </span>
//               <span>{notification.message}</span>
//             </div>
//             <button
//               onClick={dismissNotification}
//               style={{
//                 background: 'transparent',
//                 border: 'none',
//                 color: 'inherit',
//                 fontSize: '1.5rem',
//                 cursor: 'pointer',
//                 padding: '0 0.5rem',
//                 fontWeight: '700'
//               }}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Main Grid */}
//         <div style={{...styles.gridContainer}} className="grid-responsive">
//           {/* Upload Panel */}
//           <div style={{...styles.panel}} className="hover-lift panel-responsive">
//             <div style={styles.panelTitle}>
//               <span>📂</span>
//               <span>Data Upload</span>
//             </div>

//             <div
//               style={{
//                 ...styles.uploadZone,
//                 ...(state.isDragging ? styles.uploadZoneActive : {})
//               }}
//               onClick={() => fileInputRef.current?.click()}
//               onDragEnter={handleDragEnter}
//               onDragLeave={handleDragLeave}
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".csv"
//                 onChange={handleFileSelect}
//                 style={{ display: 'none' }}
//                 disabled={state.processingStatus}
//               />

//               <div style={{ 
//                 fontSize: '3.5rem', 
//                 marginBottom: '1.5rem', 
//                 opacity: 0.85,
//                 animation: state.isDragging ? 'pulse 1s infinite' : 'none'
//               }}>
//                 {state.selectedFile ? '📄' : '☁️'}
//               </div>

//               {state.selectedFile ? (
//                 <div>
//                   <div style={{ 
//                     color: '#1e293b', 
//                     fontWeight: '700', 
//                     fontSize: '1.1rem',
//                     marginBottom: '0.75rem' 
//                   }}>
//                     {state.selectedFile.name}
//                   </div>
//                   <div style={{ 
//                     color: '#64748b', 
//                     fontSize: '0.95rem',
//                     marginBottom: '1rem'
//                   }}>
//                     {Utils.formatFileSize(state.selectedFile.size)}
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       clearFile();
//                     }}
//                     style={{
//                       padding: '0.5rem 1.25rem',
//                       background: '#fee2e2',
//                       color: '#991b1b',
//                       border: '1px solid #fca5a5',
//                       borderRadius: '8px',
//                       fontSize: '0.85rem',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                       transition: 'all 0.3s ease'
//                     }}
//                   >
//                     Remove File
//                   </button>
//                 </div>
//               ) : (
//                 <div>
//                   <div style={{ 
//                     color: '#1e293b', 
//                     fontWeight: '700', 
//                     fontSize: '1.1rem',
//                     marginBottom: '0.75rem' 
//                   }}>
//                     Drop CSV file here
//                   </div>
//                   <div style={{ 
//                     color: '#64748b', 
//                     fontSize: '0.95rem' 
//                   }}>
//                     or click to browse • Max {Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={processUpload}
//               disabled={state.processingStatus || !state.selectedFile}
//               className="hover-scale"
//               style={{
//                 ...styles.button,
//                 ...styles.buttonPrimary,
//                 marginTop: '1.5rem',
//                 width: '100%',
//                 justifyContent: 'center',
//                 opacity: (state.processingStatus || !state.selectedFile) ? 0.5 : 1,
//                 cursor: (state.processingStatus || !state.selectedFile) ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {state.processingStatus && state.uploadProgress > 0 && (
//                 <div style={{ ...styles.progressBar, width: `${state.uploadProgress}%` }}></div>
//               )}
//               {state.processingStatus ? (
//                 <>
//                   <div style={styles.loader}></div>
//                   <span>
//                     {state.uploadProgress > 0 && state.uploadProgress < 100
//                       ? `Processing ${state.uploadProgress}%`
//                       : 'Analyzing Data...'}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span></span>
//                   <span>Generate Predictions</span>
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Performance Metrics */}
//           {state.performanceMetrics && state.currentView === 'predictions' && (
//             <>
//               <div style={styles.metricCard} className="hover-lift">
//                 <div style={styles.metricLabel}>LSTM Model</div>
//                 <div style={styles.metricValue}>{state.performanceMetrics.lstm_usage}</div>
//                 <div style={{ 
//                   color: '#64748b', 
//                   fontSize: '0.95rem',
//                   marginTop: '0.75rem',
//                   fontWeight: '600'
//                 }}>
//                   {state.performanceMetrics.lstm_percentage}% of predictions
//                 </div>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   height: '4px',
//                   width: `${state.performanceMetrics.lstm_percentage}%`,
//                   background: `linear-gradient(90deg, ${THEME_COLORS.primary.blue}, ${THEME_COLORS.primary.purple})`,
//                   transition: 'width 1s ease'
//                 }}></div>
//               </div>

//               <div style={styles.metricCard} className="hover-lift">
//                 <div style={styles.metricLabel}>Transformer Model</div>
//                 <div style={styles.metricValue}>{state.performanceMetrics.transformer_usage}</div>
//                 <div style={{ 
//                   color: '#64748b', 
//                   fontSize: '0.95rem',
//                   marginTop: '0.75rem',
//                   fontWeight: '600'
//                 }}>
//                   {state.performanceMetrics.transformer_percentage}% of predictions
//                 </div>
//                 <div style={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   height: '4px',
//                   width: `${state.performanceMetrics.transformer_percentage}%`,
//                   background: `linear-gradient(90deg, ${THEME_COLORS.accent.cyan}, ${THEME_COLORS.primary.purple})`,
//                   transition: 'width 1s ease'
//                 }}></div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Results Section */}
//         {state.predictionResults.length > 0 && (
//           <>
//             {/* View Toggle */}
//             <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
//               <button
//                 onClick={toggleView}
//                 className="hover-scale"
//                 style={{...styles.button, ...styles.buttonSecondary}}
//               >
//                 <span>{state.currentView === 'predictions' }</span>
//                 <span>{state.currentView === 'predictions' ? 'View Source Data' : 'View Predictions'}</span>
//               </button>
//             </div>

//             {/* Model Strategy Info */}
//             {/* {state.performanceMetrics && state.currentView === 'predictions' && (
//               <div style={{
//                 ...styles.panel,
//                 marginBottom: '2.5rem',
//                 background: `linear-gradient(135deg, ${THEME_COLORS.primary.blue}08, ${THEME_COLORS.primary.purple}08)`,
//                 border: `2px solid ${THEME_COLORS.primary.blue}30`
//               }} className="hover-lift">
//                 <div style={{
//                   display: 'flex',
//                   alignItems: 'flex-start',
//                   gap: '1.5rem'
//                 }}>
//                   <span style={{ fontSize: '2rem' }}>🧠</span>
//                   <div>
//                     <div style={{ 
//                       color: '#1e293b', 
//                       fontWeight: '700', 
//                       marginBottom: '0.875rem',
//                       fontSize: '1.2rem'
//                     }}>
//                       Adaptive Intelligence Strategy
//                     </div>
//                     <div style={{ 
//                       color: '#475569', 
//                       fontSize: '1rem',
//                       lineHeight: '1.75'
//                     }}>
//                       Our system employs intelligent model selection, dynamically choosing between LSTM 
//                       and Transformer architectures based on temporal characteristics. LSTM networks excel 
//                       at sequential patterns with consistent intervals, while Transformers demonstrate 
//                       superior performance on irregular sequences and long-range dependencies.
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )} */}

//             {/* Dataset Overview */}
//             {dataStatistics && (
//               <div style={{...styles.panel, marginBottom: '2.5rem'}} className="hover-lift">
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginBottom: '1.5rem',
//                   flexWrap: 'wrap',
//                   gap: '1rem'
//                 }}>
//                   <div style={styles.panelTitle}>
//                     <span></span>
//                     <span>Dataset Analytics</span>
//                   </div>
//                   {dataStatistics.detailedStats && (
//                     <button
//                       onClick={toggleDetailedStats}
//                       className="hover-scale"
//                       style={{
//                         padding: '0.625rem 1.25rem',
//                         background: '#f8fafc',
//                         color: THEME_COLORS.primary.blue,
//                         border: `2px solid ${THEME_COLORS.primary.blue}`,
//                         borderRadius: '10px',
//                         fontSize: '0.85rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.3s ease'
//                       }}
//                     >
//                       {uiState.showDetailedStats ? 'Hide' : 'Show'} Statistics
//                     </button>
//                   )}
//                 </div>

//                 <div style={{...styles.gridContainer}} className="grid-responsive">
//                   <div style={styles.statsCard}>
//                     <div style={{ 
//                       color: '#64748b', 
//                       fontSize: '0.85rem',
//                       fontWeight: '600',
//                       marginBottom: '0.75rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.05em'
//                     }}>
//                       Total Records
//                     </div>
//                     <div style={{ color: '#1e293b', fontSize: '2.25rem', fontWeight: '900' }}>
//                       {dataStatistics.totalRecords.toLocaleString()}
//                     </div>
//                   </div>
//                   <div style={{...styles.statsCard, gridColumn: 'span 2'}}>
//                     <div style={{ 
//                       color: '#64748b', 
//                       fontSize: '0.85rem',
//                       fontWeight: '600',
//                       marginBottom: '0.75rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.05em'
//                     }}>
//                       Time Coverage
//                     </div>
//                     <div style={{ 
//                       color: '#1e293b', 
//                       fontSize: '1rem', 
//                       fontWeight: '700',
//                       fontFamily: '"JetBrains Mono", monospace'
//                     }}>
//                       {dataStatistics.timeRange}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed Statistics */}
//                 {uiState.showDetailedStats && dataStatistics.detailedStats && (
//                   <div style={{ marginTop: '2rem' }}>
//                     <div style={{
//                       color: '#1e293b',
//                       fontSize: '1.1rem',
//                       fontWeight: '700',
//                       marginBottom: '1.5rem'
//                     }}>
//                       Statistical Analysis
//                     </div>
//                     <div style={{...styles.gridContainer}} className="grid-responsive">
//                       {Object.entries(dataStatistics.detailedStats).map(([field, stats]) => (
//                         <div key={field} style={styles.statsCard}>
//                           <div style={{
//                             fontSize: '0.9rem',
//                             fontWeight: '700',
//                             color: THEME_COLORS.chart[field],
//                             marginBottom: '1rem',
//                             textTransform: 'uppercase',
//                             letterSpacing: '0.05em'
//                           }}>
//                             {field.replace(/_/g, ' ')}
//                           </div>
//                           <div style={{ 
//                             fontSize: '0.85rem', 
//                             color: '#475569', 
//                             lineHeight: '1.9',
//                             fontFamily: '"JetBrains Mono", monospace'
//                           }}>
//                             <div><strong>Mean:</strong> {Utils.formatNumber(stats.mean, 6)}</div>
//                             <div><strong>Median:</strong> {Utils.formatNumber(stats.median, 6)}</div>
//                             <div><strong>Min:</strong> {Utils.formatNumber(stats.min, 6)}</div>
//                             <div><strong>Max:</strong> {Utils.formatNumber(stats.max, 6)}</div>
//                             <div><strong>Std Dev:</strong> {Utils.formatNumber(stats.stdDev, 6)}</div>
//                             <div><strong>Range:</strong> {Utils.formatNumber(stats.range, 6)}</div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Position Errors Chart */}
//             <div style={styles.chartWrapper} className="hover-lift">
//               <h3 style={{
//                 color: '#1e293b',
//                 fontSize: '1.4rem',
//                 fontWeight: '800',
//                 marginBottom: '2rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.875rem'
//               }}>
//                 <span></span>
//                 <span>Positional Error Analysis (X, Y, Z)</span>
//               </h3>
//               <Line
//                 data={generateChartData(DATA_FIELDS.POSITION_ERRORS)}
//                 options={{
//                   ...chartOptions,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       ...chartOptions.scales.y,
//                       title: { 
//                         ...chartOptions.scales.y.title, 
//                         text: 'Error Magnitude (meters)' 
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>

//             {/* Clock Error Chart */}
//             <div style={styles.chartWrapper} className="hover-lift">
//               <h3 style={{
//                 color: '#1e293b',
//                 fontSize: '1.4rem',
//                 fontWeight: '800',
//                 marginBottom: '2rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.875rem'
//               }}>
//                 <span></span>
//                 <span>Satellite Clock Error</span>
//               </h3>
//               <Line
//                 data={generateChartData(DATA_FIELDS.CLOCK_ERROR)}
//                 options={{
//                   ...chartOptions,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       ...chartOptions.scales.y,
//                       title: { 
//                         ...chartOptions.scales.y.title, 
//                         text: 'Timing Deviation (seconds)' 
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>

//             {/* Data Table */}
//             <div style={styles.panel} className="hover-lift">
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '2rem',
//                 flexWrap: 'wrap',
//                 gap: '1rem'
//               }}>
//                 <div style={{...styles.panelTitle, marginBottom: 0}}>
//                   <span>{state.currentView === 'predictions' }</span>
//                   <span>{state.currentView === 'predictions' ? 'DAY 8 PREDICTIONS' : 'Source Dataset'}</span>
//                 </div>
//                 <div style={{
//                   ...styles.badge,
//                   background: `${THEME_COLORS.primary.blue}15`,
//                   color: THEME_COLORS.primary.blue,
//                   border: `2px solid ${THEME_COLORS.primary.blue}`
//                 }}>
//                   <span></span>
//                   <span>{activeData.length} Records</span>
//                 </div>
//               </div>

//               <div style={styles.tableWrapper}>
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       {activeData.length > 0 && Object.keys(activeData[0]).map(column => (
//                         <th key={column} style={styles.tableHeader}>
//                           {column.replace(/_/g, ' ')}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {activeData.map((row, index) => (
//                       <tr key={index} className="table-row-hover">
//                         {Object.entries(row).map(([key, value], cellIndex) => (
//                           <td key={cellIndex} style={styles.tableCell}>
//                             {Utils.formatNumber(value, 6)}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Footer */}
//             {/* <div style={{
//               ...styles.panel,
//               marginTop: '3rem',
//               background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
//               textAlign: 'center'
//             }}>
//               <div style={{
//                 color: '#64748b',
//                 fontSize: '0.95rem',
//                 lineHeight: '2'
//               }}>
//                 <div style={{ marginBottom: '0.875rem' }}>
//                   <span style={{ color: '#1e293b', fontWeight: '700' }}>🔒 Secure & Private</span> • 
//                   End-to-end encryption with zero data retention policy
//                 </div>
//                 <div>
//                   <span style={{ color: '#1e293b', fontWeight: '700' }}>⚡ GPU Accelerated</span> • 
//                   High-performance neural networks optimized for real-time forecasting
//                 </div>
//               </div>
//             </div> */}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SatelliteErrorPredictor;








// niceeeeeeeeeeeeeeeeeeeeeeeeeeeeeee






// import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";

// Chart.register(...registerables);

// // ============================================================================
// // CONFIGURATION & CONSTANTS
// // ============================================================================
// const APP_CONFIG = {
//   API_ENDPOINT: "http://127.0.0.1:8000/predict/",
//   MAX_FILE_SIZE: 10485760,
//   REQUEST_TIMEOUT: 60000,
//   ALLOWED_EXTENSIONS: ['.csv'],
//   DEBOUNCE_DELAY: 300
// };

// const DATA_FIELDS = {
//   POSITION_ERRORS: ['x_error', 'y_error', 'z_error'],
//   CLOCK_ERROR: ['satclockerror'],
//   ALL_FIELDS: ['x_error', 'y_error', 'z_error', 'satclockerror']
// };

// // Scientific color palette - optimized for data visualization and accessibility
// const THEME_COLORS = {
//   primary: { 
//     navy: '#1a365d',      // Deep navy for primary elements
//     slate: '#475569'       // Professional slate gray
//   },
//   chart: {
//     x_error: '#2563eb',    // Pure blue (X-axis positional error)
//     y_error: '#059669',    // Emerald green (Y-axis positional error)
//     z_error: '#dc2626',    // Crimson red (Z-axis positional error)
//     satclockerror: '#ea580c' // Safety orange (Clock error)
//   },
//   status: { 
//     success: '#047857', 
//     error: '#b91c1c',
//     info: '#0369a1'
//   },
//   neutral: {
//     50: '#f8fafc',
//     100: '#f1f5f9',
//     200: '#e2e8f0',
//     300: '#cbd5e1',
//     400: '#94a3b8',
//     500: '#64748b',
//     600: '#475569',
//     700: '#334155',
//     800: '#1e293b',
//     900: '#0f172a'
//   }
// };

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================
// const Utils = {
//   formatFileSize: (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const units = ['Bytes', 'KB', 'MB', 'GB'];
//     const index = Math.floor(Math.log(bytes) / Math.log(1024));
//     return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
//   },

//   formatNumber: (value, decimals = 6) => {
//     return typeof value === 'number' && isFinite(value) 
//       ? value.toFixed(decimals) 
//       : value;
//   },

//   formatScientific: (value, precision = 3) => {
//     if (typeof value !== 'number' || !isFinite(value)) return value;
//     const absValue = Math.abs(value);
//     if (absValue >= 1000 || absValue < 0.001) {
//       return value.toExponential(precision);
//     }
//     return value.toFixed(6);
//   },

//   validateFile: (file) => {
//     if (!file) return { valid: false, message: 'No file selected' };
    
//     const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
//     if (!APP_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
//       return { valid: false, message: 'Only CSV files are supported' };
//     }
    
//     if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
//       return { valid: false, message: `File exceeds ${Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)} limit` };
//     }
    
//     return { valid: true, message: 'File validated successfully' };
//   },

//   calculateStatistics: (data, fields) => {
//     if (!data || !data.length || !fields) return null;

//     const stats = {};
//     fields.forEach(field => {
//       const values = data
//         .map(row => parseFloat(row[field]))
//         .filter(v => isFinite(v));

//       if (values.length > 0) {
//         const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
//         const sortedValues = [...values].sort((a, b) => a - b);
//         const median = sortedValues[Math.floor(sortedValues.length / 2)];
//         const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
//         const stdDev = Math.sqrt(variance);
        
//         stats[field] = {
//           mean,
//           median,
//           min: Math.min(...values),
//           max: Math.max(...values),
//           stdDev,
//           variance,
//           range: Math.max(...values) - Math.min(...values),
//           count: values.length
//         };
//       }
//     });

//     return Object.keys(stats).length > 0 ? stats : null;
//   }
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================
// const SatelliteErrorPredictor = () => {
//   const [state, setState] = useState({
//     selectedFile: null,
//     uploadedDataset: [],
//     predictionResults: [],
//     performanceMetrics: null,
//     processingStatus: false,
//     currentView: 'predictions',
//     uploadProgress: 0,
//     isDragging: false
//   });

//   const [notification, setNotification] = useState({ 
//     visible: false, 
//     type: '', 
//     message: '' 
//   });

//   const [uiState, setUiState] = useState({
//     showDetailedStats: false,
//     selectedChart: 'position',
//     tableSearchTerm: ''
//   });

//   const fileInputRef = useRef(null);
//   const chartRefs = useRef({});

//   useEffect(() => {
//     return () => {
//       Object.values(chartRefs.current).forEach(chart => {
//         if (chart) chart.destroy();
//       });
//     };
//   }, []);

//   // ============================================================================
//   // PROFESSIONAL SCIENTIFIC STYLES
//   // ============================================================================
//   const styles = useMemo(() => ({
//     mainContainer: {
//       minHeight: '100vh',
//       background: '#ffffff',
//       padding: '2rem 1.5rem',
//       fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
//       position: 'relative',
//       color: THEME_COLORS.neutral[800]
//     },
//     backgroundPattern: {
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       background: `
//         linear-gradient(90deg, ${THEME_COLORS.neutral[100]} 1px, transparent 1px),
//         linear-gradient(${THEME_COLORS.neutral[100]} 1px, transparent 1px)
//       `,
//       backgroundSize: '40px 40px',
//       opacity: 0.4,
//       pointerEvents: 'none',
//       zIndex: 0
//     },
//     contentWrapper: {
//       maxWidth: '1400px',
//       margin: '0 auto',
//       position: 'relative',
//       zIndex: 1
//     },
//     headerPanel: {
//       background: `linear-gradient(to right, ${THEME_COLORS.primary.navy}, ${THEME_COLORS.primary.slate})`,
//       borderRadius: '12px',
//       padding: '2.5rem 2rem',
//       marginBottom: '2rem',
//       boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
//       border: `1px solid ${THEME_COLORS.neutral[300]}`
//     },
//     mainTitle: {
//       fontSize: '2rem',
//       fontWeight: '700',
//       color: '#ffffff',
//       marginBottom: '0.75rem',
//       letterSpacing: '-0.02em',
//       lineHeight: '1.2'
//     },
//     subtitle: {
//       fontSize: '0.95rem',
//       color: THEME_COLORS.neutral[200],
//       lineHeight: '1.6',
//       maxWidth: '900px',
//       fontWeight: '400'
//     },
//     gridContainer: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//       gap: '1.5rem',
//       marginBottom: '2rem'
//     },
//     panel: {
//       background: '#ffffff',
//       border: `1px solid ${THEME_COLORS.neutral[200]}`,
//       borderRadius: '8px',
//       padding: '1.75rem',
//       boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
//       transition: 'all 0.3s ease'
//     },
//     panelTitle: {
//       fontSize: '1.1rem',
//       fontWeight: '600',
//       color: THEME_COLORS.neutral[900],
//       marginBottom: '1.25rem',
//       letterSpacing: '-0.01em',
//       textTransform: 'uppercase',
//       fontSize: '0.85rem',
//       borderBottom: `2px solid ${THEME_COLORS.primary.navy}`,
//       paddingBottom: '0.5rem'
//     },
//     uploadZone: {
//       border: `2px dashed ${THEME_COLORS.neutral[300]}`,
//       borderRadius: '8px',
//       padding: '3rem 2rem',
//       textAlign: 'center',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       background: THEME_COLORS.neutral[50],
//       position: 'relative'
//     },
//     uploadZoneActive: {
//       borderColor: THEME_COLORS.primary.navy,
//       background: `${THEME_COLORS.primary.navy}08`,
//       transform: 'scale(1.01)'
//     },
//     button: {
//       padding: '0.875rem 1.75rem',
//       borderRadius: '6px',
//       border: 'none',
//       fontWeight: '600',
//       fontSize: '0.95rem',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       fontFamily: 'inherit'
//     },
//     buttonPrimary: {
//       background: THEME_COLORS.primary.navy,
//       color: '#ffffff',
//       boxShadow: '0 2px 8px rgba(26, 54, 93, 0.3)'
//     },
//     buttonSecondary: {
//       background: '#ffffff',
//       color: THEME_COLORS.primary.navy,
//       border: `2px solid ${THEME_COLORS.primary.navy}`
//     },
//     metricCard: {
//       background: THEME_COLORS.neutral[50],
//       border: `1px solid ${THEME_COLORS.neutral[200]}`,
//       borderRadius: '8px',
//       padding: '1.5rem',
//       position: 'relative',
//       borderLeft: `4px solid ${THEME_COLORS.primary.navy}`
//     },
//     metricLabel: {
//       fontSize: '0.75rem',
//       color: THEME_COLORS.neutral[600],
//       textTransform: 'uppercase',
//       letterSpacing: '0.1em',
//       fontWeight: '700',
//       marginBottom: '0.75rem'
//     },
//     metricValue: {
//       fontSize: '2rem',
//       fontWeight: '700',
//       color: THEME_COLORS.primary.navy,
//       lineHeight: '1',
//       marginBottom: '0.5rem',
//       fontFamily: '"IBM Plex Mono", monospace'
//     },
//     chartWrapper: {
//       background: '#ffffff',
//       border: `1px solid ${THEME_COLORS.neutral[200]}`,
//       borderRadius: '8px',
//       padding: '2rem',
//       marginBottom: '2rem',
//       boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
//     },
//     tableWrapper: {
//       maxHeight: '600px',
//       overflowY: 'auto',
//       overflowX: 'auto',
//       borderRadius: '8px',
//       border: `1px solid ${THEME_COLORS.neutral[200]}`,
//       background: '#ffffff'
//     },
//     table: {
//       width: '100%',
//       borderCollapse: 'collapse',
//       fontSize: '0.9rem'
//     },
//     tableHeader: {
//       padding: '1rem 1.25rem',
//       background: THEME_COLORS.neutral[100],
//       color: THEME_COLORS.neutral[900],
//       fontWeight: '700',
//       textAlign: 'left',
//       textTransform: 'uppercase',
//       fontSize: '0.75rem',
//       letterSpacing: '0.08em',
//       position: 'sticky',
//       top: 0,
//       zIndex: 10,
//       borderBottom: `2px solid ${THEME_COLORS.neutral[300]}`
//     },
//     tableCell: {
//       padding: '1rem 1.25rem',
//       color: THEME_COLORS.neutral[700],
//       borderBottom: `1px solid ${THEME_COLORS.neutral[200]}`,
//       fontFamily: '"IBM Plex Mono", monospace',
//       fontSize: '0.85rem'
//     },
//     notification: {
//       padding: '1rem 1.5rem',
//       borderRadius: '8px',
//       marginBottom: '1.5rem',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       fontWeight: '600',
//       fontSize: '0.9rem',
//       animation: 'slideInDown 0.3s ease',
//       border: '1px solid'
//     },
//     badge: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       padding: '0.4rem 0.9rem',
//       borderRadius: '6px',
//       fontSize: '0.75rem',
//       fontWeight: '700',
//       textTransform: 'uppercase',
//       letterSpacing: '0.05em',
//       border: '1px solid'
//     },
//     progressBar: {
//       position: 'absolute',
//       bottom: 0,
//       left: 0,
//       height: '3px',
//       background: THEME_COLORS.primary.navy,
//       transition: 'width 0.3s ease'
//     },
//     loader: {
//       width: '20px',
//       height: '20px',
//       border: '3px solid rgba(255, 255, 255, 0.3)',
//       borderTopColor: '#ffffff',
//       borderRadius: '50%',
//       animation: 'spin 0.8s linear infinite'
//     },
//     statsCard: {
//       background: '#ffffff',
//       border: `1px solid ${THEME_COLORS.neutral[200]}`,
//       borderRadius: '8px',
//       padding: '1.25rem',
//       transition: 'all 0.3s ease'
//     },
//     legendItem: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       padding: '0.5rem 0.75rem',
//       background: THEME_COLORS.neutral[50],
//       borderRadius: '4px',
//       fontSize: '0.85rem',
//       fontWeight: '600',
//       border: `1px solid ${THEME_COLORS.neutral[200]}`
//     },
//     colorBox: {
//       width: '16px',
//       height: '16px',
//       borderRadius: '3px',
//       border: '1px solid rgba(0,0,0,0.1)'
//     }
//   }), []);

//   // ============================================================================
//   // EVENT HANDLERS
//   // ============================================================================
//   const handleFileSelect = useCallback((event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validation = Utils.validateFile(file);
//     if (!validation.valid) {
//       setNotification({ visible: true, type: 'error', message: validation.message });
//       return;
//     }

//     setState(prev => ({ ...prev, selectedFile: file }));
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const handleDragEnter = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: true }));
//   }, []);

//   const handleDragLeave = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: false }));
//   }, []);

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   }, []);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setState(prev => ({ ...prev, isDragging: false }));

//     const file = e.dataTransfer.files?.[0];
//     if (!file) return;

//     const validation = Utils.validateFile(file);
//     if (!validation.valid) {
//       setNotification({ visible: true, type: 'error', message: validation.message });
//       return;
//     }

//     setState(prev => ({ ...prev, selectedFile: file }));
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const processUpload = useCallback(async () => {
//     if (!state.selectedFile) {
//       setNotification({ visible: true, type: 'error', message: 'Please select a file to upload' });
//       return;
//     }

//     setState(prev => ({ ...prev, processingStatus: true, uploadProgress: 0 }));
//     setNotification({ visible: false, type: '', message: '' });

//     try {
//       const formData = new FormData();
//       formData.append("file", state.selectedFile);

//       const response = await axios.post(APP_CONFIG.API_ENDPOINT, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setState(prev => ({ ...prev, uploadProgress: progress }));
//         },
//         timeout: APP_CONFIG.REQUEST_TIMEOUT
//       });

//       if (response.data.error) {
//         throw new Error(response.data.error);
//       }

//       setState(prev => ({
//         ...prev,
//         uploadedDataset: response.data.table_data || [],
//         predictionResults: response.data.prediction || [],
//         performanceMetrics: response.data.summary || null,
//         currentView: 'predictions',
//         processingStatus: false
//       }));

//       setNotification({ 
//         visible: true, 
//         type: 'success', 
//         message: 'Prediction analysis completed successfully' 
//       });

//       setTimeout(() => {
//         setNotification(prev => ({ ...prev, visible: false }));
//       }, 5000);

//     } catch (error) {
//       console.error('Upload failed:', error);
      
//       let errorMessage = 'Processing failed. Please verify data format and try again.';
//       if (error.code === 'ECONNABORTED') {
//         errorMessage = 'Request timeout. Server may be processing large dataset.';
//       } else if (error.response) {
//         errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || error.message}`;
//       } else if (error.request) {
//         errorMessage = 'Cannot establish connection. Verify backend service at ' + APP_CONFIG.API_ENDPOINT;
//       } else {
//         errorMessage = error.message;
//       }

//       setNotification({ visible: true, type: 'error', message: errorMessage });
//       setState(prev => ({ ...prev, processingStatus: false, uploadProgress: 0 }));
//     }
//   }, [state.selectedFile]);

//   const toggleView = useCallback(() => {
//     setState(prev => ({ 
//       ...prev, 
//       currentView: prev.currentView === 'predictions' ? 'uploaded' : 'predictions' 
//     }));
//   }, []);

//   const dismissNotification = useCallback(() => {
//     setNotification({ visible: false, type: '', message: '' });
//   }, []);

//   const toggleDetailedStats = useCallback(() => {
//     setUiState(prev => ({ ...prev, showDetailedStats: !prev.showDetailedStats }));
//   }, []);

//   const clearFile = useCallback(() => {
//     setState(prev => ({ ...prev, selectedFile: null }));
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   }, []);

//   // ============================================================================
//   // COMPUTED VALUES
//   // ============================================================================
//   const activeData = useMemo(() => 
//     state.currentView === 'predictions' ? state.predictionResults : state.uploadedDataset,
//     [state.currentView, state.predictionResults, state.uploadedDataset]
//   );

//   const dataStatistics = useMemo(() => {
//     if (!activeData?.length) return null;

//     const firstTime = activeData[0]?.predicted_time || activeData[0]?.utc_time || 'N/A';
//     const lastTime = activeData[activeData.length - 1]?.predicted_time || 
//                      activeData[activeData.length - 1]?.utc_time || 'N/A';

//     return {
//       totalRecords: activeData.length,
//       timeRange: `${firstTime} → ${lastTime}`,
//       detailedStats: Utils.calculateStatistics(activeData, DATA_FIELDS.ALL_FIELDS)
//     };
//   }, [activeData]);

//   // ============================================================================
//   // CHART CONFIGURATION - SCIENTIFIC VISUALIZATION
//   // ============================================================================
//   const generateChartData = useCallback((fields) => {
//     if (!activeData?.length) return { labels: [], datasets: [] };

//     const labels = activeData.map((item, idx) => 
//       item.predicted_time || item.utc_time || `T${idx + 1}`
//     );

//     return {
//       labels,
//       datasets: fields.map(field => {
//         const color = THEME_COLORS.chart[field] || THEME_COLORS.neutral[500];
//         return {
//           label: field.replace(/_/g, ' ').toUpperCase(),
//           data: activeData.map(item => {
//             const value = parseFloat(item[field]);
//             return isFinite(value) ? value : null;
//           }),
//           borderColor: color,
//           backgroundColor: `${color}15`,
//           borderWidth: 2.5,
//           pointRadius: 3,
//           pointHoverRadius: 6,
//           pointBackgroundColor: color,
//           pointBorderColor: '#ffffff',
//           pointBorderWidth: 2,
//           tension: 0.3,
//           fill: true,
//           spanGaps: true
//         };
//       })
//     };
//   }, [activeData]);

//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: true,
//     animation: { 
//       duration: 600,
//       easing: 'easeInOutQuart'
//     },
//     interaction: {
//       mode: 'index',
//       intersect: false
//     },
//     plugins: {
//       legend: {
//         display: false
//       },
//       tooltip: {
//         enabled: true,
//         backgroundColor: 'rgba(15, 23, 42, 0.96)',
//         titleColor: '#ffffff',
//         bodyColor: '#e2e8f0',
//         borderColor: THEME_COLORS.neutral[700],
//         borderWidth: 1,
//         padding: 14,
//         cornerRadius: 8,
//         titleFont: { size: 13, weight: '700', family: '"IBM Plex Sans", sans-serif' },
//         bodyFont: { size: 12, weight: '500', family: '"IBM Plex Mono", monospace' },
//         displayColors: true,
//         boxWidth: 10,
//         boxHeight: 10,
//         callbacks: {
//           label: (context) => {
//             const label = context.dataset.label || '';
//             const value = Utils.formatScientific(context.parsed.y);
//             return `${label}: ${value}`;
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: { 
//           color: THEME_COLORS.neutral[200],
//           drawBorder: false,
//           lineWidth: 1
//         },
//         ticks: {
//           color: THEME_COLORS.neutral[600],
//           font: { size: 10, weight: '500', family: '"IBM Plex Mono", monospace' },
//           maxRotation: 45,
//           minRotation: 0,
//           autoSkip: true,
//           maxTicksLimit: 12
//         },
//         title: {
//           display: true,
//           text: 'Time Sequence',
//           color: THEME_COLORS.neutral[900],
//           font: { size: 12, weight: '700' },
//           padding: { top: 10 }
//         }
//       },
//       y: {
//         grid: {
//           color: THEME_COLORS.neutral[200],
//           drawBorder: false,
//           lineWidth: 1
//         },
//         ticks: {
//           color: THEME_COLORS.neutral[600],
//           font: { size: 10, weight: '500', family: '"IBM Plex Mono", monospace' },
//           callback: (value) => Utils.formatScientific(value, 2)
//         },
//         title: {
//           display: true,
//           color: THEME_COLORS.neutral[900],
//           font: { size: 12, weight: '700' },
//           padding: { bottom: 10 }
//         }
//       }
//     }
//   }), []);

//   // ============================================================================
//   // RENDER
//   // ============================================================================
//   return (
//     <div style={styles.mainContainer}>
//       <div style={styles.backgroundPattern}></div>

//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes slideInDown {
//           from {
//             opacity: 0;
//             transform: translateY(-15px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .hover-lift:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
//         }
        
//         .hover-scale:hover:not(:disabled) {
//           transform: scale(1.02);
//         }
        
//         .hover-scale:active:not(:disabled) {
//           transform: scale(0.98);
//         }
        
//         .table-row-hover:hover {
//           background: ${THEME_COLORS.neutral[50]} !important;
//         }
        
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
//         ::-webkit-scrollbar-track {
//           background: ${THEME_COLORS.neutral[100]};
//         }
//         ::-webkit-scrollbar-thumb {
//           background: ${THEME_COLORS.neutral[400]};
//           border-radius: 4px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: ${THEME_COLORS.neutral[500]};
//         }
        
//         @media (max-width: 768px) {
//           .grid-responsive {
//             grid-template-columns: 1fr !important;
//           }
//         }
//       `}</style>

//       <div style={styles.contentWrapper}>
//         {/* Header Section */}
//         {/* <div style={styles.headerPanel}>
//           <h1 style={styles.mainTitle}>
//             GNSS Satellite Error Prediction System
//           </h1>
//           <p style={styles.subtitle}>
//             Advanced hybrid LSTM-Transformer neural network architecture for high-precision 
//             Global Navigation Satellite System error forecasting. Upload 7-day historical 
//             observational data for automated day-8 prediction generation with adaptive model selection.
//           </p>
//         </div> */}

//         {/* Notification Banner */}
//         {notification.visible && (
//           <div style={{
//             ...styles.notification,
//             background: notification.type === 'error'
//               ? '#fef2f2'
//               : '#f0fdf4',
//             borderColor: notification.type === 'error' 
//               ? THEME_COLORS.status.error 
//               : THEME_COLORS.status.success,
//             color: notification.type === 'error' 
//               ? THEME_COLORS.status.error 
//               : THEME_COLORS.status.success
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//               <span style={{ 
//                 fontSize: '0.75rem',
//                 fontWeight: '700',
//                 textTransform: 'uppercase',
//                 letterSpacing: '0.05em'
//               }}>
//                 {notification.type === 'error' ? '[ERROR]' : '[SUCCESS]'}
//               </span>
//               <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{notification.message}</span>
//             </div>
//             <button
//               onClick={dismissNotification}
//               style={{
//                 background: 'transparent',
//                 border: 'none',
//                 color: 'inherit',
//                 fontSize: '1.5rem',
//                 cursor: 'pointer',
//                 padding: '0 0.5rem',
//                 fontWeight: '700',
//                 lineHeight: '1'
//               }}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Main Grid */}
//         <div style={{...styles.gridContainer}} className="grid-responsive">
//           {/* Upload Panel */}
//           <div style={{...styles.panel}} className="hover-lift">
//             <div style={styles.panelTitle}>Data Input</div>

//             <div
//               style={{
//                 ...styles.uploadZone,
//                 ...(state.isDragging ? styles.uploadZoneActive : {})
//               }}
//               onClick={() => fileInputRef.current?.click()}
//               onDragEnter={handleDragEnter}
//               onDragLeave={handleDragLeave}
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".csv"
//                 onChange={handleFileSelect}
//                 style={{ display: 'none' }}
//                 disabled={state.processingStatus}
//               />

//               <div style={{ 
//                 fontSize: '2.5rem', 
//                 marginBottom: '1rem', 
//                 color: THEME_COLORS.neutral[400],
//                 fontWeight: '300'
//               }}>
//                 {state.selectedFile ? '◆' : '□'}
//               </div>

//               {state.selectedFile ? (
//                 <div>
//                   <div style={{ 
//                     color: THEME_COLORS.neutral[900], 
//                     fontWeight: '600', 
//                     fontSize: '1rem',
//                     marginBottom: '0.5rem',
//                     fontFamily: '"IBM Plex Mono", monospace'
//                   }}>
//                     {state.selectedFile.name}
//                   </div>
//                   <div style={{ 
//                     color: THEME_COLORS.neutral[600], 
//                     fontSize: '0.85rem',
//                     marginBottom: '1rem'
//                   }}>
//                     {Utils.formatFileSize(state.selectedFile.size)}
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       clearFile();
//                     }}
//                     style={{
//                       padding: '0.5rem 1rem',
//                       background: '#ffffff',
//                       color: THEME_COLORS.status.error,
//                       border: `1px solid ${THEME_COLORS.status.error}`,
//                       borderRadius: '4px',
//                       fontSize: '0.8rem',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ) : (
//                 <div>
//                   <div style={{ 
//                     color: THEME_COLORS.neutral[900], 
//                     fontWeight: '600', 
//                     fontSize: '1rem',
//                     marginBottom: '0.5rem' 
//                   }}>
//                     Drop CSV file or click to browse
//                   </div>
//                   <div style={{ 
//                     color: THEME_COLORS.neutral[600], 
//                     fontSize: '0.85rem' 
//                   }}>
//                     Maximum file size: {Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={processUpload}
//               disabled={state.processingStatus || !state.selectedFile}
//               className="hover-scale"
//               style={{
//                 ...styles.button,
//                 ...styles.buttonPrimary,
//                 marginTop: '1.25rem',
//                 width: '100%',
//                 justifyContent: 'center',
//                 opacity: (state.processingStatus || !state.selectedFile) ? 0.5 : 1,
//                 cursor: (state.processingStatus || !state.selectedFile) ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {state.processingStatus && state.uploadProgress > 0 && (
//                 <div style={{ ...styles.progressBar, width: `${state.uploadProgress}%` }}></div>
//               )}
//               {state.processingStatus ? (
//                 <>
//                   <div style={styles.loader}></div>
//                   <span>
//                     {state.uploadProgress > 0 && state.uploadProgress < 100
//                       ? `Processing: ${state.uploadProgress}%`
//                       : 'Computing predictions...'}
//                   </span>
//                 </>
//               ) : (
//                 <span>Execute Prediction Analysis</span>
//               )}
//             </button>
//           </div>

//           {/* Performance Metrics */}
//           {state.performanceMetrics && state.currentView === 'predictions' && (
//             <>
//               <div style={styles.metricCard} className="hover-lift">
//                 <div style={styles.metricLabel}>LSTM Architecture</div>
//                 <div style={styles.metricValue}>{state.performanceMetrics.lstm_usage}</div>
//                 <div style={{ 
//                   color: THEME_COLORS.neutral[600], 
//                   fontSize: '0.85rem',
//                   marginTop: '0.5rem',
//                   fontWeight: '500'
//                 }}>
//                   {state.performanceMetrics.lstm_percentage}% utilization rate
//                 </div>
//               </div>

//               <div style={styles.metricCard} className="hover-lift">
//                 <div style={styles.metricLabel}>Transformer Architecture</div>
//                 <div style={styles.metricValue}>{state.performanceMetrics.transformer_usage}</div>
//                 <div style={{ 
//                   color: THEME_COLORS.neutral[600], 
//                   fontSize: '0.85rem',
//                   marginTop: '0.5rem',
//                   fontWeight: '500'
//                 }}>
//                   {state.performanceMetrics.transformer_percentage}% utilization rate
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Results Section */}
//         {state.predictionResults.length > 0 && (
//           <>
//             {/* View Toggle */}
//             <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//               <button
//                 onClick={toggleView}
//                 className="hover-scale"
//                 style={{...styles.button, ...styles.buttonSecondary}}
//               >
//                 <span>{state.currentView === 'predictions' ? 'View Input Data' : 'View Predictions'}</span>
//               </button>
//             </div>

//             {/* Model Strategy Info */}
//             {/* {state.performanceMetrics && state.currentView === 'predictions' && (
//               <div style={{
//                 ...styles.panel,
//                 marginBottom: '2rem',
//                 background: THEME_COLORS.neutral[50],
//                 borderLeft: `4px solid ${THEME_COLORS.status.info}`
//               }} className="hover-lift">
//                 <div style={{
//                   color: THEME_COLORS.neutral[900], 
//                   fontWeight: '700', 
//                   marginBottom: '0.75rem',
//                   fontSize: '0.95rem',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em'
//                 }}>
//                   Model Selection Strategy
//                 </div>
//                 <div style={{ 
//                   color: THEME_COLORS.neutral[700], 
//                   fontSize: '0.9rem',
//                   lineHeight: '1.7'
//                 }}>
//                   The system employs adaptive architecture selection, dynamically choosing between 
//                   Long Short-Term Memory (LSTM) and Transformer networks based on temporal 
//                   characteristics of the input sequence. LSTM architectures demonstrate superior 
//                   performance for sequential patterns with regular temporal intervals, while 
//                   Transformer models excel at capturing long-range dependencies and irregular 
//                   time-series patterns through self-attention mechanisms.
//                 </div>
//               </div> */}
//             {/* )} */}

//             {/* Dataset Overview */}
//             {dataStatistics && (
//               <div style={{...styles.panel, marginBottom: '2rem'}} className="hover-lift">
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginBottom: '1.25rem',
//                   flexWrap: 'wrap',
//                   gap: '1rem'
//                 }}>
//                   <div style={styles.panelTitle}>Statistical Summary</div>
//                   {dataStatistics.detailedStats && (
//                     <button
//                       onClick={toggleDetailedStats}
//                       className="hover-scale"
//                       style={{
//                         padding: '0.5rem 1rem',
//                         background: '#ffffff',
//                         color: THEME_COLORS.primary.navy,
//                         border: `1px solid ${THEME_COLORS.primary.navy}`,
//                         borderRadius: '4px',
//                         fontSize: '0.8rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.2s ease'
//                       }}
//                     >
//                       {uiState.showDetailedStats ? 'Collapse' : 'Expand'} Statistics
//                     </button>
//                   )}
//                 </div>

//                 <div style={{...styles.gridContainer}} className="grid-responsive">
//                   <div style={styles.statsCard}>
//                     <div style={{ 
//                       color: THEME_COLORS.neutral[600], 
//                       fontSize: '0.75rem',
//                       fontWeight: '700',
//                       marginBottom: '0.75rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.08em'
//                     }}>
//                       Sample Count
//                     </div>
//                     <div style={{ 
//                       color: THEME_COLORS.neutral[900], 
//                       fontSize: '2rem', 
//                       fontWeight: '700',
//                       fontFamily: '"IBM Plex Mono", monospace'
//                     }}>
//                       {dataStatistics.totalRecords.toLocaleString()}
//                     </div>
//                   </div>
//                   <div style={{...styles.statsCard, gridColumn: 'span 2'}}>
//                     <div style={{ 
//                       color: THEME_COLORS.neutral[600], 
//                       fontSize: '0.75rem',
//                       fontWeight: '700',
//                       marginBottom: '0.75rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.08em'
//                     }}>
//                       Temporal Coverage
//                     </div>
//                     <div style={{ 
//                       color: THEME_COLORS.neutral[900], 
//                       fontSize: '0.9rem', 
//                       fontWeight: '600',
//                       fontFamily: '"IBM Plex Mono", monospace'
//                     }}>
//                       {dataStatistics.timeRange}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detailed Statistics */}
//                 {uiState.showDetailedStats && dataStatistics.detailedStats && (
//                   <div style={{ marginTop: '1.5rem' }}>
//                     <div style={{
//                       color: THEME_COLORS.neutral[900],
//                       fontSize: '0.85rem',
//                       fontWeight: '700',
//                       marginBottom: '1rem',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.05em',
//                       borderBottom: `1px solid ${THEME_COLORS.neutral[200]}`,
//                       paddingBottom: '0.5rem'
//                     }}>
//                       Descriptive Statistics
//                     </div>
//                     <div style={{...styles.gridContainer}} className="grid-responsive">
//                       {Object.entries(dataStatistics.detailedStats).map(([field, stats]) => (
//                         <div key={field} style={styles.statsCard}>
//                           <div style={{
//                             fontSize: '0.8rem',
//                             fontWeight: '700',
//                             color: THEME_COLORS.chart[field] || THEME_COLORS.neutral[700],
//                             marginBottom: '1rem',
//                             textTransform: 'uppercase',
//                             letterSpacing: '0.05em',
//                             borderBottom: `2px solid ${THEME_COLORS.chart[field] || THEME_COLORS.neutral[300]}`,
//                             paddingBottom: '0.5rem'
//                           }}>
//                             {field.replace(/_/g, ' ')}
//                           </div>
//                           <div style={{ 
//                             fontSize: '0.8rem', 
//                             color: THEME_COLORS.neutral[700], 
//                             lineHeight: '1.8',
//                             fontFamily: '"IBM Plex Mono", monospace'
//                           }}>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span>Mean:</span>
//                               <strong>{Utils.formatScientific(stats.mean)}</strong>
//                             </div>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span>Median:</span>
//                               <strong>{Utils.formatScientific(stats.median)}</strong>
//                             </div>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span>Std Dev:</span>
//                               <strong>{Utils.formatScientific(stats.stdDev)}</strong>
//                             </div>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span>Min:</span>
//                               <strong>{Utils.formatScientific(stats.min)}</strong>
//                             </div>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span>Max:</span>
//                               <strong>{Utils.formatScientific(stats.max)}</strong>
//                             </div>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span>Range:</span>
//                               <strong>{Utils.formatScientific(stats.range)}</strong>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Custom Legend */}
//             <div style={{
//               display: 'flex',
//               gap: '1rem',
//               flexWrap: 'wrap',
//               marginBottom: '1.5rem',
//               justifyContent: 'center'
//             }}>
//               {DATA_FIELDS.POSITION_ERRORS.map(field => (
//                 <div key={field} style={styles.legendItem}>
//                   <div style={{
//                     ...styles.colorBox,
//                     background: THEME_COLORS.chart[field]
//                   }}></div>
//                   <span>{field.replace(/_/g, ' ').toUpperCase()}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Position Errors Chart */}
//             <div style={styles.chartWrapper} className="hover-lift">
//               <h3 style={{
//                 color: THEME_COLORS.neutral[900],
//                 fontSize: '1rem',
//                 fontWeight: '700',
//                 marginBottom: '1.5rem',
//                 textTransform: 'uppercase',
//                 letterSpacing: '0.05em',
//                 borderBottom: `2px solid ${THEME_COLORS.neutral[300]}`,
//                 paddingBottom: '0.75rem'
//               }}>
//                 Ephemeris Error Analysis (X, Y, Z Coordinates)
//               </h3>
//               <Line
//                 data={generateChartData(DATA_FIELDS.POSITION_ERRORS)}
//                 options={{
//                   ...chartOptions,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       ...chartOptions.scales.y,
//                       title: { 
//                         ...chartOptions.scales.y.title, 
//                         text: 'Error Magnitude (meters)' 
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>

//             {/* Clock Error Legend */}
//             <div style={{
//               display: 'flex',
//               gap: '1rem',
//               flexWrap: 'wrap',
//               marginBottom: '1.5rem',
//               justifyContent: 'center'
//             }}>
//               {DATA_FIELDS.CLOCK_ERROR.map(field => (
//                 <div key={field} style={styles.legendItem}>
//                   <div style={{
//                     ...styles.colorBox,
//                     background: THEME_COLORS.chart[field]
//                   }}></div>
//                   <span>{field.replace(/_/g, ' ').toUpperCase()}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Clock Error Chart */}
//             <div style={styles.chartWrapper} className="hover-lift">
//               <h3 style={{
//                 color: THEME_COLORS.neutral[900],
//                 fontSize: '1rem',
//                 fontWeight: '700',
//                 marginBottom: '1.5rem',
//                 textTransform: 'uppercase',
//                 letterSpacing: '0.05em',
//                 borderBottom: `2px solid ${THEME_COLORS.neutral[300]}`,
//                 paddingBottom: '0.75rem'
//               }}>
//                 Satellite Clock Error Analysis
//               </h3>
//               <Line
//                 data={generateChartData(DATA_FIELDS.CLOCK_ERROR)}
//                 options={{
//                   ...chartOptions,
//                   scales: {
//                     ...chartOptions.scales,
//                     y: {
//                       ...chartOptions.scales.y,
//                       title: { 
//                         ...chartOptions.scales.y.title, 
//                         text: 'Clock Bias (seconds)' 
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>

//             {/* Data Table */}
//             <div style={styles.panel} className="hover-lift">
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '1.5rem',
//                 flexWrap: 'wrap',
//                 gap: '1rem'
//               }}>
//                 <div style={styles.panelTitle}>
//                   {state.currentView === 'predictions' ? 'Prediction Output' : 'Input Dataset'}
//                 </div>
//                 <div style={{
//                   ...styles.badge,
//                   background: THEME_COLORS.neutral[100],
//                   color: THEME_COLORS.primary.navy,
//                   borderColor: THEME_COLORS.neutral[300]
//                 }}>
//                   <span>{activeData.length} records</span>
//                 </div>
//               </div>

//               <div style={styles.tableWrapper}>
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       {activeData.length > 0 && Object.keys(activeData[0]).map(column => (
//                         <th key={column} style={styles.tableHeader}>
//                           {column.replace(/_/g, ' ')}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {activeData.map((row, index) => (
//                       <tr key={index} className="table-row-hover">
//                         {Object.entries(row).map(([key, value], cellIndex) => {
//                           // Check if this is the model_used column in predictions view
//                           const isModelColumn = state.currentView === 'predictions' && 
//                                                key.toLowerCase() === 'model_used';
//                           const isLSTM = isModelColumn && 
//                                         (value === 'LSTM' || String(value).toUpperCase() === 'LSTM');
//                           const isTransformer = isModelColumn && 
//                                                (value === 'Transformer' || String(value).toUpperCase() === 'TRANSFORMER');
                          
//                           return (
//                             <td key={cellIndex} style={{
//                               ...styles.tableCell,
//                               ...(isModelColumn && {
//                                 fontWeight: '700',
//                                 background: isLSTM 
//                                   ? `${THEME_COLORS.chart.x_error}15`
//                                   : isTransformer 
//                                     ? `${THEME_COLORS.chart.satclockerror}15`
//                                     : 'transparent',
//                                 color: isLSTM 
//                                   ? THEME_COLORS.chart.x_error
//                                   : isTransformer 
//                                     ? THEME_COLORS.chart.satclockerror
//                                     : THEME_COLORS.neutral[700],
//                                 borderLeft: isLSTM 
//                                   ? `3px solid ${THEME_COLORS.chart.x_error}`
//                                   : isTransformer 
//                                     ? `3px solid ${THEME_COLORS.chart.satclockerror}`
//                                     : 'none'
//                               })
//                             }}>
//                               {isModelColumn ? value : Utils.formatScientific(value)}
//                             </td>
//                           );
//                         })}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Footer */}
//             {/* <div style={{
//               ...styles.panel,
//               marginTop: '2.5rem',
//               background: THEME_COLORS.neutral[50],
//               textAlign: 'center',
//               borderTop: `3px solid ${THEME_COLORS.primary.navy}`
//             }}>
//               <div style={{
//                 color: THEME_COLORS.neutral[700],
//                 fontSize: '0.85rem',
//                 lineHeight: '1.8'
//               }}>
//                 <div style={{ marginBottom: '0.75rem' }}>
//                   <span style={{ 
//                     color: THEME_COLORS.neutral[900], 
//                     fontWeight: '700',
//                     textTransform: 'uppercase',
//                     letterSpacing: '0.05em',
//                     fontSize: '0.75rem'
//                   }}>
//                     Security Protocol
//                   </span>
//                   <span style={{ margin: '0 0.5rem' }}>•</span>
//                   End-to-end encrypted transmission with zero-persistence architecture
//                 </div>
//                 <div>
//                   <span style={{ 
//                     color: THEME_COLORS.neutral[900], 
//                     fontWeight: '700',
//                     textTransform: 'uppercase',
//                     letterSpacing: '0.05em',
//                     fontSize: '0.75rem'
//                   }}>
//                     Computational Infrastructure
//                   </span>
//                   <span style={{ margin: '0 0.5rem' }}>•</span>
//                   GPU-accelerated neural network inference optimized for real-time forecasting
//                 </div>
//               </div>
//             </div> */}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SatelliteErrorPredictor;






















// rmse


// src/components/UploadForm.js
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// CONFIG & CONSTANTS
const APP_CONFIG = {
  API_ENDPOINT: "http://127.0.0.1:8000/predict/",
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  REQUEST_TIMEOUT: 60000,
  ALLOWED_EXTENSIONS: ['.csv'],
  DEBOUNCE_DELAY: 300
};

const DATA_FIELDS = {
  POSITION_ERRORS: ['x_error', 'y_error', 'z_error'],
  CLOCK_ERROR: ['satclockerror'],
  ALL_FIELDS: ['x_error', 'y_error', 'z_error', 'satclockerror']
};

const THEME_COLORS = {
  primary: { navy: '#1a365d', slate: '#475569' },
  chart: { x_error: '#2563eb', y_error: '#059669', z_error: '#dc2626', satclockerror: '#ea580c' },
  status: { success: '#047857', error: '#b91c1c', info: '#0369a1' },
  neutral: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
};

// Utility helpers
const Utils = {
  formatFileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  },
  formatScientific: (value, precision = 3) => {
    if (typeof value !== 'number' || !isFinite(value)) return value;
    const abs = Math.abs(value);
    if (abs >= 1000 || abs < 0.001) return value.toExponential(precision);
    return value.toFixed(6);
  },
  validateFile: (file) => {
    if (!file) return { valid: false, message: 'No file selected' };
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!APP_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) return { valid: false, message: 'Only CSV files are supported' };
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) return { valid: false, message: `File exceeds ${Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)} limit` };
    return { valid: true, message: 'File validated successfully' };
  }
};

// MAIN COMPONENT
const SatelliteErrorPredictor = () => {
  const [state, setState] = useState({
    selectedFile: null,
    uploadedDataset: [],
    predictionResults: [],
    performanceMetrics: null,
    processingStatus: false,
    currentView: 'predictions',
    uploadProgress: 0,
    isDragging: false
  });

  const [accuracyMetrics, setAccuracyMetrics] = useState(null);
  const [notification, setNotification] = useState({ visible: false, type: '', message: '' });
  const [uiState, setUiState] = useState({ showDetailedStats: false, selectedChart: 'position', tableSearchTerm: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {};
  }, []);

  // styles (kept same as before)
  const styles = useMemo(() => ({
    mainContainer: { minHeight: '100vh', background: '#ffffff', padding: '2rem 1.5rem', fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, -apple-system, sans-serif', position: 'relative', color: THEME_COLORS.neutral[800] },
    backgroundPattern: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(90deg, ${THEME_COLORS.neutral[100]} 1px, transparent 1px), linear-gradient(${THEME_COLORS.neutral[100]} 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.4, pointerEvents: 'none', zIndex: 0 },
    contentWrapper: { maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 },
    panel: { background: '#ffffff', border: `1px solid ${THEME_COLORS.neutral[200]}`, borderRadius: '8px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    panelTitle: { fontSize: '0.85rem', fontWeight: '700', color: THEME_COLORS.neutral[900], marginBottom: '1.25rem', letterSpacing: '-0.01em', textTransform: 'uppercase', paddingBottom: '0.5rem', borderBottom: `2px solid ${THEME_COLORS.primary.navy}` },
    uploadZone: { border: `2px dashed ${THEME_COLORS.neutral[300]}`, borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', background: THEME_COLORS.neutral[50], position: 'relative' },
    uploadZoneActive: { borderColor: THEME_COLORS.primary.navy, background: `${THEME_COLORS.primary.navy}08`, transform: 'scale(1.01)' },
    button: { padding: '0.875rem 1.75rem', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' },
    buttonPrimary: { background: THEME_COLORS.primary.navy, color: '#ffffff', boxShadow: '0 2px 8px rgba(26,54,93,0.3)' },
    tableWrapper: { maxHeight: '600px', overflowY: 'auto', overflowX: 'auto', borderRadius: '8px', border: `1px solid ${THEME_COLORS.neutral[200]}`, background: '#ffffff' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
    tableHeader: { padding: '1rem 1.25rem', background: THEME_COLORS.neutral[100], color: THEME_COLORS.neutral[900], fontWeight: '700', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em', position: 'sticky', top: 0, zIndex: 10, borderBottom: `2px solid ${THEME_COLORS.neutral[300]}` },
    tableCell: { padding: '1rem 1.25rem', color: THEME_COLORS.neutral[700], borderBottom: `1px solid ${THEME_COLORS.neutral[200]}`, fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85rem' },
    loader: { width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    progressBar: { position: 'absolute', bottom: 0, left: 0, height: '3px', background: THEME_COLORS.primary.navy, transition: 'width 0.3s ease' },
    metricCard: { background: THEME_COLORS.neutral[50], border: `1px solid ${THEME_COLORS.neutral[200]}`, borderRadius: '8px', padding: '1.5rem', borderLeft: `4px solid ${THEME_COLORS.primary.navy}` }
  }), []);

  // File handlers
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = Utils.validateFile(file);
    if (!valid.valid) { setNotification({ visible: true, type: 'error', message: valid.message}); return; }
    setState(s => ({ ...s, selectedFile: file }));
    setNotification({ visible: false, type: '', message: '' });
  }, []);

  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setState(s => ({ ...s, isDragging: true })); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setState(s => ({ ...s, isDragging: false })); }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setState(s => ({ ...s, isDragging: false }));
    const file = e.dataTransfer.files?.[0]; if (!file) return;
    const valid = Utils.validateFile(file); if (!valid.valid) { setNotification({ visible: true, type: 'error', message: valid.message}); return; }
    setState(s => ({ ...s, selectedFile: file })); setNotification({ visible: false, type: '', message: '' });
  }, []);

  const processUpload = useCallback(async () => {
    if (!state.selectedFile) { setNotification({ visible: true, type: 'error', message: 'Please select a file to upload' }); return; }

    setState(s => ({ ...s, processingStatus: true, uploadProgress: 0 }));
    setAccuracyMetrics(null);
    setNotification({ visible: false, type: '', message: '' });

    try {
      const fd = new FormData();
      fd.append("file", state.selectedFile);
      const rsp = await axios.post(APP_CONFIG.API_ENDPOINT, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => { if (!p.total) return; setState(s => ({ ...s, uploadProgress: Math.round((p.loaded*100)/p.total) })); },
        timeout: APP_CONFIG.REQUEST_TIMEOUT
      });

      if (rsp.data.error) throw new Error(rsp.data.error);

      setState(s => ({
        ...s,
        uploadedDataset: rsp.data.table_data || [],
        predictionResults: rsp.data.prediction || [],
        performanceMetrics: rsp.data.summary || null,
        currentView: 'predictions',
        processingStatus: false
      }));

      setAccuracyMetrics(rsp.data.accuracy_metrics || null);

      setNotification({ visible: true, type: 'success', message: 'Prediction analysis completed successfully' });
      setTimeout(()=> setNotification(n => ({ ...n, visible: false })), 4500);
    } catch (err) {
      console.error(err);
      let msg = 'Processing failed. Please verify data format and try again.';
      if (err.code === 'ECONNABORTED') msg = 'Request timeout. Server may be processing large dataset.';
      else if (err.response) msg = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
      else if (err.request) msg = 'Cannot establish connection. Verify backend service at ' + APP_CONFIG.API_ENDPOINT;
      setNotification({ visible: true, type: 'error', message: msg });
      setState(s => ({ ...s, processingStatus: false, uploadProgress: 0 }));
    }
  }, [state.selectedFile]);

  const toggleView = useCallback(() => setState(s => ({ ...s, currentView: s.currentView === 'predictions' ? 'uploaded' : 'predictions' })), []);
  const dismissNotification = useCallback(() => setNotification({ visible: false, type: '', message: '' }), []);
  const clearFile = useCallback(() => { setState(s => ({ ...s, selectedFile: null })); if (fileInputRef.current) fileInputRef.current.value = ''; }, []);

  // computed
  const activeData = useMemo(() => state.currentView === 'predictions' ? state.predictionResults : state.uploadedDataset, [state.currentView, state.predictionResults, state.uploadedDataset]);

  const dataStatistics = useMemo(() => {
    if (!activeData?.length) return null;
    const firstTime = activeData[0]?.predicted_time || activeData[0]?.utc_time || 'N/A';
    const lastTime = activeData[activeData.length - 1]?.predicted_time || activeData[activeData.length - 1]?.utc_time || 'N/A';
    return { totalRecords: activeData.length, timeRange: `${firstTime} → ${lastTime}` };
  }, [activeData]);

  // chart helpers
  const generateChartData = useCallback((fields) => {
    if (!activeData?.length) return { labels: [], datasets: [] };
    const labels = activeData.map((item, idx) => item.predicted_time || item.utc_time || `T${idx+1}`);
    return {
      labels,
      datasets: fields.map(field => ({
        label: field.replace(/_/g,' ').toUpperCase(),
        data: activeData.map(item => { const v = Number(item[field]); return isFinite(v) ? v : null; }),
        borderColor: THEME_COLORS.chart[field] || THEME_COLORS.neutral[500],
        backgroundColor: `${(THEME_COLORS.chart[field] || THEME_COLORS.neutral[500])}15`,
        borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: THEME_COLORS.chart[field] || THEME_COLORS.neutral[500], pointBorderColor: '#fff', tension: 0.3, fill: true, spanGaps: true
      }))
    };
  }, [activeData]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: true,
    animation: { duration: 600, easing: 'easeInOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Utils.formatScientific(ctx.parsed.y)}` } } }
  }), []);

  // Render
  return (
    <div style={styles.mainContainer}>
      <div style={styles.backgroundPattern} />
      <style>{`
        @keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }
        @keyframes slideInDown { from {opacity:0; transform:translateY(-15px)} to {opacity:1; transform:translateY(0)} }
      `}</style>

      <div style={styles.contentWrapper}>
        {notification.visible && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: 8, background: notification.type === 'error' ? '#fee' : '#effaf0', border: `1px solid ${notification.type==='error'?THEME_COLORS.status.error:THEME_COLORS.status.success}`, display: 'flex', justifyContent: 'space-between' }}>
            <div><strong>{notification.type === 'error' ? '[ERROR]' : '[SUCCESS]'}</strong> {' '}{notification.message}</div>
            <button onClick={dismissNotification} style={{ background: 'transparent', border: 'none', fontSize: 18 }}>×</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Data Input</div>
            <div
              style={{ ...(state.isDragging ? { borderColor: THEME_COLORS.primary.navy, background: `${THEME_COLORS.primary.navy}08` } : {}), padding: 20, borderRadius: 8, border: `2px dashed ${THEME_COLORS.neutral[300]}`, textAlign: 'center', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} disabled={state.processingStatus} />
              <div style={{ fontSize: 28, marginBottom: 12 }}>{state.selectedFile ? '◆' : '□'}</div>
              {state.selectedFile ? (
                <>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{state.selectedFile.name}</div>
                  <div style={{ color: THEME_COLORS.neutral[600], marginBottom: 8 }}>{Utils.formatFileSize(state.selectedFile.size)}</div>
                  <button onClick={(e) => { e.stopPropagation(); clearFile(); }} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${THEME_COLORS.status.error}`, background: '#fff', color: THEME_COLORS.status.error }}>Remove</button>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700 }}>Drop CSV file or click to browse</div>
                  <div style={{ color: THEME_COLORS.neutral[600] }}>Max size: {Utils.formatFileSize(APP_CONFIG.MAX_FILE_SIZE)}</div>
                </>
              )}
            </div>

            <button onClick={processUpload} disabled={state.processingStatus || !state.selectedFile} style={{ marginTop: 12, width: '100%', ...styles.button, ...styles.buttonPrimary }}>
              {state.processingStatus ? ( <>
                <div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', marginRight: 8, animation: 'spin 0.8s linear infinite' }} /> 
                {state.uploadProgress > 0 && state.uploadProgress < 100 ? `Processing ${state.uploadProgress}%` : 'Computing predictions...'}
              </> ) : 'Execute Prediction Analysis'}
            </button>
          </div>

          {state.performanceMetrics && state.currentView === 'predictions' && (
            <>
              <div style={{ ...styles.metricCard }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: THEME_COLORS.neutral[600] }}>LSTM Architecture</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{state.performanceMetrics.lstm_usage}</div>
                <div style={{ color: THEME_COLORS.neutral[600] }}>{state.performanceMetrics.lstm_percentage}% utilization</div>
              </div>

              <div style={{ ...styles.metricCard }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: THEME_COLORS.neutral[600] }}>Transformer Architecture</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{state.performanceMetrics.transformer_usage}</div>
                <div style={{ color: THEME_COLORS.neutral[600] }}>{state.performanceMetrics.transformer_percentage}% utilization</div>
              </div>
            </>
          )}
        </div>

        {state.predictionResults.length > 0 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <button onClick={toggleView} style={{ ...styles.button, border: `1px solid ${THEME_COLORS.primary.navy}`, background: '#fff', color: THEME_COLORS.primary.navy }}>{state.currentView === 'predictions' ? 'View Input Data' : 'View Predictions'}</button>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
              <div style={styles.panel}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Ephemeris Error Analysis (X,Y,Z)</div>
                <Line data={generateChartData(DATA_FIELDS.POSITION_ERRORS)} options={{ responsive: true }} />
              </div>

              <div style={styles.panel}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Satellite Clock Error (seconds)</div>
                <Line data={generateChartData(DATA_FIELDS.CLOCK_ERROR)} options={{ responsive: true }} />
              </div>
            </div>

            {/* Accuracy panel with percent */}
            {accuracyMetrics && (
              <div style={{ ...styles.panel, background: '#fffaf0', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800 }}> Accuracy (rolling 1-step)</div>
                  <div style={{ color: THEME_COLORS.neutral[600] }}>n = {accuracyMetrics.sample_size ?? 'N/A'}</div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 220, padding: 12, borderRadius: 8, background: '#fff', border: `1px solid ${THEME_COLORS.neutral[200]}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Satclock (s)</div>
                    <div>RMSE: <strong>{accuracyMetrics.satclockerror?.rmse?.toFixed(6) ?? 'N/A'}</strong></div>
                    <div>MAE: <strong>{accuracyMetrics.satclockerror?.mae?.toFixed(6) ?? 'N/A'}</strong></div>
                    {/* <div>Accuracy: <strong>{(accuracyMetrics.satclockerror?.accuracy_pct != null) ? `${accuracyMetrics.satclockerror.accuracy_pct.toFixed(2)}%` : 'N/A'}</strong></div> */}
                  </div>

                  <div style={{ minWidth: 260, padding: 12, borderRadius: 8, background: '#fff', border: `1px solid ${THEME_COLORS.neutral[200]}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Ephemeris 3D (m)</div>
                    <div>RMSE: <strong>{accuracyMetrics.three_dimensional?.rmse?.toFixed(4) ?? 'N/A'}</strong></div>
                    <div>MAE: <strong>{accuracyMetrics.three_dimensional?.mae?.toFixed(4) ?? 'N/A'}</strong></div>
                    {/* <div>Accuracy: <strong>{(accuracyMetrics.three_dimensional?.accuracy_pct != null) ? `${accuracyMetrics.three_dimensional.accuracy_pct.toFixed(2)}%` : 'N/A'}</strong></div> */}
                  </div>

                  <div style={{ minWidth: 260, padding: 12, borderRadius: 8, background: '#fff', border: `1px solid ${THEME_COLORS.neutral[200]}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Axis-level (m)</div>
                    {['x_error','y_error','z_error'].map(ax => (
                      <div key={ax} style={{ marginBottom: 6 }}>
                        <strong style={{ width: 60, display: 'inline-block' }}>{ax.toUpperCase()}:</strong>
                        RMSE <strong>{accuracyMetrics.per_axis?.[ax]?.rmse?.toFixed(4) ?? 'N/A'}</strong>,&nbsp;
                        MAE <strong>{accuracyMetrics.per_axis?.[ax]?.mae?.toFixed(4) ?? 'N/A'}</strong>,&nbsp;
                        {/* Acc <strong>{(accuracyMetrics.per_axis?.[ax]?.accuracy_pct != null) ? `${accuracyMetrics.per_axis[ax].accuracy_pct.toFixed(2)}%` : 'N/A'}</strong> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div style={styles.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={styles.panelTitle}>{state.currentView === 'predictions' ? 'Prediction Output' : 'Input Dataset'}</div>
                <div style={{ background: THEME_COLORS.neutral[100], color: THEME_COLORS.primary.navy, padding: '6px 10px', borderRadius: 6, border: `1px solid ${THEME_COLORS.neutral[300]}` }}>{activeData.length} records</div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {activeData.length > 0 && Object.keys(activeData[0]).map(col => <th key={col} style={styles.tableHeader}>{col.replace(/_/g,' ')}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.map((row, rIdx) => (
                      <tr key={rIdx} className="table-row-hover">
                        {Object.entries(row).map(([k,v], cIdx) => {
                          const isModel = state.currentView === 'predictions' && k.toLowerCase() === 'model_used';
                          const isLSTM = isModel && (v === 'LSTM' || String(v).toUpperCase()==='LSTM');
                          const isTRANS = isModel && (v === 'Transformer' || String(v).toUpperCase()==='TRANSFORMER');

                          // --- NEW: smart cell rendering to avoid Number(...) on datetime strings ---
                          let displayValue;
                          const keyLower = k.toLowerCase();

                          if (isModel) {
                            displayValue = v;
                          } else if (keyLower === 'predicted_time' || keyLower === 'utc_time' || keyLower === 'utc_time_str') {
                            // these are textual timestamps; show as-is (fallback to empty string)
                            displayValue = v ?? '';
                          } else {
                            // numeric attempt: if value is numeric, format; otherwise show raw
                            const num = Number(v);
                            if (isFinite(num)) {
                              displayValue = Utils.formatScientific(num);
                            } else {
                              // if not numeric (null/undefined/string), show original
                              displayValue = v ?? '';
                            }
                          }

                          return (
                            <td key={cIdx} style={{
                              ...styles.tableCell,
                              ...(isModel ? {
                                fontWeight: 700,
                                background: isLSTM ? `${THEME_COLORS.chart.x_error}15` : isTRANS ? `${THEME_COLORS.chart.satclockerror}15` : 'transparent',
                                color: isLSTM ? THEME_COLORS.chart.x_error : isTRANS ? THEME_COLORS.chart.satclockerror : THEME_COLORS.neutral[700],
                                borderLeft: isLSTM ? `3px solid ${THEME_COLORS.chart.x_error}` : isTRANS ? `3px solid ${THEME_COLORS.chart.satclockerror}` : 'none'
                              } : {})
                            }}>
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default SatelliteErrorPredictor;
