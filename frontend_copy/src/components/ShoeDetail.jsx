import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAddItemToCart, setOpenCart } from "../app/CartSlice";

const ShoeDetail = () => {
  const { id } = useParams(); // Get shoe ID from URL
  const [shoe, setShoe] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShoe = async () => {
      try {
        setIsLoading(true);
        // Adjust base URL as needed
        const response = await axios.get(`/api/data/shoes/${id}`);
        const data = response.data;
        setShoe(data);
        // Ensure sizes and colors are arrays (fallback to empty array if undefined)
        const sizes = Array.isArray(data.sizes) ? data.sizes : [];
        const colors = Array.isArray(data.colors) ? data.colors : [];
        if (sizes.length > 0) {
          setSelectedSize(sizes[0].size);
        }
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }
      } catch (err) {
        console.error("Error fetching shoe details:", err);
        setError("Error fetching shoe details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShoe();
  }, [id]);

  const addToCart = () => {
    if (!selectedSize || !selectedColor) {
      setMessage("Please select a size and a color");
      return;
    }
    const item = {
      id: shoe._id,
      title: shoe.name,
      img: shoe.image, // Use shoe.images[0] for multiple images
      price: shoe.price,
      size: selectedSize,
      color: selectedColor,
      rating: shoe.rating,
    };
    dispatch(setAddItemToCart(item));
    setMessage("Item added to cart!");
  };

  const buyNow = () => {
    addToCart();
    dispatch(setOpenCart({ cartState: true }));
  };

  if (isLoading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
  if (!shoe) return <div className="text-center p-6">No shoe details available</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Shoe Image Section */}
        <div className="md:w-1/2">
          {shoe.image ? (
            <img
              src={shoe.image}
              alt={shoe.name}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              No Image Available
            </div>
          )}
          {!shoe.inStock && (
            <div className="mt-2 text-red-500 font-bold">Out of Stock</div>
          )}
        </div>
        {/* Shoe Details Section */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{shoe.name || "No Name"}</h1>
          <p className="text-lg mb-2">{shoe.description || "No description available"}</p>
          <p className="text-xl font-semibold mb-2">&#8377; {shoe.price || "N/A"}</p>
          <p className="text-md mb-2">
            <strong>Brand:</strong> {shoe.brand || "N/A"}
          </p>
          <p className="text-md mb-2">
            <strong>Category:</strong> {shoe.category || "N/A"}
          </p>
          <p className="text-md mb-2">
            <strong>Rating:</strong> {shoe.rating || "N/A"}
          </p>

          {/* Option Selectors */}
          <div className="mt-4">
            {shoe.sizes && shoe.sizes.length > 0 ? (
              <div className="mb-4">
                <label className="block text-lg font-medium mb-1">Size:</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {shoe.sizes.map((s, index) => (
                    <option key={index} value={s.size}>
                      {s.size} (Avail: {s.quantity})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="mb-4">No sizes available</p>
            )}
            {shoe.colors && shoe.colors.length > 0 ? (
              <div className="mb-4">
                <label className="block text-lg font-medium mb-1">Color:</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {shoe.colors.map((color, index) => (
                    <option key={index} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="mb-4">No colors available</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={addToCart}
              disabled={!shoe.inStock}
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={!shoe.inStock}
              className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-green-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoeDetail;