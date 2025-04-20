// Import createSlice to create a slice of state along with its reducers.
import { createSlice } from "@reduxjs/toolkit";
// Import toast for displaying notification messages.
import toast from "react-hot-toast";

// Define the initial state for the cart.
const initialState = {
  // cartState: Boolean to control the visibility of the cart.
  cartState: false,
  // cartItems: Array of items in the cart. It is loaded from localStorage if available, ensuring persistence. that means if the user refreshes the page, the cart items will still be available.local storage is storage that is available to the browser and saved on the user's computer. we can also store t in the session storage which is similar to local storage but the data is cleared when the page session ends.
  //can we store it in cokies ?? yes we can store it in cookies but cookies have a limit of 4kb and it is sent with every request to the server.
  // can we store it into the database ?? yes we can store it in the database but it will be slow as we have to make a request to the server and then the server will make a request to the database.
  // can we store it in the session ?? yes we can store it in the session but it will be cleared when the session ends.
  cartItems: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [], 
  // Total amount and total quantity for all items in the cart.
  cartTotalAmount: 0,
  cartTotalQantity: 0,
};

// Create the cart slice with reducers for various cart actions.
const CartSlice = createSlice({
  initialState,
  name: "cart",
  reducers: {
    // Toggle the cart to be open.
    setOpenCart: (state, action) => {
      state.cartState = action.payload.cartState;//action.payload is the data that is passed to the action creator.
    },
    // Toggle the cart to be closed.
    setCloseCart: (state, action) => {
      state.cartState = action.payload.cartState;
    },
    // Add an item to the cart. If the item already exists, increase its quantity.
    setAddItemToCart: (state, action) => {
      // Find the index of the item in the cart array.
      const itemIndex = state.cartItems.findIndex(//findIndex() method returns the index of the first element in an array that pass a test (provided as a function).
        // The test is whether the item id matches the payload id.
        // If found, itemIndex will be the index of the item in the array.
        // If not found, itemIndex will be -1.
        // The payload contains the item details to be added to the cart.
        // The payload is passed from the UI component dispatching the action.
        (item) => item.id === action.payload.id
      );

      if (itemIndex >= 0) {
        // If found, simply increase its quantity.
        state.cartItems[itemIndex].cartQuantity += 1;//cartQuantity is the quantity of the item in the cart.
        toast.success(`Item QTY Increased`);
      } else {
        // If not found, add the item with an initial quantity of 1.
        const temp = { ...action.payload, cartQuantity: 1 }; //cartQuantity is the quantity of the item in the cart.
        state.cartItems.push(temp);
        toast.success(`${action.payload.title} added to Cart`);
      }
      // Synchronize cart state with localStorage for persistence.
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    // Remove an item from the cart.
    setRemoveItemFromCart: (state, action) => {
      // Filter out the item that matches the id.
      const removeItem = state.cartItems.filter(
        (item) => item.id !== action.payload.id
      );
      state.cartItems = removeItem;
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
      toast.success(`${action.payload.title} Removed From Cart`);
    },
    // Increase the quantity of a cart item.
    setIncreaseItemQTY: (state, action) => {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );
      if (itemIndex >= 0) {
        state.cartItems[itemIndex].cartQuantity += 1;
        toast.success(`Item QTY Increased`);
      }
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    // Decrease the quantity of a cart item.
    setDecreaseItemQTY: (state, action) => {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );
      // Only decrease if quantity is greater than 1.
      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;
        toast.success(`Item QTY Decreased`);
      }
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    // Clear all items from the cart.
    setClearCartItems: (state, action) => {
      state.cartItems = [];
      toast.success(`Cart Cleared`);
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    // Calculate the total amount and quantity of items in the cart.
    setGetTotals: (state, action) => {
      // Reduce through the cartItems array to accumulate totals.
      let { totalAmount, totalQTY } = state.cartItems.reduce((cartTotal, cartItem) => {
        const { price, cartQuantity } = cartItem;
        const totalPrice = price * cartQuantity;

        cartTotal.totalAmount += totalPrice;
        cartTotal.totalQTY += cartQuantity;

        return cartTotal;
      }, {
        totalAmount: 0,
        totalQTY: 0,
      });

      state.cartTotalAmount = totalAmount;
      state.cartTotalQantity = totalQTY;
    },
  },
});

// Export the action creators so that they can be dispatched from UI components.
export const {
  setOpenCart,
  setCloseCart,
  setAddItemToCart,
  setRemoveItemFromCart,
  setIncreaseItemQTY,
  setDecreaseItemQTY,
  setClearCartItems,
  setGetTotals
} = CartSlice.actions;

// Export selectors to easily access pieces of state from the Redux store.
export const selectCartState = (state) => state.cart.cartState;
export const selectCartItems = (state) => state.cart.cartItems;
export const selectTotalAmount = (state) => state.cart.cartTotalAmount;
export const selectTotalQTY = (state) => state.cart.cartTotalQantity;

// Export the reducer to be included in the store configuration.
export default CartSlice.reducer;
