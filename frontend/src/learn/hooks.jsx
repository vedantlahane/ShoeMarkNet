// hooks-->
//     useEffect-->
//      useEffect hook is used to perform side effects in your functional components.
//      side effects are anything that affects something outside of the component.

//     useState-->
//         useState hook is used to add state to functional components.
//         useState returns an array with two elements.
//         The first element is the current state value and the second element is a function that lets you update it.

//     useContext-->
//         useContext hook is used to consume context that is provided by a parent component.
//         context is a way to pass data through the component tree without having to pass props down manually at every level.
//         ex- const value = useContext(MyContext);
//         here MyContext is the context that is created using createContext hook.

//     useReducer-->
//         useReducer hook is used to manage state in a more complex way.
//         useReducer is usually preferable to useState when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one.
//         ex- const [state, dispatch] = useReducer(reducer, initialArg, init);
//         here, reducer is a function that is used to update the state based on the action dispatched.
//         initialArg is the initial state of the reducer.
//         init is an optional function that is used to initialize the state.

//     useRef-->
//         useRef hook is used to access the DOM nodes or to store mutable values.
//         useRef returns a mutable ref object whose .current property is initialized to the passed argument (initialValue).
//         The returned object will persist for the full lifetime of the component.



//redeucer function--> 
//A reducer function is a pure function that takes the previous state and an action, and returns the next state. 
//It is used to update the state of the application based on the action dispatched.
//A reducer function is passed as an argument to the useReducer hook to manage the state in a more complex way.