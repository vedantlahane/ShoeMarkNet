import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Cart, Home, Footer, Sales, Navbar } from "./components";
import Explore from "./components/Explore";
import WorkInProgress from "./components/utils/WorkInProgress";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import Orders from "./components/admin/Orders";
import Products from "./components/admin/Products";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import ShoeDetail from "./components/ShoeDetail";

const App = () => {
  const [backendData, setBackendData] = useState({
    homeapi: null,
    popularsales: null,
    topratesales: null,
    footerAPI: null,
  });
  const [error, setError] = useState(null);

  const apiBaseUrl = import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_DEV;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          homeapiRes,
          popularsalesRes,
          topratesalesRes,
          footerAPIRes,
        ] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/data/homeapi`),
          axios.get(`${apiBaseUrl}/api/data/popularsales`),
          axios.get(`${apiBaseUrl}/api/data/topratesales`),
          axios.get(`${apiBaseUrl}/api/data/footerapi`),
        ]);

        setBackendData(prevData => ({
          ...prevData,
          homeapi: homeapiRes.data,
          popularsales: popularsalesRes.data,
          topratesales: topratesalesRes.data,
          footerAPI: footerAPIRes.data,
        }));
      } catch (err) {
        console.error("Error fetching backend data:", err);
        setError(err.message);
      }
    };

    loadData();
  }, [apiBaseUrl]);

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

  const isHomeDataLoaded = backendData.homeapi !== null;
  const isSalesDataLoaded = backendData.popularsales !== null && backendData.topratesales !== null;
  const isFooterDataLoaded = backendData.footerAPI !== null;

  return (
    <Router>
      <Navbar />
      <Cart />
      <WorkInProgress />
      <Routes>
        {/* Home route is public */}
        <Route
          path="/"
          element={
            <main>
              {isHomeDataLoaded ? (
                <Home homeapi={backendData.homeapi} />
              ) : (
                <div>Loading Home...</div>
              )}
              {isSalesDataLoaded ? (
                <>
                  <Sales endpoint={backendData.popularsales} ifExists />
                  <Sales endpoint={backendData.topratesales} />
                </>
              ) : (
                <div>Loading Sales...</div>
              )}
            </main>
          }
        />
        {/* Protected Shoe Detail Route */}
        <Route
          path="/shoe/:id"
          element={
            <ProtectedRoute>
              <ShoeDetail />
            </ProtectedRoute>
          }
        />
        {/* Other protected routes */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              {isSalesDataLoaded ? (
                <Explore endpoint={backendData.topratesales} />
              ) : (
                <div>Loading Explore...</div>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
        </Route>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
      </Routes>
      {isFooterDataLoaded ? (
        <Footer footerAPI={backendData.footerAPI} />
      ) : (
        <div>Loading Footer...</div>
      )}
    </Router>
  );
};

export default App;