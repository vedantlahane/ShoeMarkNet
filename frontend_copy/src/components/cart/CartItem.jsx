import React from "react";
// Import icons from Heroicons for use as buttons
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
// useDispatch lets you dispatch Redux actions
import { useDispatch } from "react-redux";
// Import Redux action creators from your CartSlice
import { setDecreaseItemQTY, setIncreaseItemQTY, setRemoveItemFromCart } from "../../app/CartSlice.jsx";

const CartItem = ({
  // Destructure the 'item' prop to get product details
  item: { id, title, text, img, color, shadow, price, cartQuantity }
}) => {
  // Create a dispatch function from Redux
  const dispatch = useDispatch();

  // Determine the base URL for API calls/images based on environment
  const apiBaseUrl = import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_API_URL_PROD 
    : import.meta.env.VITE_API_URL_DEV;

  // Function to handle removing an item from the cart
  const onRemoveItem = () => {
    // Dispatch action with the item payload
    dispatch(setRemoveItemFromCart({ id, title, text, img, color, shadow, price, cartQuantity }));
  };

  // Function to handle increasing the item quantity
  const onIncreaseItemQTY = () => {
    // Dispatch action with the item payload
    dispatch(setIncreaseItemQTY({ id, title, text, img, color, shadow, price, cartQuantity }));
  };

  // Function to handle decreasing the item quantity
  const onDecreaseItemQTY = () => {
    // Dispatch action with the item payload
    dispatch(setDecreaseItemQTY({ id, title, text, img, color, shadow, price, cartQuantity }));
  };

  return (
    <>
      {/* Outer container: Flex layout with space between the product info and price controls */}
      <div className="flex items-center justify-between w-full px-5">
        
        {/* Left section: Contains image and product details */}
        <div className="flex items-center gap-5">
          
          {/* Image container with dynamic background gradient and shadow styling */}
          <div className={`bg-gradient-to-b ${color} ${shadow} relative rounded p-3 hover:scale-105 transition-all duration-75 ease-in-out grid items-center`}>
            {/* Product image - src is constructed from base URL and the image path */}
            <img
              src={`${apiBaseUrl}/${img}`}  
              alt={`img/cart-item/${id}`}
              className="w-36 h-auto object-fill lg:w-28"
            />
            {/* Price tag positioned at the top right of the image */}
            <div className="absolute right-1 top-1 blur-theme-effect bg-white/80 text-black text-xs px-1 rounded">
              &#8377; {price}
            </div>
          </div>
          
          {/* Product details section */}
          <div className="grid items-center gap-4">
            {/* Title and description */}
            <div className="grid items-center leading-none">
              <h1 className="font-medium text-lg text-slate-900 lg:text-sm">{title}</h1>
              <p className="text-sm text-slate-800 lg:text-xs">{text}</p>
            </div>
            {/* Quantity controls: decrease, display current quantity, increase */}
            <div className="flex items-center justify-around w-full">
              {/* Button to decrease quantity */}
              <button
                type="button"
                onClick={onDecreaseItemQTY}
                className="bg-theme-cart rounded w-6 h-6 lg:w-5 lg:h-5 flex items-center justify-center active:scale-90"
              >
                <MinusIcon className="w-5 h-5 lg:w-4 lg:h-4 text-white stroke-[2]" />
              </button>
              {/* Display current quantity */}
              <div className="bg-theme-cart rounded text-white font-medium lg:text-xs w-7 h-6 lg:h-5 lg:w-6 flex items-center justify-center">
                {cartQuantity}
              </div>
              {/* Button to increase quantity */}
              <button
                type="button"
                onClick={onIncreaseItemQTY}
                className="bg-theme-cart rounded w-6 h-6 lg:w-5 lg:h-5 flex items-center justify-center active:scale-90"
              >
                <PlusIcon className="w-5 h-5 lg:w-4 lg:h-4 text-white stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right section: Contains the total price and remove button */}
        <div className="grid items-center gap-5">
          {/* Total price is calculated as price multiplied by quantity */}
          <div className="grid items-center justify-center">
            <h1 className="text-lg lg:text-base text-slate-900 font-medium">
              &#8377; {price * cartQuantity}
            </h1>
          </div>
          {/* Button to remove the item from the cart */}
          <div className="grid items-center justify-center">
            <button
              type="button"
              onClick={onRemoveItem}
              className="bg-theme-cart rounded p-1 lg:p-0.5 grid items-center justify-items-center cursor-pointer"
            >
              <TrashIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartItem;
