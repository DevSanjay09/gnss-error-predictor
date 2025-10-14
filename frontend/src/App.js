// import React from 'react';
// import UploadForm from './components/UploadForm';

// function App() {
//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial' }}>
//             <h1>GNSS Error Prediction Dashboard</h1>
//             <UploadForm />
//         </div>
//     );
// }

// export default App;

import React from "react";
import UploadForm from "./components/UploadForm";

export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>GNSS Error Prediction Dashboard</h1>
      <UploadForm />
    </div>
  );
}

