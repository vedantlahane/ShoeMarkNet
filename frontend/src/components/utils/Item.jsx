import React from "react";
import { useDispatch } from "react-redux";//useDispatch hook is used to dispatch actions in the redux store. it  means that you can dispatch actions to the store from any component in your application. dispatch is a function that takes an action object as an argument and sends it to the store.

import { StarIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { setAddItemToCart, setOpenCart } from "../../app/CartSlice";

const Item = ({
  ifExists,
  id,
  color,
  shadow,
  title,
  text,
  img,
  btn,
  rating,
  price,
}) => {
  //   console.log(id)
  const dispatch = useDispatch();//useDispatch hook is used to dispatch actions in the redux store. it  means that you can dispatch actions to the store from any component in your application. dispatch is a function that takes an action object as an argument and sends it to the store.

  const onAddToCart = () => {//onAddToCart function is used to add an item to the cart.
    const item = { id, title, text, img, color, shadow, price };

    dispatch(setAddItemToCart(item));//setAddItemToCart is a reducer function that adds an item to the cart.
  };

  const onCartToggle = () => {
    dispatch(setOpenCart({
        cartState: true
    }))
}

  return (
    <>
      <div
        className={`relative bg-theme grid items-center ${
          ifExists ? "justify-items-start" : "justify-items-center"
        } rounded-xl py-4 px-5 transition-all duration-700 ease-in-out w-full hover:scale-105`}
      >
        <div
          className={`grid items-center ${
            ifExists ? "justify-items-start" : "justify-items-center"
          }`}
        >
          <h1 className=" text-black text-xl lg:text-lg md:text-base font-medium filter drop-shadow">
            {title}
          </h1>
          <p className="text-black filter drop-shadow text-base md:text-sm font-normal">
            {text}
          </p>

          <div className="flex items-center justify-between w-28 my-2">
            <div className="flex items-center bg-white/80  px-1 rounded blur-effect-theme">
              <h1 className="text-black text-sm font-medium">&#8377; {price}</h1>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="icon-style w-5 h-5 md:w-4 md:h-4 brightness-0" />
              <h1 className="md:text-sm font-normal text-black">
                {rating}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-white/90 blur-effect-theme button-theme p-0.5 shadow black-200"
              onClick={()=> onAddToCart()}
            >
              <ShoppingBagIcon className="icon-style text-slate-900" />
            </button>
            <button
              type="button"
              className="bg-white/90 blur-effect-theme button-theme px-2 py-1 shadow black-200 text-sm text-black"
              onClick={()=> {onAddToCart(); onCartToggle();}}// onAddToCart() and onCartToggle() are called when the button is clicked  
            >
              {btn}
            </button>
          </div>
        </div>
        <div
          className={`flex items-center ${
            ifExists ? "absolute top-5 right-1" : "justify-center"
          }`}
        >
          <img
            src={`http://localhost:5000/${img}`}
            alt={`img/item-img/${id}`}
            className={`transitions-theme hover:-rotate-12 ${
              ifExists
                ? "h-auto w-64 lg:w-56 md:w-48 -rotate-[35deg]"
                : "h-36 w-64"
            }`}
          />
        </div>
      </div>
    </>
  );
};

export default Item;
