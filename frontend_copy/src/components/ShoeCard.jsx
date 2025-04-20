import React from "react";
import { useDispatch } from "react-redux";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { setAddItemToCart, setOpenCart } from "../app/CartSlice";
import { Link } from "react-router-dom";
import { recordAddToCart } from "./api";

const ShoeCard = ({ shoe }) => {
  const dispatch = useDispatch();

  const onAddToCart = () => {
    const item = {
      id: shoe._id,
      title: shoe.name,
      img: shoe.image,
      price: shoe.price,
      color: shoe.colors[0],
      rating: shoe.rating,
    };
    dispatch(setAddItemToCart(item));
    // Record add-to-cart event
    recordAddToCart(shoe._id);
  };

  const onCartToggle = () => {
    dispatch(setOpenCart({ cartState: true }));
  };

  return (
    <div className="relative bg-theme grid items-center justify-items-center rounded-xl py-4 px-5 transition-all duration-700 ease-in-out w-full hover:scale-105">
      <div className="grid items-center justify-items-center">
        <h1 className="text-black text-xl font-medium">{shoe.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onAddToCart}
            className="bg-white/90 p-0.5 rounded shadow"
          >
            <ShoppingBagIcon className="w-5 h-5 text-slate-900" />
          </button>
          <button
            onClick={() => {
              onAddToCart();
              onCartToggle();
            }}
            className="bg-white/90 px-2 py-1 text-sm text-black rounded shadow"
          >
            Buy Now
          </button>
        </div>
        <Link to={`/shoe/${shoe._id}`} className="text-blue-500 hover:underline mt-2">
          View Details
        </Link>
      </div>
      <div className="flex items-center justify-center">
        <img
          src={shoe.image}
          alt={shoe.name}
          className="h-36 w-64 transitions-theme hover:-rotate-12"
        />
      </div>
      {!shoe.inStock && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Out of Stock
        </div>
      )}
    </div>
  );
};

export default ShoeCard;