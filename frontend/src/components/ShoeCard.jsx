import React from "react";
// useDispatch is used to send actions to the Redux store.
import { useDispatch } from "react-redux";
// Import icons from Heroicons to display visual elements.
import { StarIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
// Import Redux actions for adding an item to the cart and opening the cart panel.
import { setAddItemToCart, setOpenCart } from "../app/CartSlice";

const ShoeCard = ({ shoe }) => {
  // Initialize the dispatch function for sending Redux actions.
  const dispatch = useDispatch();

  // onAddToCart: prepares an item object based on the shoe data and dispatches an action to add it to the cart.
  const onAddToCart = () => {
    const item = {
      // Using shoe._id from the API as the unique identifier.
      id: shoe._id,
      // The name of the shoe is used as the title.
      title: shoe.name,
      // The description of the shoe is used as text.
      text: shoe.description,
      // Image URL for the shoe.
      img: shoe.image,
      // Price of the shoe.
      price: shoe.price,
      // Selects the first color from the array of colors as the default.
      color: shoe.colors[0],
      // The shoe's rating.
      rating: shoe.rating
    };

    // Dispatch the action to add the item to the cart.
    dispatch(setAddItemToCart(item));
  };

  // onCartToggle: dispatches an action to open the cart view.
  const onCartToggle = () => {
    dispatch(
      setOpenCart({
        cartState: true,
      })
    );
  };

  return (
    <div className="relative bg-theme grid items-center justify-items-center rounded-xl py-4 px-5 transition-all duration-700 ease-in-out w-full hover:scale-105">
      {/* Top Section: Displays the shoe's name, description, price, and rating */}
      <div className="grid items-center justify-items-center">
        {/* Shoe Name */}
        <h1 className="text-black text-xl lg:text-lg md:text-base font-medium filter drop-shadow">
          {shoe.name}
        </h1>
        {/* Shoe Description */}
        <p className="text-black filter drop-shadow text-base md:text-sm font-normal">
          {shoe.description}
        </p>

        {/* Price and Rating Section */}
        <div className="flex items-center justify-between w-28 my-2">
          {/* Price Display */}
          <div className="flex items-center bg-white/80 px-1 rounded blur-effect-theme">
            <h1 className="text-black text-sm font-medium">
              &#8377; {shoe.price}
            </h1>
          </div>
          {/* Rating Display */}
          <div className="flex items-center gap-1">
            {/* Star Icon for visual rating */}
            <StarIcon className="icon-style w-5 h-5 md:w-4 md:h-4 brightness-0" />
            {/* Shoe rating value */}
            <h1 className="md:text-sm font-normal text-black">{shoe.rating}</h1>
          </div>
        </div>

        {/* Action Buttons: "Add to Cart" and "Buy Now" */}
        <div className="flex items-center gap-3">
          {/* Button to add the item to the cart */}
          <button
            type="button"
            className="bg-white/90 blur-effect-theme button-theme p-0.5 shadow black-200"
            onClick={() => onAddToCart()}
          >
            <ShoppingBagIcon className="icon-style text-slate-900" />
          </button>
          {/* "Buy Now" button adds the item to the cart and opens the cart view */}
          <button
            type="button"
            className="bg-white/90 blur-effect-theme button-theme px-2 py-1 shadow black-200 text-sm text-black"
            onClick={() => {
              onAddToCart();
              onCartToggle();
            }}
          >
            Buy Now
          </button>
        </div>

        {/* Additional Information: Sizes and Colors */}
        <div className="mt-2 text-sm">
          <p className="text-gray-600">
            {/* Display available sizes and their quantities.
                Each size is shown in the format "size (quantity)". */}
            Sizes: {shoe.sizes.map(s => `${s.size} (${s.quantity})`).join(', ')}
          </p>
          <p className="text-gray-600">
            {/* Display available colors by joining the colors array. */}
            Colors: {shoe.colors.join(', ')}
          </p>
        </div>
      </div>

      {/* Shoe Image Section */}
      <div className="flex items-center justify-center">
        <img
          src={shoe.image} // Shoe image URL
          alt={shoe.name}  // Alt text for accessibility
          className="transitions-theme hover:-rotate-12 h-36 w-64"
        />
      </div>

      {/* Stock Status Indicator */}
      {/* If the shoe is not in stock, display an "Out of Stock" badge at the top right */}
      {!shoe.inStock && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          Out of Stock
        </div>
      )}
    </div>
  );
};

export default ShoeCard;
