import React, { useEffect, useState } from "react";
import { Cart, Home, Footer, Sales, Navbar } from "./components";
import Explore from "./components/Explore.jsx";
import Story from "./components/Story.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { fetchData } from './utils/api';

const App = () => {
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(data => {
        // Validate required data properties
        if (!data.homeapi || !data.popularsales || !data.toprateslaes || !data.footerAPI) {
          throw new Error('Invalid data structure received from server');
        }
        setBackendData(data);
      })
      .catch(error => {
        console.error("Error fetching backend data:", error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 bg-red-50 border border-red-500 rounded">
          <h2 className="text-red-700">Error loading data: {error}</h2>
        </div>
      </div>
    );
  }

  if (!backendData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Loading data...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Cart />
      
      <Routes>
        <Route
          path="/"
          element={
            <main>
              {backendData.homeapi && <Home homeapi={backendData.homeapi} />}
              {backendData.popularsales && (
                <Sales endpoint={backendData.popularsales} ifExists />
              )}
              {backendData.toprateslaes && (
                <Sales endpoint={backendData.toprateslaes} />
              )}
            </main>
          }
        />
        <Route
          path="/explore"
          element={
            <div>
              {backendData.toprateslaes && (
                <Explore endpoint={backendData.toprateslaes} />
              )}
            </div>
          }
        />
        <Route
          path="/story"
          element={
            <div>
              {backendData.story && <Story story={backendData.story} />}
            </div>
          }
        />
      </Routes>

      {backendData.footerAPI && <Footer footerAPI={backendData.footerAPI} />}
    </Router>
  );
};

export default App;
