import axios from "axios";

// Optionally, set up a base URL if not already done
const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : "http://localhost:5000"; // adjust if needed

// Function to record a product visit
export const recordProductVisit = async (shoeId) => {
  try {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // Call the endpoint with the shoeId
    const response = await axios.post(
      `${BASE_URL}/api/data/auth/score/productVisit`,
      { shoeId },
      config
    );
    console.log("Product visit recorded:", response.data);
  } catch (error) {
    console.error("Error recording product visit:", error);
  }
};

// Function to record an add-to-cart event
export const recordAddToCart = async (shoeId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User may not be logged in.");
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(
      `${BASE_URL}/api/data/auth/score/addToCart`,
      { shoeId },
      config
    );
    console.log("Add-to-cart recorded:", response.data);
  } catch (error) {
    console.error("Error recording add-to-cart:", error);
  }
};