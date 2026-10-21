// Module 2: entry point (the "Hello World" mount of a React app)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ParkingProvider } from "./context/ParkingContext.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ParkingProvider>
        <App />
      </ParkingProvider>
    </BrowserRouter>
  </React.StrictMode>
);