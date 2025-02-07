import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cart, Home, Footer, Sales, Navbar } from "./components";
import Explore from "./components/Explore.jsx";
import Story from "./components/Story.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  // State to hold the fetched backend data
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    // Fetch data from the backend on component mount
    axios
      .get("http://localhost:5000/api/data")
      .then((response) => {
        setBackendData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching backend data:", error);
      });
  }, []);

  // If backendData is not loaded yet, you can display a loading state or spinner.
  if (!backendData) {
    return (
      <div style={{ padding: "1rem", backgroundColor: "#f4f4f4" }}>
        <h2>Loading backend data...</h2>
      </div>
    );
  }

  return (
    <Router>
      {/* Navigation components */}
      <Navbar />
      <Cart />

      {/* Application routing */}
      <Routes>
        <Route
          path="/"
          element={
            <main>
              {/* Pass backend data to your components */}
              <Home homeapi={backendData.homeapi} />
              <Sales endpoint={backendData.popularsales} ifExists />
              <Sales endpoint={backendData.toprateslaes} />
            </main>
          }
        />
        <Route
          path="/explore"
          element={
            <div>
              <Explore endpoint={backendData.toprateslaes} />
            </div>
          }
        />
        <Route
          path="/story"
          element={
            <div>
              <Story story={backendData.story} />
            </div>
          }
        />
      </Routes>

      {/* Footer receives the backend's footer API data */}
      <Footer footerAPI={backendData.footerAPI} />

      {/* For debugging or demonstration, you can show the entire backend data */}
      <div style={{ padding: "1rem", backgroundColor: "#f4f4f4" }}>
        <h2>Backend Data (Complete)</h2>
        <pre>{JSON.stringify(backendData, null, 2)}</pre>
      </div>
    </Router>
  );
};

export default App;
