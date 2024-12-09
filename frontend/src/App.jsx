import React from "react";
import { Cart, Home, Footer} from "./components";
import { Sales } from "./components";
import { Navbar } from "./components";
import {
  homeapi,
  popularsales,
  toprateslaes,
  footerAPI,
  story,
} from "./data/data.jsx";
import Explore from "./components/Explore.jsx";
import Story from "./components/Story.jsx";
import { BrowserRouter as Router, Route,Routes} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Cart />
      <Routes>
        <Route path="/" element={<main>
        <Home homeapi={homeapi} />
        <Sales endpoint={popularsales} ifExists />
        <Sales endpoint={toprateslaes} />
      </main>} />
      <Route path="/explore" element={<div>
        <Explore endpoint={toprateslaes} />
        
      </div>} />
      <Route path="/story" element={<div>
        <Story story={story} />
      </div>} />
      </Routes>
      
      
      <Footer footerAPI={footerAPI} />
    </Router>
  );
};

export default App;
