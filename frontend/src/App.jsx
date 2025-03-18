import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Cart, Home, Footer, Sales, Navbar } from "./components";
import Explore from "./components/Explore.jsx";
import Story from "./components/Story.jsx";
import WorkInProgress from "./components/utils/WorkInProgress.jsx";
import AdminLayout from "./components/admin/AdminLayout";

import Dashboard from "./components/admin/Dashboard";

import Orders from "./components/admin/Orders";

import Products from "./components/admin/Products";

const App = () => {
  const [backendData, setBackendData] = useState({
    homeapi: null,
    popularsales: null,
    toprateslaes: null,
    story: null,
    footerAPI: null,
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl =
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_DEV;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [
          homeapiRes,
          popularsalesRes,
          toprateslaesRes,
          storyRes,
          footerAPIRes,
        ] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/data/homeapi`),
          axios.get(`${apiBaseUrl}/api/data/popularsales`),
          axios.get(`${apiBaseUrl}/api/data/topratesales`),
          axios.get(`${apiBaseUrl}/api/data/story`),
          axios.get(`${apiBaseUrl}/api/data/footerapi`),
        ]);

        setBackendData({
          homeapi: homeapiRes.data,
          popularsales: popularsalesRes.data,
          toprateslaes: toprateslaesRes.data,
          story: storyRes.data,
          footerAPI: footerAPIRes.data,
        });
      } catch (err) {
        console.error("Error fetching backend data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [apiBaseUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Loading data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 bg-red-50 border border-red-500 rounded">
          <h2 className="text-red-700">Error: {error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Cart />
      <WorkInProgress />
      <Routes>
        <Route
          path="/"
          element={
            <main>
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
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="orders" element={<Orders />} />

          <Route path="products" element={<Products />} />
        </Route>
      </Routes>

      <Footer footerAPI={backendData.footerAPI} />
    </Router>
  );
};

export default App;
