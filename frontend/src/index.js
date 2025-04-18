import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const auth = Cookies.get("auth");
  return auth === "true" ? children : <Navigate to="/login" />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
    </Routes>
  </BrowserRouter>
);